<script setup lang="ts">
import { ws, sendRoomCount } from '~/core/websocket'
import { Channel, type ServerSendMsg, type SSRoomCount } from '@token-heist/backend/src/types/socketTypes'
import { type TokenHeist, TokenHeist__factory } from '@token-heist/contracts/typechain-types'
import { ethers, HDNodeWallet, Wallet } from 'ethers'
import { useMessage } from 'naive-ui'
import { LS_PRIVATE_KEY, RPC_URL } from '~/utils/config'

const route = useRoute()
const address = route.params.address as string
if (!address) {
	navigateTo('/')
}
const message = useMessage()

// ----------------------- feat: contract -----------------------

const gameState = ref(0n)

let tokenHeist: TokenHeist

if (process.client) {
	if (!localStorage.getItem(LS_PRIVATE_KEY)) {
		const hdNodeWallet = HDNodeWallet.createRandom()
		localStorage.setItem(LS_PRIVATE_KEY, hdNodeWallet.privateKey)
	}
	const privateKey = localStorage.getItem(LS_PRIVATE_KEY) as string
	const provider = new ethers.JsonRpcProvider(RPC_URL)
	const signer = new Wallet(privateKey, provider)
	console.log(signer.address)
	tokenHeist = TokenHeist__factory.connect(address, signer)

	const gameState = await tokenHeist.gameState()

	// subscribe to events
	tokenHeist.on(tokenHeist.getEvent('Registered'), (address: string) => {
		console.log('Registered', address)
		message.info(`${address} Registered`)
	})
}

const isRegistering = ref(false)

async function onClickRegister() {
	try {
		isRegistering.value = true
		const tx = await tokenHeist.register(2)
		await tx.wait()
	} catch (err: any) {
		message.error(err.message, {
			closable: true,
			duration: 10000,
		})
	} finally {
		isRegistering.value = false
	}
}

// ----------------------- feat: lobby online count -----------------------

const roomCount = ref(0)

if (process.client) {
	onMounted(() => {
		if (ws.readyState === ws.OPEN) {
			sendRoomCount(address, true)
		}
	})

	ws.onmessage = event => {
		const msg: ServerSendMsg<SSRoomCount> = JSON.parse(event.data)
		switch (msg.type) {
			case Channel.RoomCount:
				roomCount.value = msg.data.count
				break
		}
	}

	onUnmounted(() => {
		sendRoomCount(address, false)
	})
}

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
	<div>
		<div v-if="gameState === 0n">
			<n-space justify="center" class="p-4 mt-52">
				<div class="flex flex-col gap-2">
					<n-button :loading="isRegistering" @click="onClickRegister">Register</n-button>
				</div>
			</n-space>
		</div>

		<div v-if="gameState === 1n" class="pt-8 text-center">
			<NuxtLink to="/">
				<h1 class="mb-8 text-3xl font-bold uppercase">Token Heist</h1>
			</NuxtLink>

			<p>{{ roomCount }}</p>

			<h3 class="text-xl mb-4">Player {{ player }}'s turn</h3>

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

			<div class="text-center">
				<h2 v-if="winner" class="text-6xl font-bold mb-8">Player '{{ winner }}' wins!</h2>
				<button
					@click="ResetGame"
					class="px-4 py-2 bg-pink-500 rounded uppercase font-bold hover:bg-pink-600 duration-300"
				>
					Reset
				</button>
			</div>
		</div>
	</div>
</template>

<style></style>
