<script setup lang="ts">
import dayjs from 'dayjs'
import { useMessage } from 'naive-ui'
import { GameState, Player } from '~/types'

const message = useMessage()

// Get the contract address from the URL
const route = useRoute()
const address = route.params.address as string
if (!address) {
	navigateTo('/')
}

const contractStore = useGameStore()
onMounted(async () => {
	await contractStore.init(address)
	await contractStore.fetchContractData()
})

// ----------------------- feat: subscribe to events -----------------------
const { gameState, currentRole, userIsRole, prizeMap } = storeToRefs(contractStore)

const RegisterEventSet = new Set<string>()
// @ts-ignore
tokenHeist.on('Registered', (address: string, event: ContractEventPayload) => {
	const blockHash = event.log.blockHash
	if (RegisterEventSet.has(blockHash)) return

	message.info(`${address} Registered`)
	RegisterEventSet.add(blockHash)
})

onUnmounted(() => {
	tokenHeist.removeAllListeners()
})

const GameProps = {
	gameState: gameState.value,
	role: userIsRole.value,
	currentRole: currentRole.value,
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
	prizeMap: prizeMap.value,
	countdown: dayjs().add(30, 'minute'), // skip temporarily
	noticed: false, // get from sneak event
	isTimeup: false, // skip temporarily
}
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
