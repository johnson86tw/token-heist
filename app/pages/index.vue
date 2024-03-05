<script setup lang="ts"></script>

<template>
	<n-space justify="center" class="p-4">
		<div class="flex flex-col gap-2">
			<n-button>Deploy contracts</n-button>
			<n-button>Copy Invite Link</n-button>
			<n-button @click="navigateTo('/game')">Play</n-button>
		</div>
	</n-space>
</template>

<style lang="scss"></style>
