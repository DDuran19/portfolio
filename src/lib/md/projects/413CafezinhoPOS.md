<h1 class="text-balance">413 Cafezinho - Point of Sales System</h1>

This webapp is a POS specifically designed for a coffee shop named 413 Cafezinho. It contains basic functionality of a POS and automatically creates an e-commerce store alongside it. This is a work-in-progress and the customer-facing (e-commerce) side is yet to be implemented in production (but is functional). The screenshots attached are just literal snippets. You can go to [This link](https://beta.413cafezinho.cafe/) to check out the actual website.

## Key Features

### Customer-Facing Online Order System
- **Mobile-First Approach**: Ensures optimal responsiveness and usability across different screen sizes, prioritizing mobile devices.
- **Minimalistic and Clean UI**: Features are categorized for easy customer navigation and order creation.
- **Product Recommendations**: Saves previous orders in the browser to provide accurate "Recommended Products" on subsequent visits.
- **Progressive Web App (PWA)**: Configured for installation on both iOS and Android devices, enhancing accessibility and user experience.
- **Real-Time Order Queue**: Directs customer orders to the queue on the POS employee-facing side for efficient processing.

### Employee-Facing POS System

#### Admin Dashboard
- **Employee Management**: Manage (edit user details, roles, branch associations, branch coverage, passwords) employees you are supervising if you are a supervisor.
- **Product Management**: CRUD operations for categories, subcategories, and products.

#### Main POS Interface
- **Modern, Intuitive UI**: Segmented into three columns:
  1. **Order Queue**: Click on an order to open the Order Details modal for managing the order, changing its status, or reviewing it. Order cancellations require supervisor login for approval.
  2. **Product List**: Clicking a product opens a modal to modify the product order before adding it to the cart.
  3. **Cart**: Contains options for applying discounts and other modifications. Supports printing receipts using an external printer, with an associated Android app for this purpose.
   
#### Reporting
- **Comprehensive Reports**: Includes filters and a table of all products sold and orders within a specified date range.
- **Visual Summaries**: A bar graph showing a summary of previous transactions, with hoverable columns in the table for specific field summaries.

### Technical Stack
- **SvelteKit**: For building the frontend with a focus on fast, reactive components.
- **TypeScript**: Ensuring type safety and better maintainability.
- **DaisyUI & TailwindCSS**: For styling, providing a modern, consistent look and feel.
- **Cloudflare Workers**: For handling serverless functions, enhancing performance and scalability.
- **PWA Configuration**: Allows the app to be installed on mobile devices and accessed offline.

## Future Enhancements
- **Advanced Analytics**: To provide insights into customer behavior and sales trends.
- **Loyalty Programs**: For rewarding repeat customers and encouraging repeat business.

Stay tuned for updates as we continue to enhance and expand the functionalities of 413 Cafezinho's POS system.