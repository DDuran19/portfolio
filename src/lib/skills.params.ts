import Assets from './data/assets';
import type { Skill } from './types';
// import svelte from './md/svelte.md?raw';

const s = (skill: Skill) => skill;

export type ArrayElementType<ArrayType extends readonly unknown[]> =
	ArrayType extends readonly (infer ElementType)[] ? ElementType : never;

const MY_SKILLS = [
	s({
		slug: 'svelte',
		color: 'orange',
		description:
			'I have extensive experience with Svelte, a modern JavaScript framework known for its efficiency in building web applications.',
		logo: Assets.Svelte,
		name: 'Svelte'
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
	})
];

export default MY_SKILLS;

export const getSkills = (...slugs: Array<string>): Array<Skill> =>
	MY_SKILLS.filter((it) => slugs.includes(it.slug));
