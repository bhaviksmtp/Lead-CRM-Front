# WhatsApp Leads & Follow-up CRM — Frontend SPA

This is the production-ready client application SPA for the WhatsApp Leads & Follow-up CRM built with Vue 3, Vite, Pinia, Axios, and Vanilla CSS.

## Tech Stack
- Vue 3 (Composition API)
- Vite (Build Tool)
- Pinia (State Management Store)
- Axios (REST Client Services)
- Vanilla CSS (Tailored UI theme layout)

---

## Local Setup

### 1. Requirements
Ensure you have Node.js 18+ and npm installed.

### 2. Configure Environment Variable
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure the API endpoint matches your backend:
```env
VITE_API_URL=http://localhost:8000/api/v1
```

### 3. Install Dependencies
Run:
```bash
npm install
```
*(If you encounter dependency conflict warnings, append `--legacy-peer-deps`)*

### 4. Start Development Server
Run:
```bash
npm run dev
```
The application will launch on: `http://localhost:5173`.

---

## Authentication Credentials (Seeded)
Login at `/login` using the company administrator profile:
- **Email:** `admin@acme.com`
- **Password:** `password`
- **Other Staff (Salesperson):** `sales1@acme.com`, `sales2@acme.com` (Password: `password`)
