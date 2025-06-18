import Assets from './data/assets';
import { getSkills } from './skills.params';
import { ContractType, type Experience } from './types';
import kdci from '$lib/md/experiences/kdci.md?raw';
import _413doubledenterprisesopc from '$lib/md/experiences/413doubledenterprisesopc.md?raw';
import mmvmp from '$lib/md/experiences/mmvmp.md?raw';
const MY_EXPERIENCES: Array<Experience> = [
	{
		slug: 'cpo-outlet',
		company: 'CPO Outlet',
		description: kdci,
		contract: ContractType.FullTime,
		type: 'Web development',
		location: 'Home',
		period: { from: new Date('2023-10-23') },
		skills: getSkills('html', 'js', 'css'),
		name: 'Jr Programmer',
		color: '#ffffff',
		links: [
			{ to: 'https://www.cpooutlets.com/', label: 'CPO Outlets', newTab: true },
			{ to: 'https://www.cpopowertools.com/', label: 'CPO Dewalt', newTab: true }
		],
		logo: Assets.CpoOutlets,
		shortDescription: 'Executing promotions on CPO outlets and CPO dewalt website.'
	},
	{
		slug: 'mmvmp',
		company: 'MMVMP (Freelance via Upwork)',
		description: mmvmp,
		contract: ContractType.Freelance,
		type: 'Full-stack Development',
		location: 'Remote · Australia Client',
		period: { from: new Date('2024-04-13') },
		skills: getSkills('sveltekit', 'ts', 'html', 'css', 'cloudflare'),
		name: 'Lead Full-stack Developer',
		color: '#800020',
		links: [],
		logo: Assets.upwork,
		shortDescription:
			'Architected and developed a wine-themed multi-vendor platform using SvelteKit, Cloudflare D1, R2, Stripe, Shopify, and session-based authentication.'
	},
	{
		slug: '413doubledenterprisesopc',
		company: '413 Double D Enterprises OPC',
		description: _413doubledenterprisesopc,
		contract: ContractType.PartTime,
		type: 'Franchise Management & Digital Marketing',
		location: 'Philippines (Remote)',
		period: { from: new Date('2025-03-01') },
		skills: getSkills('MetaAds', 'crm', 'html', 'css'),
		name: 'Franchise Manager / Digital Marketing Associate',
		color: '#fbbf24',
		links: [
			{
				to: 'https://www.facebook.com/doubledbrewmain/',
				label: "Double D' Brew Main",
				newTab: true
			},
			{ to: 'https://www.facebook.com/2xdbrew/', label: 'Franchise Page', newTab: true },
			{
				to: 'https://www.facebook.com/413WorldofFranchisePH2024/',
				label: '413 World of Franchise PH',
				newTab: true
			},
			{
				to: 'https://www.facebook.com/profile.php?id=61562090516118',
				label: "Grandma's Sandwich",
				newTab: true
			}
		],
		logo: Assets._413, // adjust if you have a specific logo asset for 413
		shortDescription:
			'Managing franchise inquiries and digital marketing for Double D Brew and Grandma’s Sandwich under 413 World of Franchise PH.'
	}
];
// ,
// 	{
// 		slug: 'software-freelance',
// 		company: 'Self-employed',
// 		description: 'Creating awesome applications for customers.',
// 		contract: ContractType.Freelance,
// 		type: 'Software Development',
// 		location: 'Home',
// 		period: { from: new Date() },
// 		skills: getSkills('svelte', 'ts', 'sass', 'css', 'html', 'js'),
// 		name: 'Freelancer',
// 		color: '#ffffff',
// 		links: [],
// 		logo: Assets.Unknown,
// 		shortDescription: ''
// 	},
// 	{
// 		slug: 'software-freelance-junior',
// 		company: 'Self-employed',
// 		description: 'Creating awesome applications for customers.',
// 		contract: ContractType.Freelance,
// 		type: 'Software Development',
// 		location: 'Home',
// 		period: { from: new Date(2022, 0, 1), to: new Date() },
// 		skills: getSkills('css', 'html', 'js'),
// 		name: 'Junior Freelancer',
// 		color: '#ffffff',
// 		links: [],
// 		logo: Assets.Unknown,
// 		shortDescription: ''
// 	}
export default MY_EXPERIENCES;
