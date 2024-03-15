<script setup lang="ts">
import { ws, sendRoomCount } from '~/core/websocket'
import { Channel, type ServerSendMsg, type SSRoomCount } from '@token-heist/backend/src/types/socketTypes'
import { type TokenHeist, TokenHeist__factory } from '@token-heist/contracts/typechain-types'
import { ethers, HDNodeWallet, Wallet } from 'ethers'
import { useMessage } from 'naive-ui'
import { LS_PRIVATE_KEY, RPC_URL, getApiUrl } from '~/config'
import { genCalldata } from '~/utils/relay'
import type { Provider } from 'ethers'
import type { ContractEventPayload } from 'ethers'

const route = useRoute()
const address = route.params.address as string
if (!address) {
	navigateTo('/')
}
const message = useMessage()

// ----------------------- feat: contract -----------------------

const gameState = ref(0n)

let tokenHeist: TokenHeist
let provider: Provider
let signer: Wallet

if (process.client) {
	if (!localStorage.getItem(LS_PRIVATE_KEY)) {
		const hdNodeWallet = HDNodeWallet.createRandom()
		localStorage.setItem(LS_PRIVATE_KEY, hdNodeWallet.privateKey)
	}
	const privateKey = localStorage.getItem(LS_PRIVATE_KEY) as string
	provider = new ethers.JsonRpcProvider(RPC_URL)
	signer = new Wallet(privateKey, provider)
	console.log('user', signer.address)
	tokenHeist = TokenHeist__factory.connect(address, signer)

	gameState.value = await tokenHeist.gameState()
	const player1 = await tokenHeist.player1()
	const player2 = await tokenHeist.player2()
	console.log('player1', player1)
	console.log('player2', player2)

	// subscribe to events
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
}

// ----------------------- feat: register -----------------------

const player1Registering = ref(false)
const player2Registering = ref(false)

async function register(n: number) {
	const calldata = await genCalldata({
		tokenHeistAddress: address,
		provider: provider,
		signer: signer,
		data: tokenHeist.interface.encodeFunctionData('register', [n]),
	})
	await $fetch(getApiUrl() + '/relay', {
		method: 'POST',
		body: calldata,
	})
}

async function onClickRegister(n: number) {
	try {
		if (n === 1) player1Registering.value = true
		if (n === 2) player2Registering.value = true
		if (n !== 1 && n !== 2) throw new Error('Invalid player number')
		await register(n)
	} catch (err: any) {
		message.error(err.message, {
			closable: true,
			duration: 10000,
		})
		console.error(err)
	} finally {
		if (n === 1) player1Registering.value = false
		if (n === 2) player2Registering.value = false
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
</script>

<template>
	<ClientOnly>
		<div v-if="gameState === 0n">
			<n-space justify="center" class="p-4 mt-52">
				<div class="flex flex-col gap-2">
					<n-button :loading="player1Registering" @click="onClickRegister(1)">Register Player 1</n-button>
					<n-button :loading="player2Registering" @click="onClickRegister(2)">Register Player 2</n-button>
				</div>
			</n-space>
		</div>
	</ClientOnly>
</template>
