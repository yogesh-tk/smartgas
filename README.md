# Bharat Scheme (பாரத் திட்டம்) - Smart Gas Management Module

An enterprise-grade, citizen-first **Smart LPG Gas Management System** designed for the **Bharat Scheme** digital governance initiative. It unifies India's major Oil Marketing Companies (**Indane Gas / IOCL**, **Bharat Gas / BPCL**, and **HP Gas / HPCL**) into one seamless, privacy-preserving, bilingual (English & தமிழ்) dashboard.

Built using the modern **MERN Stack (MongoDB, Express.js, React 19, Node.js)** with **Brevo email + Gemini AI** integration and **Firebase Cloud Messaging**.

---

## 🌟 Key Features
- **Dynamic AI chatbot** powered by Google Gemini 2.5 Flash; supports English and Tamil/Tanglish through a backend API.
- **Email-only verification** through Brevo; mobile number OTP and Twilio are removed.

### 1. Unified LPG Provider Integration
- Full support for all 3 national LPG grids:
  - **Indane Gas** (Indian Oil Corporation Limited - IOCL)
  - **Bharat Gas** (Bharat Petroleum Corporation Limited - BPCL)
  - **HP Gas** (Hindustan Petroleum Corporation Limited - HPCL)
- Modular LPG Provider Adapter pattern (`LpgProviderInterface`, `MockLpgProviderAdapter`, `OfficialLpgProviderAdapter`).
- Simulated National LPG Grid Sandbox for zero-friction evaluation, pre-seeded with realistic consumer numbers and regional distributor networks.

### 2. Email verification + AI assistant
- Brevo transactional email API sends registration and LPG connection verification codes.
- Mobile numbers are profile/connection details only; there is no mobile OTP or SMS provider.
- Google Gemini 2.5 Flash powers the in-app chatbot through a backend endpoint. The API key stays on the server.

### 3. MongoDB Database Architecture
- Built with **Mongoose 8** schemas and collections:
  - `users`: Citizen profiles, roles (`citizen`, `admin`), language preference (`en`, `ta`), FCM tokens.
  - `consumer_connections`: Linked LPG connections with masked consumer numbers, 17-digit LPG IDs, distributor data, subsidy eligibility.
  - `refill_bookings`: Multi-stage cylinder bookings with delivery PIN, delivery agent details, payment statuses, and subsidy receipts.
  - `family_members`: Consent-based family directory with cryptographic tokens and RBAC permissions.
  - `notifications`: In-app and FCM push notifications; transactional email notifications via Brevo.
  - `support_tickets`: Citizen grievances and **1906 Emergency Gas Leak** reports.
  - `gas_providers`: OMC pricing configuration, subsidy rates, and helplines.
- **Dual-Engine MongoDB Layer**: Connects to live MongoDB (`mongodb://127.0.0.1:27017/bharat_gas_db`) or activates the standalone in-memory Sandbox Engine seamlessly if local `mongod` is not running.

### 4. Privacy-First Family Gas Hub (Bharat Parivar)
- Manage elderly parents' and family members' gas connections under a unified citizen account.
- **Consent-First Security**: A family member's consumer data is strictly locked and blurred until they grant consent via email consent link (`/consent/:token`).
- Once consented, the family head can view refill schedules and order cylinders on their behalf.

### 5. Smart Refill Predictor
- Predicts household gas depletion using consumption intervals.
- Generates proactive refill reminder warnings when the cylinder drops below ~20% (around 25–30 days from last delivery).

### 6. 1906 Emergency Gas Leak Helpline & Safety Protocol
- Prominent 24x7 **1906 Universal Emergency Helpline** button with pulsing alert.
- Bilingual life-safety checklist (regulator shutoff, ventilation, electrical switch hazard warnings).
- Rapid one-click critical emergency ticket creation with distributor alert dispatch.

### 7. Modern Indian Government Digital Portal UI
- Clean, responsive design themed with Indian national tricolor accents, Ashoka chakra emblems, and government blue/green typography.
- Instant, dynamic **English (EN)** and **Tamil (தமிழ்)** language toggle across all pages, forms, badges, and receipts.

---

## 📁 Project Structure

```
e:\hackathon\
├── backend\
│   ├── config\
│   │   └── db.js                 # MongoDB connection & sandbox engine
│   ├── controllers\
│   │   ├── authController.js     # Email OTP registration, password auth, JWT
│   │   ├── bookingController.js  # Refill booking, live tracking, tax invoices
│   │   ├── familyController.js   # Family hub, email consent requests & review
│   │   ├── lpgController.js      # Consumer verification & connection linking
│   │   ├── notificationController.js # Notifications & Smart Refill Predictor
│   │   └── supportController.js  # Helpdesk & 1906 emergency tickets
│   ├── middleware\
│   │   └── authMiddleware.js     # JWT verification & Admin role guard
│   ├── models\                   # Mongoose Schemas
│   │   ├── ConsumerConnection.js
│   │   ├── FamilyMember.js
│   │   ├── GasProvider.js
│   │   ├── Notification.js
│   │   ├── OtpVerification.js
│   │   ├── RefillBooking.js
│   │   ├── SupportTicket.js
│   │   └── User.js
│   ├── routes\                   # Express REST APIs
│   ├── scripts\
│   │   └── seedMongo.js          # MongoDB database seed script
│   ├── services\
│   │   ├── fcmService.js         # Firebase Cloud Messaging push service
│   │   ├── lpg\                  # Modular LPG Provider Adapters
│   │   │   ├── LpgProviderInterface.js
│   │   │   ├── MockLpgProviderAdapter.js
│   │   │   ├── OfficialLpgProviderAdapter.js
│   │   │   └── index.js
│   │   └── brevoService.js      # Brevo transactional email service
│   ├── .env                      # Backend environment variables
│   ├── package.json
│   └── server.js                 # Express server entry point (Port 5000)
│
├── frontend\
│   ├── src\
│   │   ├── components\
│   │   │   ├── BookRefillModal.jsx       # Refill order modal (14.2kg, 5kg, 19kg)
│   │   │   ├── EmergencyModal.jsx        # 1906 Emergency Leak response modal
│   │   │   ├── LinkConnectionModal.jsx   # 4-Step OTP Connection linking modal
│   │   │   ├── Navbar.jsx                # Gov tricolor header, language switch, profile
│   │   │   ├── NotificationDropdown.jsx  # Notification center
│   │   │   ├── ReceiptModal.jsx          # Digital GST tax invoice with print/download
│   │   │   ├── Sidebar.jsx               # Navigation drawer
│   │   │   └── TrackBookingModal.jsx     # Live multi-stage milestone tracker
│   │   ├── context\
│   │   │   └── AuthContext.jsx           # JWT session, 1-click evaluator switch, i18n
│   │   ├── pages\
│   │   │   ├── BookingsPage.jsx          # Order history & tracking
│   │   │   ├── ConsentReviewPage.jsx     # Citizen-facing email consent review page
│   │   │   ├── DashboardPage.jsx         # Citizen gas hub, refill prediction, DBTL
│   │   │   ├── EmergencySupportPage.jsx  # 1906 hotline & grievance tickets
│   │   │   ├── FamilyHubPage.jsx         # Bharat Parivar family gas hub
│   │   │   ├── LoginPage.jsx             # email OTP & password login
│   │   │   └── SubsidyPage.jsx           # PAHAL / DBTL subsidy ledger
│   │   ├── utils\
│   │   │   └── translations.js           # Bilingual dictionary (English & தமிழ்)
│   │   ├── api.js                        # Centralized API fetch wrapper
│   │   ├── App.jsx                       # Routing & layout configuration
│   │   └── index.css                     # Tailwind v4 configuration & Gov theme
│   ├── package.json
│   └── vite.config.js                    # Vite dev server + /api proxy
│
├── database\
│   ├── mongo-seeds.json                  # Sample MongoDB JSON data
│   ├── schema.sql                        # Reference SQL schema
│   └── seeds.sql                         # Reference SQL seeds
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18 or higher recommended; v24 verified)
- **MongoDB** (Local `mongod` or MongoDB Atlas URI; app auto-activates sandbox engine if daemon is not running)

### 1. Backend Setup
```bash
cd backend
npm install
node server.js
```
The server will start on `http://localhost:5000`.

### 2. Frontend Setup
Open a second terminal:
```bash
cd frontend
npm install
npm run dev
```
Open the Vite URL shown in the terminal (usually `http://localhost:5173`).

## ✉️ Brevo and Gemini setup

Copy `backend/.env.example` to `backend/.env`, then configure:

```env
BREVO_API_KEY=your_brevo_api_key
BREVO_SENDER_EMAIL=your_verified_sender_email
BREVO_SENDER_NAME=Bharat Scheme
GEMINI_API_KEY=your_google_ai_studio_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Register/verify the sender address in Brevo. Create a Gemini API key in Google AI Studio. Keep both keys in the backend environment only. Registration and LPG ownership verification codes go to email; no mobile OTP or SMS gateway is used.
