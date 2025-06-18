import Assets from './data/assets';
import type { Skill } from './types';
// import svelte from './md/svelte.md?raw';

const s = (skill: Skill) => skill;

export type ArrayElementType<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

const MY_SKILLS = [
	s({
		slug: 'sveltekit',
		color: 'orange',
		description:
			'With a year of experience in SvelteKit, I have developed complex applications such as a comprehensive POS system. My expertise includes building modern, high-performance web apps with a focus on scalability and maintainability.',
		logo: Assets.Svelte,
		name: 'SvelteKit'
	}),
	s({
		slug: 'ts',
		color: 'blue',
		description: 'I have experience with TypeScript, enhancing JavaScript code with static typing.',
		logo: Assets.TypeScript,
		name: 'Typescript'
	}),
	s({
		slug: 'python',
		color: 'blue',
		description: 'I can use Python for web development, data analysis, and scripting.',
		logo: Assets.Python,
		name: 'Python'
	}),
	s({
		slug: 'js',
		color: 'yellow',
		description: 'I am skilled in JavaScript and can create interactive web applications.',
		logo: Assets.JavaScript,
		name: 'Javascript'
	}),
	s({
		slug: 'css',
		color: 'blue',
		description: 'I have expertise in CSS for styling web pages and creating responsive designs.',
		logo: Assets.CSS,
		name: 'CSS'
	}),
	s({
		slug: 'tailwind',
		color: 'lightblue',
		description:
			'I possess expertise in Tailwind CSS, a utility-first CSS framework. With Tailwind CSS, I can rapidly construct custom-designed web interfaces, optimizing both aesthetics and functionality.',
		logo: Assets.Tailwind,
		name: 'Tailwind'
	}),
	s({
		slug: 'html',
		color: 'orange',
		description:
			'I am proficient with HTML and can create various static web pages out of pure HTML.',
		logo: Assets.HTML,
		name: 'HTML'
	}),
	s({
		slug: 'reactjs',
		color: 'cyan',
		description:
			'I am highly proficient in React, a widely-used library for creating user interfaces. I can efficiently develop complex UIs and manage state in React applications.',
		logo: Assets.ReactJs,
		name: 'React Js'
	}),
	s({
		slug: 'nodejs',
		color: 'green',
		description: 'I have experience with Node.js, a server-side JavaScript runtime.',
		logo: Assets.NodeJs,
		name: 'Node Js'
	}),
	s({
		slug: 'android',
		color: 'green',
		description:
			'I have minimal experience with Android development. I used kotlin once on my instaprint app which is a complementary app to enable fast printing for my webapp',
		logo: Assets.Android,
		name: 'Android'
	}),
	s({
		slug: 'daisyui',
		color: '#ff66cc', // Adjust color as needed
		description:
			'I have experience using DaisyUI for styling SvelteKit applications, creating modern and consistent user interfaces with ease.',
		logo: Assets.DaisyUI,
		name: 'DaisyUI'
	}),
	s({
		slug: 'cloudflare',
		color: '#f38020', // Adjust color as needed
		description:
			'I have utilized Cloudflare Workers for handling serverless functions, enhancing performance and scalability of web applications.',
		logo: Assets.Cloudflare, // Replace with the actual asset reference
		name: 'Cloudflare'
	}),
	s({
		slug: 'pwa',
		color: '#5a0fc8', // Adjust color as needed
		description:
			'I have configured Progressive Web Apps (PWAs) for seamless installation on both iOS and Android devices, improving accessibility and user experience.',
		logo: Assets.PWA, // Replace with the actual asset reference
		name: 'PWA'
	}),
	s({
		slug: 'crm',
		color: '#00bcd4',
		description:
			'I manage customer relationships and franchise leads using CRM tools and Meta inboxes. My focus is on lead nurturing, status tracking, and supporting conversion flows through chat and funnel management.',
		logo: Assets.CRM, // Use the CRM icon you generated or named accordingly
		name: 'CRM'
	}),
	s({
		slug: 'metaads',
		color: '#1877f2',
		description:
			'I run Meta Ads campaigns for multiple franchise brands. This includes ad set creation, targeting setup, budget optimization, and monitoring performance across lead generation and awareness campaigns.',
		logo: Assets.MetaAds, // Use the ads management icon you generated or assign a proper key
		name: 'Meta Ads Management'
	})
];

export default MY_SKILLS;

export const getSkills = (...slugs: Array<string>): Array<Skill> =>
	MY_SKILLS.filter((it) => slugs.includes(it.slug));
