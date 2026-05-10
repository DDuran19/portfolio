import MonetasCalculator from "./MonetasCalculator.svelte";
import ShippingPlatform from "./ShippingPlatform.svelte";
import CentralizedDashboard from "./CentralizedDashboard.svelte";

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
    }
]