# Marketly — Digital Marketplace & Services Platform

A production-grade digital marketplace with VIP tiers, manual services, and crypto
payments. A full-stack reference app combining a Laravel 13 API with a React 19 + TypeScript
single-page application, deployed end-to-end on Railway.

> **Live demo:** [https://marketly-frontend-production.up.railway.app](https://marketly-frontend-production.up.railway.app)

---

## Overview

Marketly is a complete commerce loop in a single repository. A customer can register, browse
a multi-category catalog, deposit funds via USDT or Binance Pay, buy a digital product, and
receive either instant auto-delivery or a manually-fulfilled service order. A separate admin
surface manages users, products, orders, deposits, withdrawals, and platform settings —
all behind a role-gated API.

The codebase demonstrates the daily choices a senior full-stack engineer makes: eager-loaded
queries to prevent N+1, a thin caching layer, idempotent payment webhooks, signed Laravel
Reverb broadcasts, a Redux store with localStorage persistence, and a bilingual
(English / Arabic, full RTL) frontend that lazy-loads each route.

---

## Tech Stack

### Backend
- **PHP 8.3** on **Laravel 13**
- **Eloquent ORM** with API Resources for stable response shapes
- **Laravel Sanctum 4** (SPA token authentication)
- **Spatie Laravel Permission 8** (RBAC: `admin`, `moderator`, `user`)
- **MySQL 8.4** as primary datastore
- **Redis 7** via **Predis 3.6** (cache + queue + broadcasting)
- **Laravel Reverb 1.11** (real-time WebSockets) with **Laravel Echo** + **Pusher JS** on the client
- **Cloudinary** for image storage and on-the-fly optimization
- **Idempotent webhooks** — HMAC-SHA512 for Binance Pay, HMAC-SHA256 for USDT
- **PHPUnit 12** feature and unit tests
- **Laravel Pint** for code style

### Frontend
- **React 19** + **TypeScript 5** on **Vite 5**
- **Tailwind CSS 3.4** (light + dark mode)
- **Redux Toolkit 2.2** + **React Redux 9** (with `localStorage` persistence)
- **React Router 6** (route-level code splitting via `React.lazy` + `Suspense`)
- **Framer Motion 11** (page and component transitions)
- **Lucide React** (icon set)
- **React Hook Form 7** + **Zod 3** (typed forms and validation)
- **Axios** with auth interceptors
- **React Hot Toast** (notifications)
- **Laravel Echo** + **Pusher JS** (Reverb client)
- **i18n** (English / Arabic, full RTL)
- **Vitest 2.1** + **Testing Library** (component and reducer tests)

### DevOps & Infrastructure
- **Docker** + **docker-compose** (PHP-FPM, Nginx, MySQL, Redis stack)
- **GitHub Actions** CI on every push and PR to `main`
- **Railway** (hosting for frontend, backend API, and Reverb worker)
- **Nginx** (reverse proxy and static asset serving)

---

## Features

### User-Facing
- **User Auth** — email/password registration and login, session persistence
- **Bilingual UI** — full English / Arabic translation with RTL layout
- **Catalog Browsing** — categories, products, debounced search (350 ms)
- **Cart** — multi-quantity, `localStorage`-backed, survives reloads
- **Crypto & Wallet Payments** — Binance Pay, USDT (BEP-20), internal Cash Wallet
- **VIP System** — multi-tier upgrades, VIP-gated prices and discounts
- **Order Management** — auto-delivery for digital products, manual order queue for services
- **Deposit & Withdrawal** flows with admin approval
- **Dark / Light Mode** — `data-theme` toggle persisted in `localStorage`
- **Responsive Design** — mobile, tablet, and desktop layouts
- **Legal Pages** — Terms of Service, Privacy Policy, Refund Policy
- **Dynamic Company Info** — footer name, contact, social links loaded from the API

### Admin / Moderator
- **Admin Dashboard** — KPIs for users, revenue, pending items
- **User Management** — ban / unban, change VIP level
- **Product & Category CRUD**
- **Order Queues** — auto orders, manual orders, deposits, withdrawals
- **Settings Store** — VIP limits, fees, payment gateway credentials, company info, legal content
- **Real-time Health** — database, storage, Reverb, payment providers
- **Fully Bilingual Admin Panel** — the entire Admin Dashboard, Categories, Products, Orders, and Settings interface is fully translated between English and Arabic (RTL), with locale-aware labels, placeholders, status text, and toasts.
- **Dynamic Custom Form Fields Builder** — for Manual Service categories, admins can dynamically create custom input fields (text, select, textarea) with required flags and comma-separated options, allowing them to collect specific customer data (e.g., Platform, Profile Link, Document Description) on the order form. Each field supports fully bilingual EN/AR labels, automatically displayed based on the user's locale.
- **Webhook-Ready Payment Architecture** — backend is equipped with Binance Pay and USDT webhook endpoints ready for real API key integration, with a safe "Demo Mode" active until production keys are provided, so the full purchase flow can be exercised end-to-end without live credentials.

---

## Live Demo

🔗 **[https://marketly-frontend-production.up.railway.app](https://marketly-frontend-production.up.railway.app)**

API base URL: `https://marketly-backend-production.up.railway.app/api`

---

## Local Setup

### Prerequisites
- PHP 8.3+ with extensions (`pdo_mysql`, `bcmath`, `ctype`, `json`, `openssl`, `tokenizer`, `xml`)
- Composer 2.x
- Node 20+ / npm 10+
- MySQL 8.4 and Redis 7.2 — or use the included Docker stack (recommended)

### 1. Install dependencies
```bash
# Backend
cd backend
composer install

# Frontend
cd ../frontend
npm install --legacy-peer-deps
```

### 2. Configure environment
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and set `DB_*`, `REDIS_*`, and `CLOUDINARY_URL` values, then:

```bash
php artisan key:generate
php artisan migrate:fresh --seed
```

### 3. Run the app
```bash
# Terminal 1 — backend API
cd backend && php artisan serve --port=8000

# Terminal 2 — Reverb (optional, for real-time)
cd backend && php artisan reverb:start --port=8080

# Terminal 3 — frontend dev server
cd frontend && npm run dev
```

App is now running at **http://localhost:5173**.

---

## Demo Accounts

All accounts use the password **`password`**.

| Email | Role | Access |
|-------|------|--------|
| `admin@demo.test` | Admin | Full Admin Dashboard — every queue, every setting |
| `mod@demo.test` | Moderator | Operational queues (orders, manual services) |
| `vip1@demo.test` | User | VIP Tier 1 pricing and discounts |
| `vip2@demo.test` | User | VIP Tier 2 pricing and discounts |
| `user@demo.test` | User | Regular customer |

---

## Local Development with Docker

A full stack (PHP-FPM, Nginx, MySQL, Redis) is provided via `docker-compose.yml`.

```bash
docker compose up -d
docker compose exec app composer install
docker compose exec app php artisan migrate:fresh --seed
docker compose exec app npm --prefix ../frontend install --legacy-peer-deps
docker compose exec app npm --prefix ../frontend run build
```

After the build, Nginx serves the Laravel API and the static frontend from `http://localhost:8080`.

---

## Running Tests

```bash
# Backend
cd backend && php artisan test --testdox

# Frontend
cd frontend && npm test
```

---

## CI

Every push and PR to `main` runs (see `.github/workflows/ci.yml`):
- `composer install` + `php artisan test` (MySQL 8.4 + Redis 7.2 services)
- `npm ci` + `npm run build`

---

## License

MIT
