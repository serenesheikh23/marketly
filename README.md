# Marketly — Digital Marketplace & Services Platform

A production-grade digital marketplace with VIP tiers, manual services, and crypto payments.
Built as a portfolio-ready full-stack reference app: Laravel 11 + React 19 + TypeScript,
deployed on Railway.

> **Live demo:** [https://eliasproject-production.up.railway.app](https://eliasproject-production.up.railway.app)

---

## Why this project exists

A single repo that demonstrates the kind of choices a senior full-stack engineer makes every day:
eager-loaded queries to prevent N+1, a thin caching layer, role-gated admin endpoints,
idempotent webhooks, and a frontend that lazy-loads each route and keeps state in Redux with
localStorage persistence. It's a complete loop: a customer can register, browse, deposit
via USDT, buy a digital product, and get an auto-delivered order — and an admin can manage
every step from a dashboard.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Laravel 11, PHP 8.3 |
| **Frontend** | React 19, TypeScript, Vite 5, Tailwind CSS |
| **State** | Redux Toolkit, RTK |
| **Database** | MySQL 8.4 |
| **Cache / Queue** | Redis 7.2 |
| **Auth** | Laravel Sanctum (SPA) |
| **Real-time** | Laravel Reverb + Echo |
| **RBAC** | Spatie Laravel Permission |
| **Image storage** | Cloudinary (CDN) |
| **Payments** | Binance Pay, USDT (BEP-20), Cash Wallet |
| **Hosting** | Railway |

## Features

### User
- Email/password auth, role-gated admin access
- Browse categories and products, debounced search
- Cart with localStorage persistence, multi-quantity items
- Checkout via **Binance Pay**, **USDT (BEP-20)**, or **Cash Wallet**
- Balance, deposit & withdrawal flows
- VIP upgrades, manual service orders
- **Bilingual UI** (English / Arabic with full RTL layout)
- **Dark / light theme** with localStorage persistence

### Admin / Moderator
- Dashboard with KPIs (users, revenue, pending items)
- User management: ban, change VIP level
- Product & category CRUD
- Auto-order, manual-order, deposit, and withdrawal queues
- Approve / reject financial transactions
- Settings store (VIP limits, fees, gateway credentials)

### Engineering
- Eager loading + query constraints everywhere — zero N+1 in hot paths
- Webhook signature verification (HMAC-SHA512 for Binance Pay, HMAC-SHA256 for USDT)
- Idempotent transaction state machine (pending → approved / rejected)
- Image uploads via Cloudinary with auto-format/quality optimization
- PHPUnit feature tests for auth, cart, orders, admin permissions, webhooks
- Vitest tests for cart state, formatters, components
- GitHub Actions CI on every push to `main`

## Optimizations Implemented

- **N+1 prevention** — `with(['category', 'externalStore'])` and `whereHas` everywhere
- **Database indexes** on `user_id`, `status`, `slug`, and `gateway_ref`
- **Laravel cache** for the category tree and settings (`Cache::remember`)
- **API Resources** to keep response shape stable
- **React route-level code splitting** with `React.lazy` + `Suspense`
- **Debounced search** in catalog and category pages (350 ms)
- **Image lazy loading** (`<img loading="lazy" decoding="async">`) and `aria-*` for a11y
- **Production-grade bundle** — single gzipped main chunk under 200 kB
- **Eagerly validated** through `FormRequest` classes, no inline validation

## Project Structure

```
.
├── backend/                 # Laravel 11 API
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   └── Services/        # CloudinaryService, PaymentGatewayManager, …
│   ├── database/migrations/
│   ├── tests/Feature/
│   └── ...
├── frontend/                # React 19 SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/           # Redux Toolkit slices
│   │   └── i18n/            # English / Arabic translations
│   ├── tests/ (co-located)
│   └── ...
├── docker/
│   ├── nginx/
│   └── php/
├── .github/workflows/ci.yml
└── docker-compose.yml
```

## Local Setup

### Prerequisites

- PHP 8.3+ with extensions (pdo_mysql, bcmath, ctype, json, openssl, tokenizer, xml)
- Composer 2.x
- Node 20+ / npm 10+
- MySQL 8.4 and Redis 7.2 — or use Docker (recommended)

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

Edit `backend/.env` and set your `DB_*`, `REDIS_*`, and `CLOUDINARY_URL` values.

```bash
php artisan key:generate
php artisan migrate:fresh --seed
```

### 3. Run the app

```bash
# Backend (terminal 1)
cd backend && php artisan serve --port=8000

# Reverb (terminal 2 — optional, for real-time)
cd backend && php artisan reverb:start --port=8080

# Frontend (terminal 3)
cd frontend && npm run dev
```

App is now running at **http://localhost:5173**.

### Demo Accounts

All accounts use password `password`.

| Email | Role | VIP |
|-------|------|-----|
| `admin@demo.test` | Admin | VIP2 |
| `mod@demo.test` | Moderator | VIP1 |
| `vip2@demo.test` | User | VIP2 |
| `vip1@demo.test` | User | VIP1 |
| `user@demo.test` | User | None |

## Local Development with Docker

A full stack (PHP-FPM, Nginx, MySQL, Redis) is provided via `docker-compose.yml`.

```bash
# Start the stack
docker compose up -d

# Install dependencies
docker compose exec app composer install

# Run migrations + seed
docker compose exec app php artisan migrate:fresh --seed

# Build the frontend (Vite outputs to frontend/dist)
docker compose exec app npm --prefix ../frontend install --legacy-peer-deps
docker compose exec app npm --prefix ../frontend run build

# Stop
docker compose down
```

After the build, `nginx` serves the Laravel API and the static frontend from `http://localhost:8080`.

## Running Tests

```bash
# Backend — 32 tests
cd backend && php artisan test --testdox

# Frontend — 19 tests
cd frontend && npm test
```

## CI

Every push to `main` (and every PR) runs:
- `composer install` + `php artisan test` (MySQL 8.4 + Redis 7.2 services)
- `npm ci` + `npm run build`

See `.github/workflows/ci.yml`.

## Payment Gateways

Production-ready adapters for:

- **Binance Pay** — HMAC-SHA512 webhook signature verification, returns a checkout URL
- **USDT (BEP-20)** — HMAC-SHA256 webhook signature, amount tolerance, memo-based reconciliation
- **Cash Wallet** — Admin-approval flow (no external API)

To go live, replace the env-var placeholders with real API keys — no code changes required.

## API

Import `postman/Marketplace.postman_collection.json` into Postman. Base URL: `http://localhost:8000/api`.

## License

MIT
