# 413 Serene Glow - Wellness and Beauty E-commerce Platform

**413 Serene Glow** is a modern e-commerce platform built to showcase and sell premium skincare and wellness products. The project leverages **SvelteKit**, **TailwindCSS**, **Pocketbase**, and **shadcn-svelte** to deliver a fast, elegant, and responsive user experience.

---

## 🚀 Features

- **Frontend:** SvelteKit + TailwindCSS with **shadcn-svelte** components.
- **Backend:** Pocketbase with custom JS hooks and email notification logic.
- **Automated Email System:**
  - Sends order confirmation and status update emails via SMTP.
  - Uses a cron-based background process for retrying unsent emails.
- **Cloudflare Pages** deployment for the frontend.
- **PocketHost** deployment for the backend.
- **Responsive UI** optimized for mobile and desktop.

---

## 📦 Tech Stack

**Frontend:**
- [SvelteKit](https://kit.svelte.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [shadcn-svelte](https://ui.shadcn.com/svelte) for customizable components.
- [Embla Carousel](https://www.embla-carousel.com/) for product carousels.
- [Lucide Icons](https://lucide.dev/icons/) via `lucide-svelte`.

**Backend:**
- [Pocketbase](https://pocketbase.io/) with custom **hooks** and **background cron jobs**.
- SMTP for transactional email delivery.

**Deployment:**
- **Frontend:** Cloudflare Pages
- **Backend:** PocketHost (Pocketbase server)

---

## 📬 Email Notification & Retry System

The email system is powered by Pocketbase hooks and a **custom retry mechanism** implemented in `pb_hooks`.

### Workflow:
1. **Order Creation:**
   - `main.pb.js` triggers `scheduleEmail()` for:
     - Customer order confirmation.
     - Admin order notification.
2. **Order Updates:**
   - When `status` changes, another email is queued via `scheduleEmail()`.
3. **Retry System (Background Cron Job):**
   - The cron job (every minute) checks the `email_notifications` collection for `status = "pending"` or `sent = false`.
   - Emails are resent via `sendEmail()` or `sendEmails()` (for multiple recipients).
   - Status is updated (`processing`, `completed`, `failed`).

The core email functions are in `utils.js`.

---

## ⚙️ Development Setup

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [Pocketbase CLI](https://pocketbase.io/docs/)
- [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/)
- [shadcn-svelte CLI](https://www.shadcn-svelte.com)

### Clone and Install
```bash
git clone https://github.com/DDuran19/serene.git
cd serene
npm install
````

### Run Pocketbase (local)

```bash
npm run pb
```

### Run development server

```bash
npm run dev
```

---

## 🏗️ Build & Deployment

### Build the frontend

```bash
npm run build
```

### Preview build

```bash
npm run preview
```

### Deploy

* **Frontend:** Deploy `build` folder to **Cloudflare Pages**.
* **Backend:** Deploy Pocketbase instance and `pb_hooks` to **PocketHost**.

---

## 📁 Project Structure

```
.
├── pocketbase/
│   └── pb_hooks/         # Custom Pocketbase hooks
│       ├── main.pb.js    # Email notifications + cron job
│       └── utils.js      # Helper functions for email sending
├── src/                  # SvelteKit source code
├── static/               # Static assets
├── components.json       # shadcn-svelte config
├── package.json
├── pb_schema.json
├── tailwind.config.js
└── ...
```

---

## 🎨 Using shadcn-svelte

**shadcn-svelte** is used for a consistent and modern UI.

Add a new component:

```bash
npx shadcn-svelte add button
```

Update all components:

```bash
npx shadcn-svelte update
```

---

## ✨ About 413 Serene Glow

### Vision

To become the leading wellness and beauty solutions provider in the Philippines, inspiring individuals to unlock their inner glow through innovative, high-performance skincare products.

### Mission

* Deliver affordable, effective, and safe skincare solutions.
* Foster self-love and confidence by addressing core beauty concerns.
* Build a community of empowered individuals through education and engagement.
