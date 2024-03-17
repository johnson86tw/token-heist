<script setup lang="ts">
const props = withDefaults(
	defineProps<{
		width?: string
		height?: string
	}>(),
	{
		width: '60',
		height: '60',
	},
)
</script>

<template>
	<div>
		<img class="thief" src="/images/thief.png" :width="width" :height="height" />
		<a style="display: none" href="https://www.pngall.com/money-heist-tv-series-png/download/54638" target="_blank">
			Money Heist Mask PNG Free Image
		</a>
	</div>
</template>

<style lang="scss"></style>
