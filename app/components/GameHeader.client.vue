<script setup lang="ts">
const showTips = ref(false)
</script>

<template>
	<div class="p-3 pb-0 flex justify-between">
		<div>
			<div class="flex items-center gap-1">
				<div>Player 1:</div>
				<Thief width="20" height="20" />
				<n-countdown
					:render="
						({ minutes, seconds }) => {
							return [h('span', [String(minutes)]), ':', h('span', [String(seconds).padStart(2, '0')])]
						}
					"
					:duration="180000"
					:active="true"
				/>
			</div>
			<div class="flex items-center gap-1">
				<div>Player 2:</div>
				<Cop width="18" height="18" />
				<n-countdown
					:render="
						({ minutes, seconds }) => {
							return [h('span', [String(minutes)]), ':', h('span', [String(seconds).padStart(2, '0')])]
						}
					"
					:duration="180000"
					:active="true"
				/>
			</div>
		</div>

		<div class="flex items-center gap-3">
			<Icon
				class="hover:text-teal-300 cursor-pointer"
				size="24"
				name="ic:baseline-library-books"
				@click="showTips = true"
			/>
			<!-- <n-button size="tiny">Share</n-button> -->
			<div class="flex items-center gap-1">
				<Icon size="24" name="ic:round-groups" />
				<p>2</p>
			</div>
		</div>

		<n-drawer v-model:show="showTips" :height="200" placement="top">
			<n-drawer-content title="Tips">
				<ul class="list-disc px-5">
					<li>Each game consists of two rounds, with players taking turns being the thief and the police.</li>
				</ul>
			</n-drawer-content>
		</n-drawer>
	</div>
</template>

<style lang="scss"></style>
