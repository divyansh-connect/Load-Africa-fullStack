# LoadAfrica Enterprise Logistics Marketplace Specification

This document details the complete end-to-end business rules, workflows, and specifications for the LoadAfrica platform.

---

## 1. Core Security & Onboarding Rules
* **No Direct Access**: All users (Customers, Fleet Owners, Independent Drivers) entering from the Landing Page register into a `PENDING_APPROVAL` status.
* **Admin Review Gate**: Login is strictly disabled until the Admin verifies the uploads, KYC, and details, updating their status to `ACTIVE`.

---

## 2. Actor Workflows & Dashboards

### Customer Flow
1. Landing Page $\rightarrow$ Registration $\rightarrow$ Account Creation $\rightarrow$ `PENDING_APPROVAL`.
2. Admin approves $\rightarrow$ Welcome email notification simulated.
3. Login active $\rightarrow$ Customer Dashboard displays:
   * Welcome Card & Profile Completion status
   * Company Details & Wallet balance
   * Active & Previous Bookings list
   * Quotes, Invoices, and real-time Notification feed

### Booking & Pricing Flow
1. **Creation**: Customer inputs Pickup, Destination, Cargo Name, Weight, Vehicle Type, and Special Instructions.
2. **Pricing Engine**: Prices are calculated automatically using:
   * Total Route Distance & Pickup Distance
   * Vehicle Type Multipliers & Cargo Weight
   * Fuel surcharges, Tolls, Admin override buffer, Taxes, Platform Fees, and Insurance.
3. **Status**: Starts at `QUOTE_REQUESTED`.
4. **Broker Quote**: Broker reviews booking, prepares/negotiates final quotation.
5. **Acceptance**: Customer accepts quote $\rightarrow$ Status changes to `CONFIRMED`.

### Broker (Operations Manager) Flow
* Responsible for monitoring bookings, pricing/quotation preparation, and assignments.
* Assigns either a **Fleet Owner** (Option A) or an **Independent Driver** (Option B).
* Monitors trip telemetry from start to finish.
* **Strict Permissions**: Broker *never* releases payments, approves users, or edits wallets.

### Fleet Owner Flow
* Register $\rightarrow$ Admin Approves $\rightarrow$ Dashboard unlocked.
* **Capabilities**:
   * Add Vehicles (requires photos & registration doc uploads).
   * Add Drivers (created *only* inside Fleet dashboard; starts as `PENDING_APPROVAL` $\rightarrow$ Admin Approves).
   * Receive Booking Requests $\rightarrow$ Accept Booking $\rightarrow$ Assign Driver & Vehicle to load.
   * View live trips, fleet wallet, and dynamic revenue charts.

### Independent Driver Flow
* Register $\rightarrow$ Upload Profile Photo, License front/back, Vehicle details, Disc/COF documents $\rightarrow$ `PENDING_APPROVAL` $\rightarrow$ Admin approves $\rightarrow$ Live Command Center active.

---

## 3. Assignment & Telemetry Flow
* **Option A**: Assign Fleet $\rightarrow$ Fleet Owner accepts $\rightarrow$ Fleet Owner selects Driver + Vehicle $\rightarrow$ Trip Starts.
* **Option B**: Assign Independent Driver $\rightarrow$ Driver accepts $\rightarrow$ Trip Starts.
* **Live Telemetry**: During active trips, the Customer, Broker, Fleet, and Admin dashboards display:
   * Current Driver & Vehicle specifications
   * Live GPS Location & Route timeline
   * Calculated ETA, total route distance, and completed/remaining kilometers.

---

## 4. Payment, Invoicing, and Commission Engine
1. **Verification**: Driver completes trip $\rightarrow$ Uploads POD image $\rightarrow$ Broker verifies delivery $\rightarrow$ Customer confirms receipt.
2. **Settlement**: System automatically generates the Invoice.
3. **Payment**: Customer pays invoice $\rightarrow$ Transaction confirmed.
4. **Commission Engine**:
   * Deducts Platform Commission percentage (e.g., 10%).
   * Disburses remaining funds to the Fleet Owner's wallet (if fleet assignment) or the Independent Driver's wallet (if independent assignment).
   * Fleet Owners internally disburse payments to their drivers.
