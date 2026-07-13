# Roles and Permissions

This document outlines the security structure and permission matrices implemented across the platform.

| Role | Core Purpose | Accessible Pages | REST API Scope | Restrictions |
|---|---|---|---|---|
| **Customer** (Shipper) | Create transport bookings and hire plant machines. | Customer Dashboard, Create Booking, Book Plant Machine, Active Deliveries, My Quotes, Profile. | Create/get bookings, accept/reject quotes, pay invoices. | Cannot access broker/admin panels. Cannot edit vehicle databases. |
| **Broker** | Intermediary managing quote bidding and dispatches. | Broker Dashboard, Quote Requests, Assigned Loads, Commissions, Customers list. | Submit quote amounts, assign fleets/drivers, view commission balances. | Cannot create bookings or modify plant equipment. |
| **Driver / Transporter** | Transport cargo loads between addresses. | Driver Profile, Assigned Loads. | Update trip status (In Transit, Delivered), view assigned load telemetry. | Cannot submit quotes or access client billing details. |
| **Fleet Owner** | Register vehicles and dispatch linked drivers. | Fleet Management, Active Trucks. | Manage vehicles list, manage linked drivers list. | Cannot act as client or broker. |
| **Admin** | Site moderation and driver registration review. | Admin Dashboard, Drivers approval panel, Settings. | Approve/reject drivers, manage vehicle categories, view system-wide payments. | None. Full system access. |
