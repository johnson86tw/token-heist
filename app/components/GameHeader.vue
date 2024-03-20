<script setup lang="ts">
import { Channel, type SSRoomCount, type ServerSendMsg } from '@token-heist/backend/src/types/socketTypes'
import { ws, sendRoomCount } from '~/core/websocket'
import { GameState, Player, Role } from '~/types'

const gameStore = useGameStore()

// Get the contract address from the URL
const route = useRoute()
const address = route.params.address as string
if (!address) {
	navigateTo('/')
}

const showTips = ref(false)

const { player1, player2 } = storeToRefs(useGameStore())

// ----------------------- feat: lobby online count -----------------------

const roomCount = ref(0)

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

// ----------------------- feat: countdown -----------------------
const player1CountdownActive = computed(() => {
	return gameStore.currentPlayerN === Player.Player1
})
const player2CountdownActive = computed(() => {
	return gameStore.currentPlayerN === Player.Player2
})

const { userPlayerN, player1Role, player2Role, gameState } = storeToRefs(gameStore)
</script>

<template>
	<div
		v-if="gameState === GameState.RoundOneInProgress || gameState === GameState.RoundTwoInProgress"
		class="p-3 pb-0 flex justify-between"
	>
		<div>
			<!-- player 1 -->
			<div
				class="flex items-center gap-2"
				:class="{
					'opacity-60': !player1,
				}"
			>
				<div
					:class="{
						'text-teal-300': userPlayerN === 1,
					}"
				>
					Player 1
				</div>
				<Thief v-if="player1Role === Role.Thief" width="18" height="18" />
				<Cop v-if="player1Role === Role.Police" width="16" height="16" />
				<div>
					<n-countdown
						v-if="player1CountdownActive"
						:render="
							({ minutes, seconds }) => {
								return [
									h('span', [String(minutes)]),
									':',
									h('span', [String(seconds).padStart(2, '0')]),
								]
							}
						"
						:duration="180000"
						:active="player1CountdownActive"
					/>
				</div>
			</div>
			<!-- player 2 -->
			<div
				class="flex items-center gap-2"
				:class="{
					'opacity-60': !player2,
				}"
			>
				<div
					:class="{
						'text-teal-300': userPlayerN === 2,
					}"
				>
					Player 2
				</div>
				<Thief v-if="player2Role === Role.Thief" width="18" height="18" />
				<Cop v-if="player2Role === Role.Police" width="16" height="16" />
				<div>
					<n-countdown
						v-if="player2CountdownActive"
						:render="
							({ minutes, seconds }) => {
								return [
									h('span', [String(minutes)]),
									':',
									h('span', [String(seconds).padStart(2, '0')]),
								]
							}
						"
						:duration="180000"
						:active="player2CountdownActive"
					/>
				</div>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<Icon
				class="hover:text-teal-300 cursor-pointer"
				size="24"
				name="ic:baseline-library-books"
				@click="showTips = true"
			/>
			<!-- <n-button size="tiny">Share</n-button> -->
			<div class="flex items-center gap-1">
				<Icon size="24" name="ic:round-groups" />
				<p>{{ roomCount }}</p>
			</div>
		</div>

		<n-drawer v-model:show="showTips" :height="200" placement="top">
			<n-drawer-content title="Tips">
				<ul class="list-disc px-5">
					<li>Each game consists of two rounds, with players taking turns being the thief and the police.</li>
				</ul>
			</n-drawer-content>
		</n-drawer>
	</div>
</template>

<style lang="scss"></style>
