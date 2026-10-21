 <div align="center">

# LedgerFlow

### Smart Ledger Management System

Manage transactions, contacts, shared expenses, savings goals, and upcoming payments in one connected workspace.

[![Live Demo](https://img.shields.io/badge/LIVE_DEMO-Try_LedgerFlow-111111?style=for-the-badge&logo=vercel&logoColor=white)](https://ledger-flow-six.vercel.app/)
[![GitHub Repository](https://img.shields.io/badge/GITHUB-View_Repository-24292f?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Vincentmx2000/LedgerFlow)

<br>

![React](https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-Build_Tool-646CFF?style=flat&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-Runtime-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-Backend-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=flat&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Styling-06B6D4?style=flat&logo=tailwindcss&logoColor=white)
![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?style=flat&logo=vercel&logoColor=white)
![Render](https://img.shields.io/badge/Backend-Render-46E3B7?style=flat&logo=render&logoColor=black)

<br>

[Features](#-features) · [Screenshots](#-screenshots) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Overview](#-api-overview)

</div>

---

## 📌 About

**LedgerFlow** is a full-stack ledger and money-management application built using the MERN stack. It brings contact management, financial transactions, shared expenses, savings goals, and payment planning together in one connected workspace.

Inspired by business management platforms such as Zoho Books and Vyapar, LedgerFlow focuses on making financial activities easier to organize, manage, and track through a clean interface.

**Live application:** [ledger-flow-six.vercel.app](https://ledger-flow-six.vercel.app/)

## ✨ Features

| Module | Description |
|---|---|
| **People Management** | Manage customers, suppliers, staff, vendors, and consultants with search, filters, and custom roles. |
| **Transactions** | Record financial transactions, payments, receipts, purchases, and expenses with inflow and outflow tracking. |
| **Vault** | Create savings wallets, set financial targets, add funds, and track progress toward goals. |
| **Split & Collect** | Divide expenses among multiple people, split amounts equally, validate totals, and track payment status. |
| **Planner** | Schedule upcoming payments, collections, and expenses, and track due dates and completion status. |
| **Authentication** | Register and sign in using JWT-based authentication. |
| **Dynamic Roles** | Create custom contact roles and use them in contact forms and directory filters. |
| **Responsive Interface** | Navigate financial management modules through a consistent interface. |


## 🖥️ Screenshots

Explore the LedgerFlow interface below.

### Landing Page

<div align="center">
  <img src="https://github.com/user-attachments/assets/24cdf01a-912b-4756-85f9-277518f2ab9b" alt="LedgerFlow landing page" width="100%">
</div>

### Dashboard

<div align="center">
  <img src="https://github.com/user-attachments/assets/8aa1d21d-4560-4b30-9fb0-813650dc4888" alt="LedgerFlow dashboard" width="100%">
</div>

### Transactions

<div align="center">
  <img src="https://github.com/user-attachments/assets/ed73da61-598a-40ca-b19e-214e16c6a0b9" alt="LedgerFlow transactions page" width="100%">
</div>

### Vault

<div align="center">
  <img src="https://github.com/user-attachments/assets/ce5627cd-08d7-43e4-9b8a-776d99cec283" alt="LedgerFlow vault page" width="100%">
</div>

### Planner

<div align="center">
  <img src="https://github.com/user-attachments/assets/d3023e0c-94c3-4fac-8c56-bc5d95e73db1" alt="LedgerFlow planner page" width="100%">
</div>

### Split & Collect

<div align="center">
  <img src="https://github.com/user-attachments/assets/20626a04-6999-4cd6-8053-d6ddaa7f8e35" alt="LedgerFlow split and collect page" width="100%">
</div>

### People Management

<div align="center">
  <img src="https://github.com/user-attachments/assets/2374afab-8413-4bce-a339-916760e3805a" alt="LedgerFlow people management page" width="100%">
</div>

## 🛠️ Tech Stack

### Frontend

- React
- Vite
- JavaScript (ES6+)
- Tailwind CSS
- React Router
- Lucide icons

### Backend

- Node.js
- Express.js
- REST APIs
- JWT authentication

### Database

- MongoDB
- Mongoose

### Deployment

- **Frontend:** [Vercel](https://vercel.com/)
- **Backend:** [Render](https://render.com/)
- **Database:** MongoDB, with Atlas available for cloud hosting

## 📂 Project Structure

```text
LedgerFlow/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── services/
│   │   └── ...
│   ├── index.html
│   └── package.json
├── server/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── server.js
│   └── package.json
└── README.md
```

## 🚀 Getting Started

Follow these steps to run LedgerFlow locally.

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [MongoDB](https://www.mongodb.com/) or a MongoDB Atlas connection

### 1. Clone the Repository

```bash
git clone https://github.com/Vincentmx2000/LedgerFlow.git
cd LedgerFlow
```

### 2. Set Up the Backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory. Use the project's environment template if one is available.

Example configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_private_random_secret
```

Use the exact variable names required by your backend code. Keep your real credentials private and never commit them to GitHub.

Start the backend using the development script defined in `server/package.json`. If the project provides a `dev` script, run:

```bash
npm run dev
```

The backend should be available at `http://localhost:5000` if port `5000` is configured.

### 3. Set Up the Frontend

Open a second terminal from the project root:

```bash
cd client
npm install
npm run dev
```

Vite typically serves the frontend at:

**http://localhost:5173**

During local development, the Vite proxy forwards `/api` requests to the backend when configured.

### 4. Open LedgerFlow

Visit `http://localhost:5173`, create an account if registration is enabled, and explore the available modules.

## 🌐 Deployment

LedgerFlow uses separate hosting for its frontend and backend.

| Component | Platform | Link |
|---|---|---|
| Frontend | Vercel | [Open LedgerFlow](https://ledger-flow-six.vercel.app/) |
| Backend | Render | [Backend URL](https://ledgerflow-jw1r.onrender.com) |
| Source Code | GitHub | [View Repository](https://github.com/Vincentmx2000/LedgerFlow) |

### Production Configuration

- Set the frontend API URL in Vercel using the environment variable expected by the client, such as `VITE_API_URL`.
- Configure backend environment variables in Render.
- Allow the deployed frontend origin in the backend CORS configuration.
- Configure MongoDB credentials securely in the backend environment.
- Push changes to the connected GitHub branch to trigger deployments when automatic deployments are enabled.

## 🔌 API Overview

The following table lists the main API areas used by the application.

| Module | Base Route |
|---|---|
| Authentication | `/api/auth` |
| People | `/api/people` |
| Roles | `/api/roles` |
| Transactions | `/api/transactions` |
| Vaults | `/api/vaults` |
| Split & Collect | `/api/split-collections` |
| Planner | `/api/plans` |
| Health Check | `/api/health` |

Protected routes require the authentication mechanism configured by the backend. For JWT-protected routes, this typically means sending an `Authorization: Bearer <token>` header.

## 🔒 Security

- Keep database credentials and authentication secrets out of source control.
- Use environment variables for production configuration.
- Configure CORS to allow only intended frontend origins.
- Use HTTPS for production requests.
- Avoid exposing sensitive server errors or authentication details to clients.

## 🗺️ Future Improvements

Potential enhancements include:

- Financial summaries and visual analytics.
- Exportable transaction reports.
- Expanded automated testing.
- Additional accessibility and mobile usability improvements.

These are possible future enhancements, not claims that they are already implemented.

## 👨‍💻 Author

**Vincent** — Full-Stack Developer

[![GitHub](https://img.shields.io/badge/GitHub-Vincentmx2000-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Vincentmx2000)

---

<div align="center">

**LedgerFlow — Keep your finances organized.**

[Live Demo](https://ledger-flow-six.vercel.app/) · [GitHub Repository](https://github.com/Vincentmx2000/LedgerFlow)

</div>
