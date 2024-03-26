<script setup lang="ts">
import dayjs from 'dayjs'
import type { Paths } from '~/types'

const GameProps = {
	tokenHeistAddress: '0x1234567890123456789012345678901234567890',
	gameState: 1,
	userRole: 2,
	currentRole: 1,
	ambushes: [
		[1, 1],
		[2, 2],
		[0, 1],
		[-1, -1],
		[-1, -1],
	] as [number, number][],
	prizeMap: [1, 2, 1, 2, 3, 4, 3, 5, 4],
	countdown: dayjs().add(30, 'minute'),
	noticed: true,
	isTimeup: true,
	sneak: async (paths: Paths) => console.log('Sneak'),
	dispatch: async (x: number, y: number) => console.log('Dispatch'),
	reveal: async (paths: Paths, caught?: boolean) => console.log('Reveal'),
}
</script>

<template>
	<ClientOnly>
		<GameInProgress v-bind="GameProps" @reload="() => console.log('Reload')" />
	</ClientOnly>
</template>

<style lang="scss"></style>
