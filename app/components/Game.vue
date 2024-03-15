<script setup lang="ts">
import type { Ambushes, CopUsedCount, Countdown, GameState, Noticed, Player, PrizeMap, Role } from '~/types'

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
		noticed: Noticed
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

const description = computed(() => {
	if (props.noticed) return 'The previous cop found the thief nearby, but they may have already left!'
	return ''
})

function to3x3Array(arr: number[]) {
	const res = []
	for (let i = 0; i < 3; i++) {
		res.push(arr.slice(i * 3, i * 3 + 3))
	}
	return res
}

const board = ref(to3x3Array(props.prizeMap))

const thiefPos = ref([-1, -1])

function isRedCells(x: number, y: number) {
	if (!props.noticed) return false

	let lastAmbush
	for (let i = 4; i >= 0; i--) {
		if (props.ambushes[i][0] !== -1 && props.ambushes[i][1] !== -1) {
			lastAmbush = props.ambushes[i]
			break
		}
	}
	if (!lastAmbush) return []

	// find the adjacent cells of the lastAmbush
	const cells = []
	const adjacents = [
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1],
	]
	for (let i = 0; i < 4; i++) {
		const x = lastAmbush[0] + adjacents[i][0]
		const y = lastAmbush[1] + adjacents[i][1]
		if (x >= 0 && x < 3 && y >= 0 && y < 3) {
			cells.push([x, y])
		}
	}

	return cells.some(cell => {
		if (props.ambushes.some(ambush => ambush[0] === cell[0] && ambush[1] === cell[1])) {
			return false
		}
		return cell[0] === x && cell[1] === y
	})
}

// 'text-pink-500' : 'text-blue-400'
</script>

<template>
	<ClientOnly>
		<div v-if="gameState === 1 || gameState === 2" class="game">
			<div class="h-32">
				<p class="title">{{ title }}</p>
				<p class="subtitle">{{ subtitle }}</p>
				<p class="description">{{ description }}</p>
			</div>

			<div class="flex flex-col items-center mb-8">
				<div v-for="(row, y) in board" :key="y" class="flex">
					<div
						v-for="(prize, x) in row"
						:key="x"
						class="relative border border-white w-24 h-24 hover:bg-gray-700 flex items-center justify-center material-icons-outlined text-4xl cursor-pointer"
						:class="isRedCells(x, y) ? 'bg-red-600 bg-opacity-40' : ''"
					>
						<!-- prize map -->
						<p>{{ board[y][x] }}</p>

						<!-- thief -->
						<div v-if="x === thiefPos[0] && y === thiefPos[1]" class="absolute opacity-60">
							<Thief />
						</div>

						<!-- police -->
						<div v-for="(ambush, i) in ambushes" :key="i" class="absolute">
							<div v-if="x === ambush[0] && y === ambush[1]">
								<Cop />
							</div>
						</div>
					</div>
				</div>
			</div>

			<div>
				<Thief />
				<Cop />
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

.description {
	@apply text-base mb-4;
}
</style>
