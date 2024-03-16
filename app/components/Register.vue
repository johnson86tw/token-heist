<script setup lang="ts">
import { useMessage } from 'naive-ui'
import type { Player } from '~/types'

// Get the contract address from the URL
const route = useRoute()
const address = route.params.address as string
if (!address) {
	navigateTo('/')
}

const message = useMessage()

// ----------------------- feat: register -----------------------

const gameStore = useGameStore()
const { player1, player2 } = storeToRefs(gameStore)

const player1Registering = ref(false)
const player2Registering = ref(false)

async function onClickRegister(n: Player.Player1 | Player.Player2) {
	try {
		if (n === 1) player1Registering.value = true
		if (n === 2) player2Registering.value = true
		if (n !== 1 && n !== 2) throw new Error('Invalid player number')
		await gameStore.register(n)
	} catch (err: any) {
		message.error(err.message, {
			closable: true,
			duration: 10000,
		})
		console.error(err)
	} finally {
		if (n === 1) player1Registering.value = false
		if (n === 2) player2Registering.value = false
	}
}
</script>

<template>
	<n-space justify="center" class="p-4 mt-16">
		<div class="flex flex-col gap-4">
			<n-button :loading="player1Registering" :disabled="!!player1" @click="onClickRegister(1)">
				{{ player1 ? 'Player 1 Registered' : 'Register as Player 1' }}
			</n-button>

			<n-button :loading="player2Registering" :disabled="!!player2" @click="onClickRegister(2)">
				{{ player2 ? 'Player 2 Registered' : 'Register as Player 2' }}
			</n-button>
		</div>
	</n-space>
</template>
