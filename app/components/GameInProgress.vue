<script setup lang="ts">
import { Role, type Ambushes, type Countdown, type GameState, type Noticed, type Paths, type PrizeMap } from '~/types'
import { useMessage } from 'naive-ui'

const message = useMessage()

const props = withDefaults(
	defineProps<{
		tokenHeistAddress: string
		gameState: GameState
		userRole: Role
		currentRole: Role
		ambushes: Ambushes
		prizeMap: PrizeMap
		countdown: Countdown
		noticed: Noticed
		isTimeup: boolean
		sneak: (paths: Paths) => Promise<void>
		dispatch: (x: number, y: number) => Promise<void>
		reveal: (paths: Paths, caught?: boolean) => Promise<void>
	}>(),
	{},
)

const emit = defineEmits<{
	(e: 'reload'): void
}>()

const title = computed(() => {
	switch (props.gameState) {
		case 1:
			return 'Round 1'
		case 2:
			return 'Round 2'
	}
})

const subtitle = computed(() => {
	switch (props.currentRole) {
		case 1:
			return isMyTurn.value ? "It's your turn to steal" : "It's thief's turn"
		case 2:
			return isMyTurn.value ? "It's your turn to catch" : "It's police's turn"
	}
})

// ------------------------------------------ Paths in local storage ------------------------------------------

const { paths, setPaths } = useLsPaths(props.tokenHeistAddress)

// ------------------------------------------ Computed ------------------------------------------

const isSpectator = computed(() => props.userRole === 0)
const isThief = computed(() => props.userRole === 1)
const isPolice = computed(() => props.userRole === 2)
const isPlayer = computed(() => props.userRole === 1 || props.userRole === 2)
const isMyTurn = computed(() => props.currentRole === props.userRole)
const isThiefMyTurn = computed(() => isThief.value && isMyTurn.value)
const isPoliceMyTurn = computed(() => isPolice.value && isMyTurn.value)

const isThiefFirstMove = computed(() => {
	return paths.value.every(path => path[0] === -1 && path[1] === -1)
})

const thiefLastMove = computed(() => findLastValidCell(paths.value))
const policeLastMove = computed(() => findLastValidCell(props.ambushes))

const bottomCopCount = computed(() => {
	let copUsedCount = 5
	for (let i = 4; i >= 0; i--) {
		if (props.ambushes[i][0] !== -1 && props.ambushes[i][1] !== -1) {
			copUsedCount--
		}
	}
	if (isMoved.value) return copUsedCount - 1
	return copUsedCount
})

// ------------------------------------------ Auto Reveal Condition ------------------------------------------

watch(
	() => props.ambushes,
	async () => {
		console.log('watch ambushes', props.ambushes)
		// why this watch will be kept triggering?
		// console.log('watch ambushes')
		if (isThiefMyTurn.value) {
			try {
				if (
					thiefLastMove.value[0] !== -1 &&
					thiefLastMove.value[1] !== -1 &&
					policeLastMove.value[0] === thiefLastMove.value[0] &&
					policeLastMove.value[1] === thiefLastMove.value[1]
				) {
					// 1. thief is caught

					await props.reveal(paths.value, true)
					emit('reload')
				} else if (props.ambushes[4][0] !== -1 && props.ambushes[4][1] !== -1) {
					// 2. ambushes are used up and thief is not caught
					await props.reveal(paths.value)
					emit('reload')
				}
			} catch (err: any) {
				console.error(err)
				message.error(err.message)
			}
		}
	},
	{
		deep: true,
		immediate: true,
	},
)

// ------------------------------------------ Component Validation: check if game state is reasonable ------------------------------------------
// If there are ambushes, there should be paths
if (
	isThief.value &&
	props.ambushes.some(a => a[0] !== -1 && a[1] !== -1) &&
	paths.value.every(p => p[0] === -1 && p[1] === -1)
) {
	console.error('Invalid ambushes and paths', props.ambushes, paths)
	message.error('Invalid ambushes and paths', {
		duration: 0,
	})
}

// ------------------------------------------ Noticed ------------------------------------------

if (isPoliceMyTurn.value && props.noticed) {
	message.info(
		'The previous cop found the thief nearby! Note that they may stay put in the red cell or have already left.',
		{
			closable: true,
			duration: 0,
		},
	)
}

// --------------------- Board ---------------------

const board = ref(to3x3Array(props.prizeMap))

function to3x3Array(arr: number[]) {
	const res = []
	for (let i = 0; i < 3; i++) {
		res.push(arr.slice(i * 3, i * 3 + 3))
	}
	return res
}

function isRedCells(x: number, y: number) {
	if (isThief.value) return false
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
	const moves = [
		[1, 0],
		[0, 1],
		[-1, 0],
		[0, -1],
	]
	for (let i = 0; i < 4; i++) {
		const x = lastAmbush[0] + moves[i][0]
		const y = lastAmbush[1] + moves[i][1]
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

function isClickableCell(x: number, y: number) {
	if (!isPlayer.value) return false
	if (bottomBtnLoading.value) return false

	// Cannot make move if there's already a cop there
	if (props.ambushes.some(ambush => ambush[0] === x && ambush[1] === y)) {
		return false
	}
	// for police's turn
	if (isPoliceMyTurn.value) {
		return true
	}
	// for thief's turn
	if (isThiefMyTurn.value) {
		if (isThiefFirstMove.value) return true
		// thief can stay put or move to adjacent cells
		const moves = [
			[0, 0],
			[1, 0],
			[0, 1],
			[-1, 0],
			[0, -1],
		]
		for (let i = 0; i < 5; i++) {
			const ax = thiefLastMove.value[0] + moves[i][0]
			const ay = thiefLastMove.value[1] + moves[i][1]
			if (ax >= 0 && ax < 3 && ay >= 0 && ay < 3) {
				if (x === ax && y === ay) {
					return true
				}
			}
		}
		return false
	}
	return false
}

function isSelectedCell(x: number, y: number) {
	return placement.value[0] === x && placement.value[1] === y
}

// --------------------- Make move ---------------------

const placementRef = ref()
const placement = ref<[number, number]>([-1, -1])
const isMoved = ref(false)

async function makeMove(x: number, y: number) {
	if (!isPlayer.value) return
	if (!isClickableCell(x, y)) return

	// only thief's first move and police's move
	if (isThiefFirstMove.value || isPoliceMyTurn.value) {
		// Return back if selected cell is the same as the current placement
		if (placement.value[0] === x && placement.value[1] === y) {
			placement.value = [-1, -1]
			isMoved.value = false
			return
		}
	}

	placement.value = [x, y]
	isMoved.value = true

	// await nextTick()
	// console.log(placementRef.value)

	// const { $anime } = useNuxtApp()
	// $anime({
	// 	targets: placementRef.value[0],
	// 	translateY: 180,
	// 	direction: 'reverse',
	// })
}

// --------------------- Bottom button ---------------------
enum Move {
	None = '',
	StayPut = 'stay put',
	Sneak = 'sneak',
	Dispatch = 'dispatch',
	TimeUp = 'time up',
}

const isNotMyTurn = computed(() => isPlayer.value && !isMyTurn.value)
const isThiefStayPut = computed(() => {
	if (
		isThiefMyTurn.value &&
		placement.value[0] !== -1 &&
		placement.value[1] !== -1 &&
		placement.value[0] === thiefLastMove.value[0] &&
		placement.value[1] === thiefLastMove.value[1]
	) {
		return true
	}
	return false
})
const bottomBtnText = computed<Move>(() => {
	if (isThiefStayPut.value) return Move.StayPut
	if (isThiefMyTurn.value && isMoved.value) return Move.Sneak
	if (isPoliceMyTurn.value && isMoved.value) return Move.Dispatch
	if (isNotMyTurn.value && props.isTimeup) {
		return Move.TimeUp
	}
	return Move.None
})
const showBottomBtn = computed(() => {
	return !!bottomBtnText.value
})

const bottomBtnLoading = ref(false)

async function onClickBottomBtn() {
	if (bottomBtnText.value === Move.Sneak || bottomBtnText.value === Move.StayPut) {
		/**
		 * ----------------- Sneak -----------------
		 */
		let newPaths = paths.value.slice()
		console.log('newPaths', newPaths)
		for (let i = 0; i < 5; i++) {
			if (paths.value[i][0] === -1 && paths.value[i][1] === -1) {
				newPaths[i] = toValue(placement.value)
				break
			}
		}
		try {
			bottomBtnLoading.value = true
			await props.sneak(newPaths)

			// Successfull sneak
			setPaths(newPaths)

			console.log('sneak', paths.value)
			emit('reload')
		} catch (err: any) {
			console.error(err)
			message.error(err.message)
		} finally {
			bottomBtnLoading.value = false
			isMoved.value = false
			placement.value = [-1, -1]
		}
	} else if (bottomBtnText.value === Move.Dispatch) {
		/**
		 * ----------------- Dispatch -----------------
		 */

		try {
			bottomBtnLoading.value = true
			await props.dispatch(placement.value[0], placement.value[1])
			console.log('dispatch', placement.value)
			emit('reload')
		} catch (err: any) {
			console.error(err)
			message.error(err.message)
		} finally {
			bottomBtnLoading.value = false
			isMoved.value = false
			placement.value = [-1, -1]
		}
	} else if (bottomBtnText.value === Move.TimeUp) {
		/**
		 * ----------------- Timeup -----------------
		 */
		// TODO: handle timeup
		console.log('timeup')
	}
}

// 'text-pink-500' : 'text-blue-400'
</script>

<template>
	<div class="game-state">
		<div class="h-20">
			<p class="title">{{ title }}</p>
			<p class="subtitle">{{ subtitle }}</p>
		</div>

		<!-- Board -->
		<div class="flex flex-col items-center">
			<div v-for="(row, y) in board" :key="y" class="flex">
				<!-- Cell -->
				<div
					v-for="(prize, x) in row"
					:key="x"
					class="relative border border-white w-20 h-20 flex items-center justify-center text-4xl"
					:class="{
						'bg-red-600 bg-opacity-40': isRedCells(x, y),
						'hover:bg-gray-400 hover:bg-opacity-20 cursor-pointer': isClickableCell(x, y),
						'bg-gray-400 bg-opacity-20': isSelectedCell(x, y) && isPlayer,
						'bg-red-400 bg-opacity-20': isThiefMyTurn && thiefLastMove[0] === x && thiefLastMove[1] === y,
					}"
					@click="makeMove(x, y)"
				>
					<!-- prize map -->
					<p>{{ board[y][x] }}</p>

					<!-- Selected cell -->
					<div ref="placementRef" v-if="isPlayer && isSelectedCell(x, y)" class="absolute">
						<Thief v-if="isThiefMyTurn" class="opacity-60" />
						<Cop v-if="isPoliceMyTurn" />
					</div>

					<!-- thief's last move -->
					<div v-if="isThief && !isThiefFirstMove && !isMoved" class="absolute">
						<Thief v-if="x === thiefLastMove[0] && y === thiefLastMove[1]" class="opacity-60" />
					</div>

					<!-- ambushed cops -->
					<div v-for="(ambush, i) in props.ambushes" :key="i" class="absolute">
						<div v-if="x === ambush[0] && y === ambush[1]">
							<Cop />
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Block below board -->
		<div class="flex flex-col items-center mt-10">
			<div v-if="isThiefMyTurn && isThiefFirstMove && !isMoved">
				<Thief />
			</div>
			<div v-if="!isThief" class="flex">
				<Cop v-for="(_, i) in bottomCopCount" :key="i" />
			</div>
		</div>

		<!-- Bottom button -->
		<n-drawer :show="showBottomBtn" :show-mask="false" :mask-closable="false" :height="55" placement="bottom">
			<n-button class="bottom-btn" :loading="bottomBtnLoading" @click="onClickBottomBtn">
				{{ bottomBtnText }}
			</n-button>
		</n-drawer>
	</div>
</template>

<style lang="scss" scoped>
.game-state {
	@apply pt-8 text-center;
}

.title {
	@apply text-xl;
}

.subtitle {
	@apply text-lg mb-4;
}

.bottom-btn {
	@apply w-full h-full flex justify-center items-center text-xl uppercase bg-teal-700 hover:bg-teal-800 focus:bg-teal-800 cursor-pointer;
}
</style>
