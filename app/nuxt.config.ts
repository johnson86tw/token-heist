import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	runtimeConfig: {
		public: {
			origin: process.env.NODE_ENV === 'production' ? 'token-heist.ddns.net' : 'localhost:8000',
		},
	},
	devtools: { enabled: true },
	modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss', '@vueuse/nuxt'],
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
})
