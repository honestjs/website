import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
	lang: 'en-US',
	title: 'HonestJS',
	description: 'Fast, minimal, and structured. Hono performance meets Nest architecture for scalable apps.',
	lastUpdated: true,
	cleanUrls: true,
	ignoreDeadLinks: true,
	sitemap: {
		hostname: 'https://honestjs.dev',
	},
	head: [['link', { rel: 'icon', href: '/images/honestjs-resized.png' }]],
	themeConfig: {
		logo: '/images/honestjs-resized.png',
		// https://vitepress.dev/reference/default-theme-config
		nav: [
			{ text: 'Home', link: '/' },
			{ text: 'Documentation', link: '/docs/overview' },
			{
				text: 'Discussions',
				link: 'https://github.com/orgs/honestjs/discussions',
			},
		],

		sidebar: [
			{
				text: 'Introduction',
				items: [
					{ text: 'Overview', link: '/docs/overview' },
					{ text: 'Getting Started', link: '/docs/getting-started' },
					{ text: 'Configuration', link: '/docs/configuration' },
				],
			},
			{
				text: 'Core Concepts',
				items: [
					{ text: 'Dependency Injection', link: '/docs/concepts/dependency-injection' },
					{ text: 'Routing', link: '/docs/concepts/routing' },
					{ text: 'Parameters', link: '/docs/concepts/parameters' },
					{ text: 'Error Handling', link: '/docs/concepts/error-handling' },
				],
			},
			{
				text: 'Components',
				items: [
					{ text: 'Overview', link: '/docs/components/overview' },
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
			{
				text: 'Reference',
				items: [{ text: 'API Reference', link: '/docs/api-reference' }],
			},
			{
				text: 'LLMs',
				collapsed: true,
				items: [
					{
						text: 'Docs List',
						link: '/llms.txt',
					},
					{
						text: 'Full Docs',
						link: '/llms-full.txt',
					},
					{
						text: 'Tiny Docs',
						link: '/llms-small.txt',
					},
				],
			},
		],

		socialLinks: [{ icon: 'github', link: 'https://github.com/honestjs/website' }],

		footer: {
			message: 'Released under the MIT License.',
			copyright: 'Copyright © 2025-present Orkhan Karimov & HonestJS contributors.',
		},

		editLink: {
			pattern: 'https://github.com/honestjs/website/edit/master/:path',
			text: 'Edit this page on GitHub',
		},

		search: {
			provider: 'local',
		},
	},
})
