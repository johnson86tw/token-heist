<script setup lang="ts">
import dayjs from 'dayjs'
import { useMessage } from 'naive-ui'
import { Player } from '~/types'

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

const { gameState } = storeToRefs(contractStore)

const GameProps = {
	gameState: 1,
	role: 1,
	currentRole: 1,
	paths: [
		[-1, -1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
	],
	ambushes: [
		[-1, -1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
	],
	copUsedCount: 0,
	prizeMap: [1, 2, 1, 2, 3, 4, 3, 5, 4],
	countdown: dayjs().add(30, 'minute'),
	winner: Player.Player1,
	noticed: false,
	isTimeup: false,
	loading: false,
	bottomBtnLoading: false,
}
</script>

<template>
	<ClientOnly>
		<GameHeader />
		<Register v-if="gameState === 0" />
		<GameInProgress v-if="gameState === 1 || gameState === 2" v-bind="GameProps" />
		<GameOver v-if="gameState === 3" />
	</ClientOnly>
</template>
