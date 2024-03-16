<script setup lang="ts">
// const props = withDefaults(
// 	defineProps<{
// 		winner: Player
// 	}>(),
// 	{},
// )
// const subtitle = 'Player ${props.winner} wins!'
</script>

<template>
	<div class="game-state">
		<p class="title">Game Over</p>
		<p class="subtitle">Player 1 wins!</p>
	</div>
</template>

<style lang="scss">
.title {
	@apply text-xl;
}

.subtitle {
	@apply text-lg mb-4;
}
</style>
