import Assets from './data/assets';
import { getSkills } from './skills.params';
import { ContractType, type Experience } from './types';
import kdci from '$lib/md/experiences/kdci.md?raw';
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
