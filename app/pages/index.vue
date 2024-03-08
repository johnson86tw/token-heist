<script setup lang="ts">
import { io } from 'socket.io-client'
import { v4 as uuidv4 } from 'uuid'

const clientId = uuidv4()

enum WebSocketEvent {
	LobbyCount = 'LobbyCount',
	RoomCount = 'RoomCount',
	Registering = 'Registering',
	OpponentDisconnect = 'OpponentDisconnect',
}

const onlineNum = ref(0)

const socket = io('ws://localhost:8000/lobby')

if (process.client) {
	socket.on('connect', () => {
		socket.emit(WebSocketEvent.LobbyCount, clientId)
	})

	socket.on(WebSocketEvent.LobbyCount, count => {
		onlineNum.value = count
	})

	socket.on('disconnect', () => {
		console.log('disconnected')
	})
}

onUnmounted(() => {
	if (process.client) {
		socket.disconnect()
	}
})
</script>

<template>
	<n-space justify="center" class="p-4">
		<div class="flex flex-col gap-2">
			<p>{{ onlineNum }}</p>
			<n-button>Deploy contracts</n-button>
			<n-button>Copy Invite Link</n-button>
			<n-button @click="navigateTo('/game')">Play</n-button>
		</div>
	</n-space>
</template>

<style lang="scss"></style>
