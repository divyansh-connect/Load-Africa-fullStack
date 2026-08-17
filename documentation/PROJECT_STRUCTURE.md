# Project Structure

This document provides a map of the LoadAfrica codebase.

```
Load-Africa-fullStack/
├── Frontend/             # React SPA application source code
│   ├── src/
│   │   ├── components/   # Reuseable UI parts (Maps, Inputs, Buttons)
│   │   ├── data/         # Mock data database system (mockData.js)
│   │   ├── layouts/      # Sidebar templates (Customer, Broker, Admin)
│   │   ├── pages/        # Views (Auth, Dashboards, Booking creation pages)
│   │   ├── services/     # API handlers (authService.js, bookingService.js)
│   │   ├── App.jsx       # Router declaration
│   │   └── main.jsx      # React DOM bootstrap
│   └── package.json      # Frontend package configuration
├── backend/              # Node/Express server source code
│   ├── prisma/           # Prisma schema definition and migration logs
│   ├── src/
│   │   ├── controllers/  # Route controller modules
│   │   ├── middlewares/  # Authentication checks
│   │   ├── routes/       # Express route routing
│   │   └── app.js        # Server bootstrap script
│   └── package.json      # Backend dependency manifests
└── documentation/        # Markdown architecture and developer guides
```
