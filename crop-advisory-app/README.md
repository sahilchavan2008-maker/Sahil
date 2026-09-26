# AgriCure AI: Enterprise Crop Advisory & Multimodal Diagnostics Assistant

> Production-ready, data-driven agricultural advisory platform leveraging Google Gemini 2.5 Flash, Supabase PostgreSQL with Row-Level Security (RLS), and strict Zod runtime JSON validation.

---

## 🌾 Overview & Core Mission

Empowering farmers, agronomists, and agricultural extension workers to diagnose crop diseases, analyze foliar lesions, and receive scientifically validated Integrated Pest Management (IPM) treatment protocols tailored to local soil chemistry and growth stages.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React Router v6, Axios
- **Backend**: Node.js, Express.js (ES Modules), Helmet, CORS, Express Rate Limit, Multer
- **AI Integration**: `@google/genai` SDK (`gemini-2.5-flash`), structured JSON schema enforcement, deterministic parameter tuning (Temp: 0.2, TopP: 0.95)
- **Validation**: Zod (runtime response validation and input sanitization)
- **Database & Auth**: Supabase PostgreSQL with strict Row Level Security (RLS) policies

---

## 📁 Monorepo Structure

```text
crop-advisory-app/
├── server/
│   ├── config/
│   │   ├── gemini.js           # @google/genai SDK setup & fallback
│   │   └── supabase.js         # Supabase client + in-memory evaluation store
│   ├── controllers/
│   │   ├── advisoryController.js # Multimodal Gemini vision & Zod validation
│   │   └── farmController.js     # Farm plots CRUD
│   ├── middleware/
│   │   ├── auth.js             # Supabase JWT token validator
│   │   └── upload.js           # Multer memory storage for plant photos
│   ├── routes/
│   │   ├── advisoryRoutes.js   # /api/advisories routes
│   │   └── farmRoutes.js       # /api/farms routes
│   ├── schemas/
│   │   └── advisorySchema.js   # Gemini Type Schema & Zod Schemas
│   ├── supabase/
│   │   └── schema.sql          # PostgreSQL DDL, Enums, RLS, & triggers
│   ├── .env.example
│   ├── package.json
│   └── index.js                # Express app entrypoint
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── FarmCard.jsx
│   │   │   ├── AdvisoryForm.jsx
│   │   │   ├── DiagnosisReport.jsx
│   │   │   └── AnalyticsCharts.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Supabase Auth & 1-Click Evaluation Mode
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── AuthPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── FarmsPage.jsx
│   │   │   ├── NewAdvisoryPage.jsx
│   │   │   ├── AdvisoryDetailPage.jsx
│   │   │   ├── AnalyticsPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── supabase.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── package.json
```

---

## ⚡ Quick Start

### 1. Run the Express Backend
```bash
cd server
npm install
npm run dev
```
Server runs on `http://localhost:5000`.

### 2. Run the React Frontend
```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:5173`.

> **Note**: Both backend and frontend include automatic zero-configuration **Demo Evaluation Modes**, allowing immediate testing without manual database provisioning or API key configuration.
