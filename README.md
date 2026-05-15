# 🎯 HireFlow — Interview Management Platform

A full-stack interview management platform built with **React + Vite** (frontend) and **Express + SQLite + Drizzle ORM** (backend). Supports two roles: **Coordinator** and **Interviewer**.

---

## 🏗 Architecture

```
interview-platform/
├── backend/                  # Express API server
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.js      # DB connection + migrations
│   │   │   └── schema.js     # Drizzle ORM schema
│   │   ├── middleware/
│   │   │   └── auth.js       # JWT middleware + role guard
│   │   ├── routes/
│   │   │   ├── auth.js       # /api/auth/*
│   │   │   ├── roles.js      # /api/roles/*
│   │   │   ├── candidates.js # /api/candidates/*
│   │   │   ├── interviews.js # /api/interviews/*
│   │   │   ├── feedback.js   # /api/feedback/*
│   │   │   └── dashboard.js  # /api/dashboard/*
│   │   └── index.js          # Express app entry
│   ├── drizzle.config.js
│   └── package.json
│
└── frontend/                 # React + Vite SPA
    ├── src/
    │   ├── contexts/
    │   │   └── AuthContext.jsx
    │   ├── components/
    │   │   └── Layout.jsx
    │   ├── pages/
    │   │   ├── auth/          # Login, Register
    │   │   ├── coordinator/   # Dashboard, Roles, Candidates, Schedule
    │   │   └── interviewer/   # Dashboard, Interviews, Feedback
    │   ├── utils/
    │   │   └── api.js         # Axios instance
    │   ├── App.jsx
    │   └── main.jsx
    └── package.json
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+

### 1. Install dependencies

```bash
# Root
npm install

# Backend
cd backend && npm install && cd ..

# Frontend
cd frontend && npm install && cd ..
```

### 2. Run in development

```bash
# From root — starts both servers concurrently
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/api/health

The SQLite database is created automatically at `backend/data/interview.db`.

---

## 🔑 Features by Role

### Coordinator
- Create and manage **job roles** with custom **interview rounds** and **evaluation areas**
- Add and track **candidates** through the hiring pipeline
- **Schedule interviews** with overlap detection
- **Advance or reject** candidates between rounds
- Coordinator **dashboard** with pipeline stats

### Interviewer
- View **assigned interviews** (upcoming/past)
- **Submit feedback** with per-area scores and overall recommendation
- Interviewer **dashboard** with pending feedback alerts

---

## 📡 API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/health | ✗ | Health check |
| POST | /api/auth/register | ✗ | Register user |
| POST | /api/auth/login | ✗ | Login |
| GET | /api/auth/me | ✓ | Current user |
| GET/POST | /api/roles | ✓ | List / create roles |
| GET/PUT/DELETE | /api/roles/:id | ✓ | Role CRUD |
| POST | /api/roles/:id/rounds | coordinator | Add round |
| POST | /api/roles/rounds/:id/eval-areas | coordinator | Add eval area |
| GET/POST | /api/candidates | ✓ | List / create candidates |
| GET/PUT/DELETE | /api/candidates/:id | ✓ | Candidate CRUD |
| POST | /api/candidates/:id/advance | coordinator | Advance to next round |
| POST | /api/candidates/:id/reject | coordinator | Reject candidate |
| GET/POST | /api/interviews | ✓ | List / schedule interviews |
| PUT | /api/interviews/:id | coordinator | Update interview |
| POST | /api/interviews/:id/cancel | coordinator | Cancel interview |
| GET/POST | /api/feedback | ✓ | Submit / get feedback |
| GET | /api/dashboard/coordinator | coordinator | Coordinator stats |
| GET | /api/dashboard/interviewer | interviewer | Interviewer stats |

---

## 🗄 Database Schema

- **users** — accounts with role (coordinator/interviewer)
- **roles** — job positions
- **rounds** — interview stages per role (ordered)
- **eval_areas** — scoring dimensions per round
- **candidates** — applicants linked to a role
- **interviews** — scheduled sessions (interviewer + candidate + round)
- **feedback** — post-interview assessment
- **feedback_scores** — per-eval-area numeric scores

---

## 🔐 Security

- Passwords hashed with **bcryptjs** (12 rounds)
- Auth via **JWT** (7-day expiry)
- Role-based route protection (coordinators vs interviewers)
- Interviewers can only access their own interviews and submit feedback
- SQLite WAL mode + foreign key enforcement

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Vite, Axios, date-fns |
| Backend | Express 4, better-sqlite3, Drizzle ORM |
| Auth | JWT, bcryptjs |
| Database | SQLite (file-based, no setup needed) |
| Styling | Pure CSS (custom design system) |
