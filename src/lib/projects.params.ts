import Assets from './data/assets';
import { getSkills } from './skills.params';
import type { Project } from './types';
import MolleyBolley from '$lib/md/projects/MolleyBolley.md?raw';
import SimpleVanillaLogin from '$lib/md/projects/SimpleVanillaLogin.md?raw';
import Instaprint from '$lib/md/projects/Instaprint.md?raw';
import CafezinhoPOS from '$lib/md/projects/413CafezinhoPOS.md?raw';
import SereneGlow from '$lib/md/projects/413SereneGlow.md?raw';
import GrandmasPOS from '$lib/md/projects/grandmaPOS.md?raw';

const MY_PROJECTS: Array<Project> = [
	{
		name: '413 Cafezinho POS',
		slug: '413-cafezinho-pos',
		logo: Assets.cafezinhoPOS,
		links: [],
		color: '#000000',
		type: 'Sveltekit Web App',
		period: {
			from: new Date('2024-01-06'),
			to: new Date('2024-05-22')
		},
		description: CafezinhoPOS,
		shortDescription:
			'A POS system designed for 413 Cafezinho, featuring mobile-first design, real-time order management, and detailed reporting.',
		skills: getSkills('sveltekit', 'ts', 'css', 'tailwind', 'cloudflare', 'pwa'),
		screenshots: [
			{
				src: '/images/projects/denvie.online/landing-page.png',
				label: 'Landing Page'
			},
			{
				src: '/images/projects/denvie.online/cart-1.png',
				label: 'Customer Cart 1'
			},
			{
				src: '/images/projects/denvie.online/cart-2.png',
				label: 'Customer Cart 2'
			},
			{
				src: '/images/projects/denvie.online/payment-instructions.png',
				label: 'Payment Instructions'
			},
			{
				src: '/images/projects/denvie.online/product-order-screen.png',
				label: 'Product Details Page (SAMPLE ONLY - Update mode)'
			},
			{
				src: '/images/projects/denvie.online/product-order-screen-new.png',
				label: 'Product Details Page (SAMPLE ONLY - Add new product to cart mode)'
			},
			{
				src: '/images/projects/denvie.online/empty-cart.png',
				label: 'Empty Cart'
			},
			{
				src: '/images/projects/denvie.online/reports.png',
				label: 'Reporting Feature (SAMPLE ONLY)'
			},
			{
				src: '/images/projects/denvie.online/POS-main-interface.png',
				label: 'POS Main Interface (PRODUCTS ARE SAMPLE ONLY)'
			},
			{
				src: '/images/projects/denvie.online/order-details.png',
				label: 'Order Details (SAMPLE ONLY)'
			},
			{
				src: '/images/projects/denvie.online/cancel-approval-screen.png',
				label: 'Cancel Approval Feature'
			},
			{
				src: '/images/projects/denvie.online/admin-dashboard-manage-product-category.png',
				label: 'Product category management'
			},
			{
				src: '/images/projects/denvie.online/admin-dashboard-manage-own-account.png',
				label: 'User account management'
			},
			{
				src: '/images/projects/denvie.online/admin-dashboard-manage-employee-account.png',
				label: 'Employee account management'
			}
		]
	},
	{
		name: '413 Serene Glow',
		slug: '413-serene-glow',
		logo: Assets._413sereneglow,
		links: [{ label: 'Live Demo', to: 'https://413sereneglow.com/', newTab: true }],
		color: '#ffffff',
		type: 'Sveltekit Ecommerce',
		period: {
			from: new Date('2024-10-05'),
			to: new Date('2024-10-28')
		},
		description: SereneGlow,
		shortDescription:
			'413 Serene Glow is a fully-responsive modern e-commerce platform built to showcase and sell premium skincare and wellness products.',
		skills: getSkills('sveltekit', 'ts', 'css', 'tailwind', 'cloudflare', 'pwa'),
		screenshots: [
			{ src: '/images/projects/413sereneglow/home_banner_wide.png', label: 'Home Banner' },
			{
				src: '/images/projects/413sereneglow/fully_responsive_homepage.png',
				label: 'Fully Responsive Homepage'
			},
			{
				src: '/images/projects/413sereneglow/fully_responsive_products_page_with_filters.png',
				label: 'Products Page with Filters'
			},
			{ src: '/images/projects/413sereneglow/products_table.png', label: 'Products Table' },
			{ src: '/images/projects/413sereneglow/order_status_page.png', label: 'Order Status Page' },
			{ src: '/images/projects/413sereneglow/email_worker_table.png', label: 'Email Worker Table' }
		]
	},
	{
		slug: 'molley-bolley',
		color: '#5e95e3',
		description: MolleyBolley,
		shortDescription:
			'It features an intuitive minimalist UI backed with SQL database under the hood. This is a solo project which is coded using Python.',
		links: [
			{
				to: 'https://github.com/DDuran19/MolleyBolley',
				label: 'GitHub',
				newTab: true,
				icon: 'i-carbon-logo-github'
			},
			{ to: 'https://dduran19.github.io/MolleyBolley/', label: 'More info', newTab: true }
		],
		logo: Assets.Python,
		name: 'Molley Bolley',
		period: {
			from: new Date('2023-05-30'),
			to: new Date('2023-08-01')
		},
		skills: getSkills('python', 'html'),
		type: 'Salon Queueing and Sales Tracking System',
		screenshots: [
			{
				label: 'Login component',
				src: 'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Getting_Started/1.png?raw=true'
			},
			{
				label: 'Main screen',
				src: 'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Getting_Started/2.png?raw=true'
			},
			{
				label: 'Add customer',
				src: 'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Getting_Started/4.gif?raw=true',
				static:
					'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Getting_Started/2.png?raw=true'
			},
			{
				label: 'Assign customer to an employee',
				src: 'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Getting_Started/5.gif?raw=true',
				static:
					'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Getting_Started/2.png?raw=true'
			},
			{
				label: 'Mark employee as free',
				src: 'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Getting_Started/6.gif?raw=true',
				static:
					'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Getting_Started/2.png?raw=true'
			},
			{
				label: 'Settings panel (standard view)',
				src: 'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Getting_Started/7.gif?raw=true',
				static:
					'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Getting_Started/2.png?raw=true'
			},
			{
				label: 'Simple Analysis',
				src: 'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Data_Analysis/1.gif?raw=true',
				static:
					'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Getting_Started/2.png?raw=true'
			},
			{
				label: 'Data Extraction',
				src: 'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Data_Analysis/2.gif?raw=true',
				static:
					'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Getting_Started/2.png?raw=true'
			},
			{
				label: 'Employee management - Changing password',
				src: 'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Admin_Panel/1.gif?raw=true',
				static:
					'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Getting_Started/2.png?raw=true'
			},
			{
				label: 'Employee management - Add new employee',
				src: 'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Admin_Panel/2.gif?raw=true',
				static:
					'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Getting_Started/2.png?raw=true'
			},
			{
				label: 'Employee management - Delete employee',
				src: 'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Admin_Panel/3.gif?raw=true',
				static:
					'https://github.com/DDuran19/MolleyBolley/blob/main/images/how_to_use/Getting_Started/2.png?raw=true'
			}
		]
	},
	{
		slug: 'simple-vanilla-login',
		color: '#646cff',
		shortDescription:
			'Created using typescript and CSS, this implements a simple authentication mechanism using sessions. Routing are created without libraries.',
		logo: Assets.TypeScript,
		name: 'Simple Vanilla Login',
		period: {
			from: new Date('2023-07-30'),
			to: new Date('2023-08-02')
		},
		skills: getSkills('ts', 'css', 'html'),
		type: 'Authentication',
		description: SimpleVanillaLogin,
		links: [
			{
				to: 'https://github.com/DDuran19/simpleVanillaLogin',
				label: 'GitHub',
				newTab: true,
				icon: 'i-carbon-logo-github'
			},
			{
				to: 'https://simple-vanilla-login.vercel.app/',
				label: 'Live Demo',
				newTab: true
			}
		],
		screenshots: [
			{
				label: 'Login Page',
				src: 'https://raw.githubusercontent.com/DDuran19/images/main/SimpleVanillaLogin/root.webp'
			},
			{
				label: 'Register Page',
				src: 'https://raw.githubusercontent.com/DDuran19/images/main/SimpleVanillaLogin/register.webp'
			},
			{
				label: 'User Details Page',
				src: 'https://raw.githubusercontent.com/DDuran19/images/main/SimpleVanillaLogin/user-details.webp'
			},
			{
				label: 'Not Found/ Unauthorized Page',
				src: 'https://raw.githubusercontent.com/DDuran19/images/main/SimpleVanillaLogin/not-found-not-allowed.webp'
			}
		]
	},
	{
		name: 'Instaprint',
		slug: 'instaprint',
		logo: Assets.instaprint,
		links: [],
		color: '#ffffff',
		type: 'Android native app',
		period: {
			from: new Date('2023-08-30'),
			to: new Date('2023-09-01')
		},
		description: Instaprint,
		shortDescription:
			'Allows my POS webapp to directly print the receipt without any confirmation.',
		skills: getSkills('kotlin', 'android'),
		screenshots: [
			{ src: '/logos/instaprint_printing.png', label: 'Printing screen' },
			{ src: '/logos/instaprint_main.png', label: 'Main screen when open on menu' }
		]
	}, {
		name: "Grandma's POS System",
		slug: 'grandmas-pos',
		logo: Assets.GrandmaPOS,
		links: [
			{
				label: 'Live Demo',
				to: 'https://55b60a46-grandma-pos.denver02-james14.workers.dev/',
				newTab: true
			}
		],
		color: '#fbbf24',
		type: 'SvelteKit Web App',
		period: {
			from: new Date('2025-10-30'),
			to: new Date('2026-05-05')
		},
		description: GrandmasPOS,
		shortDescription:
			'A full franchise POS and inventory management system with offline-first support, multi-location stock tracking, and role-based access control — built on Cloudflare Workers and D1.',
		skills: getSkills('sveltekit', 'ts', 'tailwind', 'cloudflare'),
		screenshots: [
			{ src: '/images/projects/grandma-pos/branch-selector.jpg', label: 'Branch Selector' },
			{ src: '/images/projects/grandma-pos/orders/order-screen.jpg', label: 'POS Order Screen' },
			{ src: '/images/projects/grandma-pos/orders/order-details-1.jpg', label: 'Order Details' },
			{ src: '/images/projects/grandma-pos/orders/order-confirmation.jpg', label: 'Order Confirmation' },
			{ src: '/images/projects/grandma-pos/orders/order-details-payment-screen.jpg', label: 'Payment Screen' },
			{ src: '/images/projects/grandma-pos/orders/order-details-payment-verification-screen.jpg', label: 'Payment Verification' },
			{ src: '/images/projects/grandma-pos/orders/order-eta-screen.jpg', label: 'Order ETA' },
			{ src: '/images/projects/grandma-pos/orders/order-preparation-progress-after-approval.jpg', label: 'Preparation Progress' },
			{ src: '/images/projects/grandma-pos/orders/order-pickup-confirmation.jpg', label: 'Pickup Confirmation' },
			{ src: '/images/projects/grandma-pos/orders/order-receive-confirmation.jpg', label: 'Receive Confirmation' },
			{ src: '/images/projects/grandma-pos/orders/order-logs.jpg', label: 'Order Logs' },
			{ src: '/images/projects/grandma-pos/orders/order-chat.jpg', label: 'Order Chat' },
			{ src: '/images/projects/grandma-pos/orders/order-details-2-final-changes.jpg', label: 'Order Final Changes' },
			{ src: '/images/projects/grandma-pos/product-raw-material-management.jpg', label: 'Product & Raw Material Management' },
			{ src: '/images/projects/grandma-pos/multi-tenant-management.jpg', label: 'Multi-Tenant Management' },
			{ src: '/images/projects/grandma-pos/users-management.jpg', label: 'Users Management' },
			{ src: '/images/projects/grandma-pos/users-management-details.jpg', label: 'User Details' },
			{ src: '/images/projects/grandma-pos/role-management.jpg', label: 'Role Management' },
			{ src: '/images/projects/grandma-pos/permissions-management.jpg', label: 'Permissions Management' }
		]
	},
];
export default MY_PROJECTS;
