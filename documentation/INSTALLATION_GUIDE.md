# Installation Guide

Follow these instructions to set up, build, and run the LoadAfrica application locally.

---

## 1. Prerequisites
- **Node.js**: Ensure Node.js (version 16 or newer) is installed.
- **Database**: PostgreSQL or MySQL database service running locally or in the cloud.

---

## 2. Environment Variables

Create a `.env` file inside the `backend` folder:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/loadafrica?schema=public"
JWT_SECRET="supersecretkey123"
PORT=5000
VITE_API_URL="http://localhost:5000/api/v1"
```

---

## 3. Database Setup

From the `backend` directory, perform the following commands:

```bash
# Install node packages
npm install

# Run database migrations
npx prisma migrate dev --name init

# Seed initial roles and test data
npm run seed
```

---

## 4. Running the Applications

### Backend Server
From the `backend` directory:
```bash
# Start server in development mode
npm run dev
```

### Frontend Server
From the `Frontend` directory:
```bash
# Install node packages
npm install

# Start local server
npm run dev
```

The frontend will run at `http://localhost:5173`.
