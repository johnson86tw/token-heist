<script setup lang="ts">
import { ws, sendLobbyCount } from '~/core/websocket'
import { Channel, type ServerSendMsg, type SSLobbyCount } from '@token-heist/backend/src/types/socketTypes'

const { data } = await useFetch(getApiUrl(), {
	server: true,
})
console.log(data.value)

// ----------------------- feat: lobby online count -----------------------

const lobbyCount = ref(0)

if (process.client) {
	onMounted(() => {
		// In the initial loading of this page, the ws will be in a connecting state, and it can't send messages yet
		// So we sendLobbyCount when the ws is just open and landing on this page, see websocket.ts
		if (ws.readyState === ws.OPEN) {
			sendLobbyCount(true)
		}
	})

	ws.onmessage = event => {
		const msg: ServerSendMsg<SSLobbyCount> = JSON.parse(event.data)
		switch (msg.type) {
			case Channel.LobbyCount:
				lobbyCount.value = msg.data.count
				break
		}
	}

	onUnmounted(() => {
		sendLobbyCount(false)
	})
}
</script>

<template>
	<n-space justify="center" class="p-4">
		<div class="flex flex-col gap-2">
			<p>{{ lobbyCount }}</p>
			<n-button>Deploy contracts</n-button>
			<n-button>Copy Invite Link</n-button>
			<n-button @click="navigateTo('/game/0x95222290dd7278aa3ddd389cc1e1d165cc4bafe5')"> Play </n-button>
		</div>
	</n-space>
</template>

<style lang="scss"></style>
