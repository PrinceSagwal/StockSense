# ⚙️ StockSense — Setup Guide

> Complete step-by-step instructions to set up StockSense locally for development.  
> **Agent instructions:** Follow every step in order. Do not skip steps. Verify each step's expected output before proceeding to the next.

---

## Prerequisites

| Requirement | Minimum Version | How to Check |
|---|---|---|
| Node.js | 18.x | `node --version` |
| npm | 9.x | `npm --version` |
| Git | Latest | `git --version` |
| MongoDB Atlas | Free account | [cloud.mongodb.com](https://cloud.mongodb.com) |
| Cloudinary | Free account | [cloudinary.com](https://cloudinary.com) |
| Twilio | Free trial | [twilio.com](https://twilio.com) |
| Gmail account | With 2FA enabled | For App Password |

---

## Step 1 — Clone the Repository

```bash
git clone https://github.com/yourusername/StockSense.git
cd StockSense
```

Expected: `StockSense/` directory with `client/`, `server/`, and all `.md` files.

---

## Step 2 — Server Setup

### 2a. Install Dependencies

```bash
cd server
npm install
```

Verify: no error messages. `node_modules/` folder created.

### 2b. Create Environment File

```bash
cp .env.example .env
```

If `.env.example` doesn't exist yet, create `server/.env` manually with this content:

```env
# ─── Server Configuration ─────────────────────────────────────
PORT=5000
NODE_ENV=development

# ─── MongoDB Atlas ─────────────────────────────────────────────
# Get from MongoDB Atlas → Connect → Connect your application
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/stocksense?retryWrites=true&w=majority

# ─── JWT ───────────────────────────────────────────────────────
# Minimum 32 characters random string
JWT_SECRET=replace_this_with_a_very_long_random_secret_string_min32chars
JWT_EXPIRES_IN=7d

# ─── Cloudinary ────────────────────────────────────────────────
# Get from Cloudinary Dashboard → Settings → API Keys
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── Email (Nodemailer + Gmail) ────────────────────────────────
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
# Use Gmail App Password, NOT your Gmail login password
# Get it: Google Account → Security → 2-Step Verification → App passwords
EMAIL_PASS=xxxx_xxxx_xxxx_xxxx

# ─── Twilio (Verify & SMS) ────────────────────────────────────
# Get from Twilio Console (twilio.com/console)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=+1234567890
# Twilio Verify Service SID (Optional, for Verify v2 API)
TWILIO_VERIFY_SERVICE_SID=VAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# ─── Client URL (CORS) ─────────────────────────────────────────
CLIENT_URL=http://localhost:5173
```

**Important:** Never commit `.env` to git. It is already in `.gitignore`.

---

## Step 3 — Client Setup

```bash
cd ../client
npm install
```

Create `client/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## Step 4 — Configure `vite.config.js`

The Vite config must proxy API requests and WebSocket connections to the backend to avoid CORS issues in development.

```javascript
// client/vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true,                     // Required for WebSocket proxying
      }
    }
  }
})
```

---

## Step 5 — Configure Tailwind CSS v4

Tailwind v4 works differently from v3. There is **no `tailwind.config.js`** needed. The Vite plugin handles everything.

In `client/src/index.css` (top of file):

```css
@import "tailwindcss";

/* Custom CSS variables for StockSense design system */
:root {
  --sidebar-bg:       #0F172A;
  --sidebar-text:     #94A3B8;
  --sidebar-active:   #4F46E5;
  --sidebar-hover:    #1E293B;
  --color-primary:    #4F46E5;
  --color-primary-hover: #4338CA;
  --color-primary-light: #EEF2FF;
  --content-bg:       #F8FAFC;
  --card-bg:          #FFFFFF;
  --border-color:     #E2E8F0;
  --text-primary:     #0F172A;
  --text-secondary:   #64748B;
  --text-muted:       #94A3B8;
  --color-success:    #22C55E;
  --color-warning:    #F59E0B;
  --color-danger:     #EF4444;
  --color-info:       #3B82F6;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background-color: var(--content-bg);
  color: var(--text-primary);
}
```

Add Inter font in `client/index.html` `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

---

## Step 6 — Create `server/server.js`

This is the entry point for the backend. Create it with this content:

```javascript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

dotenv.config();

// Connect MongoDB
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST']
  }
});

// Make io accessible in controllers via req.app.get('io')
app.set('io', io);

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join:warehouse', ({ warehouseId }) => {
    socket.join(`warehouse:${warehouseId}`);
  });

  socket.on('leave:warehouse', ({ warehouseId }) => {
    socket.leave(`warehouse:${warehouseId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('dev'));

// Routes (import after setup)
import authRoutes       from './routes/authRoutes.js';
import productRoutes    from './routes/productRoutes.js';
import receiptRoutes    from './routes/receiptRoutes.js';
import deliveryRoutes   from './routes/deliveryRoutes.js';
import transferRoutes   from './routes/transferRoutes.js';
import adjustmentRoutes from './routes/adjustmentRoutes.js';
import warehouseRoutes  from './routes/warehouseRoutes.js';
import dashboardRoutes  from './routes/dashboardRoutes.js';
import moveRoutes       from './routes/moveRoutes.js';

app.use('/api/auth',        authRoutes);
app.use('/api/products',    productRoutes);
app.use('/api/receipts',    receiptRoutes);
app.use('/api/deliveries',  deliveryRoutes);
app.use('/api/transfers',   transferRoutes);
app.use('/api/adjustments', adjustmentRoutes);
app.use('/api/warehouses',  warehouseRoutes);
app.use('/api/dashboard',   dashboardRoutes);
app.use('/api/moves',       moveRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  const status = err.statusCode || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 StockSense server running on http://localhost:${PORT}`);
});
```

---

## Step 7 — Create `server/config/db.js`

```javascript
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
```

---

## Step 8 — Create `client/src/api/axiosInstance.js`

```javascript
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,              // Send cookies with every request (required for JWT)
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,                     // 15 second timeout
});

// Request interceptor — log in development
axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401 globally
axiosInstance.interceptors.response.use(
  (response) => response.data,        // Unwrap response.data automatically
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth state and redirect
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;
```

---

## Step 9 — Create `client/src/socket/socket.js`

```javascript
import { io } from 'socket.io-client';

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  withCredentials: true,
  autoConnect: false,                 // Only connect after user logs in
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Socket disconnected:', reason);
});

socket.on('connect_error', (err) => {
  console.error('Socket connection error:', err.message);
});

export default socket;
```

Connect in `useAuthStore` after login:

```javascript
// In login action inside useAuthStore.js:
import socket from '../socket/socket';

// After successful login:
socket.connect();

// In logout action:
socket.disconnect();
```

---

## Step 10 — Create `client/src/hooks/useSocket.js`

```javascript
import { useEffect } from 'react';
import socket from '../socket/socket';

const useSocket = (eventName, handler) => {
  useEffect(() => {
    socket.on(eventName, handler);
    return () => {
      socket.off(eventName, handler);
    };
  }, [eventName, handler]);
};

export default useSocket;
```

Usage in Dashboard:

```javascript
const { fetchKPIs } = useDashboardStore();

useSocket('stock:updated', () => {
  fetchKPIs();
});
```

---

## Step 11 — Set Up FontAwesome

FontAwesome is installed as `@fortawesome/fontawesome-free`. Import it in `client/src/main.jsx`:

```javascript
import '@fortawesome/fontawesome-free/css/all.min.css';
```

Usage in JSX:

```jsx
<i className="fa-solid fa-box"></i>
<i className="fa-solid fa-truck"></i>
<i className="fa-solid fa-triangle-exclamation"></i>
```

---

## Step 12 — Set Up React Hot Toast

In `client/src/App.jsx`, add the Toaster component at the root level:

```jsx
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1E293B',
            color: '#F8FAFC',
            borderRadius: '10px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#22C55E', secondary: '#F8FAFC' }
          },
          error: {
            iconTheme: { primary: '#EF4444', secondary: '#F8FAFC' }
          }
        }}
      />
      {/* Routes here */}
    </>
  );
}
```

Usage anywhere:

```javascript
import toast from 'react-hot-toast';

toast.success('Receipt validated successfully!');
toast.error('Insufficient stock for this product.');
toast('⚠️ Steel Rod is running low.', { icon: '⚠️' });
```

---

## Step 13 — Run Development Servers

Open **two terminal windows**:

**Terminal 1 — Backend:**

```bash
cd server
npm run dev
```

Expected output:
```
[nodemon] starting `node server.js`
✅ MongoDB Connected: cluster0.xxxxx.mongodb.net
🚀 StockSense server running on http://localhost:5000
```

**Terminal 2 — Frontend:**

```bash
cd client
npm run dev
```

Expected output:
```
  VITE v7.3.1  ready in 350ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Open `http://localhost:5173` in your browser.

---

## Step 14 — External Services Configuration

### MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → sign up or log in
2. Create a new **free M0 cluster**
3. Under **Database Access**: create a user with `Read and Write` privileges. Note the username and password.
4. Under **Network Access**: click "Add IP Address" → "Allow Access from Anywhere" (`0.0.0.0/0`) for development
5. Under **Databases** → Connect → **Connect your application** → copy the connection string
6. Replace `<username>` and `<password>` in the string and paste into `MONGO_URI`

### Cloudinary

1. Go to [cloudinary.com](https://cloudinary.com) → sign up
2. From the **Dashboard**, copy:
   - Cloud Name → `CLOUDINARY_CLOUD_NAME`
   - API Key → `CLOUDINARY_API_KEY`
   - API Secret → `CLOUDINARY_API_SECRET`

### Gmail App Password (Nodemailer)

1. Enable **2-Step Verification** on your Google account
2. Go to: `myaccount.google.com → Security → 2-Step Verification → App passwords`
3. Select **Mail** and your device → Generate
4. Copy the 16-character password (shown once) → paste as `EMAIL_PASS`
5. Use your Gmail address as `EMAIL_USER`

### Twilio (SMS OTP)

1. Sign up at [twilio.com](https://twilio.com) (free trial gives credit)
2. From the Console Dashboard, copy:
   - Account SID → `TWILIO_ACCOUNT_SID`
   - Auth Token → `TWILIO_AUTH_TOKEN`
3. Under **Phone Numbers** → Buy a number → copy it → `TWILIO_PHONE_NUMBER`

---

## Step 15 — `server/config/cloudinary.js`

```javascript
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

---

## Step 16 — `server/middleware/uploadMiddleware.js`

```javascript
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'stocksense/products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 800, height: 800, crop: 'limit' }]
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }    // 5MB max
});

export default upload;
```

**Usage in routes:**

```javascript
import upload from '../middleware/uploadMiddleware.js';
router.post('/', protect, upload.single('image'), createProduct);
```

---

## Step 17 — `server/middleware/authMiddleware.js`

```javascript
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  try {
    const token = req.cookies.stocksense_token;
    if (!token) {
      return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -otp -otpExpiry');
    if (!user || !user.isActive) {
      return res.status(401).json({ success: false, message: 'User not found or deactivated.' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Token invalid or expired.' });
  }
};

// Role-based access guard
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Access denied. Insufficient role.' });
  }
  next();
};

export { protect, restrictTo };
```

---

## Step 18 — `server/middleware/rateLimiter.js`

```javascript
import rateLimit from 'express-rate-limit';

// General API limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests. Please try again later.' }
});

// Stricter limiter for auth/OTP routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts. Please wait 15 minutes.' }
});
```

---

## Step 19 — `server/utils/generateToken.js`

```javascript
import jwt from 'jsonwebtoken';

const generateToken = (res, userId, role) => {
  const token = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  res.cookie('stocksense_token', token, {
    httpOnly: true,                                      // Cannot be accessed by JavaScript
    secure: process.env.NODE_ENV === 'production',       // HTTPS only in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000                    // 7 days in milliseconds
  });

  return token;
};

export default generateToken;
```

---

## Step 20 — `client/src/App.jsx` Route Structure

```jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/useAuthStore';
import ProtectedRoute from './components/layout/ProtectedRoute';
import PageWrapper from './components/layout/PageWrapper';

// Auth pages
import Login from './pages/Auth/Login';
import Signup from './pages/Auth/Signup';
import ForgotPassword from './pages/Auth/ForgotPassword';

// App pages
import Dashboard from './pages/Dashboard/Dashboard';
import ProductList from './pages/Products/ProductList';
import ProductCreate from './pages/Products/ProductCreate';
import ProductDetail from './pages/Products/ProductDetail';
import ReceiptList from './pages/Receipts/ReceiptList';
import ReceiptCreate from './pages/Receipts/ReceiptCreate';
import ReceiptDetail from './pages/Receipts/ReceiptDetail';
import DeliveryList from './pages/Deliveries/DeliveryList';
import DeliveryCreate from './pages/Deliveries/DeliveryCreate';
import DeliveryDetail from './pages/Deliveries/DeliveryDetail';
import TransferList from './pages/Transfers/TransferList';
import TransferCreate from './pages/Transfers/TransferCreate';
import AdjustmentPage from './pages/Adjustments/AdjustmentPage';
import MoveHistory from './pages/MoveHistory/MoveHistory';
import WarehouseSettings from './pages/Warehouses/WarehouseSettings';
import MyProfile from './pages/Profile/MyProfile';

function App() {
  const { fetchUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    fetchUser();                    // Rehydrate auth state on app load
  }, []);

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected routes wrapped in layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<PageWrapper />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/products" element={<ProductList />} />
            <Route path="/products/create" element={<ProductCreate />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/receipts" element={<ReceiptList />} />
            <Route path="/receipts/create" element={<ReceiptCreate />} />
            <Route path="/receipts/:id" element={<ReceiptDetail />} />
            <Route path="/deliveries" element={<DeliveryList />} />
            <Route path="/deliveries/create" element={<DeliveryCreate />} />
            <Route path="/deliveries/:id" element={<DeliveryDetail />} />
            <Route path="/transfers" element={<TransferList />} />
            <Route path="/transfers/create" element={<TransferCreate />} />
            <Route path="/adjustments" element={<AdjustmentPage />} />
            <Route path="/history" element={<MoveHistory />} />
            <Route path="/settings/warehouses" element={<WarehouseSettings />} />
            <Route path="/profile" element={<MyProfile />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
```

---

## Step 21 — `client/src/components/layout/ProtectedRoute.jsx`

```jsx
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../../store/useAuthStore';

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
```

---

## Common Issues & Fixes

### ❌ `CORS error` in browser console
- Ensure `CLIENT_URL` in `server/.env` is exactly `http://localhost:5173`
- Ensure `withCredentials: true` is in Axios instance
- Ensure `credentials: true` is in Express CORS options
- Verify the Vite proxy in `vite.config.js` is set up correctly

### ❌ `MongoDB connection error`
- Check IP whitelist in MongoDB Atlas (add `0.0.0.0/0` for development)
- Verify `<username>` and `<password>` in `MONGO_URI` are URL-encoded (special characters like `@` must be encoded as `%40`)
- Ensure no angle brackets remain in the URI

### ❌ JWT cookie not being set
- In development, `sameSite: 'lax'` and `secure: false` — ensure `NODE_ENV=development`
- In production, `sameSite: 'none'` and `secure: true` — requires HTTPS
- Use browser DevTools → Application → Cookies to verify cookie is present

### ❌ Tailwind v4 styles not working
- Do NOT use `@tailwind base;` `@tailwind components;` `@tailwind utilities;` — that is Tailwind v3 syntax
- Use `@import "tailwindcss";` in your CSS file instead
- Ensure `@tailwindcss/vite` is in plugins in `vite.config.js`

### ❌ Gmail OTP not sending
- `EMAIL_PASS` must be the 16-character **App Password**, not your regular Gmail password
- 2-Step Verification must be enabled on your Google account before App Passwords appear
- Check spam folder when testing

### ❌ Socket.io not connecting
- Verify `VITE_SOCKET_URL=http://localhost:5000` in `client/.env`
- Ensure Vite proxy has `ws: true` on `/socket.io`
- Confirm `socket.connect()` is called in `useAuthStore` after successful login
- Check browser console → Network → WS tab for the WebSocket connection

### ❌ Images not uploading to Cloudinary
- Verify all three Cloudinary env vars are correct
- Ensure `multer-storage-cloudinary` is installed (it's in the mediconnect package.json — install it: `npm install multer-storage-cloudinary`)
- Check Cloudinary dashboard for upload errors

---

## `.gitignore` (Root)

```gitignore
# Dependencies
node_modules/

# Environment files
.env
.env.local
.env.production

# Build outputs
dist/
build/

# Logs
*.log
npm-debug.log*

# OS files
.DS_Store
Thumbs.db

# Editor files
.vscode/
.idea/
*.swp
```

---

## Production Deployment Checklist

### Before deploying:
- [ ] All `.env` variables are set in the hosting platform's dashboard
- [ ] `NODE_ENV=production` on the server
- [ ] Cookie options updated: `secure: true`, `sameSite: 'none'`
- [ ] CORS `CLIENT_URL` updated to production frontend domain
- [ ] MongoDB Atlas IP whitelist updated to allow all IPs or the server's IP

### Recommended Hosting:
- **Backend**: [Render](https://render.com) (Free tier, auto-deploys from GitHub) or [Railway](https://railway.app)
- **Frontend**: [Vercel](https://vercel.com) (Free tier, connects to GitHub repo)
- **Database**: MongoDB Atlas M0 Free Cluster
- **Media**: Cloudinary (free tier: 25GB storage)