# LedgerFlow — Smart Ledger Management System

> **Phase 0 — Foundation**: MERN project scaffold, stateless JWT authentication, modular server architecture, and a modern financial dashboard shell with responsive sidebar navigation.

---

## 🏗️ Architecture Overview

```text
Ledgerflow/
├── client/                      # React Frontend (Vite + shadcn/ui + Tailwind CSS v3)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/              # shadcn/ui Primitives (button, card, dialog, table, badge, input, label, avatar, tabs)
│   │   │   ├── Layout.jsx       # App Shell (Sidebar + Topbar + Content Outlet)
│   │   │   ├── Navbar.jsx       # Top navigation with live API health, search, & notifications
│   │   │   ├── Sidebar.jsx      # Navigation sidebar with route indicators and user card
│   │   │   ├── StatCard.jsx     # Financial metrics card with trend indicators
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/             # AuthContext (JWT session hydration & state)
│   │   ├── lib/
│   │   │   └── utils.js         # shadcn cn() helper (clsx + tailwind-merge)
│   │   ├── pages/               # Views (Dashboard, People, Login, Register, PlaceholderPage)
│   │   ├── services/            # API client service with Bearer token injection
│   │   ├── index.css            # shadcn/ui Neutral Monochrome theme tokens & Tailwind directives
│   │   ├── App.jsx              # Routing configuration
│   │   └── main.jsx             # React entrypoint
│   ├── components.json          # shadcn/ui configuration file
│   ├── tailwind.config.js       # Tailwind CSS v3 configuration with shadcn tokens
│   ├── postcss.config.js        # PostCSS configuration with Tailwind & Autoprefixer
│   ├── vite.config.js           # Vite config with @ alias & /api proxy to localhost:5000
│   └── package.json
│
├── server/                      # Node.js / Express Backend API
│   ├── config/
│   │   └── db.js                # MongoDB / Mongoose connection with auto-reconnect
│   ├── controllers/
│   │   └── authController.js    # Register, login, getMe, updateProfile logic
│   ├── middleware/
│   │   ├── authMiddleware.js    # JWT Bearer token protection & role authorization
│   │   └── errorMiddleware.js   # Centralized error handler & 404 handler
│   ├── models/
│   │   └── User.js              # Mongoose user schema with bcrypt password hashing
│   ├── routes/
│   │   └── authRoutes.js        # Auth REST endpoints
│   ├── server.js                # Express app entrypoint & health checks
│   ├── .env                     # Server environment variables
│   └── package.json
│
├── package.json                 # Monorepo / workspace helper scripts
└── README.md
```

---

## ⚡ Quick Start

### 1. Install Dependencies
Run the installation script from the project root:
```bash
npm run install:all
```
*(Or individually in both `./server` and `./client` via `npm install`)*

### 2. Start Backend Server
```bash
npm run server
```
*Backend runs on `http://localhost:5000`.*
*Health endpoint: `http://localhost:5000/api/health`.*

### 3. Start Frontend Client
```bash
npm run client
```
*Vite React client runs on `http://localhost:5173` with proxy routing for `/api`.*

---

## 🔑 Preconfigured Demo Credentials

For instant evaluation without manual signup:
- **Email:** `admin@ledgerflow.io`
- **Password:** `ledgerflow123`
*(A 1-click "Quick Demo Admin" button is also provided directly on the Login page).*

---

## 🛡️ Authentication & API Endpoints

### Auth Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new organization user & receive JWT token |
| `POST` | `/api/auth/login` | Public | Authenticate with email/password & receive JWT token |
| `GET` | `/api/auth/me` | Private (Bearer) | Fetch current authenticated user profile |
| `PUT` | `/api/auth/profile` | Private (Bearer) | Update user profile and organization settings |
| `GET` | `/api/health` | Public | Ping server status & MongoDB connection state |

### People & Contacts Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/people` | Private (Bearer) | List/search people with optional `?type=Customer\|Supplier\|Staff` & `?search=term` |
| `POST` | `/api/people` | Private (Bearer) | Add a person (`type`, `name`, `mobile`, `address`) |
| `GET` | `/api/people/:id` | Private (Bearer) | Retrieve single person details by ID |
| `PUT` | `/api/people/:id` | Private (Bearer) | Edit person fields (`type`, `name`, `mobile`, `address`) |
| `DELETE` | `/api/people/:id` | Private (Bearer) | Remove person from directory |

### Transactions Routes
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/transactions` | Private (Bearer) | List/search transactions with optional `?type=Sale\|Purchase\|Payment\|Receipt\|Expense` & `?search=keyword` |
| `POST` | `/api/transactions` | Private (Bearer) | Record transaction (`type`, `party`, `amount`, `date`, `notes`) |
| `GET` | `/api/transactions/:id` | Private (Bearer) | View single transaction details (populates counterparty) |
| `PUT` | `/api/transactions/:id` | Private (Bearer) | Edit transaction fields (`type`, `party`, `amount`, `date`, `notes`) |
| `DELETE` | `/api/transactions/:id` | Private (Bearer) | Delete transaction by ID |

---

## 👥 People Module Specifications

- **Model (`Person`)**:
  - `type`: Enum (`'Customer'`, `'Supplier'`, `'Staff'`), required
  - `name`: String, required, trimmed
  - `mobile`: String, trimmed
  - `address`: String, trimmed
  - `user`: ObjectId referencing `User` (tenant isolation)
- **Client Page (`/people`)**:
  - Live search bar filtering by name, mobile, or address
  - Filter tabs (`All`, `Customer`, `Supplier`, `Staff`) with dynamic count badges
  - "+ Add Person" modal form with relationship picker
  - Edit modal for updating records
  - Delete confirmation dialog with safety warning
  - Color-coded badges and initial avatars

---

## 💸 Transactions Module Specifications

- **Model (`Transaction`)**:
  - `type`: Enum (`'Sale'`, `'Purchase'`, `'Payment'`, `'Receipt'`, `'Expense'`), required
  - `party`: ObjectId referencing `Person` (optional counterparty)
  - `amount`: Number, positive (> 0), required
  - `date`: Date, default `Date.now`, required
  - `notes`: String, trimmed
  - `user`: ObjectId referencing `User` (tenant isolation)
- **Client Page (`/transactions`)**:
  - Financial KPI Cards (Total Inflows, Total Outflows, Net Cash Flow, Active Vouchers)
  - Type Filter Tabs (`All`, `Sale`, `Purchase`, `Payment`, `Receipt`, `Expense`) with dynamic count badges
  - Real-time search across description, amount, and counterparty
  - Data Table with color-coded badges, signed amounts, and populated counterparty
  - Create & Edit Dialog Modal with type dropdown, dynamic party selector, amount, date, and notes
  - Delete confirmation modal with safety alert

---

## 🧭 Project Deliverables Checklist

- [x] **MERN Project Scaffold**: React (Vite) client + Express (Node.js) server.
- [x] **MongoDB Connection**: Configured with Mongoose auto-reconnect and resilient development fallback.
- [x] **Stateless JWT Auth**: Register, Login, Protected Routes, bcrypt password hashing, token persistence in client `localStorage`.
- [x] **Folder Structure**: Clean separation of `models`, `routes`, `controllers`, and `middleware` in server; modular components, contexts, and pages in client.
- [x] **shadcn/ui Design System**: Configured with Tailwind CSS v3, Neutral Monochrome palette, and accessible Radix primitives.
- [x] **Dashboard Shell & Sidebar Nav**: Responsive sidebar with links for modules (`/`, `/transactions`, `/people`, `/ledger`, `/invoices`, `/expenses`, `/reports`, `/settings`).
- [x] **People Module**: Full CRUD (Add, List/Search with type filter, Edit, Delete) with modern client UI and REST API.
- [x] **Transactions Module**: Full CRUD (Create, List with type filter & search, View, Edit, Delete) with shadcn UI, KPI cards, and counterparty linking.
