# Grandma's POS System

**Role:** Solo Full-Stack Developer  
**Stack:** SvelteKit · TypeScript · Hono.js · Cloudflare Workers · D1  
**Deployment:** [Cloudflare Workers](https://55b60a46-grandma-pos.denver02-james14.workers.dev/)

---

A bespoke Point of Sale and franchise management system built from the ground up for a fast-paced food service business. Designed to handle real-world operational complexity — multiple locations, offline environments, and a full supply chain — without any off-the-shelf POS shortcuts.

---

## Branch & Location Management

![Branch Selector](/images/projects/grandma-pos/branch-selector.jpg)

Each user session is scoped to a specific branch or location. The branch selector ensures cashiers, managers, and commissary staff all operate within their assigned context — keeping inventory, sales, and reports cleanly separated per location.

---

## Point of Sale & Order Processing

![Order Screen](/images/projects/grandma-pos/orders/order-screen.jpg)

The POS interface is built for speed in a high-volume food service environment. Orders are processed with minimal taps, and the system continues to function during internet outages — syncing automatically once connectivity is restored.

### Order Workflow

![Order Details](/images/projects/grandma-pos/orders/order-details-1.jpg)

![Order Confirmation](/images/projects/grandma-pos/orders/order-confirmation.jpg)

Each order moves through a structured lifecycle — from creation and approval through preparation, payment, and pickup — with every step tracked and logged.

### Payment Handling

![Payment Screen](/images/projects/grandma-pos/orders/order-details-payment-screen.jpg)

![Payment Verification](/images/projects/grandma-pos/orders/order-details-payment-verification-screen.jpg)

Payment verification is built directly into the order flow, with support for image uploads (proof of payment) that are queued locally and synced to Google Drive in the background.

### Order Tracking & ETA

![ETA Screen](/images/projects/grandma-pos/orders/order-eta-screen.jpg)

![Preparation Progress](/images/projects/grandma-pos/orders/order-preparation-progress-after-approval.jpg)

Orders are tracked in real time from approval through preparation and dispatch, with ETA visibility for both staff and management.

### Delivery & Receiving

![Pickup Confirmation](/images/projects/grandma-pos/orders/order-pickup-confirmation.jpg)

![Receive Confirmation](/images/projects/grandma-pos/orders/order-receive-confirmation.jpg)

Pickup and receiving confirmations close the order loop, triggering automatic stock updates across the relevant locations.

### Order Logs & Communication

![Order Logs](/images/projects/grandma-pos/orders/order-logs.jpg)

![Order Chat](/images/projects/grandma-pos/orders/order-chat.jpg)

Every order carries a full audit log and an in-system chat thread — giving staff and managers a clear, timestamped record of every action and decision.

---

## Product & Raw Material Management

![Product & Raw Material Management](/images/projects/grandma-pos/product-raw-material-management.jpg)

Products are defined with recipes that map directly to raw materials. Every sale automatically deducts the correct ingredient quantities across the supply chain — no manual stock counting required.

---

## Multi-Tenant Management

![Multi-Tenant Management](/images/projects/grandma-pos/multi-tenant-management.jpg)

The system is architected to support multiple franchise tenants under one platform. Each tenant operates independently with their own locations, users, products, and inventory — managed from a central head office view.

---

## User & Access Management

![Users Management](/images/projects/grandma-pos/users-management.jpg)

![User Details](/images/projects/grandma-pos/users-management-details.jpg)

User accounts are fully managed within the system — creation, profile details, role assignment, and location access all controlled from a single admin interface.

---

## Role & Permission Management

![Role Management](/images/projects/grandma-pos/role-management.jpg)

![Permissions Management](/images/projects/grandma-pos/permissions-management.jpg)

A granular RBAC system with 30+ individual permissions. Roles are fully configurable — cashiers, branch managers, commissary staff, and super admins each get exactly the access they need, nothing more.

---

## Technical Highlights

**Offline-first architecture.** Sales are stored locally in IndexedDB via Dexie.js and replayed to the server automatically when the connection returns — no data loss, no manual intervention.

**Edge-native backend.** The entire backend runs on Cloudflare Workers with D1 as the database, keeping latency low for real-time operations like stock deduction and order processing. A custom transaction wrapper handles atomicity for multi-step operations.

**Internal tooling.** Beyond the POS, the system includes company-wide internal tools — inventory dashboards, stock movement reports, production order tracking, and admin panels — replacing previously manual, spreadsheet-based workflows.

---

## Business Impact

- Eliminated manual inventory tracking across multiple locations
- Sales continue during internet outages with zero data loss
- Recipe-based deduction removed human error from stock management
- Internal tooling consolidated fragmented spreadsheet workflows into a single system