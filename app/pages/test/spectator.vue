<script setup lang="ts">
import dayjs from 'dayjs'
import { Player } from '~/types'

const GameProps = {
	gameState: 1,
	role: 0,
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
}
</script>

<template>
	<GameInProgress v-bind="GameProps" />
</template>

<style lang="scss"></style>
