# Marketly

**A full-stack digital marketplace with VIP tiers, crypto payments, and a partner API.**

**Live:** [marketlly.store](https://www.marketlly.store)

**Laravel 13** · **React 19** · TypeScript · MySQL · Redis · Reverb WebSockets · Docker · GitHub Actions

---

## What it does

Multi-role marketplace connecting users, store owners, and admins:

- **User roles** — user, admin, moderator via Spatie Laravel Permission
- **Product catalog** — search, category filtering, per-store custom pricing
- **VIP tier system** — None → VIP1 → VIP2 → VIP3, controlling withdrawal limits and fee percentages
- **Shopping cart & favorites** — persisted client + server-side
- **Order lifecycle** — pending → processing → completed/rejected, with admin override
- **Deposits** — gateway-specific QR codes and wallet addresses, admin approval queue
- **Withdrawals** — VIP-tier-limited, with automatic fee calculation
- **Partner API** — token-authenticated endpoints for external sellers
- **Automation product fulfillment** — Oranos Market API integration
- **Webhook processing** — idempotent handlers for Binance Pay and USDT BEP-20
- **Bilingual interface** — Arabic and English with RTL support
- **Admin dashboard** — users, products, categories, orders, transactions, settings

---

## Verified metrics

| | |
|---|---|
| API routes | **86** |
| PHPUnit tests | **66** (1,233 lines, 11 feature test files) |
| Eloquent models | **12** |
| Migrations / tables | **36** |
| Backend controllers | **27** |
| Payment gateways | **3** behind a pluggable interface |
| Webhook routes | **3** (Binance, USDT, generic dispatcher) |
| Frontend pages | **36** |
| Frontend components | **26** |
| Frontend TypeScript files | **89** |
| Frontend build | **14.4s** |
| Main bundle (gzipped) | **165 kB** |

**PageSpeed Insights** (mobile / desktop, on the live domain):

| | Mobile | Desktop |
|---|---|---|
| Performance | 44 | 58 |
| Accessibility | **91** | **91** |
| Best Practices | **100** | **100** |
| SEO | **100** | **100** |

---
## Payment architecture

Gateways are behind `PaymentGatewayInterface` with five methods:

~~~php
public function isDemoMode(): bool;
public function name(): string;
public function createDeposit(float $amount, string $currency, array $meta = []): array;
public function simulatePayment(array $meta = []): array;
public function verifyWebhook(Request $request): array;
~~~

Three implementations ship in this repo:

| Gateway | Deposit flow | Webhook verification |
|---|---|---|
| **Binance Pay** | QR code + Binance ID input | HMAC signature |
| **Cash Wallet** | Internal balance debit | Synchronous |
| **USDT (BEP-20)** | Wallet address + tx hash input | On-chain verification |

The live deployment now supports **five** payment methods after post-launch additions — both new gateways dropped into the existing interface without changing the contract. Adding a new method is: implement the interface, register it in `PaymentGatewayManager`, ship.

**Demo mode** lets the entire deposit flow run end-to-end without real API keys — useful for local development and integration tests.

---

## Technical highlights

- **Pluggable payment architecture** — `PaymentGatewayManager` resolves gateways by name; no switch statements in the deposit or webhook controllers
- **Idempotent webhooks** — signature-verified, duplicate-safe; retries from the payment provider don't double-credit
- **Server-enforced VIP logic** — `VipService` owns tier thresholds, withdrawal limits, and fee percentages; changes ship without a frontend deploy
- **Order service with refund** — `OrderService` handles balance deduction, upstream fulfillment, and **automatic refund on upstream failure**
- **Spatie RBAC** — user/admin/moderator roles enforced at route middleware and policy layers
- **Sanctum + sessions** — API tokens for the SPA, session auth for the admin dashboard
- **Reverb WebSockets** — real-time order and transaction updates
- **Multilingual by design** — every string in `i18n/{ar,en}.ts`, with RTL handling for Arabic
- **Dockerized multi-service stack** — php-fpm, nginx, MySQL, Redis in one `docker-compose.yml`
- **GitHub Actions CI** — test suite runs on every push
- **66 PHPUnit tests** — auth flows, admin RBAC, order lifecycle, VIP upgrades, webhooks, partner API, upstream failures, contact form validation

---

## Architecture

~~~text
marketly/
  backend/              Laravel 13 API
    app/
      Http/Controllers/ 27 controllers (Auth, Products, Orders, VIP, Admin, Webhooks, Partner)
      Models/           12 Eloquent models
      Services/
        Payments/       3 gateways + PaymentGatewayInterface
        VipService      Tier thresholds, limits, fees
        OrderService    Creation, deduction, refund
        OranosMarketService  Upstream fulfillment
    routes/api.php      86 routes
    database/migrations 36 migrations
    tests/Feature/      11 feature test files (1,233 lines)
  frontend/             React 19 SPA (Vite 5)
    src/
      pages/            36 pages
      components/       26 components
      store/            Redux Toolkit slices
      api/              Axios client
      i18n/             ar.ts, en.ts
  docker/               nginx, php-fpm
  docker-compose.yml    Full local stack
  .github/workflows/    CI pipeline
~~~

**Data flow:** React SPA → Axios → Laravel API → Eloquent → MySQL. Sanctum tokens in `localStorage` authenticate API calls; admin routes check Spatie roles. Redis handles sessions, cache, and Reverb broadcast queues. Payment webhooks arrive at `/api/webhooks/{gateway}`, verify signatures, and update the matching `Transaction` idempotently.

---
## Tech stack

| Layer | Tools |
|---|---|
| **Backend** | PHP 8.3, Laravel 13 |
| **Frontend** | React 19, TypeScript, Vite 5, Redux Toolkit |
| **Styling** | Tailwind CSS 3, Framer Motion, lucide-react |
| **Database** | MySQL 8.4 (SQLite for local tests) |
| **Cache / Queue** | Redis |
| **WebSockets** | Laravel Reverb |
| **Auth** | Sanctum (SPA), session (admin), Spatie Permission (RBAC) |
| **Payments** | Binance Pay, Cash Wallet, USDT BEP-20 |
| **Image hosting** | Cloudinary |
| **Upstream** | Oranos Market API |
| **DevOps** | Docker, GitHub Actions CI |
| **Testing** | PHPUnit (66 tests) |

---

## Run locally

~~~bash
git clone https://github.com/serenesheikh23/Marketly
cd Marketly

# Backend
cd backend
cp .env.example .env
composer install
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan serve

# Frontend (separate terminal)
cd ../frontend
npm install
npm run dev
~~~

Fill `.env` with `DB_*`, `REDIS_*`, `CLOUDINARY_*`, and payment gateway keys. All three payment gateways support **demo mode** — the full deposit flow runs without real API keys.

For a one-command setup, use the included Docker stack:

~~~bash
docker-compose up --build
~~~

### Tests

~~~bash
cd backend
./vendor/bin/phpunit
~~~

**66 tests** across 11 feature test files. Coverage includes:

- `AuthTest` — registration, login, wrong password, banned users
- `AdminSettingsTest` — admin vs moderator permissions
- `OrderServiceTest` — balance deduction, insufficient funds, refund on upstream failure
- `OranosMarketServiceTest` — upstream error, empty response, malformed payload handling
- `WebhookTest` — payment webhook processing
- `VipServiceTest` — tier upgrade logic
- `PartnerApiTest`, `PartnerRequestTest` — external partner integration
- `ContactWebsiteTest` — form validation and error handling

### Build

~~~bash
cd frontend
npm run build
~~~

Builds in **~14s**. Main bundle **165 kB gzipped**, code-split per page (36 routes, 26 components).

---

## Known issues and fix paths

**High CLS on mobile and desktop.** Cumulative Layout Shift is currently **0.568 (mobile) / 1.0 (desktop)** — well above Google's 0.1 threshold. The cause is documented in the Lighthouse report: **image elements do not have explicit `width` and `height`** attributes, so the browser reserves no space before load and content reflows. The fix is a two-line change in the product image component (`<img width={} height={}>` with `aspect-ratio` CSS). Fix path documented but not yet shipped — product photos are user-uploaded and the current upload pipeline doesn't record dimensions.

**Main bundle is above Vite's 500 kB warning threshold.** The 508 kB shared chunk is React + Redux Toolkit + React Router + Tailwind + the payment SDK. A `manualChunks` config splitting vendor libraries would drop it under the threshold, but the gzipped 165 kB is acceptable for a dashboard-heavy SPA.

These are noted because a hiring manager running PageSpeed on the live site will see the same numbers. The README states what's wrong, why, and how it would be fixed — that's a more honest signal than a clean score with no context.

---

## Notes

- **Demo mode on every gateway** — full checkout flow works without real payment credentials
- **Reverb WebSockets** — real-time order and transaction status pushes
- **Cloudinary** — product images are hosted off-server; DB stores URLs, not blobs
- **Oranos Market integration** — upstream automation product fulfillment with automatic balance refund on failure (tested in `OrderServiceTest`)
- **Frontend and backend are separate folders** — deploy independently; frontend expects `VITE_API_URL` pointing at the deployed API

---

*Built by [Serene Sheikhalard](https://github.com/serenesheikh23).*
