<script setup lang="ts">
const address = '0xA33C6B2a730a1a70539AFC58aE6d7A6e154dC161'

const { paths, setPaths, removePaths } = useLsPaths(address)

onMounted(() => {
	console.log(paths.value)
})

const newPaths: [number, number][] = [
	[1, 0],
	[1, 1],
	[0, 1],
	[0, 0],
	[0, 1],
]
</script>

<template>
	<div>LocalStorage</div>
	<n-button @click="setPaths(newPaths)">Set</n-button>
	<n-button @click="removePaths('123')">Remove paths</n-button>
</template>

<style lang="scss"></style>
