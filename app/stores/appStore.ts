import { defineStore } from 'pinia'

type AppStore = {}

export const useAppStore = defineStore('appStore', {
	state: (): AppStore => ({}),
	getters: {},
	actions: {},
})
