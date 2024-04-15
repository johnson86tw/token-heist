import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import packageJSON from './package.json'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			origin: process.env.NODE_ENV === 'production' ? 'token-heist.ddns.net' : 'localhost:8000',
		},
	},
	devtools: { enabled: true },
	modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@vueuse/nuxt', '@nuxt/test-utils/module', 'nuxt-icon'],
	css: ['@/styles/main.scss'],

	// naive-ui: https://www.naiveui.com/en-US/os-theme/docs/ssr
	build: {
		transpile:
			process.env.NODE_ENV === 'production'
				? ['naive-ui', '@css-render/vue3-ssr', '@juggle/resize-observer']
				: ['@juggle/resize-observer'],
	},
	vite: {
		optimizeDeps: {
			include: process.env.NODE_ENV === 'development' ? ['naive-ui'] : [],
		},
		plugins: [
			Components({
				dts: true,
				resolvers: [NaiveUiResolver()], // Automatically register all components in the `components` directory
			}),
		],
	},
	app: {
		// opengraph https://www.opengraph.xyz/url/https%3A%2F%2Ftoken-heist.vercel.app
		head: {
			title: 'Token Heist - A real-time on-chain Board Game',
			meta: [
				{
					charset: 'utf-8',
				},
				{
					name: 'viewport',
					content:
						'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0, viewport-fit=cover',
					// Disable Auto Zoom in Input "Text" tag https://stackoverflow.com/a/13706151/19799243
				},
				{
					name: 'description',
					content: packageJSON.description,
				},
				{
					name: 'author',
					content: packageJSON.author,
				},
				{
					name: 'keywords',
					content:
						'web3,dapp,development,developer,blockchain,vue,vuejs,vue3,nuxt,nuxt3,crypto,typescript,javascript,ethereum,game,board game,real-time',
				},
				// Facebook Meta Tags
				{
					property: 'og:type',
					content: 'website',
				},
				{
					property: 'og:title',
					content: 'Token Heist - A real-time on-chain Board Game',
				},
				{
					property: 'og:description',
					content: packageJSON.description,
				},
				{
					property: 'og:url',
					content: 'https://token-heist.vercel.app/',
				},
				{
					property: 'og:image',
					content: '',
				},

				// Twitter Meta Tags
				{
					name: 'twitter:card',
					content: 'summary_large_image',
				},
				{
					property: 'twitter:domain',
					content: 'token-heist.vercel.app',
				},
				{
					property: 'twitter:url',
					content: 'https://token-heist.vercel.app/',
				},
				{
					name: 'twitter:title',
					content: 'Token Heist - A real-time on-chain Board Game',
				},
				{
					name: 'twitter:description',
					content: packageJSON.description,
				},
				{
					name: 'twitter:image',
					content: '',
				},
			],
			link: [{ rel: 'icon', href: '/favicon.ico' }],
		},
	},
})
