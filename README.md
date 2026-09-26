# AI-Powered Meal Decision & Anti-Fatigue Assistant

> Built around the **"Rule of Three"** framework, weekly anchor themes, 15-minute lazy-backup pantry tracking, and **Google Gemini AI** fallback recipe generation.

---

## 🎯 The Anti-Fatigue Philosophy

Decision fatigue peaks at 6:00 PM after a full workday. Traditional meal planners fail because they force you to plan and cook 7 elaborate, separate meals every week. 

This system adopts the **Rule of Three**:
1. **Sunday 5-Minute Checklist**: Lock in just **3 core dinner ideas** for the week.
2. **7-Day Anchor Themes**: Pre-assign repeating daily rhythms (e.g. *Stir-Fry Monday*, *Breakfast for Dinner Wednesday*) to eliminate evening choice paralysis.
3. **Lazy Backup Stash**: Maintain an inventory of foolproof canned and frozen staples for 15-minute emergency dinners.
4. **Panic Mode (Gemini AI)**: When battery is low, tap one button, feed in available ingredients, and receive an instant foolproof recipe in under 3 seconds.

---

## 🛠 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React Router v7.
- **Backend**: Node.js, Express.js, Helmet, CORS, Dotenv.
- **Database & Auth**: Supabase PostgreSQL with Row Level Security (RLS) & Supabase Auth.
- **AI Integration**: `@google/genai` SDK (`gemini-2.5-flash` / `gemini-3.8-flash`) with strict structured JSON schema enforcement.
- **Validation**: Zod (client and server-side schemas).

---

## 📁 Repository Structure

```text
sahil/
├── client/                      # React (Vite) Frontend
│   ├── src/
│   │   ├── api/                 # Supabase & Express API clients
│   │   ├── components/          # Navbar, DashboardOverview, WeeklyPlanner,
│   │   │                        # PantryManager, AIGeneratorModal
│   │   ├── context/             # AuthContext (Supabase Auth & 1-Click Demo)
│   │   ├── pages/               # LandingAuth, Dashboard, Planner, Pantry, Generator
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/                      # Node.js Express API
│   ├── src/
│   │   ├── config/              # Supabase & Gemini SDK configurations
│   │   ├── controllers/         # Pantry, Planner, and AI Controllers
│   │   ├── middleware/          # Supabase JWT Auth & Zod Validator
│   │   ├── routes/              # Express API Routes
│   │   ├── schemas/             # Zod Validation Schemas
│   │   ├── services/            # Gemini AI Service with Schema Enforcement
│   │   └── server.js            # Express Entrypoint
│   ├── supabase/
│   │   └── schema.sql           # Production PostgreSQL DDL & RLS Policies
│   ├── .env.example
│   └── package.json
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Backend Setup

```bash
cd server
npm install
```

Create `.env` based on `.env.example`:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
GEMINI_API_KEY=your-google-gemini-api-key
GEMINI_MODEL=gemini-2.5-flash
```

> **Note**: If `SUPABASE_URL` is omitted or left as mock, the application automatically launches in **Zero-Setup Demo Mode** with in-memory stores and default anchor routines so you can test everything immediately!

Run backend server:
```bash
npm run dev
# or
npm start
```
API runs on `http://localhost:5000`.

### 2. Frontend Setup

```bash
cd client
npm install
npm run dev
```
Client runs on `http://localhost:3000` with automated proxy to the Express API.

---

## 🗄 Database & RLS Setup (Supabase)

Copy the contents of `server/supabase/schema.sql` into the Supabase SQL Editor:
- Enables `uuid-ossp`.
- Creates `profiles`, `anchor_themes`, `pantry_items`, and `weekly_plans`.
- Enables Row Level Security (RLS) on all tables with strict `auth.uid() = user_id` isolation.
- Installs automated trigger to create `public.profiles` upon `auth.users` signup.

---

## ⚡ API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health and Gemini status |
| `GET` | `/api/pantry` | List user's pantry & lazy backup items |
| `POST` | `/api/pantry` | Add pantry item with Zod validation |
| `DELETE` | `/api/pantry/:id` | Remove pantry item |
| `PATCH` | `/api/pantry/:id/toggle-backup` | Toggle lazy backup status |
| `GET` | `/api/planner` | Get 7-day anchor themes & current weekly plan |
| `POST` | `/api/planner` | Save weekly 3-dinner checklist |
| `PUT` | `/api/planner/themes` | Update anchor schedule themes |
| `PATCH` | `/api/planner/complete/:id` | Toggle completion status of weekly plan |
| `POST` | `/api/ai/generate-meal` | Gemini AI structured recipe generator |
"# new" 
