<script setup lang="ts">
import dayjs from 'dayjs'

const GameProps = {
	gameState: 1,
	role: 1,
	currentRole: 1,
	ambushes: [-1, -1, -1, -1, -1],
	copUsedCount: 1,
	prizeMap: [1, 2, 1, 2, 3, 4, 3, 5, 4],
	countdown: dayjs().add(30, 'minute'),
}
</script>

<template>
	<div>
		<Game v-bind="GameProps" />
	</div>
</template>

<style lang="scss"></style>
