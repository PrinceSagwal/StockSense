# 🎙️ StockSense — 4-Minute Hackathon Demo Video & Voiceover Script (Finalized)

This document is your complete, battle-tested recording guide and word-for-word voiceover script for presenting **StockSense** to hackathon judges.

---

## ⏱️ Video Breakdown at a Glance (4:00 Total)

| Time | Segment | Screen Focus | Key Hook & Highlights |
|---|---|---|---|
| **0:00 – 0:30** | **The Hook & Problem Statement** | Home Page / Landing | Inventory shrinkage, spreadsheet chaos & StockSense's solution |
| **0:30 – 1:00** | **Enterprise Auth & Security** | Login / Native OTP 2FA | JWT cookies, role permissions & native OTP floor verification |
| **1:00 – 1:45** | **The Command Center Dashboard** | Manager & Staff Dashboards | Dual persona, live KPIs, low stock alerts, charts & floor queue |
| **1:45 – 2:25** | **Inbound Receipts & Internal Transfers** | Receipts & Transfers | Vendor ASN dock intake + Zone-to-zone physical relocation |
| **2:25 – 3:05** | **Outbound Deliveries & Cycle Audits** | Deliveries & Adjustments | Over-shipment blocking + Physical cycle count audit reconciliation |
| **3:05 – 3:35** | **The Secret Weapon: Stock Move Ledger** | `/moves` & Multi-Warehouse | Immutable double-entry ledger & multi-hub bin hierarchy |
| **3:35 – 4:00** | **Tech Highlights & Winning Pitch** | Architecture / Home Page | MERN + Socket.io + Tailwind v4 + Cloud enterprise scale |

---

## 🎬 Timestamped Screenplay & Voiceover Script

---

### 🟢 Segment 1: The Hook & Problem Statement (0:00 – 0:30)

#### 🖥️ Screen Action:
1. Start on the **Landing Page** (`/`).
2. Smoothly scroll through the hero section: highlight the SVG headline draw, the continuous live preview video card, and the dynamic typewriter terminal.
3. Toggle between **Dark Mode** and **Light Mode** once to show UI sophistication.

#### 🗣️ Voiceover:
> *"Every year, warehouse operations lose billions due to misplaced inventory, unrecorded shrinkage, and fragmented spreadsheets. When stock numbers in the office don't match what's physically on the warehouse racks, customer shipments get delayed, orders fail, and business trust is broken.*

---

### 🔐 Segment 2: Authentication, Roles & Security (0:30 – 1:00)

#### 🖥️ Screen Action:
1. Click **"Launch Live App"** or **"Sign In"** (`/login`).
2. Show credentials login, then click the **"Phone OTP"** tab.
3. Type a phone number and click **"Send Code"**. Highlight the auto-filled 6-digit code or enter the hackathon demo code `123456`.
4. Click **"Verify & Sign In"** $\rightarrow$ land straight into the Dashboard.

#### 🗣️ Voiceover:
> *"Security in a modern warehouse environment is critical. StockSense features tokenized JWT authentication stored securely in HTTP-only cookies, combined with native 6-digit OTP verification designed specifically for floor tablets and shared dock terminals.*
>
> *With granular role-based access control, Inventory Managers have full administrative, analytical, and configuration authority, while Warehouse Floor Staff get a streamlined, error-proof operational interface focused entirely on day-to-day fulfillment."*

---

### 📊 Segment 3: The Command Center Dashboard (1:00 – 1:45)

#### 🖥️ Screen Action:
1. Land on the **Executive Management Dashboard** (`/dashboard`).
2. Point out the top **Safety Breach Alert Banner** (highlighting items that have dipped below minimum safe thresholds).
3. Hover over the **5 KPI Metric Cards**: *Catalog Items*, *Low Stock*, *Out of Stock*, *Pending Receipts*, and *Pending Deliveries*.
4. Scroll past the **Stock by Category** progress pills and the **Recent Moves Continuous Timeline**.
5. Hover over the **Stock Health Donut Chart** and the **Operations Breakdown Stacked Bar Chart** (*Draft $\rightarrow$ Waiting $\rightarrow$ Ready $\rightarrow$ Done*).
6. Click the role toggle switch in the top right to switch to **Staff Queue** mode: show the instant **SKU / Barcode Floor Scanner** and active task queue.

#### 🗣️ Voiceover:
> *"The StockSense Dashboard is an operational command center with a dual-persona design. In Executive Manager mode, operators immediately see live business vitals across five core KPI cards.*
>
> *Notice this pulsating red alert banner: whenever an item breaches its safe reorder threshold, StockSense broadcasts instant WebSocket alerts across all active sessions. Below, you see category distribution pills, an immutable live movement feed, and analytical charts tracking pipeline bottlenecks from draft through completion.*
>
> *And with a single click, floor supervisors can switch to the Staff Queue view — featuring an instant SKU barcode scanner and prioritized work tickets for receiving and packing."*

---

### 📥 Segment 4: Inbound Receipts & Internal Transfers (1:45 – 2:25)

#### 🖥️ Screen Action:
1. Navigate to **Receipts** (`/receipts`).
2. Open an existing draft receipt or click **Create Receipt**, showing vendor selection, line items, and quantities.
3. Click **"Validate Receipt"** $\rightarrow$ highlight the success toast and stock increasing atomically.
4. Navigate to **Transfers** (`/transfers`). Show moving stock from *Main Distribution Hub (Zone A)* to *Production Floor (Zone B)*.

#### 🗣️ Voiceover:
> *"Now let's examine physical operations. When shipments arrive from vendors at the receiving dock, staff create an Inbound Receipt. We specify the supplier, line items, and expected quantities.*
>
> *The moment the dock worker validates the shipment, StockSense atomically updates physical stock in that specific destination bay and broadcasts the update across the entire company.*
>
> *Need to relocate items between aisles, bins, or distinct regional hubs? The Internal Transfer module facilitates seamless movements. Total company stock remains perfectly balanced, while individual per-location balances update with zero paperwork."*

---

### 📤 Segment 5: Outbound Deliveries & Cycle Audits (2:25 – 3:05)

#### 🖥️ Screen Action:
1. Navigate to **Deliveries** (`/deliveries`).
2. Open a delivery order and demonstrate validation (picking, packing, and final dispatch).
3. Show the built-in guardrail: if a user attempts to over-dispatch more units than exist in that warehouse, validation is strictly blocked.
4. Navigate to **Inventory Adjustments** (`/adjustments`). Show entering a physical count (e.g., physical 47 vs recorded 50) and validate the audited discrepancy.

#### 🗣️ Voiceover:
> *"For outbound customer fulfillment, StockSense handles pick, pack, and ship workflows with strict safeguards. If a worker accidentally attempts to dispatch more units than are physically available in that bin, validation is strictly blocked to eliminate negative inventory.*
>
> *And for periodic cycle counting, our Adjustment engine lets supervisors enter physical counts directly from the floor. If units are damaged or lost, StockSense automatically calculates the delta, adjusts on-hand inventory, and stamps the reason for managerial compliance."*

---

### 📋 Segment 6: The Secret Weapon — The Stock Move Ledger (3:05 – 3:35)

#### 🖥️ Screen Action:
1. Navigate to **Move History** (`/moves`).
2. Scroll through the ledger table showing: *Date & Time, Product SKU, Movement Type, Source $\rightarrow$ Destination Location, Quantity Delta (+/-), and Responsible Staff Member*.
3. Quickly navigate to **Warehouse Settings** (`/settings/warehouses`) to showcase multi-warehouse and zone/rack hierarchies.

#### 🗣️ Voiceover:
> *"What truly elevates StockSense is its immutable Stock Move Ledger. In accounting, you never delete a transaction; you balance it. StockSense applies that exact same double-entry philosophy to physical inventory.*
>
> *Every single receipt, dispatch, transfer, or adjustment creates an immutable, timestamped ledger record. You know exactly who moved what, where it came from, where it went, and why. Combined with multi-warehouse and multi-rack hierarchy management, audit preparation becomes completely effortless."*

---

### 🚀 Segment 7: Tech Stack & Winning Closing Pitch (3:35 – 4:00)

#### 🖥️ Screen Action:
1. Return smoothly to the **Dashboard** or **Landing Page**.
2. Show the fluid Framer Motion transitions, responsive dark mode, and toast notifications.
3. Finish on the title logo: **StockSense**.

#### 🗣️ Voiceover:
> *"Under the hood, StockSense is built for speed and reliability: React 19, Vite, and Tailwind CSS on the frontend with Framer Motion animations; backed by Node.js, Express, MongoDB Mongoose, and Socket.io for millisecond-latency real-time sync.*
>
> *StockSense transforms chaotic manual warehouses into intelligent, synchronized, and audit-compliant logistics engines. Thank you for watching!"*

---

## 💡 Production Checklist for a Flawless Demo Recording

1. **Pre-populated Demo Data**:
   - Ensure you have 4–6 realistic products (e.g. *Precision Ball Bearings*, *Lithium Battery Pack*, *Solar Inverter*).
   - Ensure at least 1 item is below safety threshold so the **red alert banner** shows on the dashboard.
   - Have at least 2 warehouses configured (*Main Distribution Hub*, *Production Floor*).
2. **Demo Shortcuts (Zero Friction)**:
   - For phone OTP login, enter any phone number and use code **`123456`** for instantaneous authentication without waiting.
3. **Screen Recording Settings**:
   - Resolution: **1920x1080 (1080p)** at 60 fps.
   - Zoom: Keep browser zoom at 100% or 90% for clean layout visibility.
   - Use OBS Studio, Loom, or macOS QuickTime.
4. **Voiceover Tip**:
   - Record your screen walkthrough video first with calm, deliberate mouse movements.
   - Play the recorded video back while speaking this script aloud into your microphone.
5. **Output Video Placement**:
   - Save your final video as `video.mp4` and place it in `client/public/video.mp4`.
   - It will automatically loop smoothly in the landing page hero preview card!
