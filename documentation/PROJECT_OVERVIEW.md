# LoadAfrica: Project Overview

## Project Introduction
**LoadAfrica** is a high-performance logistics marketplace platform designed to bridge the gap between clients requiring cargo transport/plant equipment hire and verified logistics service providers, fleet operators, plant machine suppliers, and independent drivers. By introducing a broker-mediated matching ecosystem, the platform ensures transparency in quote generation, active dispatch verification, driver/operator assignment, and automated tracking.

---

## Business Objective
- **Efficiency**: Automate the manual broker-mediated matching processes for transport loads.
- **Verification**: Enable transporters and plant owners to register and undergo strict administrative review processes.
- **Fair Pricing**: Utilize a quotation bidding model where brokers review customer transport/hire requests and submit official quotes.
- **Reliability**: Provide clients with end-to-end trip status histories and live tracking alerts.

---

## Target Users

1. **Customers (Shippers)**: Individuals or corporate clients needing to move cargo or hire plant machinery.
2. **Transporters / Drivers**: Logistics service operators, fleet owners, and owner-drivers who fulfill the delivery assignments.
3. **Plant Owners**: Heavy equipment suppliers who rent out machinery (e.g., excavators, dumpers) with or without operators.
4. **Brokers**: Certified intermediaries who review booking requests, negotiate pricing, issue formal quotations, and assign trips.
5. **Administrators (Admin)**: Platform moderators who verify driver registrations, manage assets, and monitor payments.

---

## Core Modules

### 1. Transport Booking & Quote Management
- Shippers submit detailed cargo load parameters (pickup/delivery addresses, cargo type, vehicle category, time, special instructions).
- Brokers review incoming leads, assign transport assets, calculate platform/broker fees, and issue binding quotes.
- Shippers accept or reject quotes. Upon acceptance, payment is processed, and driver allocation is unlocked.

### 2. Yellow Plant Hire Portal
- Shippers submit requests to rent heavy equipment (excavators, loaders, flatbeds).
- Suppliers (Plant Owners) receive notifications to accept or reject hire requests, detailing the machine operator status and payout details.
- Statuses progress through a state machine of driver/operator assignment, delivery, and work completion.

### 3. Driver & Fleet Verification Module
- Transporters submit registration applications including photos, vehicle details, driver licenses, and KYC documentation.
- Admins review and approve applications before drivers can accept loads or receive dispatched trips.

---

## Technology Stack

- **Frontend**: React.js, React Router DOM, TailwindCSS, Lucide React (Icons).
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL/MySQL database, Google Maps & OpenStreetMap integrations.
- **Build Systems**: Vite, npm.
- **Workflow Tools**: Git.
