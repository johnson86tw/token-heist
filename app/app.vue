<script setup lang="ts">
import { darkTheme, NConfigProvider, type GlobalThemeOverrides } from 'naive-ui'
import { createWebSocket } from './core/websocket'

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

const appStore = useAppStore()

if (process.client) {
	createWebSocket()
}
</script>

<template>
	<n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
		<NuxtPage />
	</n-config-provider>
</template>
