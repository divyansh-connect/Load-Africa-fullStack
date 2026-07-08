# AI Memory

# Project Information

Project Name:
LoadAfrica

Project Type:
Enterprise Multi-Portal Logistics & Heavy Equipment Rental Platform

Industry:
Logistics • Transport Marketplace • Fleet Management • Heavy Equipment Rental

Reference Website:
https://loadafrica.app

---

# Technology Stack

Frontend

- React.js
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- React Hook Form
- Zod
- Socket.io Client

Backend

- Node.js
- Express.js
- Prisma ORM

Database

- MySQL (XAMPP)

Authentication

- JWT
- Role Based Access Control (RBAC)

Maps

- Google Maps API
- Places Autocomplete
- Live GPS Tracking

Real-Time

- Socket.io

File Upload

- Multer

---

# Project Scope

This is a FULL STACK enterprise application.

The project includes:

✔ Frontend
✔ Backend
✔ Database
✔ Authentication
✔ Role Management
✔ Real-Time Tracking
✔ Wallet System
✔ Notifications
✔ Document Management
✔ Maintenance Management
✔ Revenue Management

This project is NOT frontend-only.

---

# System Portals

1. Landing Website

2. Customer Portal

3. Driver Portal

4. Fleet Owner Portal

5. Yellow Plant Portal

6. Broker Portal

7. Admin Portal

Every portal shares the same backend and database.

---

# Core Business Flow

Customer creates booking

↓

Broker/Admin receives booking

↓

Fleet Owner receives request

↓

Fleet assigns Vehicle

↓

Fleet assigns Driver

↓

Driver accepts trip

↓

Driver reaches pickup

↓

Trip starts

↓

Customer tracks trip

↓

Driver reaches destination

↓

OTP Verification

↓

POD Upload

↓

Delivery Completed

↓

Payment Released

↓

Wallet Updated

↓

Revenue Updated

↓

Reports Updated

All modules must remain synchronized.

---

# Yellow Plant Workflow

Customer requests heavy equipment

↓

Plant Owner receives request

↓

Accept / Reject

↓

Assign Equipment

↓

Assign Operator

↓

Equipment Delivered

↓

Rental Active

↓

Equipment Returned

↓

Inspection

↓

Maintenance

↓

Revenue Updated

↓

Equipment Available Again

---

# Main Modules

Authentication

Booking Management

Tracking

Fleet Management

Driver Management

Equipment Management

Payments

Wallet

Notifications

Documents

Maintenance

Reports

Analytics

Profile

Settings

---

# Vehicle Categories

Use categories from the existing LoadAfrica platform.

Examples

- Bakkie
- Truck
- Tipper
- Tanker
- Flatbed
- Trailer

Do not invent random categories.

---

# Design Direction

Modern Enterprise Logistics SaaS

Inspired By

- Uber Freight
- BlackBuck
- Porter

Maintain existing LoadAfrica branding.

Do NOT redesign the identity.

Improve UX while keeping the current design language consistent.

---

# Backend Rules

Single Backend

Single Database

Single Source of Truth

Use Prisma ORM

Use MySQL

Never create duplicate business logic.

Never duplicate APIs.

Never duplicate models.

Never duplicate services.

---

# Frontend Rules

Never hardcode data.

Always consume backend APIs.

Reuse components.

Reuse layouts.

Reuse services.

Maintain responsive design.

---

# Development Rules

Always follow:

1. Flow.md

2. DB_Schema.md

3. Full_Backend_info.md

4. API_Specification.md

5. Full_frontend_info.md

These documents are the SINGLE SOURCE OF TRUTH.

Do not create functionality that contradicts them.

---

# Important Rules

Do not break business workflow.

Do not change routing unnecessarily.

Do not redesign existing branding.

Do not create isolated state.

Do not create duplicate modules.

Every update must remain synchronized across:

Customer

Driver

Fleet Owner

Yellow Plant

Broker

Admin

Backend

Database

Notifications

Tracking

Wallet

Revenue

Audit Logs

---

# Final Goal

Build a production-ready enterprise logistics and heavy equipment rental platform that can scale to thousands of users while maintaining a clean architecture, reusable components, centralized business logic, and synchronized workflows across all portals.