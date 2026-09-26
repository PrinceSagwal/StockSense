<div align="center">

# 📦 StockSense

### Modular Real-Time Inventory Management System

[![Stack](https://img.shields.io/badge/Stack-MERN-00d8ff?style=for-the-badge)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-19.2.0-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7.3.1-646cff?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2.1-38bdf8?style=for-the-badge&logo=tailwindcss)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

> Replace manual registers, Excel sheets, and scattered tracking methods with a  
> **centralized, role-based, real-time inventory platform** — built for Inventory Managers and Warehouse Staff.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Project Structure](#-project-structure) • [Quick Start](#-quick-start) • [Roadmap](./ROADMAP.md) • [Architecture](./ARCHITECTURE.md) • [Setup Guide](./SETUP.md)

</div>

---

## 🧩 What is StockSense?

StockSense is a **modular Inventory Management System (IMS)** that digitizes and streamlines all stock-related operations within a business. It provides:

- A **real-time dashboard** with live KPIs and stock health metrics
- **Role-based access** for Inventory Managers and Warehouse Staff
- A complete **audit trail** for every stock movement via the Stock Ledger
- **Multi-warehouse support** with precise location-based stock tracking
- Smart **low stock alerts** delivered by email and SMS
- A **professional, animated UI** built for speed and clarity

---

## ✨ Features

### 🔐 Authentication
- User signup & login secured with **JWT stored in HTTP-only cookies**
- **OTP-based password reset** via Twilio (SMS) + Nodemailer (email)
- Protected routes with role-based access control
- Redirect to Inventory Dashboard on successful login

### 📊 Dashboard
Real-time operational snapshot with:
- **Total Products in Stock**
- **Low Stock / Out of Stock Items** (highlighted alerts)
- **Pending Receipts** count
- **Pending Deliveries** count
- **Internal Transfers Scheduled**

Dynamic filters across all operation lists:
- By document type: Receipts / Delivery / Internal / Adjustments
- By status: Draft → Waiting → Ready → Done → Canceled
- By warehouse or location
- By product category

### 📦 Product Management
Create and manage products with full detail:
- Product Name
- SKU / Code (unique identifier, searchable)
- Category
- Unit of Measure (kg, pcs, litres, metres, etc.)
- Optional Initial Stock at creation
- Stock availability broken down **per location**
- Reordering rules (minimum quantity threshold for alerts)

### 📥 Receipts — Incoming Goods
Used when items arrive from vendors:
1. Create a new receipt
2. Add supplier & product lines with expected quantities
3. Input quantities actually received
4. **Validate → stock increases automatically**
5. Every line logged as a `StockMove` entry in the ledger

> **Example:** Receive 50 units of "Steel Rods" → `stockQuantity +50`

### 📤 Delivery Orders — Outgoing Goods
Used when stock leaves the warehouse for customer shipment:
1. Pick items from source location
2. Pack items
3. **Validate → stock decreases automatically**
4. System rejects validation if quantity exceeds available stock

> **Example:** Sales order for 10 chairs → `stockQuantity -10`

### 🔄 Internal Transfers
Move stock inside the company without changing total quantity:
- Main Warehouse → Production Floor
- Rack A → Rack B
- Warehouse 1 → Warehouse 2

Each movement is logged in the ledger. Total stock unchanged; only `stockPerLocation` is updated.

### 🔧 Stock Adjustments
Fix mismatches between recorded stock and physical count:
1. Select product and location
2. Enter physically counted quantity
3. System calculates difference and auto-updates
4. Adjustment logged with reason and timestamp

### 📋 Move History / Stock Ledger
- Complete, immutable audit trail of every stock movement
- Filterable by product (name/SKU), operation type, date range, warehouse/location
- Columns: Date, Product, SKU, Type, From → To, Qty Change, Reference, User

### 🏭 Warehouse Management (Settings)
- Create and manage multiple warehouses
- Define locations within each warehouse (racks, shelves, zones, bins)
- All transfer and receipt operations reference warehouses and locations

---

## 🛠️ Tech Stack

### Frontend

| Package | Version | Role |
|---|---|---|
| **React** | 19.2.0 | Core UI Framework |
| **Vite** | 7.3.1 | Build Tool & Dev Server |
| **React Router DOM** | 7.13.1 | Client-side Routing |
| **Tailwind CSS** | 4.2.1 | Utility-first CSS Framework |
| **@tailwindcss/vite** | 4.2.1 | Vite plugin for Tailwind v4 |
| **Framer Motion** | 12.35.0 | Page & Component Animations |
| **Zustand** | 5.0.11 | Lightweight Global State Management |
| **Axios** | 1.13.6 | HTTP Client for API Calls |
| **Socket.io Client** | 4.8.3 | Real-time WebSocket Communication |
| **React Hot Toast** | 2.6.0 | Toast Notifications |
| **@fortawesome/fontawesome-free** | 7.2.0 | Icon Library |
| **React Parallax Tilt** | 1.7.319 | Interactive 3D Tilt on Cards (Auth pages) |
| **React Markdown** | 10.1.0 | Markdown Rendering |

### Backend

| Package | Version | Role |
|---|---|---|
| **Node.js** | 18+ | JavaScript Runtime |
| **Express** | 4.18.2 | REST API Framework |
| **Mongoose** | 8.1.1 | MongoDB ODM |
| **jsonwebtoken** | 9.0.2 | JWT Auth Tokens |
| **bcryptjs** | 2.4.3 | Password Hashing |
| **Socket.io** | 4.7.4 | Real-time Server Events |
| **Nodemailer** | 6.9.9 | Email (OTP + Low Stock Alerts) |
| **Twilio** | 4.23.0 | SMS OTP |
| **Cloudinary** | 2.0.1 | Image / File Cloud Storage |
| **Multer** | 1.4.5-lts.1 | File Upload Middleware |
| **cookie-parser** | 1.4.7 | Cookie Handling |
| **Helmet** | 7.1.0 | HTTP Security Headers |
| **CORS** | 2.8.5 | Cross-Origin Policy |
| **Morgan** | 1.10.0 | HTTP Request Logger |
| **express-rate-limit** | 7.1.5 | API Rate Limiting |
| **express-validator** | 7.0.1 | Request Input Validation |
| **dotenv** | 16.4.1 | Environment Variable Management |
| **nodemon** | 3.0.3 | Auto-restart Dev Server |

---

## 📁 Project Structure

```
StockSense/
├── client/                                 # React + Vite Frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/                         # Logos, static images
│   │   ├── components/
│   │   │   ├── common/                     # Button, Input, Modal, Badge, Spinner, Table, EmptyState
│   │   │   ├── layout/                     # Sidebar, Topbar, PageWrapper, ProtectedRoute
│   │   │   ├── dashboard/                  # KPICard, StockChart, RecentActivity, LowStockAlert
│   │   │   ├── products/                   # ProductForm, ProductTable, ProductCard, StockBadge
│   │   │   ├── receipts/                   # ReceiptForm, ReceiptList, ReceiptLineRow
│   │   │   ├── deliveries/                 # DeliveryForm, DeliveryList, DeliveryLineRow
│   │   │   ├── transfers/                  # TransferForm, TransferList, LocationSelector
│   │   │   └── adjustments/               # AdjustmentForm, DifferencePreview
│   │   ├── pages/
│   │   │   ├── Auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Signup.jsx
│   │   │   │   └── ForgotPassword.jsx      # Multi-step OTP reset
│   │   │   ├── Dashboard/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── Products/
│   │   │   │   ├── ProductList.jsx
│   │   │   │   ├── ProductCreate.jsx
│   │   │   │   └── ProductDetail.jsx
│   │   │   ├── Receipts/
│   │   │   │   ├── ReceiptList.jsx
│   │   │   │   ├── ReceiptCreate.jsx
│   │   │   │   └── ReceiptDetail.jsx
│   │   │   ├── Deliveries/
│   │   │   │   ├── DeliveryList.jsx
│   │   │   │   ├── DeliveryCreate.jsx
│   │   │   │   └── DeliveryDetail.jsx
│   │   │   ├── Transfers/
│   │   │   │   ├── TransferList.jsx
│   │   │   │   └── TransferCreate.jsx
│   │   │   ├── Adjustments/
│   │   │   │   └── AdjustmentPage.jsx
│   │   │   ├── MoveHistory/
│   │   │   │   └── MoveHistory.jsx
│   │   │   ├── Warehouses/
│   │   │   │   └── WarehouseSettings.jsx
│   │   │   └── Profile/
│   │   │       └── MyProfile.jsx
│   │   ├── store/                          # Zustand global stores
│   │   │   ├── useAuthStore.js
│   │   │   ├── useProductStore.js
│   │   │   ├── useReceiptStore.js
│   │   │   ├── useDeliveryStore.js
│   │   │   ├── useTransferStore.js
│   │   │   ├── useAdjustmentStore.js
│   │   │   └── useDashboardStore.js
│   │   ├── hooks/
│   │   │   ├── useSocket.js                # Socket.io event subscriptions
│   │   │   ├── useFilters.js               # Reusable filter state
│   │   │   └── usePagination.js
│   │   ├── api/
│   │   │   ├── axiosInstance.js            # Base Axios with interceptors
│   │   │   ├── authAPI.js
│   │   │   ├── productAPI.js
│   │   │   ├── receiptAPI.js
│   │   │   ├── deliveryAPI.js
│   │   │   ├── transferAPI.js
│   │   │   ├── adjustmentAPI.js
│   │   │   ├── warehouseAPI.js
│   │   │   └── dashboardAPI.js
│   │   ├── socket/
│   │   │   └── socket.js                  # Socket.io client initialization
│   │   ├── utils/
│   │   │   ├── formatters.js              # Date, quantity, status formatters
│   │   │   ├── validators.js
│   │   │   └── constants.js               # Enums: STATUS, OPERATION_TYPE, UOM_LIST
│   │   ├── App.jsx                        # Router + Layout
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                                # Node.js + Express Backend
│   ├── config/
│   │   ├── db.js                          # MongoDB connection
│   │   ├── cloudinary.js                  # Cloudinary SDK config
│   │   └── socket.js                      # Socket.io server setup
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── receiptController.js
│   │   ├── deliveryController.js
│   │   ├── transferController.js
│   │   ├── adjustmentController.js
│   │   ├── warehouseController.js
│   │   └── dashboardController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Product.js
│   │   ├── Category.js
│   │   ├── Warehouse.js
│   │   ├── Location.js
│   │   ├── Receipt.js
│   │   ├── DeliveryOrder.js
│   │   ├── InternalTransfer.js
│   │   ├── StockAdjustment.js
│   │   └── StockMove.js                  # Ledger — every movement ever
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── productRoutes.js
│   │   ├── receiptRoutes.js
│   │   ├── deliveryRoutes.js
│   │   ├── transferRoutes.js
│   │   ├── adjustmentRoutes.js
│   │   ├── warehouseRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── moveRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js              # JWT verification + role guard
│   │   ├── rateLimiter.js                 # express-rate-limit config
│   │   ├── uploadMiddleware.js            # Multer + Cloudinary config
│   │   └── errorHandler.js               # Global error handler
│   ├── utils/
│   │   ├── generateToken.js               # JWT signer
│   │   ├── generateOTP.js                 # 6-digit OTP generator
│   │   ├── sendEmail.js                   # Nodemailer helper
│   │   ├── sendSMS.js                     # Twilio helper
│   │   └── stockEngine.js                 # Core stock calculation logic
│   ├── .env
│   ├── server.js                          # App entry point
│   └── package.json
│
├── README.md
├── ROADMAP.md
├── ARCHITECTURE.md
├── SETUP.md
└── .gitignore
```

---

## ⚙️ Environment Variables

### `server/.env`
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/stocksense
JWT_SECRET=your_jwt_secret_min_32_chars
JWT_EXPIRES_IN=7d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_16char_app_password
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890
CLIENT_URL=http://localhost:5173
```

### `client/.env`
```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🚀 Quick Start

Full setup instructions in **[SETUP.md](./SETUP.md)**.

```bash
# Clone the repo
git clone https://github.com/yourusername/StockSense.git
cd StockSense

# Server
cd server && npm install && cp .env.example .env
# Fill in .env values, then:
npm run dev

# Client (new terminal)
cd client && npm install && cp .env.example .env
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

---

## 🗺️ Roadmap

See **[ROADMAP.md](./ROADMAP.md)** for the full phase-by-phase development plan.

---

## 🏗️ Architecture

See **[ARCHITECTURE.md](./ARCHITECTURE.md)** for MongoDB schemas, API routes, Socket.io events, Zustand store shapes, stock engine logic, and UI design principles.

---

## 📜 License

MIT ©️ StockSense