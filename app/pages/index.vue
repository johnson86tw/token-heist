<script setup lang="ts">
const input: CircuitInput = {
	paths: [
		[1, 2],
		[2, 2],
		[2, 1],
		[-1, -1],
		[-1, -1],
	],
	ambushes: [
		[1, 1],
		[1, 2],
		[-1, -1],
		[-1, -1],
		[-1, -1],
	],
}

async function onClickGenerateProof() {
	const { proof, publicSignals } = await genProofAndPublicSignals(input)
	console.log(proof, publicSignals)
}
</script>

<template>
	<div>hi</div>
	<!-- <button @click="onClickGenerateProof">generate proof</button> -->
</template>

<style lang="scss"></style>
