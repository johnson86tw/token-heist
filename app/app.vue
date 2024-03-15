<script setup lang="ts">
import { darkTheme, NConfigProvider, type GlobalThemeOverrides } from 'naive-ui'
import { createWebSocket } from './core/websocket'
import { getApiUrl } from './config'

const themeOverrides: GlobalThemeOverrides = {
	common: {
		// primaryColor: '#FF0000',
		// hoverColor: '#FF0000',
		// hoverColor: '#FF0000',
	},
	Button: {
		// colorHover: '#FF0000',
		// textColorHover: '#FF0000',
	},
}

if (process.client) {
	createWebSocket()
}

await useFetch(getApiUrl(), {
	server: false,
	retry: 0,
	onResponse({ request, response, options }) {
		if (response._data.message === 'Hello, world!') {
			console.log('Server is up!')
		} else {
			console.log('Server is down!')
		}
	},
})
</script>

<template>
	<n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
		<n-message-provider container-class="">
			<NuxtPage />
		</n-message-provider>
	</n-config-provider>
</template>

<style lang="scss">
// to make the message content wrap, refer to https://www.atatus.com/blog/applying-css-word-wrap-overflow-wrap-word-break/
.n-message > .n-message__content {
	word-wrap: break-word;
	overflow: hidden;
}
</style>
