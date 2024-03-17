<script setup lang="ts">
import dayjs from 'dayjs'
import type { ContractEventPayload } from 'ethers'
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
	try {
		gameStore.init(address)
		await gameStore.fetchContractData()
	} catch (err: any) {
		message.error(err.message)
		return
	}
})
// ----------------------- feat: subscribe to events -----------------------

watch([() => gameStore.gameState], () => {
	console.log('watching initialized and gameState')
	if (gameStore.gameState === GameState.NotStarted) {
		const RegisterEventSet = new Set<string>()

		// tokenHeist.on(tokenHeist.getEvent('Registered'), (address: string, event: any) => {
		// 	console.log('Registered')
		// 	const blockHash = event.log.blockHash
		// 	if (RegisterEventSet.has(blockHash)) return
		// 	RegisterEventSet.add(blockHash)

		// 	message.info(`${address} Registered`)
		// 	gameStore.fetchContractData()
		// })

		// tokenHeist.on(tokenHeist.getEvent('GameStarted'), () => {
		// 	message.info('Game Started!')
		// 	gameStore.fetchContractData()
		// })
	}
})

onUnmounted(() => {
	tokenHeist.removeAllListeners()
})

const { fetched, gameState, userRole, currentRole, paths, ambushes, prizeMap } = storeToRefs(gameStore)

// Ensure that the ref is passed to the object wrapped by reactive to make the props reactive
const GameProps = reactive({
	gameState,
	userRole,
	currentRole,
	paths,
	ambushes,
	prizeMap,
	countdown: dayjs().add(30, 'minute'), // skip temporarily
	noticed: false, // get from sneak event
	isTimeup: false, // skip temporarily
})
</script>

<template>
	<ClientOnly>
		<GameHeader />
		<div v-if="fetched">
			<Register v-if="gameState === GameState.NotStarted" />
			<GameInProgress
				v-if="gameState === GameState.RoundOneInProgress || gameState === GameState.RoundTwoInProgress"
				v-bind="GameProps"
			/>
			<GameOver v-if="gameState === GameState.Ended" />
		</div>
	</ClientOnly>
</template>
