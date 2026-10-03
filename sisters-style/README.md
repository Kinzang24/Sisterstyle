# Sister'Style — Next.js Edition

A Bhutanese clothing boutique, rebuilt as a real Next.js app with a real
database, real authentication, and real (optional) payments — evolved from
an earlier single-file HTML prototype.

## Stack

- **Next.js 16** (App Router, Turbopack)
- **SQLite** via Node's built-in `node:sqlite` module (Node 22.5+) — a real
  relational database, zero install, zero native compilation. (I first
  tried Prisma, then `better-sqlite3` as a fallback, but both need to
  download a native binary during `npm install` — Prisma's engine download
  and `better-sqlite3`'s node-gyp/Node-headers download were both blocked
  in my sandbox's network, so I couldn't verify either end-to-end. Node's
  own built-in SQLite needs nothing downloaded at all, which let me
  actually build, run, and test the whole app before handing it to you.
  Swapping to Postgres later is a `lib/db.js` rewrite, not a
  rearchitecture — every query goes through that one file.)
- **Auth.js (NextAuth v5)** — credentials login, bcrypt-hashed passwords,
  JWT sessions, role-based access (`customer` / `admin`)
- **Stripe** (optional) for card payments, **Cash on Delivery** always
  available with no setup
- **Tailwind CSS v4**

## Getting started

**Requires Node.js 22.5 or newer** (for the built-in `node:sqlite` module —
run `node -v` to check; the SQLite module logs an "experimental feature"
warning on startup, which is expected and harmless).

```bash
npm install
cp .env.example .env.local   # then edit AUTH_SECRET at minimum
npm run dev
```

Open http://localhost:3000. The database (`data/sisters-style.db`) and its
tables are created automatically on first run, and seeded with the original
8-item catalog plus a demo admin account:

- **Admin login:** `admin@sistersstyle.shop` / `admin1234`
- **Change this password immediately** if you deploy this anywhere real.

## What's implemented

- **Catalog** — browse, search, filter by category (Hot Trending / Best
  Seller / New Style)
- **Accounts** — sign up, log in/out, profile with avatar upload (drag a
  file or paste a URL), editable contact info, saved shipping address,
  notification preferences, password change, and account deletion
- **Cart & wishlist** — persisted per account in the database, so they
  survive logging out and back in (unlike the old prototype's in-memory
  cart)
- **Checkout** — Cash on Delivery works immediately; Stripe Checkout is
  wired in but stays disabled until you add API keys (see below)
- **Orders** — "Already Paid" (full history) and "On Delivery" (active
  orders) pages with a visual progress tracker
- **Admin panel** — full product CRUD with photo upload, and an Orders tab
  to move any order through Processing → On Delivery → Delivered

## Payments — read this before launching

Stripe only supports merchant accounts in a limited set of countries, and
**Bhutan isn't currently one of them**. So:

- Out of the box, **Cash on Delivery** is fully functional and needs no
  external account — a completely reasonable way to launch.
- Stripe works if you (or the business) are registered somewhere Stripe
  supports, or for testing. Add `STRIPE_SECRET_KEY` and
  `STRIPE_WEBHOOK_SECRET` to `.env.local` to turn it on — it'll charge in
  USD, since Stripe doesn't accept BTN as a presentment currency.
- For a Bhutan-based business, you'll likely want a local gateway instead
  (a Bank of Bhutan / BNB merchant gateway, or a mobile wallet like myPay).
  I don't have reliable, current API details for those memorized, so I
  didn't fake an integration — check each provider's current developer
  docs, then implement it in `lib/payments.js`, which is written as a
  swappable abstraction for exactly this reason.

## Project structure

```
app/
  (auth)/login, signup          — auth pages, no sidebar
  (shop)/                       — everything behind the sidebar shell
    page.js                     — product grid
    cart/, wishlist/, checkout/
    account/profile, settings, orders, delivery
    admin/, admin/orders/
  api/                          — all backend routes
auth.js, auth.config.js         — NextAuth config (split for Edge middleware)
lib/db.js                       — database schema + connection + seed
lib/payments.js                 — Stripe / COD abstraction
lib/currency.js                 — Nu. formatting
components/                     — shared UI + CartContext/UserContext
proxy.js                        — route protection (Next 16's middleware)
```

## Notes on what I verified

I ran this end-to-end in my own sandbox before handing it off: build,
registration, login (customer + admin), cart, wishlist, checkout →
real order creation, order totals, admin product CRUD, admin order status
updates, route protection (redirects for logged-out/non-admin users), and
image upload. Everything above passed. I could not verify Stripe itself
(needs your real API keys) or deployment to a live domain — those are the
two things worth testing carefully yourself before going live.
