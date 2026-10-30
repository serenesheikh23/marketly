# Marketly

A full-stack digital marketplace with VIP tiers, manual services, and crypto payments. A Laravel 13 API paired with a React 19 + TypeScript single-page application.

## Live Demo

Launching soon

## Key Features

- User authentication (register/login/logout) with Sanctum API tokens and session-based auth
- Role-based access control via Spatie Laravel Permission (user, admin, moderator roles)
- Product catalog with search, category filtering, and type-based browsing
- Store/franchise system with per-store custom pricing
- VIP tier system (None -> Vip1 -> Vip2 -> Vip3) with withdrawal limits and fee percentages
- Shopping cart and favorites system
- Order creation with quantity validation against product `qty_values`
- Payment gateways: cash wallet, Binance Pay, USDT (BEP-20), with demo/real mode switching
- Deposit system with gateway-specific QR codes and wallet addresses
- Withdrawal system with VIP withdrawal limits and fee calculation
- Oranos Market API integration for automation product fulfillment
- Partner API with token-based authentication for external sellers
- Webhook handlers for Binance Pay and USDT payment verification
- Legal pages (terms, privacy, refund) with multilingual support (AR/EN)
- Admin dashboard with stats, user/product/category/order management
- Health check endpoint for database, storage, and Reverb verification
- Multilingual interface (Arabic/English) with i18n provider
- Theme toggle (light/dark mode)
- Order lifecycle: pending -> processing -> completed/rejected, with admin override actions

## Tech Stack

### Languages & Frameworks
- PHP 8.3, Laravel 13 (API backend)
- TypeScript, React 19, Vite 5 (frontend)

### Frontend
- React 19 with React Router 6
- Redux Toolkit for state management
- Axios for API calls
- Tailwind CSS 3 (with dark mode, custom colors, and extended typography)
- React Redux, React Hot Toast, Framer Motion
- lucide-react icons, zod validation

### Backend
- MySQL 8.4 (primary database, also supports SQLite locally)
- Redis for sessions, cache, and broadcasting
- Laravel Reverb for WebSocket broadcasting
- Spatie Laravel Permission for roles/abilities
- Laravel Sanctum for API token authentication
- Cloudinary for image hosting
- Guzzle HTTP client for external API calls (Oranos Market API)

### DevOps & Deployment
- Docker (php-fpm + nginx + mysql + redis via docker-compose.yml)
- Nginx (reverse proxy and static asset serving)
- GitHub Actions for CI/CD
- Railway for deployment

## Architecture Overview

- `backend/` — Laravel 13 API
  - `app/Http/Controllers/Api/` — REST API controllers (Auth, Products, Orders, VIP, Admin, Webhooks)
  - `app/Models/` — Eloquent models (User, Product, Category, Order, etc.)
  - `app/Services/` — Business logic (VipService, OrderService, PaymentGatewayManager, OranosMarketService)
  - `app/Services/Payments/` — Gateway implementations (CashWallet, BinancePay, USDT)
  - `routes/api.php` — API route definitions
  - `database/migrations/` — Database schema
- `frontend/` — React 19 SPA
  - `src/pages/` — Public, Account, and Admin pages
  - `src/store/` — Redux Toolkit store and slices
  - `src/api/` — Axios client configuration
  - `src/components/` — Reusable UI components
  - `src/i18n/` — Multilingual support (Arabic/English)
- `docker/` — Docker configuration (Nginx, PHP-FPM)
- `.github/workflows/` — GitHub Actions CI pipeline

**Data Flow:** The React SPA communicates with the Laravel API via Axios. Authentication is handled via Sanctum tokens (stored in localStorage). The API uses Eloquent to interact with MySQL. Redis is used for caching, queues, and WebSocket broadcasting via Reverb. Payment webhooks are processed idempotently by the Laravel backend.

## Getting Started

### Prerequisites
- PHP 8.3+ and Composer
- Node.js 20+ and npm
- MySQL 8.4 and Redis (or use Docker)

### Environment Setup
```bash
cp backend/.env.example backend/.env
# Update DB_*, REDIS_*, CLOUDINARY_*, and payment gateway variables in backend/.env
php artisan key:generate