import MY_EXPERIENCES from './experiences.params';
import MY_PROJECTS from './projects.params';
import MY_SKILLS from './skills.params';
import {
	Platform,
	type HomePageParams,
	type ProjectPageParams,
	type ExperiencePageParams,
	type SkillsPageParams,
	type ResumePageParams,
	type SearchPageParams
} from './types';
import { Icons } from './utils';
import resume from '$lib/md/denver-james-duran-resume.pdf';

export const TITLE_SUFFIX = 'Software developer';

export const NavBar = {
	home: 'Home',
	personal: 'Projects',
	career: 'Experiences',
	resume: 'Resume',
	skills: 'Skills'
};

export const getPlatfromIcon = (platform: Platform): Icons => {
	switch (platform) {
		case Platform.GitHub:
			return Icons.GitHub;
		case Platform.Linkedin:
			return Icons.LinkedIn;
		case Platform.StackOverflow:
			return Icons.StackOverflow;
		case Platform.Facebook:
			return Icons.Facebook;
		case Platform.Email:
			return Icons.Email;
		case Platform.Twitter:
			return Icons.Twitter;
		case Platform.Youtube:
			return Icons.Youtube;
	}
};

export const HOME: HomePageParams = {
	title: 'Denver James Duran',
	name: 'Denver James',
	lastName: 'Duran',
	description:
		'Sveltekit fullstack software developer based on the Philippines, only accepting remote work. Able to provide custom solutions to your specific digital problems. Send me an email at <span class="badge">denver02.james14@gmail.com</span>',
	links: [
		{ platform: Platform.GitHub, link: 'https://github.com/DDuran19' },
		{
			platform: Platform.Linkedin,
			link: 'https://Linkedin.com/in/dduran19'
		},
		{
			platform: Platform.Email,
			link: 'inquiries@denvie.online'
		},
		{
			platform: Platform.Facebook,
			link: 'https://www.facebook.com/denver02.james14'
		}
	]
};

export const PROJECTS: ProjectPageParams = {
	title: 'Projects',
	items: MY_PROJECTS
};

export const EXPERIENCES: ExperiencePageParams = {
	title: 'Experiences',
	items: MY_EXPERIENCES
};

export const SKILLS: SkillsPageParams = {
	title: 'Skills',
	items: MY_SKILLS
};

export const RESUME: ResumePageParams = {
	title: 'Resumé',
	item: resume
};

export const SEARCH: SearchPageParams = {
	title: 'Search'
};
