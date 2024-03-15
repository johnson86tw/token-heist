<script setup lang="ts">
import type { Ambushes, CopUsedCount, Countdown, GameState, Player, PrizeMap, Role } from '~/types'

const props = withDefaults(
	defineProps<{
		gameState: GameState
		role: Role
		currentRole: Role
		ambushes: Ambushes
		copUsedCount: CopUsedCount
		prizeMap: PrizeMap
		countdown: Countdown
		winner: Player
	}>(),
	{},
)

const title = computed(() => {
	switch (props.gameState) {
		case 1:
			return 'Round 1'
		case 2:
			return 'Round 2'
		case 3:
			return 'Game Over'
	}
})

const subtitle = computed(() => {
	if (props.gameState === 3) return `Player ${props.winner} wins!`
	switch (props.currentRole) {
		case 1:
			return props.role === 1 ? "It's your turn to steal" : "It's thief's turn"
		case 2:
			return props.role === 2 ? "It's your turn to catch" : "It's police's turn"
	}
})

// ----------------------- feat: tic-tac-toe -----------------------

const player = ref('X')
const board = ref([
	['', '', ''],
	['', '', ''],
	['', '', ''],
])

const CalculateWinner = board => {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	]

	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i]

		if (board[a] && board[a] === board[b] && board[a] === board[c]) {
			return board[a]
		}
	}

	return null
}

const winner = computed(() => CalculateWinner(board.value.flat()))

const MakeMove = (x, y) => {
	if (winner.value) return

	if (board.value[x][y]) return

	board.value[x][y] = player.value

	player.value = player.value === 'X' ? 'O' : 'X'
}

const ResetGame = () => {
	board.value = [
		['', '', ''],
		['', '', ''],
		['', '', ''],
	]
	player.value = 'X'
}
</script>

<template>
	<ClientOnly>
		<div v-if="gameState === 1 || gameState === 2" class="game">
			<p class="title">{{ title }}</p>
			<p class="subtitle">{{ subtitle }}</p>

			<div class="flex flex-col items-center mb-8">
				<div v-for="(row, x) in board" :key="x" class="flex">
					<div
						v-for="(cell, y) in row"
						:key="y"
						@click="MakeMove(x, y)"
						:class="`border border-white w-24 h-24 hover:bg-gray-700 flex items-center justify-center material-icons-outlined text-4xl cursor-pointer ${cell === 'X' ? 'text-pink-500' : 'text-blue-400'}`"
					>
						{{ cell === 'X' ? 'close' : cell === 'O' ? 'circle' : '' }}
					</div>
				</div>
			</div>
		</div>

		<div v-if="gameState === 3" class="game">
			<p class="title">{{ title }}</p>
			<p class="subtitle">{{ subtitle }}</p>
		</div>
	</ClientOnly>
</template>

<style lang="scss" scoped>
.game {
	@apply pt-8 text-center;
}

.title {
	@apply text-xl;
}

.subtitle {
	@apply text-lg mb-4;
}
</style>
