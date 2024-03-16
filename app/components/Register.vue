<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { getApiUrl } from '~/config'
import { genCalldata } from '~/utils/relay'
import type { ContractEventPayload } from 'ethers'

// Get the contract address from the URL
const route = useRoute()
const address = route.params.address as string
if (!address) {
	navigateTo('/')
}

const message = useMessage()

// ----------------------- feat: contract -----------------------

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

// ----------------------- feat: register -----------------------

const player1Registering = ref(false)
const player2Registering = ref(false)

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
</script>

<template>
	<n-space justify="center" class="p-4 mt-16">
		<div class="flex flex-col gap-4">
			<n-button :loading="player1Registering" @click="onClickRegister(1)">Register as Player 1</n-button>
			<n-button :loading="player2Registering" @click="onClickRegister(2)">Register as Player 2</n-button>
		</div>
	</n-space>
</template>
