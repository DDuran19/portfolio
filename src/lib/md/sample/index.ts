import MonetasCalculator from "./MonetasCalculator.svelte";
import ShippingPlatform from "./ShippingPlatform.svelte";
import CentralizedDashboard from "./CentralizedDashboard.svelte";
import ZiteAndBrevoApi from "./ZiteAndBrevoApi.svelte";
import MedicJi from "./MedicJi.svelte";

export const sampleComponents = [
    {
        name: "Monetas Calculator",
        slug: "monetas-calculator",
        description: "An embeddable mortgage savings calculator with GA4 analytics integration, real-time calculation engine, and an iframe embed snippet.",
        component: MonetasCalculator
    },
    {
        name: "Shipping Platform",
        slug: "shipping-platform",
        description: "A simulated shipping integration demo — from checkout to DB write to third-party courier API dispatch, with a live event log.",
        component: ShippingPlatform
    },
    {
        name: "Centralized Dashboard",
        slug: "centralized-dashboard",
        description: "A multi-tenant SSO prototype where a super admin can auto-login across isolated business instances, each with their own role-based access.",
        component: CentralizedDashboard
    },
    {
        name: "Zite & Brevo API Integration",
        slug: "zite-and-brevo-api",
        description: "An order processing flow simulation with mock APIs for Brevo CRM and Zite database, showing API request payloads and responses.",
        component: ZiteAndBrevoApi
    },
    {
        name: "MedicJi",
        slug: "medicji",
        description: "A Medicare insurance agent dashboard with contact management, marketing activity logs, and calendar scheduling.",
        component: MedicJi
    },

]