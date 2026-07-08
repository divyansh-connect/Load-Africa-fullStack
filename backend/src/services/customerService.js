const { prisma } = require('../config/db');

const getCustomerDashboard = async (userId) => {
  const customer = await prisma.customer.findUnique({
    where: { user_id: userId },
    include: {
      user: {
        include: {
          wallets: true
        }
      }
    }
  });

  if (!customer) {
    throw new Error('Customer profile not found');
  }

  // Get active bookings count
  const activeBookingsCount = await prisma.booking.count({
    where: {
      customer_id: customer.id,
      status: { in: ['DRIVER_ASSIGNED', 'PICKUP_SCHEDULED', 'PICKUP_ARRIVED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'] }
    }
  });

  // Get pending quotes
  const pendingQuotesCount = await prisma.booking.count({
    where: {
      customer_id: customer.id,
      status: { in: ['QUOTE_REQUESTED', 'QUOTE_PREPARED', 'CUSTOMER_ACCEPTED', 'BOOKING_CONFIRMED'] }
    }
  });

  // Get total bookings
  const totalBookings = await prisma.booking.count({
    where: { customer_id: customer.id }
  });

  // Fetch recent bookings
  const recentBookings = await prisma.booking.findMany({
    where: { customer_id: customer.id },
    orderBy: { created_at: 'desc' },
    take: 5
  });

  const walletBalance = customer.user.wallets[0]?.balance || 0;

  return {
    activeBookingsCount,
    pendingQuotesCount,
    totalBookings,
    walletBalance,
    recentBookings
  };
};

module.exports = { getCustomerDashboard };
