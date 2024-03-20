<script setup lang="ts">
import { useLoadingBar, useMessage } from 'naive-ui'
import { tokenHeist } from '~/stores/gameStore'
import { Player } from '~/types'

const message = useMessage()
const loadingBar = useLoadingBar()

const route = useRoute()
const address = route.params.address as string
if (!address) {
	navigateTo('/')
}

const player1Score = ref(0)
const player2Score = ref(0)

onMounted(async () => {
	try {
		loadingBar.start()
		player1Score.value = Number(await tokenHeist.scores(0))
		player2Score.value = Number(await tokenHeist.scores(1))
		console.log('player1Score', player1Score.value)
		console.log('player2Score', player2Score.value)
	} catch (err: any) {
		console.error(err)
		message.error(err.message)
	} finally {
		loadingBar.finish()
	}
})

const winner = computed<Player>(() => {
	if (player1Score.value > player2Score.value) {
		return Player.Player1
	} else if (player1Score.value < player2Score.value) {
		return Player.Player2
	} else {
		return Player.None
	}
})
</script>

<template>
	<div class="p-3 pb-0 flex justify-between">
		<n-space justify="center" class="flex-1">
			<NuxtLink to="/">
				<div class="flex flex-col gap-2">
					<n-gradient-text type="primary" class="text-lg text-center"> Token Heist </n-gradient-text>
				</div>
			</NuxtLink>
		</n-space>
	</div>

	<div class="mt-10 p-4 flex flex-col items-center">
		<div class="flex flex-col justify-center gap-2">
			<div class="flex flex-col items-center">
				<p class="title">Game Over</p>
				<p v-if="winner" class="subtitle">Player {{ winner }} wins!</p>

				<div class="mt-5 flex flex-col item-center">
					<p class="text-center">Scores</p>
					<p>Player 1: {{ player1Score }}</p>
					<p>Player 2: {{ player2Score }}</p>
				</div>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
.title {
	@apply text-xl;
}

.subtitle {
	@apply text-lg my-4;
}
</style>
