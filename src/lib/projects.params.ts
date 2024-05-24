import Assets from './data/assets';
import { getSkills } from './skills.params';
import type { Project } from './types';
import MolleyBolley from '$lib/md/projects/MolleyBolley.md?raw';
import SimpleVanillaLogin from '$lib/md/projects/SimpleVanillaLogin.md?raw';
import Instaprint from '$lib/md/projects/Instaprint.md?raw';
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
	}
];
export default MY_PROJECTS;
