import Assets from './data/assets';
import { getSkills } from './skills.params';
import type { Project } from './types';
import MolleyBolley from '$lib/md/MolleyBolley.md?raw';

const MY_PROJECTS: Array<Project> = [
	{
		slug: 'molley-bolley',
		color: '#5e95e3',
		description: MolleyBolley,
		shortDescription:
			'It features an intuitive minimalist UI backed with SQL database under the hood. This is a solo project which is coded using Python.',
		links: [
			{ to: 'https://github.com/DDuran19/MolleyBolley', label: 'GitHub', newTab: true },
			{ to: 'https://dduran19.github.io/MolleyBolley/', label: 'More info', newTab: true }
		],
		logo: Assets.Unknown,
		name: 'Molley Bolley',
		period: {
			from: new Date('2023-05-30'),
			to: new Date('2023-08-01')
		},
		skills: getSkills('python', 'html'),
		type: 'Salon Queueing and Sales Tracking System'
	}
];
// ,
// 	{
// 		slug: 'slick-portfolio-svelte',
// 		color: '#ff3e00',
// 		description:
// 			'A Vercel-like developer portfolio website template made with Typescript and SvelteKit.',
// 		shortDescription:
// 			'A Vercel-like developer portfolio website template made with Typescript and SvelteKit.',
// 		links: [{ to: 'https://github.com/RiadhAdrani/slick-portfolio-svelte', label: 'GitHub' }],
// 		logo: Assets.Svelte,
// 		name: 'Slick Portfolio',
// 		period: {
// 			from: new Date()
// 		},
// 		skills: getSkills('svelte', 'ts', 'tailwind', 'sass'),
// 		type: 'Website Template',
// 		screenshots: [
// 			{
// 				label: 'screen 1',
// 				src: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZ3JhbW1pbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60'
// 			},
// 			{
// 				label: '2',
// 				src: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8cHJvZ3JhbW1pbmd8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=500&q=60'
// 			},
// 			{
// 				label: '3',
// 				src: 'https://images.unsplash.com/photo-1537432376769-00f5c2f4c8d2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTB8fHByb2dyYW1taW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
// 			},
// 			{
// 				label: '4',
// 				src: 'https://images.unsplash.com/photo-1542903660-eedba2cda473?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHByb2dyYW1taW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
// 			},
// 			{
// 				label: '5',
// 				src: 'https://images.unsplash.com/photo-1619410283995-43d9134e7656?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHByb2dyYW1taW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
// 			},
// 			{
// 				label: '6',
// 				src: 'https://images.unsplash.com/photo-1585079542156-2755d9c8a094?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTd8fHByb2dyYW1taW5nfGVufDB8fDB8fHww&auto=format&fit=crop&w=500&q=60'
// 			}
// 		]
// 	}
export default MY_PROJECTS;
