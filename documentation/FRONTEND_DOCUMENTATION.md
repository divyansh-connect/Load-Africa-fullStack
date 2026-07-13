# Frontend Documentation

## Folder Structure Overview

```
Frontend/
├── src/
│   ├── components/       # Shared UI components (inputs, maps, buttons)
│   ├── layouts/          # Portal Shells (CustomerLayout, BrokerLayout, AdminLayout)
│   ├── pages/            # View routes grouped by Role (customer, broker, admin, driver)
│   ├── services/         # API abstraction layers (authService, bookingService)
│   ├── App.jsx           # Main entry point with React Router Switch
│   ├── main.jsx          # DOM rendering entry
│   └── index.css         # Tailwind & global stylesheet
```

---

## Routing & Layouts
The frontend uses nested routing via `react-router-dom`:

- **Public Routes**: `/` (Home/Landing), `/login`, `/register`.
- **Customer Portal (`/customer`)**: Wrapped in `CustomerLayout.jsx`. Includes:
  - Dashboard: `/customer/dashboard`
  - Book Transport: `/customer/create-booking`
  - Book Plant Machine: `/customer/book-plant-machine`
  - Active Deliveries: `/customer/active-deliveries`
  - Billing & Invoices: `/customer/profile?tab=billing`
- **Broker Portal (`/broker`)**: Wrapped in `BrokerLayout.jsx`. Includes:
  - Dashboard: `/broker/dashboard`
  - Quote Requests: `/broker/quote-requests`
  - Assigned Loads: `/broker/assigned-loads`
- **Admin Portal (`/admin`)**: Wrapped in `AdminLayout.jsx`. Includes:
  - Dashboard: `/admin/dashboard`
  - Driver Registrations: `/admin/drivers`

---

## State Management & Forms
- **Local state**: Managed locally within components using React's `useState` hook.
- **Form Persistence**: Forms (such as in `CreateBooking.jsx`) save inputs to `localStorage` drafts (`booking_form_data`, `booking_pickup_value`, etc.) to prevent losing input on page refresh.
- **Validation**: Fields validate inputs on-the-fly (e.g., coordinates, weights, required inputs) before enabling submission buttons.
