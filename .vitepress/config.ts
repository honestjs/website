import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
	title: 'HonestJS',
	description: 'A modern TypeScript web framework built on top of Hono',
	sitemap: {
		hostname: 'https://honestjs.dev',
	},
	themeConfig: {
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: 'Home', link: '/' },
			{ text: 'Documentation', link: '/docs/introduction' },
		],

		sidebar: [
			{
				text: 'Getting Started',
				items: [
					{ text: 'Introduction', link: '/docs/introduction' },
					{ text: 'Configuration', link: '/docs/configuration' },
				],
			},
			{
				text: 'Core Concepts',
				items: [
					{ text: 'Dependency Injection', link: '/docs/concepts/dependency-injection' },
					{ text: 'Routing', link: '/docs/concepts/routing' },
					{ text: 'Parameters', link: '/docs/concepts/parameters' },
				],
			},
			{
				text: 'Components',
				items: [
					{ text: 'Middleware', link: '/docs/components/middleware' },
					{ text: 'Guards', link: '/docs/components/guards' },
					{ text: 'Pipes', link: '/docs/components/pipes' },
					{ text: 'Filters', link: '/docs/components/filters' },
				],
			},
			{
				text: 'Features',
				items: [
					{ text: 'Plugins', link: '/docs/features/plugins' },
					{ text: 'MVC', link: '/docs/features/mvc' },
					{ text: 'Helpers', link: '/docs/features/helpers' },
				],
			},
		],

		socialLinks: [{ icon: 'github', link: 'https://github.com/honestjs/website' }],

		footer: {
			message: 'Released under the MIT License.',
			copyright: 'Copyright © 2025-present Orkhan Karimov & HonestJS contributors.',
		},

		editLink: {
			pattern: 'https://github.com/honestjs/website/edit/main/:path',
			text: 'Edit this page on GitHub',
		},

		search: {
			provider: 'local',
		},
	},
})
