# 413 Cafezinho - Point of Sales System

**Role:** Solo Full-Stack Developer  
**Stack:** SvelteKit · TypeScript · DaisyUI · TailwindCSS · Cloudflare D1 · R2 · Cloudflare Workers

---

A Point of Sale system specifically designed for a coffee shop named 413 Cafezinho. It contains basic functionality of a POS and automatically creates an e-commerce store alongside it. This is a work in progress and the customer-facing (e-commerce) side is yet to be implemented in production (but is functional). The screenshots attached are just literal snippets. You can go to [This link](https://413cafezinho.denvie.online/) to check out the actual website.

---

## Customer-Facing Online Order System

![Homepage](/images/projects/413cafezinho-pos/homepage.png)
_Mobile-first homepage with hero banner, order CTA, and clean navigation._

![Featured Specials](/images/projects/413cafezinho-pos/homepage-featured.png)
_Featured Specials section showcasing promotional items with vivid product imagery._

![Menu Page](/images/projects/413cafezinho-pos/homepage-menu.png)
_Category-filtered menu grid with product cards and quick add-to-cart buttons._

![Product Details](/images/projects/413cafezinho-pos/product-details.png)
_Product detail page with size variants, quantity selector, and special instructions._

![Cart & Delivery Details](/images/projects/413cafezinho-pos/cart-details.png)
_Cart summary with item breakdown, quantity editing, and delivery form._

![Login Screen](/images/projects/413cafezinho-pos/login-screen.png)
_Employee login screen with session feedback and auto-redirect on success._

- **Mobile-First Approach**: Ensures optimal responsiveness and usability across different screen sizes, prioritizing mobile devices.
- **Minimalistic and Clean UI**: Features are categorized for easy customer navigation and order creation.
- **Product Recommendations**: Saves previous orders in the browser to provide accurate "Recommended Products" on subsequent visits.
- **Progressive Web App (PWA)**: Configured for installation on both iOS and Android devices, enhancing accessibility and user experience.
- **Real-Time Order Queue**: Directs customer orders to the queue on the POS employee-facing side for efficient processing.

---

## Employee-Facing POS System

### Admin Dashboard

![Dashboard Overview](/images/projects/413cafezinho-pos/employee/dashboard.png)
_Main dashboard showing active shift timer, shift activity feed, and key metrics._

![Dashboard Top Bar](/images/projects/413cafezinho-pos/employee/dashboard-topbar.png)
_Top bar with branch selector and shift selector for multi-branch report viewing._

![Performance Metrics](/images/projects/413cafezinho-pos/employee/dashboard-performance-matrix.png)
_Performance metrics: financials, top products, top categories, and recent orders._

![Quick Lookups](/images/projects/413cafezinho-pos/employee/dashboard-quick-lookups.png)
_Recent activity feed with order list and sub-category sales rankings._

![Shift Logs](/images/projects/413cafezinho-pos/employee/dashboard-shift-logs.png)
_Shift activity log showing cash events, expenses, breaks, and timestamps._

![EOD Report - Part 1](/images/projects/413cafezinho-pos/employee/dashboard-running-eod-report.png)
_End-of-day report: shift info, sales breakdown by payment method and discounts._

![EOD Report - Part 2](/images/projects/413cafezinho-pos/employee/dashboard-running-eod-report-2.png)
_EOD report continued: cash drawer movement, performance metrics, and invoice range._

### Main POS Interface

![Main POS Interface](/images/projects/413cafezinho-pos/employee/pos/actual-pos.png)
_POS interface split into order queue, product list, cart, and payment controls._

![Break Mode](/images/projects/413cafezinho-pos/employee/pos/break-mode.png)
_Break mode overlay with live timer, cash-in-drawer field, and end break button._

![Receipt Preview](/images/projects/413cafezinho-pos/employee/receipt-preview.png)
_Order receipt with itemized billing, VAT breakdown, and order status controls._

### Product & Inventory Management

![Products Management](/images/projects/413cafezinho-pos/employee/products-management.png)
_Products list with stock status, recipe configuration badge, and availability dots._

![Tags Management](/images/projects/413cafezinho-pos/employee/tags-management.png)
_Tags management table with category hierarchy, product count, and CRUD actions._

![Ingredients Management](/images/projects/413cafezinho-pos/employee/Ingredients-management.png)
_Ingredients list with unit, low-stock threshold, status filter, and edit actions._

### Documentation

![In-App Guide](/images/projects/413cafezinho-pos/employee/docs.png)
_Built-in documentation covering shift management and order workflows step by step._

---

## Technical Stack

- **SvelteKit**: For building the frontend with a focus on fast, reactive components.
- **TypeScript**: Ensuring type safety and better maintainability.
- **DaisyUI & TailwindCSS**: For styling, providing a modern, consistent look and feel.
- **Cloudflare Workers**: For handling serverless functions, enhancing performance and scalability.
- **Cloudflare D1**: SQLite-based edge database for structured relational data.
- **Cloudflare R2**: Object storage for product images and media assets.
- **PWA Configuration**: Allows the app to be installed on mobile devices and accessed offline.

## Future Enhancements

- **Advanced Analytics**: To provide insights into customer behavior and sales trends.
- **Loyalty Programs**: For rewarding repeat customers and encouraging repeat business.

Stay tuned for updates as we continue to enhance and expand the functionalities of 413 Cafezinho's POS system.
