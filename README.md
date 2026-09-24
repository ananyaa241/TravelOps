# ✈️ TRAVELOPS
### Corporate Travel Approval, Concierge Booking & Expense Management Platform

> A modern, enterprise-grade corporate travel governance and expense management SaaS built with the MERN stack (MongoDB, Express.js, React.js, Node.js), Tailwind CSS, Lucide Icons, and Recharts.

---

## 🌟 Product Overview

**TravelOps** manages the complete corporate travel lifecycle:

```
Employee: Request Travel
      ↓
Live Policy Validation (Hotel caps, Meals per-diem, Flights)
      ↓
Manager Approval (Tier 1)
      ↓
Finance / Admin Approval (If Policy Exception or > ₹50k)
      ↓
Travel Coordinator Concierge Booking (IndiGo, Air India, Taj Hotels)
      ↓
Interactive Itinerary Generation (Flights, Hotels, Transits, Meetings)
      ↓
Post-Trip Expense Submission (Digital Receipts, Merchants, Categories)
      ↓
Finance Officer Audit & Verification
      ↓
Reimbursement Payout & Bank Disbursement (NEFT / RTGS / UPI)
      ↓
Audit Trail & Analytics Intelligence (Recharts & CSV Exports)
```

---

## 👥 Role-Based Access Control (RBAC) & Demo Personas

TravelOps includes 5 pre-configured demo accounts for testing all workflows. You can switch personas with **1-click** inside the app navbar or login screen:

| Role | Demo Email | Password | Primary Functions |
|------|------------|----------|-------------------|
| **EMPLOYEE** | `employee@travelops.demo` | `TravelOps@2026` | Create multi-step travel requests, view upcoming itineraries, submit post-trip receipts & claim reimbursements. |
| **MANAGER** | `manager@travelops.demo` | `TravelOps@2026` | Authorize team travel requests, approve policy exceptions, monitor department budget. |
| **TRAVEL COORDINATOR** | `coordinator@travelops.demo` | `TravelOps@2026` | Concierge booking desk, issue flight/hotel confirmation vouchers (PNR), manage vendor roster. |
| **FINANCE OFFICER** | `finance@travelops.demo` | `TravelOps@2026` | Review claims, audit invoices, approve expense batches, disburse bank reimbursements. |
| **COMPANY ADMIN** | `admin@travelops.demo` | `TravelOps@2026` | Manage travel policy engine rules, departments, users, system configuration & analytics. |

---

## 🏗️ Architecture & Project Structure

```
TravelOps/
 ├── backend/
 │   ├── src/
 │   │   ├── config/          # MongoDB Atlas configuration
 │   │   ├── controllers/     # Thin controllers for all modules
 │   │   ├── middleware/      # JWT auth, RBAC, error handlers
 │   │   ├── models/          # 13 Mongoose models (User, TravelRequest, Booking, etc.)
 │   │   ├── routes/          # RESTful endpoints
 │   │   ├── services/        # Policy Engine, Audit Logger, Notification Dispatcher
 │   │   ├── seed/            # Indian corporate seed data generator
 │   │   └── server.js        # Express app entry point
 │   ├── .env.example
 │   └── package.json
 │
 ├── frontend/
 │   ├── src/
 │   │   ├── components/      # Badges, Modals, StatCards, Timelines, Wizards
 │   │   ├── context/         # AuthContext with 1-click persona switcher
 │   │   ├── pages/           # Role-specific Dashboards, Travel, Bookings, Expenses, Reports, Audit
 │   │   ├── services/        # Centralized Axios API client
 │   │   ├── routes/          # Protected Route Guards
 │   │   ├── App.jsx
 │   │   └── main.jsx
 │   ├── tailwind.config.js   # Enterprise luxury design system tokens
 │   └── package.json
 └── README.md
```

---

## 🚀 Local Quickstart Guide

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env

# Optional: Run seed data generator
npm run seed

# Start API server (port 5000)
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Start Vite dev server (port 5173)
npm run dev
```

Open `http://localhost:5173` in your browser and log in with any demo account!

---

## 🗄️ MongoDB Atlas Setup Guide

1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a Database User with read/write permissions.
3. In **Network Access**, whitelist your IP (`0.0.0.0/0` for cloud deployment).
4. Copy your connection string and add it to `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/travelops?retryWrites=true&w=majority
   ```
5. Seed your database: `npm run seed` inside `backend/`.

---

## ☁️ Deployment Instructions

### Backend → Render (or Railway)
1. Push `backend/` to your Git repository.
2. In Render, create a **New Web Service**.
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `node src/server.js`
5. Add Environment Variables:
   - `NODE_ENV`: `production`
   - `PORT`: `10000`
   - `MONGODB_URI`: `<Your MongoDB Atlas URI>`
   - `JWT_SECRET`: `<Secure Random String>`
   - `CLIENT_URL`: `https://your-frontend.vercel.app`
6. Health Check URL: `GET /api/health`

### Frontend → Vercel
1. Push `frontend/` to your Git repository.
2. Import project in Vercel.
3. Framework Preset: **Vite**.
4. Set Environment Variable:
   - `VITE_API_URL`: `https://your-backend.onrender.com/api`
5. Click **Deploy**!

---

## 🛡️ Enterprise Security Best Practices
- Strict Helmet security headers
- Production CORS origin whitelisting
- Express rate limiting
- Bcrypt password hashing (salt rounds = 10)
- Excluded password fields in API responses
- Centralized asynchronous error handling
