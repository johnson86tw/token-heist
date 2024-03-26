<script setup lang="ts">
import dayjs from 'dayjs'
import { Player, type Paths } from '~/types'

const GameProps = {
	tokenHeistAddress: '0x1234567890123456789012345678901234567890',
	gameState: 1,
	userRole: 0,
	currentRole: 1,
	paths: [
		[-1, -1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
	] as [number, number][],
	ambushes: [
		[1, 1],
		[2, 1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
	] as [number, number][],
	prizeMap: [1, 2, 1, 2, 3, 4, 3, 5, 4],
	countdown: dayjs().add(30, 'minute'),
	noticed: false,
	isTimeup: false,
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
