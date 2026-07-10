const { prisma } = require('../config/db');

// Helper for dev, assuming user id is driver id for now.
const getDriverId = async (req) => {
  if (req.user?.driver?.id) return req.user.driver.id;
  const driver = await prisma.driver.findFirst();
  return driver ? driver.id : null;
};

const verifyPODAndReleasePayment = async (req, res) => {
  try {
    const { bookingId } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        assignments: {
          include: { driver: { include: { user: true } } }
        },
        quotes: true
      }
    });

    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.status !== 'POD_UPLOADED') {
      return res.status(400).json({ success: false, message: 'Booking is not awaiting POD verification' });
    }

    const assignment = booking.assignments[0];
    if (!assignment) return res.status(400).json({ success: false, message: 'No driver assigned' });

    // Use quote grand total for driver payout simulation
    const payoutAmount = booking.quotes[0]?.grand_total || 1500;
    const platformComm = payoutAmount * 0.10;
    const driverPayout = payoutAmount * 0.90;

    await prisma.$transaction(async (tx) => {
      // 1. Mark booking as PAYMENT_PENDING
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: 'PAYMENT_PENDING' }
      });

      // 2. Add to Tracking
      await tx.trackingHistory.create({
        data: { booking_id: bookingId, status: 'PAYMENT_PENDING', remarks: 'Broker verified POD. Invoice raised. Awaiting customer payment.' }
      });

      // 3. Create Invoice in PENDING status
      await tx.invoice.create({
        data: {
          invoice_no: `INV-${Math.floor(100000 + Math.random() * 900000)}`,
          booking_id: bookingId,
          customer_id: booking.customer_id,
          amount: payoutAmount - platformComm,
          tax_amount: 0,
          total_amount: payoutAmount,
          platform_commission: platformComm,
          payout_amount: driverPayout,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Due in 7 days
          status: 'PENDING'
        }
      });
    });

    res.status(200).json({ success: true, message: 'POD Verified and Invoice Raised. Awaiting customer payment.' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const withdrawEarnings = async (req, res) => {
  try {
    const driverId = await getDriverId(req); // For drivers. Wait, we should make it generic for the logged-in user.
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });

    const wallet = await prisma.wallet.findFirst({ where: { user_id: userId } });
    if (!wallet || wallet.balance < amount) return res.status(400).json({ success: false, message: 'Insufficient funds' });

    await prisma.$transaction(async (tx) => {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: { decrement: amount } }
      });

      const withdrawal = await tx.withdrawalRequest.create({
        data: {
          wallet_id: wallet.id,
          amount,
          status: 'PENDING'
        }
      });

      await tx.walletTransaction.create({
        data: {
          wallet_id: wallet.id,
          type: 'DEBIT',
          amount,
          description: `Withdrawal request submitted`,
          reference_id: withdrawal.id,
          status: 'PENDING'
        }
      });
    });

    res.status(200).json({ success: true, message: 'Withdrawal request submitted successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const getWallet = async (req, res) => {
  try {
    const userId = req.user.id;
    
    let wallet = await prisma.wallet.findFirst({ 
      where: { user_id: userId },
      include: { transactions: { orderBy: { created_at: 'desc' } } }
    });
 
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { user_id: userId, balance: 0 },
        include: { transactions: true }
      });
    }
 
    res.status(200).json({ success: true, data: wallet });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
}

const processPayment = async (req, res) => {
  try {
    const { invoiceId } = req.body;
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        booking: {
          include: {
            assignments: {
              include: { driver: true, fleet_owner: true, broker: true }
            }
          }
        },
        customer: true
      }
    });

    if (!invoice) return res.status(404).json({ success: false, message: 'Invoice not found' });
    if (invoice.status === 'PAID') return res.status(400).json({ success: false, message: 'Invoice already paid' });

    // Ensure platform admin wallet exists
    const adminUser = await prisma.user.findFirst({ where: { role: 'SUPER_ADMIN' } });
    if (!adminUser) throw new Error("No platform admin configured for wallets");
    
    let adminWallet = await prisma.wallet.findFirst({ where: { user_id: adminUser.id } });
    if (!adminWallet) adminWallet = await prisma.wallet.create({ data: { user_id: adminUser.id, balance: 0 } });

    await prisma.$transaction(async (tx) => {
      // 1. Create Payment Record
      await tx.payment.create({
        data: {
          invoice_id: invoiceId,
          amount: invoice.total_amount,
          payment_method: 'CARD',
          transaction_id: `TXN-${Math.floor(1000000 + Math.random() * 9000000)}`,
          status: 'PAID'
        }
      });

      // 2. Mark Invoice as PAID
      await tx.invoice.update({
        where: { id: invoiceId },
        data: { status: 'PAID' }
      });

      // 3. Mark Booking as COMPLETED
      await tx.booking.update({
        where: { id: invoice.booking_id },
        data: { status: 'COMPLETED' }
      });

      // Add to tracking
      await tx.trackingHistory.create({
        data: { booking_id: invoice.booking_id, status: 'COMPLETED', remarks: 'Customer completed payment. Trip finalized.' }
      });

      // 4. Commission Split Logic
      const totalAmount = Number(invoice.total_amount);
      const platformFeePct = 0.10; // 10%
      const brokerFeePct = 0.05; // 5% if broker exists
      
      let platformAmount = totalAmount * platformFeePct;
      let brokerAmount = 0;
      
      const assignment = invoice.booking.assignments[0];
      if (assignment && assignment.broker_id) {
        brokerAmount = totalAmount * brokerFeePct;
      }
      
      const providerAmount = totalAmount - platformAmount - brokerAmount;

      // Platform Wallet Update
      await tx.wallet.update({
        where: { id: adminWallet.id },
        data: { balance: { increment: platformAmount } }
      });
      await tx.walletTransaction.create({
        data: {
          wallet_id: adminWallet.id,
          type: 'CREDIT',
          amount: platformAmount,
          description: `Platform Fee for Booking ${invoice.booking_id}`,
          reference_id: invoice.booking_id,
          status: 'COMPLETED'
        }
      });
      await tx.commission.create({
        data: {
          reference_type: 'BOOKING',
          reference_id: invoice.booking_id,
          earned_by_user_id: adminUser.id,
          commission_type: 'PLATFORM_FEE',
          amount: platformAmount,
          status: 'PAID'
        }
      });

      // Provider Wallet Update
      if (assignment) {
        let providerUserId = null;
        if (assignment.driver_id && !assignment.fleet_owner_id) {
          const driver = await tx.driver.findUnique({ where: { id: assignment.driver_id } });
          providerUserId = driver.user_id;
        } else if (assignment.fleet_owner_id) {
          const fleet = await tx.fleetOwner.findUnique({ where: { id: assignment.fleet_owner_id } });
          providerUserId = fleet.user_id;
        }
        
        if (providerUserId) {
          let pWallet = await tx.wallet.findFirst({ where: { user_id: providerUserId } });
          if (!pWallet) pWallet = await tx.wallet.create({ data: { user_id: providerUserId, balance: 0 } });
          
          await tx.wallet.update({
            where: { id: pWallet.id },
            data: { balance: { increment: providerAmount } }
          });
          await tx.walletTransaction.create({
            data: {
              wallet_id: pWallet.id,
              type: 'CREDIT',
              amount: providerAmount,
              description: `Earnings for Booking ${invoice.booking_id}`,
              reference_id: invoice.booking_id,
              status: 'COMPLETED'
            }
          });
        }

        // Broker Wallet Update
        if (assignment.broker_id && brokerAmount > 0) {
          const broker = await tx.broker.findUnique({ where: { id: assignment.broker_id } });
          let bWallet = await tx.wallet.findFirst({ where: { user_id: broker.user_id } });
          if (!bWallet) bWallet = await tx.wallet.create({ data: { user_id: broker.user_id, balance: 0 } });

          await tx.wallet.update({
            where: { id: bWallet.id },
            data: { balance: { increment: brokerAmount } }
          });
          await tx.walletTransaction.create({
            data: {
              wallet_id: bWallet.id,
              type: 'CREDIT',
              amount: brokerAmount,
              description: `Broker Commission for Booking ${invoice.booking_id}`,
              reference_id: invoice.booking_id,
              status: 'COMPLETED'
            }
          });
          await tx.commission.create({
            data: {
              reference_type: 'BOOKING',
              reference_id: invoice.booking_id,
              earned_by_user_id: broker.user_id,
              commission_type: 'BROKER_FEE',
              amount: brokerAmount,
              status: 'PAID'
            }
          });
        }
      }

      // Log Financial Activity
      await tx.activityLog.create({
        data: {
          user_id: req.user?.id,
          action: 'PAYMENT_PROCESSED',
          description: `Payment of ${totalAmount} processed for Invoice ${invoiceId}`
        }
      });
    });

    res.status(200).json({ success: true, message: 'Payment processed and commissions split successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const approveWithdrawal = async (req, res) => {
  try {
    const { transactionId } = req.body;
    
    const transaction = await prisma.walletTransaction.findUnique({
      where: { id: transactionId },
      include: { wallet: true }
    });

    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    if (transaction.status !== 'PENDING' || transaction.type !== 'DEBIT') {
      return res.status(400).json({ success: false, message: 'Invalid transaction for approval' });
    }

    await prisma.$transaction(async (tx) => {
      // Mark transaction as COMPLETED
      await tx.walletTransaction.update({
        where: { id: transactionId },
        data: { status: 'COMPLETED' }
      });

      // Deduct from pending_balance
      await tx.wallet.update({
        where: { id: transaction.wallet_id },
        data: { pending_balance: { decrement: transaction.amount } }
      });

      // Log
      await tx.activityLog.create({
        data: {
          user_id: req.user.id,
          action: 'WITHDRAWAL_APPROVED',
          description: `Admin approved withdrawal of ${transaction.amount} for wallet ${transaction.wallet_id}`
        }
      });
    });

    res.status(200).json({ success: true, message: 'Withdrawal approved successfully' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  verifyPODAndReleasePayment,
  withdrawEarnings,
  getWallet,
  processPayment,
  approveWithdrawal
};
