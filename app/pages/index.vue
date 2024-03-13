<script setup lang="ts">
import { ws, sendLobbyCount } from '~/core/websocket'
import { Channel, type ServerSendMsg, type SSLobbyCount } from '@token-heist/backend/src/types/socketTypes'

import { useMessage } from 'naive-ui'

const message = useMessage()

setTimeout(() => {
	message.success('Hello, world!')
}, 3000)

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
			<n-button @click="navigateTo('/game/0x202759E34e2B6D057E23F3d9d76220d08A3cCd46')"> Play </n-button>
		</div>
	</n-space>
</template>

<style lang="scss"></style>
