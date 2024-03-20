<script setup lang="ts">
import dayjs from 'dayjs'
import { useLoadingBar, useMessage } from 'naive-ui'
import { tokenHeist } from '~/stores/gameStore'
import { GameState, Role } from '~/types'

const message = useMessage()
const loadingBar = useLoadingBar()

// Get the contract address from the URL
const route = useRoute()
const address = route.params.address as string
if (!address) {
	navigateTo('/')
}
// if address do not in the localStorage, add it
const { addresses, addAddress } = useLsAddresses()
if (!addresses.value.includes(address)) {
	addAddress(address)
}

const gameStore = useGameStore()

onMounted(async () => {
	try {
		// bug: [Vue warn]: Slot "default" invoked outside of the render function https://stackoverflow.com/questions/75803408/how-to-clear-slot-default-invoked-outside-of-the-render-function-warning-vu
		loadingBar.start()
		gameStore.initializeGame(address)
		await gameStore.fetchContractData()
	} catch (err: any) {
		message.error(err.message)
		return
	} finally {
		loadingBar.finish()
	}
})
// ----------------------- Subscribe to events -----------------------
// currentPlayer: for running the watcher in each turn

watch([() => gameStore.fetched, () => gameStore.gameState, () => gameStore.currentPlayer], () => {
	if (!gameStore.fetched) return

	tokenHeist.removeAllListeners()

	if (gameStore.gameState === GameState.NotStarted) {
		console.log('Subscribing to Registered')
		tokenHeist.on(tokenHeist.getEvent('Registered'), (address: string, event: any) => {
			console.log('Event: Registered')
			message.info(`${address} Registered`)
			gameStore.fetchContractData()
		})

		console.log('Subscribing to GameStarted')
		tokenHeist.on(tokenHeist.getEvent('GameStarted'), () => {
			message.info('Game Started!')
			gameStore.fetchContractData()
		})
	} else if (
		gameStore.gameState === GameState.RoundOneInProgress ||
		gameStore.gameState === GameState.RoundTwoInProgress
	) {
		if (gameStore.userRole === Role.Thief && !gameStore.isMyTurn) {
			// if the user is a thief and it's not their turn, subscribe to Dispatch event
			console.log('Subscribing to Dispatch')
			tokenHeist.on(tokenHeist.getEvent('Dispatch'), () => {
				gameStore.fetchContractData()
			})
		} else if (gameStore.userRole === Role.Police && !gameStore.isMyTurn) {
			// if the user is a police and it's not their turn, subscribe to Sneak and Reveal events

			// TODO: No need to subscribe to Sneak when the cops are all used up
			console.log('Subscribing to Sneak')
			tokenHeist.on(tokenHeist.getEvent('Sneak'), () => {
				gameStore.fetchContractData()
			})
			console.log('Subscribing to Reveal')
			tokenHeist.on(tokenHeist.getEvent('Reveal'), () => {
				gameStore.fetchContractData()
			})
		}
	}
})

onUnmounted(() => {
	tokenHeist.removeAllListeners()
})

const { fetched, gameState, userRole, currentRole, ambushes, prizeMap } = storeToRefs(gameStore)

// Ensure that the ref is passed to the object wrapped by reactive to make the props reactive
const GameProps = reactive({
	tokenHeistAddress: address,
	gameState,
	userRole,
	currentRole,
	ambushes,
	prizeMap,
	countdown: dayjs().add(30, 'minute'), // skip temporarily
	noticed: false, // get from sneak event
	isTimeup: false, // skip temporarily
	sneak: gameStore.sneak,
	dispatch: gameStore.dispatch,
	reveal: gameStore.reveal,
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
				@reload="gameStore.fetchContractData"
			/>
			<GameOver v-if="gameState === GameState.Ended" />
		</div>
	</ClientOnly>
</template>
