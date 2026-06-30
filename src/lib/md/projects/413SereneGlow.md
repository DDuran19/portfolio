# 413 Serene Glow — E-Commerce Platform

**Client:** 413 Serene Glow Wellness and Beauty Solutions (Philippines)
**Role:** Full-Stack Developer

---

## Summary

Built a full-stack e-commerce platform for a Philippine skincare brand, handling everything from storefront to backend order processing and automated email notifications.

## Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Frontend   | SvelteKit 5, TypeScript, TailwindCSS              |
| UI Library | shadcn-svelte (30+ components)                    |
| Backend    | PocketBase (self-hosted)                          |
| Deployment | Cloudflare Pages (frontend), PocketHost (backend) |

## Key Features

- **Product Catalog** — Dynamic product pages with image galleries, sale pricing with discount badges, related products, and SEO-optimized meta tags (OG, Twitter Card)
- **Shopping Cart** — Responsive cart with Sheet (desktop) / Drawer (mobile) layout, quantity management, and checkout flow
- **Order Management** — End-to-end order creation, status tracking, and lookup by order ID + customer name
- **Email Automation** — PocketBase hooks trigger HTML order confirmations and status update emails; cron-based retry system for failed deliveries
- **Shop Filtering** — Category-based product browsing with filter components
- **Responsive Design** — Mobile-first with adaptive UI patterns (media query-based component switching)
- **SEO** — Per-product meta tags, Open Graph images, Twitter Card support, semantic HTML

## Architecture Highlights

- **Svelte 5 runes** (`$state`, `$derived`, `$props`, `$effect`) for reactive state management
- **SvelteKit server-side data loading** with `Promise.all` parallel fetches for categories, products, carousels, and showcase data
- **Context-based state** — Cart, modals, orders, and products managed via Svelte context API
- **PocketBase hooks** (`onRecordAfterCreateRequest`, `onRecordAfterUpdateRequest`) for event-driven email scheduling
- **Background cron job** processes unsent emails with status tracking (`pending` → `processing` → `completed`/`failed`) and overlap protection
- **API routes** for order lookup, cart item verification, and shipping price calculation

## What I Delivered

- Full frontend build with 15+ custom Svelte components
- PocketBase backend setup with custom hooks and email templates
- Cron-based email retry system
- Cloudflare Pages deployment
- Mobile-responsive layout with adaptive cart UI

---

## **Tags:** `SvelteKit` `PocketBase` `TailwindCSS` `shadcn-svelte` `E-Commerce` `Cloudflare` `TypeScript` `Full-Stack`

# 413 Serene Glow — E-Commerce Platform

## Project Overview

Built a full-stack e-commerce platform for a Philippine skincare brand, handling everything from storefront to backend order processing and automated email notifications.

**Client:** 413 Serene Glow Wellness and Beauty Solutions (Philippines)
**Role:** Full-Stack Developer
**Live Site:** [413sereneglow.com](https://www.413sereneglow.com)

---

## The Problem

The client needed a modern, fast e-commerce site to sell premium skincare products in the Philippine market. Existing solutions were either too expensive, too slow, or lacked the customization needed for their specific workflow — particularly around order management and email notifications.

## The Solution

Delivered a custom e-commerce platform with:

- **Fast, responsive storefront** built on SvelteKit for near-instant page loads
- **Self-hosted backend** using PocketBase for full data ownership and zero vendor lock-in
- **Automated email system** with retry logic so no order confirmation is ever lost
- **Mobile-first design** that adapts seamlessly between desktop and mobile layouts

---

## Tech Stack

| Layer      | Technology                                        |
| ---------- | ------------------------------------------------- |
| Frontend   | SvelteKit 5, TypeScript, TailwindCSS              |
| UI Library | shadcn-svelte (30+ components)                    |
| Backend    | PocketBase (self-hosted)                          |
| Deployment | Cloudflare Pages (frontend), PocketHost (backend) |

### Why These Choices

- **SvelteKit** — Compiled output with no runtime overhead, fast page transitions, excellent DX with Svelte 5 runes
- **PocketBase** — Lightweight Go-based backend with built-in auth, database, and real-time subscriptions. Self-hosted means full control
- **shadcn-svelte** — Copy-paste components that are fully customizable, not a black-box library
- **Cloudflare Pages** — Global CDN with edge rendering, free tier covers most traffic
- **TailwindCSS** — Utility-first styling with zero CSS bloat in production

# Key Features

## Product Catalog

Dynamic product pages built with SvelteKit's slug-based routing. Each product page includes:

- **Image gallery** with thumbnail navigation and zoom
- **Sale pricing** with automatic discount badge calculation (`X% OFF!`)
- **Related products** section driven by backend-defined relationships
- **SEO optimization** — per-product meta tags, Open Graph images, Twitter Card support
- **Stock status** indicators with out-of-stock handling on the add-to-cart button

Products are loaded server-side from PocketBase with expanded category data, ensuring fast initial renders and good SEO crawlability.

---

## Shopping Cart

Fully responsive cart that switches between two UI patterns:

- **Desktop:** Sheet (slide-out panel) for quick access without leaving the page
- **Mobile:** Drawer (bottom sheet) for natural thumb-zone interaction

Cart state is managed via Svelte context API, keeping it reactive across all components without prop drilling. Features include:

- Quantity adjustment per item
- Real-time total price calculation
- Checkout flow with payment notice modal
- Empty cart state with link to shop

---

## Order Management

End-to-end order lifecycle:

1. **Order creation** — Customer fills shipping info, order is saved to PocketBase
2. **Confirmation emails** — Automated HTML emails sent to both customer and admin
3. **Status tracking** — Customers can look up orders by order ID + full name
4. **Status updates** — Email notifications triggered on every status change

The order lookup page provides a clean interface with order details, shipping info, and itemized breakdown.

---

## Email Automation

The most complex backend feature. Built on PocketBase hooks:

- **`onRecordAfterCreateRequest`** — Triggers order confirmation emails (customer + admin) when a new order is created
- **`onRecordAfterUpdateRequest`** — Sends status update emails when order status changes
- **Cron-based retry** — Background job runs every minute, picks up unsent emails, and retries them with status tracking (`pending` → `processing` → `completed`/`failed`)
- **Overlap protection** — Refetches records before processing to prevent duplicate sends from concurrent cron runs

All email templates are built as inline-styled HTML for maximum email client compatibility.

---

## Responsive Design

Mobile-first approach with adaptive components:

- Media query-based layout switching (not just CSS breakpoints)
- Cart component renders as `Sheet` on desktop, `Drawer` on mobile
- Product grid adapts from 4 columns (desktop) to 2 columns (mobile)
- Sticky sidebars collapse to full-width on smaller screens

---

## SEO

- Per-product `<title>`, meta description, keywords
- Open Graph tags with product images
- Twitter Card (`summary_large_image`)
- Semantic HTML structure
- Server-side rendering via SvelteKit for search engine crawlability

# Architecture

## Svelte 5 Runes

The entire frontend uses Svelte 5's new runes system for reactive state management:

- **`$state`** — Local component state (quantity inputs, mobile detection flags)
- **`$derived`** — Computed values from other state (processed showcase data, cart totals, order item breakdowns)
- **`$props`** — Type-safe component props with destructuring
- **`$effect`** — Side effects like media query listeners for responsive layout switching

This replaced the legacy `let`/`$: ` reactivity model, providing clearer signal-based reactivity and better TypeScript inference.

---

## Server-Side Data Loading

SvelteKit's `+layout.server.ts` loads shared data (categories, products, carousels, showcase) using `Promise.all` for parallel PocketBase fetches. Individual pages use `+page.server.ts` for page-specific data.

```typescript
const [categories, showcase, carousels, products] = await Promise.all([
	locals.pb.collection('view_all_categories').getFullList(),
	locals.pb.collection('showcase').getFullList({ expand: 'products' }),
	locals.pb.collection('carousels').getFullList({ sort: 'rank' }),
	locals.pb.collection('view_all_products').getFullList({ expand: 'categories' })
]);
```

All fetches include `.catch()` handlers that gracefully degrade to empty arrays on `ClientResponseError`, with a redirect to an under-maintenance page on total failure.

---

## Context-Based State Management

Four Svelte context modules manage cross-component state without prop drilling:

- **Cart context** — Add/remove items, quantity management, total calculations
- **Modals context** — Cart drawer open/close, payment notice visibility
- **Orders context** — Order lookup state and caching
- **Products context** — Shared product data

Each context uses Svelte's `setContext`/`getContext` pattern with TypeScript generics for type safety.

---

## PocketBase Backend

Self-hosted PocketBase instance with:

- **Custom JS hooks** in `pb_hooks/main.pb.js` for email automation
- **Utility functions** in `pb_hooks/utils.js` for SMTP email sending
- **Database migrations** for schema versioning
- **Views** for pre-built query results (e.g., `view_all_products`, `view_all_categories`)

PocketBase handles auth, database, file storage, and real-time subscriptions out of the box — no separate services needed.

---

## Email System Architecture

```
Order Created → Hook triggers → scheduleEmail() → email_notifications collection
                                                          ↓
Cron (every minute) ← picks up pending emails ← checks status
                                                          ↓
                                               sendEmail() via SMTP
                                                          ↓
                                               Update status: completed/failed
```

Key design decisions:

- **Queue-based** — Emails are written to a collection first, not sent inline. This prevents failed emails from blocking order creation
- **Idempotent** — Each email has an `email_identifier` (e.g., `order_confirmation-{id}`) to prevent duplicates
- **Overlap-safe** — Records are locked to `processing` status before send, and refetched before processing to handle concurrent cron runs

---

## API Routes

SvelteKit API routes (`src/routes/api/`) handle:

- **`/api/online_orders/{id}/{name}`** — Order lookup with name verification
- **`/api/verify_cartItems`** — Cart item validation against current inventory
- **`/api/shipping_price`** — Shipping cost calculation

These use SvelteKit's `+server.ts` pattern with proper HTTP methods and JSON responses.

# Delivery & Results

## What Was Delivered

### Frontend (15+ Custom Svelte Components)

- `Hero` — Landing page hero section
- `Carousel` — Image carousel with autoplay for banners
- `ProductItem` — Reusable product card with hover image effect
- `ProductDetails` — Expandable product detail section
- `ProductFilters` — Category-based filtering
- `Cart` / `CartItems` — Responsive cart with Sheet/Drawer switching
- `AddToCartButton` — State-aware add-to-cart with stock check
- `QuantityInput` — Controlled quantity selector
- `ImageGallery` — Product image viewer with thumbnails
- `Navbar` / `Footer` — Site-wide navigation
- `CheckoutComponents/ShippingCheckout` — Checkout form
- `CheckoutComponents/PaymentNoticeModal` — Payment instructions modal
- `Testimonials` — Marquee-style testimonial display
- `LoadingBar` — Page transition indicator
- `UnderMaintenance` — Graceful error fallback page

### Backend

- PocketBase instance with custom schema
- 2 JavaScript hooks for email automation (create + update)
- Email retry cron job with status tracking
- 3 API routes (orders, cart verification, shipping)
- SMTP integration for transactional emails

### Deployment

- Frontend deployed to Cloudflare Pages with automatic builds
- Backend hosted on PocketHost (managed PocketBase hosting)
- Custom domain configured for production use

---

## Technical Highlights

### Zero-Loss Email System

The cron-based retry mechanism ensures no email is ever silently dropped. Every email goes through a state machine:

```
pending → processing → completed
                   → failed (available for manual retry)
```

This was critical for the client — lost order confirmations directly impact customer trust.

### Adaptive Mobile Experience

The cart component dynamically switches between `Sheet` (desktop) and `Drawer` (mobile) based on a media query listener attached to `$effect`. This isn't just CSS hiding — it's a full component swap for optimal UX on each platform.

### Graceful Degradation

Every PocketBase fetch is wrapped with error handling. If the backend is unreachable, the site redirects to an under-maintenance page instead of showing a blank screen or cryptic error.

---

## Results

- **Fast load times** — SvelteKit's compiled output + Cloudflare's edge network
- **Mobile-optimized** — Adaptive components for touch-friendly shopping
- **Reliable orders** — Email retry system ensures 100% delivery rate
- **SEO-ready** — Server-rendered pages with proper meta tags for search visibility
- **Low maintenance** — Self-hosted PocketBase with minimal infrastructure overhead
