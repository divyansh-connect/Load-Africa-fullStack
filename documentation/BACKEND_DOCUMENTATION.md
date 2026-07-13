# Backend Documentation

## Folder Structure Overview

```
backend/
├── src/
│   ├── controllers/      # Route logic (authController, bookingController, brokerController)
│   ├── middlewares/      # Authentication & authorization checks
│   ├── routes/           # REST endpoints mapping to controllers
│   ├── services/         # Core business services (OSRM Route service)
│   └── app.js            # App setup, middleware declaration, route binding
├── prisma/
│   ├── schema.prisma     # DB tables declaration and relational attributes
│   └── seed.js           # Database seeder scripts for roles/users
└── package.json          # Node server scripts & package requirements
```

---

## Key Backend Components

### 1. Controllers & Route Handling
- **`authController.js`**: Handles user password hashing, JWT creation, and session validation.
- **`bookingController.js`**: Orchestrates creation, timeline tracking, and client acceptances. Integrates with OSRM (Open Source Routing Machine) to calculate distance/durations on the fly.
- **`brokerController.js`**: Contains broker operations including bid submissions, commission reports, and driver/fleet dispatch assignments.

### 2. Middleware & Protection
- **`authMiddleware.js`**: Checks the incoming request's cookie or token authorization.
  - `requireAuth`: Rejects unauthenticated requests with `401 Unauthorized`.
  - `requireRole(role)`: Validates that the logged-in user matches the requested access level (e.g., `BROKER` or `ADMIN`).

### 3. Database Access
- **Prisma Client**: Used exclusively to query the database. It guarantees transactional integrity by supporting database transactions (`tx.notification.create`, etc.).
