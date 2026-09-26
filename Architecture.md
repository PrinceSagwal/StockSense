# 🏗️ StockSense — System Architecture

> This document is the technical reference for StockSense.  
> **Agent instructions:** Read this document fully before creating any model, controller, route, or Zustand store. All schemas, API contracts, socket events, and state shapes defined here are authoritative and must be followed exactly.

---

## 📐 System Overview

```
┌───────────────────────────────────────────────────────────────┐
│                     CLIENT (Browser)                           │
│       React 19 + Vite 7 + Tailwind 4 + Zustand 5              │
│   Framer Motion | Axios | Socket.io Client | React Router 7    │
└──────────────────────┬────────────────────────────────────────┘
                       │  HTTP/REST (Axios, withCredentials)
                       │  WebSocket (Socket.io)
                       ▼
┌───────────────────────────────────────────────────────────────┐
│                  SERVER (Node.js 18+)                          │
│              Express 4 + Socket.io 4 + Mongoose 8              │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │  Auth Layer  │  │  Controllers   │  │  Stock Engine    │  │
│  │  JWT Cookie  │  │  (Business     │  │  (stockEngine.js │  │
│  │  bcryptjs    │  │   Logic)       │  │   — all stock    │  │
│  │  Middleware  │  │                │  │   mutations)     │  │
│  └──────────────┘  └────────────────┘  └──────────────────┘  │
└──────────────────────┬────────────────────────────────────────┘
                       │  Mongoose ODM
                       ▼
┌───────────────────────────────────────────────────────────────┐
│                    MongoDB Atlas                                │
│  Collections:                                                  │
│  users | products | categories | warehouses | locations        │
│  receipts | deliveryorders | internaltransfers                 │
│  stockadjustments | stockmoves                                 │
└───────────┬─────────────────────┬─────────────────────────────┘
            │                     │
    ┌───────▼──────┐      ┌───────▼──────────┐
    │  Cloudinary  │      │  Nodemailer      │
    │  (Product    │      │  + Twilio        │
    │   Images)    │      │  (OTP + Alerts)  │
    └──────────────┘      └──────────────────┘
```

---

## 🗄️ MongoDB Schemas

> All schemas use Mongoose. Every model file is in `server/models/`.  
> Timestamps (`createdAt`, `updatedAt`) are enabled via `{ timestamps: true }` unless noted.

---

### 1. User — `models/User.js`

```javascript
{
  name:        { type: String, required: true, trim: true },
  email:       { type: String, required: true, unique: true, lowercase: true },
  password:    { type: String, required: true },          // bcryptjs hashed
  role:        { type: String, enum: ['inventory_manager', 'warehouse_staff'], default: 'warehouse_staff' },
  avatar:      { type: String, default: '' },             // Cloudinary URL
  phone:       { type: String, default: '' },             // for Twilio OTP
  otp:         { type: String, default: null },           // hashed OTP
  otpExpiry:   { type: Date,   default: null },           // 10-minute window
  isActive:    { type: Boolean, default: true },
  // timestamps: true
}
```

**Pre-save hook:** hash password with `bcryptjs.hash(password, 12)` before save if modified.  
**Instance method:** `comparePassword(candidatePassword)` → `bcryptjs.compare(...)`.

---

### 2. Category — `models/Category.js`

```javascript
{
  name:        { type: String, required: true, unique: true, trim: true },
  description: { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  // timestamps: true
}
```

---

### 3. Warehouse — `models/Warehouse.js`

```javascript
{
  name:        { type: String, required: true },
  code:        { type: String, required: true, unique: true, uppercase: true }, // e.g. WH01
  address:     { type: String, default: '' },
  isActive:    { type: Boolean, default: true },
  // timestamps: true
}
```

---

### 4. Location — `models/Location.js`

```javascript
{
  name:      { type: String, required: true },           // e.g. "Rack A", "Shelf B2"
  code:      { type: String, required: true },           // e.g. "RA-01"
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  type:      { type: String, enum: ['rack', 'shelf', 'zone', 'floor', 'bin', 'other'], default: 'other' },
  isActive:  { type: Boolean, default: true },
  // timestamps: true
}
```

---

### 5. Product — `models/Product.js`

```javascript
{
  name:           { type: String, required: true, trim: true },
  sku:            { type: String, required: true, unique: true, uppercase: true },
  category:       { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  unitOfMeasure:  { type: String, required: true },      // kg | pcs | litres | metres | boxes | etc.
  description:    { type: String, default: '' },
  image:          { type: String, default: '' },         // Cloudinary URL

  // STOCK FIELDS — DO NOT MODIFY DIRECTLY; USE stockEngine.js
  stockQuantity:  { type: Number, default: 0, min: 0 }, // total across all locations

  stockPerLocation: [
    {
      location:  { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
      warehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse' },
      quantity:  { type: Number, default: 0 }
    }
  ],

  reorderThreshold: { type: Number, default: 10 },       // low stock alert level
  isActive:         { type: Boolean, default: true },     // soft delete
  createdBy:        { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  // timestamps: true
}
```

**Index:** Create text index on `name` and `sku` for search: `{ name: 'text', sku: 'text' }`.

---

### 6. Receipt — `models/Receipt.js`

```javascript
{
  reference:            { type: String, unique: true },   // auto-generated: REC-2024-0001
  supplier:             { type: String, required: true },
  status:               { type: String, enum: ['draft', 'waiting', 'ready', 'done', 'canceled'], default: 'draft' },
  destinationWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  destinationLocation:  { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },

  lines: [
    {
      product:        { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      expectedQty:    { type: Number, required: true, min: 0.001 },
      receivedQty:    { type: Number, default: 0 },       // filled at validation
      unitOfMeasure:  { type: String }
    }
  ],

  notes:        { type: String, default: '' },
  validatedAt:  { type: Date, default: null },
  validatedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // timestamps: true
}
```

**Reference generation:** On pre-save, if no reference exists: query count of all receipts, pad to 4 digits: `REC-${year}-${String(count + 1).padStart(4, '0')}`.

---

### 7. DeliveryOrder — `models/DeliveryOrder.js`

```javascript
{
  reference:       { type: String, unique: true },        // auto-generated: DEL-2024-0001
  customer:        { type: String, required: true },
  status:          { type: String, enum: ['draft', 'waiting', 'ready', 'done', 'canceled'], default: 'draft' },
  sourceWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  sourceLocation:  { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },

  lines: [
    {
      product:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      requestedQty:  { type: Number, required: true, min: 0.001 },
      deliveredQty:  { type: Number, default: 0 },
      unitOfMeasure: { type: String }
    }
  ],

  notes:       { type: String, default: '' },
  validatedAt: { type: Date, default: null },
  validatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // timestamps: true
}
```

---

### 8. InternalTransfer — `models/InternalTransfer.js`

```javascript
{
  reference:              { type: String, unique: true },   // auto-generated: INT-2024-0001
  status:                 { type: String, enum: ['draft', 'waiting', 'ready', 'done', 'canceled'], default: 'draft' },
  sourceWarehouse:        { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  sourceLocation:         { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  destinationWarehouse:   { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  destinationLocation:    { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },

  lines: [
    {
      product:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity:      { type: Number, required: true, min: 0.001 },
      unitOfMeasure: { type: String }
    }
  ],

  scheduledDate: { type: Date, default: null },
  notes:         { type: String, default: '' },
  validatedAt:   { type: Date, default: null },
  validatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  createdBy:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // timestamps: true
}
```

---

### 9. StockAdjustment — `models/StockAdjustment.js`

```javascript
{
  reference:        { type: String, unique: true },         // auto-generated: ADJ-2024-0001
  product:          { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  warehouse:        { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', required: true },
  location:         { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true },
  systemQuantity:   { type: Number, required: true },       // what the system had before
  countedQuantity:  { type: Number, required: true },       // what was physically counted
  difference:       { type: Number, required: true },       // countedQty - systemQty (can be negative)
  reason:           { type: String, default: 'Physical count' },
  adjustedBy:       { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adjustedAt:       { type: Date, default: Date.now },
  // NO auto timestamps needed; adjustedAt is the timestamp
}
```

---

### 10. StockMove — `models/StockMove.js` (The Ledger)

```javascript
{
  reference:     { type: String },                          // same as parent operation reference
  operationType: { type: String, enum: ['receipt', 'delivery', 'transfer', 'adjustment'], required: true },

  product:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName:   { type: String, required: true },          // snapshot — denormalized for ledger integrity
  productSku:    { type: String, required: true },          // snapshot — denormalized

  fromLocation:  { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null },
  fromWarehouse: { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', default: null },
  toLocation:    { type: mongoose.Schema.Types.ObjectId, ref: 'Location', default: null },
  toWarehouse:   { type: mongoose.Schema.Types.ObjectId, ref: 'Warehouse', default: null },

  quantity:       { type: Number, required: true },         // positive = incoming, negative = outgoing
  quantityBefore: { type: Number, required: true },         // stockQuantity before this move
  quantityAfter:  { type: Number, required: true },         // stockQuantity after this move
  unitOfMeasure:  { type: String },

  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt:   { type: Date, default: Date.now }            // NO updatedAt needed on ledger
}
```

**Important:** StockMove documents are append-only. Never update or delete them. They form the immutable audit trail.

---

## 🔌 API Routes Reference

### Base URL: `/api`

All routes except auth require `Authorization` via JWT cookie + `authMiddleware`.

---

### Auth — `/api/auth`

| Method | Path | Body | Auth | Description |
|---|---|---|---|---|
| POST | `/signup` | `{ name, email, password, role, phone? }` | ❌ | Register user |
| POST | `/login` | `{ email, password }` | ❌ | Login, set JWT cookie |
| POST | `/logout` | — | ✅ | Clear cookie |
| POST | `/forgot-password` | `{ email }` | ❌ | Generate + send OTP |
| POST | `/verify-otp` | `{ email, otp }` | ❌ | Verify OTP |
| POST | `/reset-password` | `{ email, otp, newPassword }` | ❌ | Reset password |
| GET | `/me` | — | ✅ | Current user profile |
| PUT | `/me` | `FormData: { name, avatar? }` | ✅ | Update profile |

**Success Response shape:**
```json
{ "success": true, "data": { ... }, "message": "..." }
```

**Error Response shape:**
```json
{ "success": false, "message": "Error description" }
```

---

### Products — `/api/products`

| Method | Path | Query Params | Body | Description |
|---|---|---|---|---|
| GET | `/` | `search, category, status, page, limit` | — | List products |
| GET | `/:id` | — | — | Product detail + stock per location |
| POST | `/` | — | `FormData: { name, sku, category, unitOfMeasure, initialStock?, reorderThreshold?, description?, image? }` | Create product |
| PUT | `/:id` | — | `FormData: { same fields }` | Update product |
| DELETE | `/:id` | — | — | Soft delete |
| GET | `/categories` | — | — | All categories |
| POST | `/categories` | — | `{ name, description? }` | Create category |

Query param `status` values: `all` | `low` (stockQty <= threshold) | `out` (stockQty === 0)

---

### Receipts — `/api/receipts`

| Method | Path | Query Params | Body | Description |
|---|---|---|---|---|
| GET | `/` | `status, supplier, dateFrom, dateTo, page, limit` | — | List receipts |
| GET | `/:id` | — | — | Receipt detail (populated) |
| POST | `/` | — | `{ supplier, destinationWarehouse, destinationLocation, lines: [{product, expectedQty, unitOfMeasure}], notes? }` | Create (draft) |
| PUT | `/:id` | — | Same as create (partial) | Update (draft/waiting only) |
| POST | `/:id/validate` | — | `{ lines: [{product, receivedQty}] }` | Validate → stock ++ |
| POST | `/:id/cancel` | — | — | Cancel |

---

### Deliveries — `/api/deliveries`

| Method | Path | Query Params | Body | Description |
|---|---|---|---|---|
| GET | `/` | `status, customer, dateFrom, dateTo, page, limit` | — | List deliveries |
| GET | `/:id` | — | — | Delivery detail |
| POST | `/` | — | `{ customer, sourceWarehouse, sourceLocation, lines: [{product, requestedQty, unitOfMeasure}], notes? }` | Create (draft) |
| PUT | `/:id` | — | Same as create (partial) | Update (draft/waiting only) |
| POST | `/:id/validate` | — | — | Validate → stock -- |
| POST | `/:id/cancel` | — | — | Cancel |

---

### Transfers — `/api/transfers`

| Method | Path | Query Params | Body | Description |
|---|---|---|---|---|
| GET | `/` | `status, sourceWarehouse, destWarehouse, page, limit` | — | List transfers |
| GET | `/:id` | — | — | Transfer detail |
| POST | `/` | — | `{ sourceWarehouse, sourceLocation, destinationWarehouse, destinationLocation, scheduledDate?, lines: [{product, quantity, unitOfMeasure}], notes? }` | Create (draft) |
| POST | `/:id/validate` | — | — | Validate → location update |
| POST | `/:id/cancel` | — | — | Cancel |

---

### Adjustments — `/api/adjustments`

| Method | Path | Query Params | Body | Description |
|---|---|---|---|---|
| GET | `/` | `product, warehouse, page, limit` | — | List adjustments |
| POST | `/` | — | `{ product, warehouse, location, countedQuantity, reason? }` | Create + apply immediately |

---

### Warehouses — `/api/warehouses`

| Method | Path | Body | Description |
|---|---|---|---|
| GET | `/` | — | All warehouses |
| POST | `/` | `{ name, code, address? }` | Create warehouse |
| PUT | `/:id` | `{ name, address }` | Update warehouse |
| GET | `/:id/locations` | — | Locations in this warehouse |
| POST | `/:id/locations` | `{ name, code, type? }` | Add location to warehouse |
| PUT | `/:id/locations/:locationId` | `{ name, code, type }` | Update location |

---

### Dashboard — `/api/dashboard`

| Method | Path | Description |
|---|---|---|
| GET | `/kpis` | All KPI counts |
| GET | `/recent-moves` | Last 10 StockMove documents |
| GET | `/stock-chart` | Stock aggregated by category |
| GET | `/low-stock` | Products below reorder threshold |

---

### Move History — `/api/moves`

| Method | Path | Query Params | Description |
|---|---|---|---|
| GET | `/` | `product, type, warehouse, dateFrom, dateTo, page, limit` | Full ledger |

---

## ⚡ Socket.io Events

### Server → Client

| Event | Payload | When emitted |
|---|---|---|
| `stock:updated` | `{ productId: string, productName: string, newQuantity: number }` | After any receipt/delivery/transfer/adjustment validation |
| `low_stock:alert` | `{ productId: string, name: string, sku: string, quantity: number, threshold: number, warehouseName: string }` | When stock drops to or below reorderThreshold |
| `transfer:scheduled` | `{ transferId: string, reference: string, scheduledDate: string }` | When an internal transfer is created |

### Client → Server

| Event | Payload | Purpose |
|---|---|---|
| `join:warehouse` | `{ warehouseId: string }` | Join a room for real-time updates scoped to a warehouse |
| `leave:warehouse` | `{ warehouseId: string }` | Leave warehouse room |

---

## 🗃️ Zustand Store Shapes

> All stores live in `client/src/store/`. Each store uses Zustand v5's `create` function.

### useAuthStore

```javascript
{
  // State
  user: null,                  // User object from GET /api/auth/me
  isAuthenticated: false,
  isLoading: false,

  // Actions
  login:         async (email, password) => {},    // POST /login, set user, connect socket
  signup:        async (data) => {},               // POST /signup
  logout:        async () => {},                   // POST /logout, clear user, disconnect socket
  fetchUser:     async () => {},                   // GET /me — called on app init
  updateProfile: async (formData) => {},           // PUT /me
}
```

### useProductStore

```javascript
{
  // State
  products: [],
  selectedProduct: null,
  categories: [],
  pagination: { page: 1, limit: 20, total: 0 },
  filters: { search: '', category: '', status: 'all' },
  isLoading: false,

  // Actions
  fetchProducts:   async () => {},
  fetchProduct:    async (id) => {},
  createProduct:   async (formData) => {},
  updateProduct:   async (id, formData) => {},
  deleteProduct:   async (id) => {},
  fetchCategories: async () => {},
  createCategory:  async (data) => {},
  setFilters:      (filters) => {},
  setPage:         (page) => {},
}
```

### useReceiptStore

```javascript
{
  receipts: [],
  selectedReceipt: null,
  pagination: { page: 1, limit: 20, total: 0 },
  filters: { status: 'all', supplier: '', dateFrom: '', dateTo: '' },
  isLoading: false,

  fetchReceipts:  async () => {},
  fetchReceipt:   async (id) => {},
  createReceipt:  async (data) => {},
  updateReceipt:  async (id, data) => {},
  validateReceipt: async (id, lines) => {},
  cancelReceipt:  async (id) => {},
  setFilters:     (filters) => {},
}
```

### useDeliveryStore — same shape as useReceiptStore, adapted for deliveries

### useTransferStore

```javascript
{
  transfers: [],
  selectedTransfer: null,
  pagination: { page: 1, limit: 20, total: 0 },
  filters: { status: 'all', sourceWarehouse: '', destinationWarehouse: '' },
  isLoading: false,

  fetchTransfers:  async () => {},
  fetchTransfer:   async (id) => {},
  createTransfer:  async (data) => {},
  validateTransfer: async (id) => {},
  cancelTransfer:  async (id) => {},
  setFilters:      (filters) => {},
}
```

### useDashboardStore

```javascript
{
  kpis: {
    totalProducts: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
    pendingReceipts: 0,
    pendingDeliveries: 0,
    scheduledTransfers: 0,
  },
  recentMoves: [],
  stockChart:  [],              // [{ categoryName, totalStock }]
  lowStockProducts: [],
  isLoading: false,

  fetchKPIs:            async () => {},
  fetchRecentMoves:     async () => {},
  fetchStockChart:      async () => {},
  fetchLowStockProducts: async () => {},
}
```

### useWarehouseStore

```javascript
{
  warehouses: [],               // Each warehouse includes locations array
  isLoading: false,

  fetchWarehouses:   async () => {},
  createWarehouse:   async (data) => {},
  updateWarehouse:   async (id, data) => {},
  addLocation:       async (warehouseId, data) => {},
  updateLocation:    async (warehouseId, locationId, data) => {},

  // Derived helpers
  getLocationsByWarehouse: (warehouseId) => [],   // filter locations client-side
}
```

---

## 📦 Stock Engine — `server/utils/stockEngine.js`

The Stock Engine is the single source of truth for all stock mutations. Controllers must **never** modify `product.stockQuantity` or `product.stockPerLocation` directly — they must call Stock Engine functions.

### Receipt Validation Logic

```
validateReceiptStock(receipt, user, io):
  BEGIN TRANSACTION (session)
  FOR each line in receipt.lines:
    product = await Product.findById(line.product).session(session)
    quantityBefore = product.stockQuantity

    product.stockQuantity += line.receivedQty

    locationEntry = product.stockPerLocation.find(e => e.location == destinationLocation)
    IF locationEntry EXISTS:
      locationEntry.quantity += line.receivedQty
    ELSE:
      product.stockPerLocation.push({ location: destinationLocation, warehouse: destinationWarehouse, quantity: line.receivedQty })

    await product.save({ session })

    await StockMove.create({ session }, {
      reference: receipt.reference,
      operationType: 'receipt',
      product: product._id,
      productName: product.name,    // snapshot
      productSku: product.sku,      // snapshot
      fromLocation: null,
      fromWarehouse: null,
      toLocation: destinationLocation,
      toWarehouse: destinationWarehouse,
      quantity: +line.receivedQty,
      quantityBefore,
      quantityAfter: product.stockQuantity,
      unitOfMeasure: line.unitOfMeasure,
      performedBy: user._id,
    })

    CHECK THRESHOLD:
    IF product.stockQuantity <= product.reorderThreshold:
      io.emit('low_stock:alert', { productId, name, sku, quantity, threshold })
      sendLowStockAlert(product)    // non-blocking

  END TRANSACTION
  io.emit('stock:updated', { productId, productName, newQuantity })
```

### Delivery Validation Logic

```
validateDeliveryStock(delivery, user, io):
  BEGIN TRANSACTION (session)
  FOR each line in delivery.lines:
    product = await Product.findById(line.product).session(session)

    GUARD: IF product.stockQuantity < line.deliveredQty:
      THROW 400: "Insufficient stock for [product.name]. Available: X, Requested: Y"

    quantityBefore = product.stockQuantity
    product.stockQuantity -= line.deliveredQty

    locationEntry = product.stockPerLocation.find(e => e.location == sourceLocation)
    IF locationEntry:
      locationEntry.quantity -= line.deliveredQty

    await product.save({ session })
    await StockMove.create({ session }, { ...type: 'delivery', quantity: -line.deliveredQty, ... })

    IF product.stockQuantity <= product.reorderThreshold:
      io.emit('low_stock:alert', { ... })
      sendLowStockAlert(product)    // non-blocking

  END TRANSACTION
  io.emit('stock:updated', { productId, productName, newQuantity })
```

### Transfer Validation Logic

```
validateTransferStock(transfer, user, io):
  BEGIN TRANSACTION (session)
  FOR each line in transfer.lines:
    product = await Product.findById(line.product).session(session)

    sourceEntry = product.stockPerLocation.find(e => e.location == sourceLocation)
    GUARD: IF NOT sourceEntry OR sourceEntry.quantity < line.quantity:
      THROW 400: "Insufficient stock at source location for [product.name]"

    sourceEntry.quantity -= line.quantity

    destEntry = product.stockPerLocation.find(e => e.location == destinationLocation)
    IF destEntry:
      destEntry.quantity += line.quantity
    ELSE:
      product.stockPerLocation.push({ location: destinationLocation, warehouse: destinationWarehouse, quantity: line.quantity })

    // NOTE: product.stockQuantity is NOT changed — only location distribution changes
    await product.save({ session })
    await StockMove.create({ session }, { ...type: 'transfer', quantity: +line.quantity, fromLocation, toLocation ... })

  END TRANSACTION
  io.emit('stock:updated', { productId, productName, newQuantity: product.stockQuantity })
```

### Adjustment Logic

```
applyStockAdjustment(data, user, io):
  product = await Product.findById(data.product)
  locationEntry = product.stockPerLocation.find(e => e.location == data.location)

  systemQuantity = product.stockQuantity
  locationSystemQty = locationEntry ? locationEntry.quantity : 0
  difference = data.countedQuantity - locationSystemQty

  product.stockQuantity += difference

  IF locationEntry:
    locationEntry.quantity = data.countedQuantity
  ELSE:
    product.stockPerLocation.push({ location, warehouse, quantity: data.countedQuantity })

  await product.save()

  await StockMove.create({
    type: 'adjustment',
    quantity: difference,           // can be negative
    quantityBefore: systemQuantity,
    quantityAfter: product.stockQuantity,
    ...
  })

  await StockAdjustment.create({ systemQuantity: locationSystemQty, countedQuantity, difference, ... })

  IF product.stockQuantity <= product.reorderThreshold:
    io.emit('low_stock:alert', { ... })

  io.emit('stock:updated', { productId, productName, newQuantity: product.stockQuantity })
```

---

## 🔐 Authentication Flow

### Login
```
Client POST /api/auth/login { email, password }
  → Find user by email (case-insensitive)
  → user.comparePassword(password)    [bcryptjs.compare]
  → IF invalid: 401 "Invalid credentials"
  → Generate JWT: jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  → Set cookie: res.cookie('stocksense_token', token, { httpOnly, secure (prod), sameSite, maxAge })
  → Return: { success: true, data: { name, email, role, avatar } }
```

### OTP Reset
```
Step 1 — POST /api/auth/forgot-password { email }
  → Find user by email
  → generateOTP(): crypto.randomInt(100000, 999999).toString()
  → Hash OTP: await bcryptjs.hash(otp, 10)
  → user.otp = hashedOtp
  → user.otpExpiry = Date.now() + 10 * 60 * 1000   (10 minutes)
  → await user.save()
  → sendEmail(user.email, 'Your StockSense OTP', otpEmailTemplate(otp))
  → IF user.phone: sendSMS(user.phone, `Your StockSense OTP is ${otp}`)
  → Return: { success: true, message: "OTP sent" }

Step 2 — POST /api/auth/verify-otp { email, otp }
  → Find user by email
  → IF user.otpExpiry < Date.now(): 400 "OTP expired"
  → bcryptjs.compare(otp, user.otp)
  → IF no match: 400 "Invalid OTP"
  → Return: { success: true, message: "OTP verified" }

Step 3 — POST /api/auth/reset-password { email, otp, newPassword }
  → Repeat OTP verification
  → user.password = newPassword  (pre-save hook rehashes)
  → user.otp = null
  → user.otpExpiry = null
  → await user.save()
  → Return: { success: true, message: "Password reset successfully" }
```

### Auth Middleware
```javascript
// middleware/authMiddleware.js
const protect = async (req, res, next) => {
  const token = req.cookies.stocksense_token;
  if (!token) return res.status(401).json({ success: false, message: 'Not authenticated' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id).select('-password -otp -otpExpiry');
  if (!req.user || !req.user.isActive) return res.status(401).json({ success: false, message: 'User not found' });
  next();
};
```

---

## 🎨 UI Design System

### Color Palette

```css
/* In client/src/index.css — applied as Tailwind CSS variables */

/* Sidebar — Deep Navy */
--sidebar-bg:       #0F172A;   /* slate-900 */
--sidebar-text:     #94A3B8;   /* slate-400 */
--sidebar-active:   #4F46E5;   /* indigo-600 */
--sidebar-hover:    #1E293B;   /* slate-800 */

/* Primary Brand */
--color-primary:    #4F46E5;   /* indigo-600 */
--color-primary-hover: #4338CA;/* indigo-700 */
--color-primary-light: #EEF2FF;/* indigo-50 */

/* Content Area */
--content-bg:       #F8FAFC;   /* slate-50 */
--card-bg:          #FFFFFF;
--border-color:     #E2E8F0;   /* slate-200 */
--text-primary:     #0F172A;   /* slate-900 */
--text-secondary:   #64748B;   /* slate-500 */
--text-muted:       #94A3B8;   /* slate-400 */

/* Status */
--color-success:    #22C55E;   /* green-500 */
--color-warning:    #F59E0B;   /* amber-500 */
--color-danger:     #EF4444;   /* red-500 */
--color-info:       #3B82F6;   /* blue-500 */
--color-neutral:    #6B7280;   /* gray-500 */
```

### Status Badge Mapping

| Status | Background | Text |
|---|---|---|
| Draft | `#F1F5F9` (slate-100) | `#64748B` (slate-500) |
| Waiting | `#DBEAFE` (blue-100) | `#1D4ED8` (blue-700) |
| Ready | `#FEF3C7` (amber-100) | `#B45309` (amber-700) |
| Done | `#DCFCE7` (green-100) | `#15803D` (green-700) |
| Canceled | `#FEE2E2` (red-100) | `#B91C1C` (red-700) |

### Typography

```css
/* Use Inter from Google Fonts or system-ui fallback */
font-family: 'Inter', system-ui, -apple-system, sans-serif;

/* Scale */
--text-xs:   0.75rem;   /* 12px — labels, badges */
--text-sm:   0.875rem;  /* 14px — table data, secondary */
--text-base: 1rem;      /* 16px — body */
--text-lg:   1.125rem;  /* 18px — card titles */
--text-xl:   1.25rem;   /* 20px — page section titles */
--text-2xl:  1.5rem;    /* 24px — page titles */
--text-3xl:  1.875rem;  /* 30px — KPI numbers */
```

### Framer Motion Presets

```javascript
// Use these consistently across all components — in client/src/utils/motionPresets.js

export const fadeInUp = {
  initial:  { opacity: 0, y: 20 },
  animate:  { opacity: 1, y: 0 },
  exit:     { opacity: 0, y: -10 },
  transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
};

export const scaleIn = {
  initial:  { opacity: 0, scale: 0.94 },
  animate:  { opacity: 1, scale: 1 },
  exit:     { opacity: 0, scale: 0.94 },
  transition: { duration: 0.2 }
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.04 } }
};

export const staggerItem = {
  initial:  { opacity: 0, y: 10 },
  animate:  { opacity: 1, y: 0 },
  transition: { duration: 0.25 }
};

export const sidebarVariants = {
  expanded:  { width: '240px', transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } },
  collapsed: { width: '72px',  transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] } }
};
```

### Sidebar Navigation Structure

This exact structure must be implemented as per the PRD:

```
Left Sidebar (fixed, dark navy):
  ┌─────────────────────────────┐
  │  [Logo] StockSense          │
  ├─────────────────────────────┤
  │  📦  Products               │
  │  ─── Operations ───         │
  │  📥  Receipts               │
  │  📤  Delivery Orders        │
  │  🔧  Inventory Adjustment   │
  │  📋  Move History           │
  │  🏠  Dashboard              │
  │  ─── Settings ───           │
  │  🏭  Warehouse              │
  ├─────────────────────────────┤
  │  (bottom)                   │
  │  👤  [Avatar] Name          │
  │      My Profile             │
  │      Logout                 │
  └─────────────────────────────┘
```

---

## 📁 Folder Naming Conventions

- Component files: `PascalCase.jsx` (e.g. `ReceiptForm.jsx`)
- Store files: `useCamelCase.js` (e.g. `useReceiptStore.js`)
- API files: `camelCaseAPI.js` (e.g. `receiptAPI.js`)
- Utility files: `camelCase.js` (e.g. `formatters.js`)
- Route files: `camelCaseRoutes.js` (e.g. `receiptRoutes.js`)
- Controller files: `camelCaseController.js`
- Model files: `PascalCase.js` (e.g. `Receipt.js`)

---

## 📐 API Response Convention

All API responses follow this exact shape:

```javascript
// Success
res.status(200).json({
  success: true,
  data: { ... },         // actual payload
  message: 'Optional success message',
  pagination: {          // only on paginated endpoints
    page: 1,
    limit: 20,
    total: 150,
    pages: 8
  }
});

// Error
res.status(400).json({
  success: false,
  message: 'Human-readable error description'
});
```

Controllers should use an `asyncHandler` wrapper to catch async errors:

```javascript
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
export default asyncHandler;
```
