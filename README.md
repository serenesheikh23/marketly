# Marketly — Digital Marketplace & Services Platform

A full-stack Laravel + React digital marketplace with VIP tiers, manual services, and crypto payments.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Laravel 11, PHP 8.3 |
| Frontend | React 19, TypeScript, Vite 5, Tailwind CSS |
| Database | MySQL 8.4 |
| Cache/Queue | Redis 7.2 |
| Auth | Laravel Sanctum |
| Real-time | Laravel Reverb + Echo |
| RBAC | Spatie Laravel Permission |

## Prerequisites

- PHP 8.3+ with extensions (pdo_mysql, bcmath, ctype, json, openssl, tokenizer, xml)
- Composer 2.x
- Node 20+ / npm 10+
- MySQL 8.4 or Docker (see below)
- Redis 7.2 or Docker (see below)

## Quick Start

### 1. Clone and install dependencies

```bash
# Backend
cd backend
composer install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Edit `backend/.env`:
```
DB_HOST=127.0.0.1        # or your Docker host IP
DB_PORT=3306
DB_DATABASE=marketplace
DB_USERNAME=root
DB_PASSWORD=

REDIS_HOST=127.0.0.1
REDIS_CLIENT=predis
```

### 3. Option A: Use Docker for MySQL + Redis (recommended)

```bash
docker compose up -d
```

### Option B: Use local ServBay / host-installed MySQL + Redis

Ensure MySQL is running on `127.0.0.1:3306` and Redis on `127.0.0.1:6379`.
Update `DB_HOST` / `REDIS_HOST` in `.env` accordingly.

### 4. Initialize the database

```bash
cd backend
php artisan key:generate
php artisan migrate:fresh --seed
```

### 5. Start the backend

```bash
# Terminal 1: Laravel API server
cd backend && php artisan serve --port=8000

# Terminal 2: Reverb WebSocket server (optional — for real-time)
cd backend && php artisan reverb:start --port=8080
```

### 6. Start the frontend

```bash
# Terminal 3
cd frontend && npm run dev
```

The app is now running at **http://localhost:5173**

---

## Demo Accounts

All accounts use password: `password`

| Email | Role | VIP |
|-------|------|-----|
| admin@demo.test | Admin | VIP2 |
| mod@demo.test | Moderator | VIP1 |
| vip2@demo.test | User | VIP2 |
| vip1@demo.test | User | VIP1 |
| user@demo.test | User | None |

## Features

### User
- Browse categories and products
- Cart + checkout (Cash Wallet / Binance Pay / USDT)
- View balance, transaction history
- Deposit via crypto or Cash Wallet
- Withdraw (VIP-gated limits and fees)
- Purchase VIP upgrades
- Manual services (social media, custom offers)

### Admin / Moderator
- Dashboard with KPIs
- User management (ban, change VIP level)
- Product and category CRUD
- Auto-order management
- Manual-order processing (mark processing / completed / rejected)
- Approve/reject deposits and withdrawals
- Settings (VIP limits, fees, payment gateway credentials)

### Payment Gateways
All gateways run as **mock adapters** — they simulate the full signature-verification
and webhook flow. To go live, swap in real API keys:

- **Binance Pay**: Set `BINANCE_PAY_KEY` / `BINANCE_PAY_SECRET` in `.env`
- **USDT BEP-20**: Set `USDT_WALLET_ADDRESS` / `USDT_WEBHOOK_SECRET` in `.env`
- **Cash Wallet**: Admin approves deposits manually via `/admin/deposits`

## Running Tests

```bash
cd backend
php artisan test
```

## API Documentation

Import `postman/Marketplace.postman_collection.json` into Postman.
Base URL: `http://localhost:8000/api`

## Deployment

For production, replace the `docker-compose.yml` with a full stack including nginx,
php-fpm, and the Laravel/Reverb containers. See the plan for the full architecture.
