# Ak Gul — Bilingual Flower Shop E‑commerce

**Live demo:** https://flower-flax-mu.vercel.app/ru · **Code:** https://github.com/keko0766/flower
**Role:** Full‑stack developer (design, frontend, backend, deployment)
**Stack:** Next.js 16 (App Router, TypeScript) · Tailwind CSS 4 · Supabase (PostgreSQL, Auth, Storage) · next-intl · Vercel

> Concept project: the shop name, contacts, bouquets and reviews are fictional placeholders.

---

## Overview

Ak Gul is a complete online store for a flower shop in Almaty, Kazakhstan. It is fully bilingual (Russian and Kazakh) and has a customer storefront plus a private admin panel. Customers can browse a filterable catalog, build a cart and place a delivery order. The owner manages orders, bouquets and delivery dates from the admin panel.

## The problem

Small local flower shops in Kazakhstan usually sell through Instagram DMs and WhatsApp. That means:
- no browsable catalog with clear prices,
- order details get lost in chat threads,
- no Kazakh-language experience, even though many customers want one,
- the owner has no overview of revenue or popular products.

## The solution

A fast, mobile-first store that keeps the WhatsApp habit customers already have and adds structure:

1. The customer places an order on the site, and it is saved in the database.
2. The thank-you page opens WhatsApp with a pre-filled order summary, so the shop gets the message in its usual channel.
3. The owner sees every order in the admin panel with one-click call/WhatsApp and quick status actions (New → Sold / Cancelled).

## Key features

**Storefront**
- Home page with hero slider, occasions, popular bouquets, reviews and contacts
- Catalog with filters (price range, occasion, color), sorting, search and result count. Filter state is stored in the URL, so results can be shared and bookmarked.
- Product page with gallery, composition, size, quantity and similar bouquets
- Cart with a progress bar toward free delivery
- Checkout: recipient, delivery or pickup, date picker with blocked dates, time slots, gift card text, packaging options
- Info pages (About, Delivery & Payment with FAQ, Contacts with map) and legal templates

**Admin panel**
- Dashboard: revenue and order count for today / 7 / 30 days, average order value, 14-day chart, top 5 bouquets
- Order management with status filters and quick actions
- Bouquet editor: bilingual fields, photo upload and ordering, occasions/colors, show/hide
- Blocked delivery dates with reasons

## Technical highlights

- **Tamper-proof pricing.** The browser only sends bouquet IDs and quantities. A PostgreSQL function, `create_order()`, recalculates every price, packaging and delivery fee, and validates the date (from tomorrow, at most 60 days ahead, not blocked) and the time slot. Direct inserts into the orders table are forbidden by Row Level Security.
- **Security in depth.** Admin access is checked three times: session refresh in `proxy.ts`, `requireAdmin()` on every page and server action, and RLS policies in the database based on an `admin` role.
- **Always-fresh cart.** `localStorage` stores only IDs and quantities. Names, photos and prices are fetched from `/api/cart`, so prices never go stale and deleted items disappear on their own.
- **Real bilingual support.** `/ru` and `/kk` routes via next-intl, ICU plural rules for both languages, `*_ru` / `*_kk` database columns, and fonts chosen for full Kazakh Cyrillic support (Cormorant + Montserrat).
- **Smart rendering.** Home and product pages are statically generated with 5-minute revalidation, the catalog and checkout render on every request, and admin edits invalidate the cache immediately with `revalidatePath`.
- **SEO.** Per-page metadata and Open Graph, canonical + hreflang (ru, kk, x-default), JSON-LD (`Florist`, `Product`, `FAQPage`), a dynamic sitemap and robots.txt.
- **Low latency.** Vercel functions are pinned to Frankfurt (`fra1`), next to the Supabase database (eu-central-1).

## Design

A soft, warm palette (cream, blush, rose, sage, ink) with an elegant serif for headings and a clean sans-serif for body text. Reusable `Button`, `Chip` and `ProductCard` components keep the UI consistent. Brand colors such as WhatsApp green were darkened to keep white text readable.

## Results

- **Lighthouse (mobile, live site):** Performance 90–92 · Accessibility 100 · Best Practices 100 · SEO 100
- 20 demo bouquets, a full order flow from catalog to WhatsApp, and a working admin dashboard
- Automatic deployment from GitHub to Vercel on every push

## What I'd do next

- Online payment (Kaspi / CloudPayments)
- Email notifications (Resend)
- Delivery zones with suburban pricing
- Customer accounts, favorites and promo codes
