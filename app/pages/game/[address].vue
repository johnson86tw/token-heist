<script setup lang="ts">
import dayjs from 'dayjs'
import { useMessage } from 'naive-ui'
import { tokenHeist } from '~/stores/gameStore'
import { GameState, Player } from '~/types'

const message = useMessage()

// Get the contract address from the URL
const route = useRoute()
const address = route.params.address as string
if (!address) {
	navigateTo('/')
}

const gameStore = useGameStore()

onMounted(async () => {
	await gameStore.init(address)
	await gameStore.fetchContractData()

	// ----------------------- feat: subscribe to events -----------------------

	const RegisterEventSet = new Set<string>()
	// @ts-ignore
	tokenHeist.on('Registered', (address: string, event: ContractEventPayload) => {
		const blockHash = event.log.blockHash
		if (RegisterEventSet.has(blockHash)) return

		message.info(`${address} Registered`)
		RegisterEventSet.add(blockHash)
	})
})

onUnmounted(() => {
	tokenHeist.removeAllListeners()
})

const GameProps = {
	gameState: gameStore.gameState,
	role: gameStore.userIsRole,
	currentRole: gameStore.currentRole,
	paths: [
		[-1, -1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
	] as [number, number][],
	ambushes: [
		[-1, -1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
	] as [number, number][],
	copUsedCount: 0,
	prizeMap: gameStore.prizeMap,
	countdown: dayjs().add(30, 'minute'), // skip temporarily
	noticed: false, // get from sneak event
	isTimeup: false, // skip temporarily
}

const { gameState } = storeToRefs(gameStore)
</script>

<template>
	<ClientOnly>
		<GameHeader />
		<Register v-if="gameState === GameState.NotStarted" />
		<GameInProgress
			v-if="gameState === GameState.RoundOneInProgress || gameState === GameState.RoundTwoInProgress"
			v-bind="GameProps"
		/>
		<GameOver v-if="gameState === GameState.Ended" />
	</ClientOnly>
</template>
