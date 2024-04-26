<script setup lang="ts">
import { ws, sendLobbyCount } from '~/core/websocket'
import { Channel, type ServerSendMsg, type SSLobbyCount } from '@token-heist/backend/src/types/socketTypes'

import { useMessage } from 'naive-ui'
import { useHttp } from '~/core/http'
import { useLsAddresses } from '~/utils/localStorage'

const message = useMessage()

const temp = '0xA33C6B2a730a1a70539AFC58aE6d7A6e154dC161'

// ----------------------- feat: lobby online count -----------------------

const lobbyCount = ref(0)

if (process.client) {
	onMounted(() => {
		// In the initial loading of this page, the ws will be in a connecting state, and it can't send messages yet
		// So we sendLobbyCount when the ws is just open and landing on this page, see websocket.ts
		if (ws.readyState === ws.OPEN) {
			sendLobbyCount(true)
		}
	})

	ws.onmessage = event => {
		const msg: ServerSendMsg<SSLobbyCount> = JSON.parse(event.data)
		switch (msg.type) {
			case Channel.LobbyCount:
				lobbyCount.value = msg.data.count
				break
		}
	}

	onUnmounted(() => {
		sendLobbyCount(false)
	})
}

// ----------------------- feat: address list -----------------------
const { addresses, addAddress, removeAddress } = useLsAddresses()
const loading = ref(false)
async function onClickCreateGame() {
	const { httpPost } = useHttp()

	try {
		loading.value = true
		const res = await httpPost<{ address: string }>('/deploy/arbitrum-sepolia')
		addAddress(res.address)
	} catch (error: any) {
		message.error(error.message)
	} finally {
		loading.value = false
	}
}

const showTips = ref(false)

function shortenAddress(address: string) {
	return `${address.slice(0, 6)}...${address.slice(-4)}`
}

const reversedAddresses = computed(() => addresses.value.slice().reverse())
</script>

<template>
	<div>
		<AppBanner id="gitcoin-grants" to="https://explorer.gitcoin.co/#/round/42161/25/98">
			<div class="flex items-center gap-2">
				<Icon name="i-streamline-blood-donate-drop" class="w-5 h-5 flex-shrink-0 pointer-events-none" />
				<span>
					DONATIONS OPEN April 23rd - May 7th | <span class="font-semibold italic">Gitcoin Grants 20</span> is
					live!
				</span>
			</div>
		</AppBanner>

		<div class="p-3 pb-0 flex justify-between">
			<div class="flex-1"></div>
			<!-- header center -->
			<n-space justify="center" class="flex-1">
				<div class="flex flex-col gap-2">
					<n-gradient-text type="primary" class="text-lg text-center"> Token Heist </n-gradient-text>
				</div>
			</n-space>

			<!-- header right -->
			<div class="flex-1 flex justify-end items-center gap-4">
				<Icon
					class="hover:text-teal-300 cursor-pointer"
					size="24"
					name="ic:baseline-library-books"
					@click="showTips = true"
				/>
				<!-- <n-button size="tiny">Share</n-button> -->
				<div class="flex items-center gap-1">
					<Icon size="24" name="ic:round-groups" />
					<p>{{ lobbyCount }}</p>
				</div>

				<!-- Github -->
				<NuxtLink to="https://github.com/johnson86tw/token-heist" target="_blank">
					<Icon class="hover:text-teal-300" name="i-mdi-github" size="24" />
				</NuxtLink>

				<n-drawer v-model:show="showTips" :height="300" placement="top">
					<n-drawer-content title="Tips">
						<Tips />
					</n-drawer-content>
				</n-drawer>
			</div>
		</div>

		<!-- addresses -->
		<ClientOnly>
			<div class="p-4 flex flex-col items-center">
				<div class="mb-5 flex flex-col justify-center gap-2">
					<n-button :loading="loading" @click="onClickCreateGame">Create New Game</n-button>
				</div>

				<div class="mt-5 flex gap-2 items-center" v-for="address in reversedAddresses" :key="address">
					<div>
						{{ shortenAddress(address) }}
					</div>
					<n-button size="tiny" @click="navigateTo(`/game/${address}`)">Enter</n-button>
					<n-button size="tiny" @click="removeAddress(address)">Remove</n-button>
				</div>
			</div>
		</ClientOnly>
	</div>
</template>

<style lang="scss"></style>
