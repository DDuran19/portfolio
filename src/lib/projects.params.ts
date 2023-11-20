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
