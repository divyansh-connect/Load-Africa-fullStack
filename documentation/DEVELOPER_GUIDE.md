# Developer Guide

This guide describes development workflows and conventions for maintaining the LoadAfrica platform.

---

## 1. Naming Conventions

### Frontend
- **Components & Pages**: UpperCamelCase (e.g., `CreateBooking.jsx`, `AddressInput.jsx`).
- **Styles**: Tailwind CSS utility classes. Avoid inline style elements.
- **Service modules**: camelCase (e.g., `authService.js`, `bookingService.js`).

### Backend
- **Routes**: kebab-case (e.g., `/api/v1/booking-assignments`).
- **Controllers**: camelCase (e.g., `bookingController.js`).
- **DB tables & columns**: snake_case for PostgreSQL mapping (e.g., `user_id`, `created_at`).

---

## 2. Adding a New API Endpoint
1. Define the model inside `backend/prisma/schema.prisma` if database persistence is needed.
2. Run database migration command: `npx prisma migrate dev --name your_migration_name`.
3. Create controller function inside the corresponding controller under `backend/src/controllers/`.
4. Register your API endpoint under the appropriate route file inside `backend/src/routes/`.

---

## 3. Adding a New Page to Frontend
1. Create your component page inside `Frontend/src/pages/` under the appropriate user role subdirectory.
2. Register the route path inside `Frontend/src/App.jsx` nested within the layout path block.
3. Import and add a navigation link to your new route inside the layout file (e.g., `CustomerLayout.jsx` or `BrokerLayout.jsx`).
