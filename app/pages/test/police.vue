<script setup lang="ts">
import dayjs from 'dayjs'
import { Player } from '~/types'

const GameProps = {
	gameState: 1,
	role: 2,
	currentRole: 1,
	paths: [
		[-1, -1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
	],
	ambushes: [
		[1, 1],
		[2, 2],
		[0, 1],
		[-1, -1],
		[-1, -1],
	],
	copUsedCount: 2,
	prizeMap: [1, 2, 1, 2, 3, 4, 3, 5, 4],
	countdown: dayjs().add(30, 'minute'),
	winner: Player.Player1,
	noticed: true,
	isTimeup: true,
	loading: false,
	bottomBtnLoading: false,
}
</script>

<template>
	<Game v-bind="GameProps" />
</template>

<style lang="scss"></style>
