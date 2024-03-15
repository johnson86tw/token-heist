<script setup lang="ts">
import type { Ambushes, CopUsedCount, Countdown, GameState, PrizeMap, Role } from '~'

const props = withDefaults(
	defineProps<{
		gameState: GameState
		role: Role
		currentRole: Role
		ambushes: Ambushes
		copUsedCount: CopUsedCount
		prizeMap: PrizeMap
		countdown: Countdown
	}>(),
	{},
)
</script>

<template>
	<div>Game</div>
</template>

<style lang="scss"></style>
