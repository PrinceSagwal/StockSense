# 🗺️ StockSense — Development Roadmap

> This roadmap is the authoritative development plan for StockSense.  
> **Agent instructions:** Complete all tasks within a phase in order before starting the next phase.  
> A phase is only DONE when all its checklist items are complete, no console errors exist, and all stock operations are verified to work correctly.

---

## 📋 Phase Overview

| # | Phase | Description | Status |
|---|---|---|---|
| 1 | Project Setup & Configuration | Scaffold both apps, install deps, set up configs | 🔲 |
| 2 | Authentication System | Signup, login, JWT cookies, OTP reset | 🔲 |
| 3 | Product & Category Management | CRUD products, categories, SKU search | 🔲 |
| 4 | Warehouse & Location Management | Multi-warehouse, nested locations | 🔲 |
| 5 | Receipts — Incoming Goods | Create → validate → stock increases | 🔲 |
| 6 | Delivery Orders — Outgoing Goods | Create → validate → stock decreases | 🔲 |
| 7 | Internal Transfers | Move stock between locations, ledger entry | 🔲 |
| 8 | Stock Adjustments | Fix physical vs recorded count mismatch | 🔲 |
| 9 | Dashboard & KPIs | Real-time stats, charts, alerts | 🔲 |
| 10 | Move History / Stock Ledger | Full audit trail with filters | 🔲 |
| 11 | Real-time (Socket.io) | Live updates across all clients | 🔲 |
| 12 | Notifications & Alerts | Low stock emails, SMS, in-app bell | 🔲 |
| 13 | UI/UX Polish & Animations | Framer Motion, Tilt, responsive, design system | 🔲 |
| 14 | Testing & Deployment | E2E verification, production deploy | 🔲 |

---

## ⚙️ Phase 1 — Project Setup & Configuration

### Backend (server/)
- [ ] Initialize Node.js project with `npm init`
- [ ] Install all server dependencies from `package.json`
- [ ] Create `server.js` — configure Express, CORS, Helmet, Morgan, cookie-parser, JSON body parser
- [ ] Create `config/db.js` — connect MongoDB via Mongoose with error handling
- [ ] Create `config/cloudinary.js` — initialize Cloudinary SDK with env vars
- [ ] Create `config/socket.js` — initialize Socket.io server, attach to HTTP server
- [ ] Create `middleware/errorHandler.js` — global async error handler middleware
- [ ] Create `middleware/rateLimiter.js` — apply express-rate-limit to all API routes
- [ ] Set up `.env` and `.env.example` with all required variable keys (no values in example)
- [ ] Create `.gitignore` — include `node_modules`, `.env`, `dist`
- [ ] Verify server starts and connects to MongoDB without errors

### Frontend (client/)
- [ ] Initialize Vite + React 19 project: `npm create vite@latest client -- --template react`
- [ ] Install all client dependencies from `package.json`
- [ ] Configure `vite.config.js` with:
  - `@vitejs/plugin-react` plugin
  - `@tailwindcss/vite` plugin
  - Dev server proxy: `/api` → `http://localhost:5000`, `/socket.io` → `http://localhost:5000` (ws: true)
- [ ] Add `@import "tailwindcss";` to `src/index.css`
- [ ] Create `api/axiosInstance.js` — base Axios with `baseURL`, `withCredentials: true`, and a 401 response interceptor that redirects to `/login`
- [ ] Create `socket/socket.js` — initialize Socket.io client with `autoConnect: false`
- [ ] Set up React Router DOM v7 in `App.jsx` with all route placeholders
- [ ] Create empty Zustand store shells for all modules
- [ ] Create `components/layout/Sidebar.jsx` — left sidebar with all nav links as per spec:
  - Products
  - Operations: Receipts, Delivery Orders, Inventory Adjustment, Move History
  - Dashboard
  - Settings → Warehouse
  - Profile Menu: My Profile, Logout
- [ ] Create `components/layout/Topbar.jsx` — page title, notification bell, user avatar
- [ ] Create `components/layout/PageWrapper.jsx` — wraps page content with sidebar + topbar
- [ ] Verify Vite dev server starts and hot-reload works

---

## 🔐 Phase 2 — Authentication System

### Backend
- [ ] Create `models/User.js` schema (see ARCHITECTURE.md for full schema)
  - Fields: name, email, password (hashed), role (enum), avatar, otp, otpExpiry, isActive
- [ ] Create `utils/generateToken.js` — sign JWT, set in HTTP-only cookie with options: `httpOnly`, `secure` (in prod), `sameSite`, `maxAge`
- [ ] Create `utils/generateOTP.js` — generate 6-digit numeric OTP, hash with bcryptjs, set 10-minute expiry
- [ ] Create `utils/sendEmail.js` — Nodemailer transporter using Gmail SMTP, HTML email template for OTP
- [ ] Create `utils/sendSMS.js` — Twilio client, send OTP via SMS to user's phone number
- [ ] Create `controllers/authController.js` with these handlers:
  - `signup` — hash password, create user, generate token, set cookie
  - `login` — find user by email, compare password, generate token, set cookie
  - `logout` — clear JWT cookie, return success
  - `forgotPassword` — find user by email, generate OTP, save hashed OTP + expiry, send via email AND SMS
  - `verifyOTP` — compare submitted OTP with hashed value, check expiry, return success
  - `resetPassword` — hash new password, clear otp + otpExpiry, save user
  - `getMe` — return req.user (attached by auth middleware)
  - `updateProfile` — update name, avatar; handle image upload via Cloudinary
- [ ] Create `middleware/authMiddleware.js`:
  - Extract JWT from cookie
  - Verify JWT with `jsonwebtoken`
  - Attach user to `req.user`
  - Return 401 if invalid or missing
- [ ] Create `routes/authRoutes.js` — map all auth endpoints, apply rate limiter to OTP routes
- [ ] Register auth routes in `server.js`

### Frontend
- [ ] Create `pages/Auth/Login.jsx`:
  - Email + Password form with client-side validation
  - Show/hide password toggle with FontAwesome icon
  - Error state from API response
  - Link to Signup and Forgot Password
  - Wrap card in `ReactParallaxTilt` for 3D hover effect
  - Animate card entrance with Framer Motion (scale + fade)
  - Show React Hot Toast on success/error
- [ ] Create `pages/Auth/Signup.jsx`:
  - Name, Email, Role (dropdown: Inventory Manager / Warehouse Staff), Password, Confirm Password
  - Same Tilt + animation treatment as Login
- [ ] Create `pages/Auth/ForgotPassword.jsx` — 3-step flow:
  - Step 1: Enter email → call `POST /api/auth/forgot-password`
  - Step 2: Enter 6-digit OTP → call `POST /api/auth/verify-otp`
  - Step 3: Enter new password + confirm → call `POST /api/auth/reset-password`
  - Animate step transitions with Framer Motion
- [ ] Create `store/useAuthStore.js`:
  - State: `user`, `isAuthenticated`, `isLoading`
  - Actions: `login`, `signup`, `logout`, `fetchUser`, `updateProfile`
  - On `login` success: connect Socket.io
  - On `logout`: disconnect Socket.io
- [ ] Create `components/layout/ProtectedRoute.jsx` — redirect to `/login` if not authenticated
- [ ] Wrap all non-auth routes in `ProtectedRoute`
- [ ] After successful login → navigate to `/dashboard`

---

## 📦 Phase 3 — Product & Category Management

### Backend
- [ ] Create `models/Category.js` — name (unique), description
- [ ] Create `models/Product.js` (full schema in ARCHITECTURE.md):
  - name, sku (unique), category (ref), unitOfMeasure, description, image (Cloudinary URL)
  - stockQuantity (total), stockPerLocation (array of `{ location, warehouse, quantity }`)
  - reorderThreshold (default: 10), isActive (soft delete), createdBy
- [ ] Create `middleware/uploadMiddleware.js` — Multer disk or memory storage, Cloudinary upload stream
- [ ] Create `controllers/productController.js`:
  - `getAllProducts` — list with query filters: `?category=`, `?search=` (name OR sku), `?status=low|out|ok`, `?page=`, `?limit=`
  - `getProductById` — return product with populated `stockPerLocation.location` and `stockPerLocation.warehouse`
  - `createProduct` — validate with express-validator, upload image to Cloudinary, save product
  - `updateProduct` — update fields, replace image if new one uploaded
  - `deleteProduct` — soft delete (`isActive: false`), not permanent
  - `getAllCategories` — list all active categories
  - `createCategory` — create new category
- [ ] Add `express-validator` validation rules for product creation
- [ ] Register product routes in `server.js`

### Frontend
- [ ] Create `pages/Products/ProductList.jsx`:
  - Table with columns: Image thumbnail, Name, SKU, Category, UoM, Stock Qty, Status badge, Actions
  - Search bar (by name or SKU) — debounced input
  - Filter dropdowns: Category, Stock Status (All / Low Stock / Out of Stock)
  - Paginated results
  - "Add Product" button → navigate to `/products/create`
  - Animate rows with Framer Motion `staggerChildren`
  - Low stock badge: amber; Out of stock badge: red
- [ ] Create `pages/Products/ProductCreate.jsx`:
  - Fields: Name, SKU, Category (searchable dropdown), Unit of Measure (dropdown), Initial Stock, Reorder Threshold, Description, Image upload with preview
  - Submit → call `POST /api/products` → show success toast → navigate to product list
- [ ] Create `pages/Products/ProductDetail.jsx`:
  - Product info card at top
  - Stock breakdown table: Location, Warehouse, Quantity (per stockPerLocation entry)
  - Edit button → inline or modal edit form
- [ ] Create `store/useProductStore.js` with all product actions and filter state
- [ ] Create `api/productAPI.js` — all Axios calls for product endpoints

---

## 🏭 Phase 4 — Warehouse & Location Management

### Backend
- [ ] Create `models/Warehouse.js` — name, code (unique, e.g. WH01), address, isActive
- [ ] Create `models/Location.js` — name, code, warehouse (ref), type (enum: rack/shelf/zone/floor/bin/other), isActive
- [ ] Create `controllers/warehouseController.js`:
  - `getAllWarehouses` — list all active warehouses with their locations
  - `createWarehouse` — create warehouse
  - `updateWarehouse` — update name, address
  - `getWarehouseLocations` — list locations for a specific warehouse
  - `createLocation` — add location to a warehouse
  - `updateLocation` — update location details
- [ ] Register warehouse routes in `server.js`

### Frontend
- [ ] Create `pages/Warehouses/WarehouseSettings.jsx`:
  - List of warehouses, each expandable to show its locations (accordion style)
  - "Add Warehouse" button → inline form or modal
  - "Add Location" button inside each warehouse section
  - Animate accordion open/close with Framer Motion
- [ ] All location/warehouse dropdowns across the app (receipts, deliveries, transfers) must populate from this data
- [ ] Create `api/warehouseAPI.js`

---

## 📥 Phase 5 — Receipts (Incoming Goods)

### Backend
- [ ] Create `models/Receipt.js` (full schema in ARCHITECTURE.md):
  - reference (auto-generated: REC-YYYY-XXXX), supplier, status (enum), destinationWarehouse, destinationLocation, lines[], notes, validatedAt, validatedBy, createdBy
- [ ] Create `models/StockMove.js` — the ledger model (see ARCHITECTURE.md for full schema)
- [ ] Create `controllers/receiptController.js`:
  - `getAllReceipts` — filters: status, supplier, dateFrom, dateTo; paginated
  - `getReceiptById` — populate product and location refs
  - `createReceipt` — auto-generate reference, save with status `draft`
  - `updateReceipt` — only allowed when status is `draft` or `waiting`
  - `validateReceipt` — **CRITICAL:**
    1. For each line: increase `product.stockQuantity += receivedQty`
    2. Find or create `stockPerLocation` entry for `destinationLocation`; increment quantity
    3. Create a `StockMove` document: type `receipt`, qty `+receivedQty`, timestamps, user
    4. Set receipt status to `done`, set `validatedAt` + `validatedBy`
    5. Emit `stock:updated` via Socket.io
    6. Check reorder threshold — if now below, emit `low_stock:alert` and send email
  - `cancelReceipt` — set status to `canceled` (only from draft/waiting/ready)
- [ ] Register receipt routes in `server.js`

### Frontend
- [ ] Create `pages/Receipts/ReceiptList.jsx`:
  - Filterable list: status tabs (All / Draft / Waiting / Ready / Done / Canceled), supplier search, date range pickers
  - Table: Reference, Supplier, Status badge, Lines count, Created date, Actions (View, Validate, Cancel)
- [ ] Create `pages/Receipts/ReceiptCreate.jsx`:
  - Header: Supplier name input, Destination Warehouse + Location dropdowns, Notes
  - Dynamic product lines table: Product search/select, Expected Qty, Unit of Measure — add/remove rows
  - Save as Draft button → `POST /api/receipts`
- [ ] Create `pages/Receipts/ReceiptDetail.jsx`:
  - Read-only view of all lines with product details
  - Editable received qty fields (before validation)
  - Validate button (green) — only active when status is `ready`
  - Cancel button (red) — only when not `done` or `canceled`
  - Status stepper at top: Draft → Waiting → Ready → Done
  - On validation: success toast + navigate back to list
- [ ] Create `store/useReceiptStore.js`, `api/receiptAPI.js`

---

## 📤 Phase 6 — Delivery Orders (Outgoing Goods)

### Backend
- [ ] Create `models/DeliveryOrder.js`:
  - reference (auto: DEL-YYYY-XXXX), customer, status (enum), sourceWarehouse, sourceLocation, lines[], notes, validatedAt, validatedBy, createdBy
- [ ] Create `controllers/deliveryController.js`:
  - `getAllDeliveries`, `getDeliveryById`, `createDelivery`, `updateDelivery`
  - `validateDelivery` — **CRITICAL:**
    1. For each line: check `product.stockQuantity >= deliveredQty` — if not, return HTTP 400 with error message "Insufficient stock for [product name]"
    2. Decrease `product.stockQuantity -= deliveredQty`
    3. Decrease matching `stockPerLocation[sourceLocation].quantity -= deliveredQty`
    4. Create `StockMove` document: type `delivery`, qty `-deliveredQty`
    5. Set delivery status to `done`
    6. Emit `stock:updated`
    7. If `product.stockQuantity <= reorderThreshold`: emit `low_stock:alert` + send low stock email
  - `cancelDelivery` — set status `canceled`
- [ ] Register delivery routes in `server.js`

### Frontend
- [ ] Create `pages/Deliveries/DeliveryList.jsx` — same pattern as ReceiptList, delivery-specific filters
- [ ] Create `pages/Deliveries/DeliveryCreate.jsx`:
  - Customer name, Source Warehouse + Location, Notes
  - Dynamic product lines: product search, requested qty
- [ ] Create `pages/Deliveries/DeliveryDetail.jsx`:
  - Validate button with confirmation dialog: "This will decrease stock. Confirm?"
  - Show insufficient stock error toast if validation fails
  - Status stepper: Draft → Waiting → Ready → Done
- [ ] Create `store/useDeliveryStore.js`, `api/deliveryAPI.js`

---

## 🔄 Phase 7 — Internal Transfers

### Backend
- [ ] Create `models/InternalTransfer.js`:
  - reference (auto: INT-YYYY-XXXX), status (enum), sourceWarehouse, sourceLocation, destinationWarehouse, destinationLocation, lines[], scheduledDate, notes, validatedAt, validatedBy, createdBy
- [ ] Create `controllers/transferController.js`:
  - `getAllTransfers`, `getTransferById`, `createTransfer`, `cancelTransfer`
  - `validateTransfer` — **CRITICAL:**
    1. For each line: check source `stockPerLocation` has sufficient quantity
    2. Decrease `stockPerLocation[sourceLocation].quantity -= qty`
    3. Find or create `stockPerLocation[destLocation]`; increase `+= qty`
    4. **Total `product.stockQuantity` remains unchanged**
    5. Create `StockMove` document: type `transfer`, fromLocation, toLocation, qty (positive)
    6. Set status `done`
    7. Emit `stock:updated`
- [ ] Register transfer routes in `server.js`

### Frontend
- [ ] Create `pages/Transfers/TransferList.jsx`:
  - Filter by status, source warehouse, destination warehouse, scheduled date
  - Table shows: Reference, From, To, Status, Scheduled Date, Lines count, Actions
- [ ] Create `pages/Transfers/TransferCreate.jsx`:
  - Source Warehouse → Source Location (cascading dropdown)
  - Destination Warehouse → Destination Location (cascading dropdown)
  - Scheduled Date picker
  - Dynamic product lines with available qty hint (auto-filled from stock)
- [ ] LocationSelector component: grouped dropdown showing Warehouse > Location hierarchy
- [ ] Create `store/useTransferStore.js`, `api/transferAPI.js`

---

## 🔧 Phase 8 — Stock Adjustments

### Backend
- [ ] Create `models/StockAdjustment.js`:
  - reference (auto: ADJ-YYYY-XXXX), product (ref), warehouse (ref), location (ref), systemQuantity, countedQuantity, difference, reason, adjustedBy, adjustedAt
- [ ] Create `controllers/adjustmentController.js`:
  - `getAllAdjustments` — paginated list with filters
  - `createAdjustment` — **CRITICAL:**
    1. Read current `product.stockQuantity` and `stockPerLocation[location].quantity` — save as `systemQuantity`
    2. Calculate `difference = countedQuantity - systemQuantity`
    3. Update `product.stockQuantity += difference`
    4. Update `stockPerLocation[location].quantity += difference`
    5. Create `StockMove` document: type `adjustment`, qty = `difference` (can be negative)
    6. Create `StockAdjustment` record with all fields
    7. Emit `stock:updated`
    8. If new stockQuantity <= reorderThreshold: emit `low_stock:alert`
- [ ] Register adjustment routes in `server.js`

### Frontend
- [ ] Create `pages/Adjustments/AdjustmentPage.jsx`:
  - Product search (by name or SKU)
  - Location dropdown (filtered by warehouse)
  - System Quantity field — auto-filled, read-only (from API)
  - Counted Quantity input — user fills this
  - Difference preview — live calculated: `counted - system`, shown as `+N` (green) or `-N` (red)
  - Reason field (text input)
  - Submit button → confirm dialog → call `POST /api/adjustments`
  - Adjustment history table below the form
- [ ] Create `api/adjustmentAPI.js`

---

## 📊 Phase 9 — Dashboard & KPIs

### Backend
- [ ] Create `controllers/dashboardController.js`:
  - `getKPIs` — single endpoint returning:
    - `totalProducts`: count of active products
    - `lowStockCount`: products where `stockQuantity > 0 && stockQuantity <= reorderThreshold`
    - `outOfStockCount`: products where `stockQuantity === 0`
    - `pendingReceipts`: receipts with status `draft`, `waiting`, or `ready`
    - `pendingDeliveries`: deliveries with status `draft`, `waiting`, or `ready`
    - `scheduledTransfers`: transfers with status `draft`, `waiting`, or `ready`
  - `getRecentMoves` — last 10 `StockMove` documents, populated with product and user
  - `getStockChart` — aggregate: total stock grouped by category name
  - `getLowStockProducts` — all products below reorder threshold with location details
- [ ] Register dashboard routes in `server.js`

### Frontend
- [ ] Create `pages/Dashboard/Dashboard.jsx` as the main landing page after login
- [ ] KPI Section — 5 animated cards using `useDashboardStore`:
  - Total Products | Low Stock | Out of Stock | Pending Receipts | Pending Deliveries
  - Animated count-up on mount (Framer Motion `useAnimation`)
  - Color-coded: red for critical, amber for warning, green for healthy
- [ ] Low Stock Alert Banner — list of products below threshold with quick link to product detail
- [ ] Stock Overview Chart — bar chart of stock by category (use `recharts` or implement with SVG)
- [ ] Recent Activity Feed — last 10 stock moves in a timeline style
- [ ] Dynamic Filters at top — by doc type, status, warehouse, category
- [ ] All KPIs refresh live on `stock:updated` Socket.io event
- [ ] Create `store/useDashboardStore.js`, `api/dashboardAPI.js`

---

## 📋 Phase 10 — Move History / Stock Ledger

### Backend
- [ ] Create `routes/moveRoutes.js` + add to `controllers/dashboardController.js` or separate controller:
  - `GET /api/moves` — paginated ledger with filters:
    - `?product=` (by name or SKU substring)
    - `?type=` receipt | delivery | transfer | adjustment
    - `?dateFrom=` + `?dateTo=` (ISO date strings)
    - `?warehouse=` (ObjectId)
    - `?page=` + `?limit=` (default 50 per page)
  - Sort by `createdAt` descending (newest first)
  - Populate: product name/SKU, fromLocation, toLocation, fromWarehouse, toWarehouse, performedBy name

### Frontend
- [ ] Create `pages/MoveHistory/MoveHistory.jsx`:
  - Filter panel (collapsible): product search, operation type dropdown, date range pickers, warehouse dropdown
  - Results table with columns: Date & Time, Product, SKU, Type (badge), From, To, Qty Change (`+N` green / `-N` red), Reference, User
  - Pagination controls
  - Animate row entrance with Framer Motion stagger
  - Empty state with illustration when no moves match filters

---

## ⚡ Phase 11 — Real-Time Features (Socket.io)

### Backend
- [ ] In `config/socket.js`: initialize Socket.io, handle `connection` and `disconnect` events
- [ ] Export `io` instance; import in server.js and pass to controllers via `app.set('io', io)`
- [ ] In `stockEngine.js`: after every stock mutation, call `io.emit('stock:updated', { productId, newQuantity })`
- [ ] After every delivery/adjustment validation: if stock <= threshold, call `io.emit('low_stock:alert', { productId, name, sku, quantity, threshold, warehouse })`
- [ ] In transfer creation: emit `transfer:scheduled` with transfer details

### Frontend
- [ ] `socket/socket.js` — singleton socket instance, `autoConnect: false`
- [ ] `hooks/useSocket.js` — custom hook: subscribe to events, unsubscribe on unmount
- [ ] On `stock:updated`:
  - Call `useDashboardStore.fetchKPIs()` to refresh dashboard counts
  - If product list is open, refresh `useProductStore.fetchProducts()`
- [ ] On `low_stock:alert`:
  - Show persistent amber toast: `"⚠️ [Product Name] is running low (Qty: X)"`
  - Add to notification bell list
- [ ] On `transfer:scheduled`:
  - Show info toast: `"📦 Internal transfer scheduled"`

---

## 🔔 Phase 12 — Notifications & Alerts

### Backend
- [ ] In `utils/sendEmail.js`: add `sendLowStockAlert(product, warehouse)` function:
  - Professional HTML email template
  - Shows: product name, SKU, current quantity, reorder threshold, warehouse name
- [ ] Trigger `sendLowStockAlert` inside `stockEngine.js` when threshold crossed (after delivery or adjustment)
- [ ] Rate-limit low stock emails per product: don't resend within 1 hour for same product

### Frontend
- [ ] Notification bell icon in Topbar (`components/layout/Topbar.jsx`):
  - Red badge with unread count
  - Dropdown showing last 10 alerts: message, time ago, type icon
  - Mark all as read on open
  - Animate badge pulse with Framer Motion when new alert arrives
- [ ] Persist notifications in `useNotificationStore` (Zustand)

---

## 🎨 Phase 13 — UI/UX Polish & Animations

> This phase is critical. StockSense must look and feel like a premium professional SaaS product. Every interaction must feel intentional.

### Design System (Tailwind CSS v4)
- [ ] Define CSS custom properties in `src/index.css`:
  - Primary: `#4F46E5` (indigo-600)
  - Sidebar background: `#0F172A` (slate-900), text: `#94A3B8` (slate-400)
  - Success: `#22C55E`, Warning: `#F59E0B`, Danger: `#EF4444`, Info: `#3B82F6`
  - Card background: `#FFFFFF`, border: `#E2E8F0`
- [ ] Status badge color mapping:
  - Draft → slate/gray | Waiting → blue | Ready → amber | Done → green | Canceled → red
- [ ] Consistent `border-radius: 12px` on cards, `8px` on inputs, `6px` on badges
- [ ] Box shadows: subtle `0 1px 3px rgba(0,0,0,0.08)` on cards

### Sidebar (Left Navigation — as per PRD spec)
Navigation structure must exactly match the spec:
```
Products
Operations
  ├── Receipts
  ├── Delivery Orders
  ├── Inventory Adjustment
  ├── Move History
  └── Dashboard
Settings
  └── Warehouse
Profile (bottom)
  ├── My Profile
  └── Logout
```
- [ ] Collapsible sidebar: icon-only mode on collapse, full labels expanded
- [ ] Active route highlighted with primary color accent
- [ ] Smooth width transition with Framer Motion
- [ ] Bottom Profile section with avatar, name, role label

### Page & Component Animations (Framer Motion)
- [ ] Page transitions: `opacity 0→1, y: 20→0, duration: 0.3s` on route change — wrap pages in `AnimatePresence`
- [ ] KPI cards: `scale: 0.95→1, opacity: 0→1` staggered by 0.1s
- [ ] Table rows: stagger children with `staggerChildren: 0.04s`, `y: 10→0`
- [ ] Modals: `scale: 0.92→1, opacity: 0→1, duration: 0.2s`
- [ ] Sidebar collapse: `width` transition with `ease: [0.4, 0, 0.2, 1]`
- [ ] Notification badge: scale pulse when new notification arrives
- [ ] Auth cards: React Parallax Tilt with `tiltMaxAngleDegrees: 8`, `glareEnable: true`, `glareMaxOpacity: 0.15`

### Table & List UX
- [ ] Sticky table header
- [ ] Alternating row backgrounds for readability
- [ ] Hover state on rows: subtle left border accent
- [ ] Loading skeletons (not spinners) for all data tables and KPI cards
- [ ] Empty state: SVG illustration + descriptive message + CTA button (e.g. "No receipts yet — Create your first receipt")

### Responsiveness
- [ ] Sidebar collapses to icon-only on tablet, hidden off-canvas on mobile with hamburger toggle
- [ ] Tables become horizontally scrollable on mobile with `overflow-x-auto`
- [ ] All modals and forms are full-screen on mobile
- [ ] Minimum touch target size: 44×44px on all interactive elements

### FontAwesome Icons (throughout)
- [ ] Sidebar nav icons for each section
- [ ] Status icons on badges
- [ ] Action icons: edit (pen), delete (trash), validate (check-circle), cancel (x-circle), view (eye)
- [ ] KPI card icons: box, exclamation-triangle, truck, arrow-down, arrow-up

---

## 🚢 Phase 14 — Testing & Deployment

### Full Inventory Flow Verification (E2E)
The agent must manually verify this complete flow before marking deployment done:

1. Create a new product "Steel Rod" — SKU: STL-001 — UoM: kg — Threshold: 20
2. Create Receipt from "Vendor A" — 100 kg to Warehouse 1 / Rack A — Validate
   - Verify: `stockQuantity = 100`, `stockPerLocation[Rack A] = 100`
   - Verify: StockMove entry created (type: receipt, qty: +100)
3. Create Internal Transfer: 40 kg from Rack A → Production Floor — Validate
   - Verify: `stockQuantity = 100` (unchanged), `stockPerLocation[Rack A] = 60`, `stockPerLocation[Production Floor] = 40`
   - Verify: StockMove entry created (type: transfer)
4. Create Delivery Order to "Customer B" — 20 kg from Rack A — Validate
   - Verify: `stockQuantity = 80`, `stockPerLocation[Rack A] = 40`
   - Verify: StockMove entry created (type: delivery, qty: -20)
5. Create Stock Adjustment on Production Floor — counted: 35 (system shows 40)
   - Verify: `difference = -5`, `stockQuantity = 75`, `stockPerLocation[Production Floor] = 35`
   - Verify: StockMove entry created (type: adjustment, qty: -5)
6. Open Move History — verify all 4 entries appear with correct data
7. Open Dashboard — verify KPIs reflect current state

### Deployment
- [ ] Backend: Deploy to **Render** or **Railway** (free tier)
  - Set all environment variables in platform dashboard
  - Enable Node.js 18+ runtime
- [ ] Frontend: Deploy to **Vercel** or **Netlify**
  - Set `VITE_API_URL` and `VITE_SOCKET_URL` to production backend URL
  - Configure build command: `npm run build`, output dir: `dist`
- [ ] MongoDB: Use **MongoDB Atlas** (free M0 cluster)
- [ ] Configure CORS in production: update `CLIENT_URL` env var to production frontend URL
- [ ] Configure cookie options in production: `secure: true`, `sameSite: 'none'`
- [ ] Test all auth flows in production (login, OTP reset)
- [ ] Test one complete inventory flow in production (receipt → delivery)

---

## ✅ Definition of Done

A phase is **DONE** only when ALL of the following are true:

- All checkboxes in the phase are completed
- Zero console errors or warnings in browser and terminal
- All new API endpoints return correct HTTP status codes and response shapes
- MongoDB documents are created/updated correctly for each operation
- Stock quantities update accurately after each operation (verified in DB)
- Socket.io events are emitted and received correctly
- UI renders correctly on both desktop and mobile viewports
- Framer Motion animations play correctly without jank
- No unused imports or dead code left behind