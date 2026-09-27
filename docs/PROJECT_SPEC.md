# Marketly — Project Specification

*Version 1.0 — Generated from codebase inventory*

---

## D1. What Marketly Is

Marketly is a digital marketplace platform where users can browse, purchase, and instantly receive digital products such as game keys, software subscriptions, gift cards, mobile top-ups, and social media services. The platform combines automated delivery (via integration with the Oranos Market API) with manual fulfillment for custom services.

Marketly also enables entrepreneurs to launch their own branded storefronts that pull products from the main catalog with customizable markups, and provides a Partner API for external systems to programmatically purchase products. Built on Laravel (PHP) and React, it runs on Railway with MySQL, using a wallet-based payment system supported by Binance Pay, USDT (BEP-20), and admin-managed cash wallet deposits.

---

## D2. User Roles

### Guest (Unauthenticated)
- Browse products and categories
- View product details
- Register for an account
- Login
- Submit a "Create Website" inquiry form
- View legal pages (Terms, Privacy, Refund)
- Request Partner API access (redirects to login)

### Customer (Authenticated User)
- All guest capabilities
- View dashboard with balance, VIP status, spending trend
- Add products to favorites
- Add to cart and checkout
- Deposit funds via Binance Pay, USDT, or Cash Wallet (admin-approved)
- Withdraw funds (VIP only, with limits and fees)
- View order history and transaction history
- Create and manage personal storefronts
- Request Partner API access → pending → approved → receive API key
- View API documentation with curl/fetch examples
- Upgrade VIP level using wallet balance

### Admin / Moderator
- All customer capabilities
- Access admin panel at `/admin`
- **Dashboard**: system stats, health checks, recent orders
- **Users**: list, view, edit, ban/unban, delete, assign roles
- **Products**: list, create, edit, delete, toggle active, sync from Oranos, apply markup
- **Categories**: list, create, edit, delete, manage manual order fields
- **Orders**: list, filter, view details, update status (pending/processing/completed/rejected), pending manual orders queue
- **Deposits**: list, approve/reject (credits user balance)
- **Withdrawals**: list, approve/reject (refunds balance on reject)
- **Partner Requests**: list, approve (generates API key), reject (with reason)
- **Oranos Monitor**: view Oranos account balance, health level, refresh
- **Settings**: manage all settings (VIP prices, fees, payment credentials, company info, legal pages) individually or in bulk

### Partner (External API Consumer)
- Authenticate via `api-token` header
- **GET /partner/me** — account info and balance
- **GET /partner/categories** — list categories with Oranos products
- **GET /partner/products** — paginated, filterable product catalog
- **GET /partner/products/{slug}** — single product details
- **POST /partner/orders** — create order (deducts from wallet, requires sufficient balance)
- **GET /partner/orders/{id}** — check order status
- Requires approved Partner API Request and generated API key

---

## D3. Feature List

### Storefront
- **Browse products** — paginated, searchable, filterable by category (`/products`)
- **Categories** — hierarchical with Oranos-sourced images (`/categories`, `/category/:slug`)
- **Product details** — image, description, price, automation vs manual, required parameters (`/product/:slug`)
- **Favorites** — heart icon on products, persistent list (`/dashboard/favorites`)
- **Shopping cart** — slide-out drawer, quantity adjustment, payload for manual/automation products
- **Responsive design** — 375px / 768px / 1280px breakpoints, RTL (Arabic) and LTR (English) support

### Checkout & Payments
- **Wallet balance** — central stored value, debited on purchase, credited on deposit
- **Deposit methods**:
  - Binance Pay (QR code, webhook confirmation)
  - USDT BEP-20 (wallet address + memo, webhook confirmation)
  - Cash Wallet (admin manual approval)
- **Withdrawal** — VIP only, configurable limits/fees per level, USDT/Binance, admin approval
- **VIP upgrades** — pay from wallet balance, instant level change, transaction recorded
- **Webhook handling** — signature verification for Binance (HMAC-SHA512) and USDT (HMAC-SHA256)

### Order Fulfillment
- **Automated (Oranos)** — products with `is_automation=true` and `oranos_product_id`:
  - Order created → balance deducted → Oranos API called with player ID + params
  - Oranos order ID stored → status polled → auto-completed or left as Processing for manual admin fulfillment
  - Stock decremented on our side
- **Manual** — products with `type=manual`:
  - Order created as Pending → admin reviews → marks Processing/Completed/Rejected
  - Payload collected at checkout (dynamic form schema from category)
  - No balance debit until admin completes
- **Store orders** — when purchased through a user's storefront, store owner earns markup difference

### VIP System
- **Levels**: None → VIP1 → VIP2 (sequential)
- **Withdrawal limits**: configurable per level (default VIP1: $1,000, VIP2: $2,000)
- **Withdrawal fees**: configurable per level (default VIP1: 3%, VIP2: 1.5%, Regular: 5%)
- **Upgrade prices**: configurable (default VIP1: $100, VIP2: $300)
- All settings manageable in Admin Settings, persisted in `settings` table

### Partner API (External Stores)
- **Onboarding**: user submits request (`/connect-store`) → admin approves → API key generated (64-char random)
- **Authentication**: `api-token` header (or `X-Api-Token`), validated against user's `api_key`
- **Authorization**: user must have approved PartnerApiRequest
- **Endpoints**: me, categories, products (list/show), orders (create/status)
- **Rate limiting**: 60 req/min (default Laravel Sanctum throttle)

### Admin Panel
- **Dashboard** — users, revenue, pending counts, VIP breakdown, recent orders
- **Health check** — database, storage, Reverb connectivity
- **Bulk operations** — settings bulk update, product/category bulk actions
- **Oranos sync** — manual trigger for category/product sync, markup application, price verification
- **Role-based access** — admin/moderator middleware on all `/api/admin/*` routes

---

## D4. Integrations

| Integration | Purpose | Configuration (names only) |
|-------------|---------|---------------------------|
| **Oranos Market API** | Source of automated products, categories, images; fulfillment of automation orders | `ORANOS_API_URL`, `ORANOS_API_TOKEN`, `ORANOS_MARKUP` |
| **Binance Pay** | Deposit payments | `BINANCE_PAY_KEY`, `BINANCE_PAY_SECRET` |
| **USDT (BEP-20)** | Deposit/withdrawal payments | `USDT_WALLET_ADDRESS`, `USDT_WEBHOOK_SECRET` |
| **Cloudinary** | Image upload/storage for products/categories | `CLOUDINARY_URL` |
| **Mail (SMTP/Log)** | Order confirmations, contact form, notifications | `MAIL_MAILER`, `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM_ADDRESS`, `MAIL_FROM_NAME` |
| **Reverb (WebSockets)** | Real-time events (order updates, balance changes) | `REVERB_APP_ID`, `REVERB_APP_KEY`, `REVERB_APP_SECRET`, `REVERB_HOST`, `REVERB_PORT` |
| **Railway (Hosting)** | App + MySQL + Volumes + Cron | Railway project, services, environment variables |

---

## D5. Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Laravel 13.x (PHP 8.3) |
| Frontend | React 19 + Vite 5 + TypeScript |
| Styling | Tailwind CSS 3.4 |
| State | Redux Toolkit (auth, cart) |
| Routing | React Router 6 |
| Animations | Framer Motion |
| Database | MySQL 8 (Railway managed) |
| Queue | Database driver |
| Cache | Database driver |
| Auth | Laravel Sanctum (SPA + API tokens) |
| Permissions | Spatie Laravel Permission |
| Broadcasting | Laravel Reverb |
| Testing | PHPUnit (backend), Vitest + React Testing Library (frontend) |
| Hosting | Railway (app, MySQL, volumes, cron) |

---

## D6. Deployment

### Hosting
- **Platform**: Railway
- **Services**: Backend (PHP), Frontend (Node/Express SSR), MySQL Database
- **Volumes**: Persistent volume mounted at `/app/storage/app/public` for uploaded images
- **Cron**: Railway runs `php artisan schedule:work` for scheduled tasks

### Migrations
- Run on deploy: `php artisan migrate --force`
- **Critical**: 13 migrations currently pending (see Known Limitations)

### Environment Variables Required
```
APP_KEY, APP_URL, DB_CONNECTION, DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
ORANOS_API_URL, ORANOS_API_TOKEN, ORANOS_MARKUP
BINANCE_PAY_KEY, BINANCE_PAY_SECRET
USDT_WALLET_ADDRESS, USDT_WEBHOOK_SECRET
CLOUDINARY_URL
MAIL_MAILER, MAIL_HOST, MAIL_PORT, MAIL_USERNAME, MAIL_PASSWORD, MAIL_FROM_ADDRESS, MAIL_FROM_NAME
REVERB_APP_ID, REVERB_APP_KEY, REVERB_APP_SECRET, REVERB_HOST, REVERB_PORT
VITE_API_URL, VITE_REVERB_APP_KEY, VITE_REVERB_HOST, VITE_REVERB_PORT
VITE_GA_MEASUREMENT_ID (optional), VITE_UMAMI_WEBSITE_ID (optional)
```

---

## D7. Onboarding a Partner

1. **User visits `/connect-store`** → clicks "Request Access"
2. **Fills form**: Store name, Store URL, Phone, Notes
3. **Admin reviews** at `/admin/partner-requests`
4. **Admin clicks Approve** → system generates 64-char API key, sets on user, marks request approved
5. **User sees API key** on `/connect-store` (with copy button, show/hide toggle)
6. **User reads docs** at `/dashboard/api-docs` → sees endpoints, curl/fetch examples

### cURL Example (Create Order)
```bash
curl -X POST "https://your-domain.com/api/partner/orders" \
  -H "Accept: application/json" \
  -H "api-token: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "product_slug": "steam-gift-card-50",
    "quantity": 1,
    "params": {}
  }'
```

### Response (Success)
```json
{
  "ok": true,
  "order_id": 456,
  "status": "processing",
  "total_charged": 50.00,
  "new_balance": 950.00
}
```

### Response (Insufficient Balance)
```json
{
  "ok": false,
  "error": "insufficient_balance",
  "required": 50.00,
  "current": 10.00
}
```

---

## D8. Known Limitations

### From Inventory (Orphaned / Missing / Uncategorized)

1. **Database not fully migrated** — 13 migrations pending including core tables: `products`, `orders`, `order_items`, `transactions`, `sessions`, `personal_access_tokens`, `favorites`, `manual_order_fields`, `form_schema` on categories, `parent_id` on categories, `icon` on products, `rejection_reason` on transactions. **App will crash on these tables until migrated.**

2. **Oranos stock not exposed** — Products show a ceiling of 999 (from seeder) but real Oranos stock is not synced to our `stock` column. Admin cannot see actual availability.

3. **Oranos balance must be topped up** — Auto-fulfillment fails silently if Oranos account balance is insufficient. Admin must monitor `/admin/oranos` and manually fund Oranos account.

4. **Admin Settings UI does not persist markup values** — The `ORANOS_MARKUP` env var is used for price computation, but the Admin Settings UI has no field to update it at runtime. The `oranos:apply-markup` command reads from config, not from settings table.

5. **Forgot password route exists but no frontend page** — `POST /api/auth/forgot-password` is registered but no "Forgot Password" UI exists.

6. **7 Oranos artisan commands are orphaned** — `apply-category-images`, `apply-tree`, `generate-placeholders`, `harvest` (scheduled), `import-category-images`, `import-images`, `import-product-images`, `parent-fallback`, `sync-product-images` — not triggered from UI or scheduled.

8. **No Job/Listener/Observer layers** — Events broadcast directly via Reverb; no async job processing for heavy operations (e.g., Oranos sync).

9. **CategoryModal component exists but unused** — Orphaned component.

10. **Frontend LanguageSwitcher test fails** — Pre-existing bug in test, not in component.

11. **VITE_GA_MEASUREMENT_ID and VITE_UMAMI_WEBSITE_ID undocumented** — Used in Analytics.tsx but not in frontend `.env.example`.

12. **Duplicate rejection_reason migrations** — Two migrations add rejection_reason to transactions (2026_09_07_210539 and 2026_09_13_144541).

13. **Demo credentials in seeder** — DemoSeeder creates users with known passwords (`password`) and mock API keys.

### Unfixed from Task B
- None — ProductPage hero image centering fixed by adding `aspect-[4/5]` wrapper.

### Top 10 Risks (Ranked by Severity)

| # | Risk | File/Location | Suggested Fix |
|---|------|---------------|---------------|
| 1 | **Data loss: pending migrations** | `database/migrations/*.php` (13 pending) | Run `php artisan migrate` on staging; verify all tables exist before production deploy |
| 2 | **Money loss: Oranos balance depletion** | `OrderService::fulfillAutomationItems()` | Add pre-flight balance check; alert admin when Oranos balance < $50; fail order early with clear message |
| 3 | **Money loss: Auto-fulfillment silent failure** | `OrderService::fulfillAutomationItems()` catch block | On Oranos failure, mark order `Rejected` with reason, refund user balance, notify admin |
| 4 | **User-facing bug: Products invisible** | `Product::where('is_active', true)` but `products` table missing | Run migrations; add deployment gate that fails if migrations pending |
| 5 | **User-facing bug: Sessions don't persist** | `sessions` table migration pending | Run migration 2026_09_01_220626_create_sessions_table |
| 6 | **User-facing bug: Sanctum tokens broken** | `personal_access_tokens` table migration pending | Run migration 2026_09_04_233025_create_personal_access_tokens_table |
| 7 | **User-facing bug: Favorites broken** | `favorites` table migration pending | Run migration 2026_09_25_203000_create_favorites_table |
| 8 | **Cosmetic: Admin markup setting not persisted** | `AdminSettingsController`, `AdminSyncController` | Add `oranos_markup` to settings table; update `OranosMarketService` to read from Setting::get() |
| 9 | **Cosmetic: LanguageSwitcher test flaky** | `src/components/LanguageSwitcher.test.tsx` | Fix test to properly await locale change |
| 10 | **Cosmetic: Unused Oranos commands clutter CLI** | `app/Console/Commands/Oranos*.php` | Document purpose or remove if truly abandoned |

---

## Appendix: Inventory Summary

| Category | Count | Flags |
|----------|-------|-------|
| Backend Routes | 91 | 1 ORPHANED (forgot-password) |
| Artisan Commands | 12 | 7 ORPHANED, 5 USED/SCHEDULED |
| Models | 11 | 0 UNUSED |
| Services | 6 + 3 gateways | 0 UNUSED |
| Middleware | 2 | 0 DEAD |
| Migrations | 27 | **13 PENDING (critical)** |
| Events | 5 | All ACTIVE |
| Frontend Pages | 36 | 0 ORPHANED/BROKEN |
| Shared Components | 26 | 10 HIGH-IMPACT, 1 ORPHANED (CategoryModal) |
| API Endpoints | 63 | 0 MISSING/MISTYPED |
| Env Variables | ~87 | 2 UNDOCUMENTED |
| Webhooks | 3 | All verified |
| Scheduled Tasks | 5 | All ACTIVE |

---

*Generated by automated codebase inventory. For questions, contact the development team.*