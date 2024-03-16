import { defineStore } from 'pinia'

type AppStore = {}

export const useAppStore = defineStore('AppStore', {
	state: (): AppStore => ({}),
	getters: {},
	actions: {},
})
