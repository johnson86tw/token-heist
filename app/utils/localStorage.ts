import type { Paths } from '~/types'

export const LS_PRIVATE_KEY = 'token-heist-private-key'
export const LS_CLIENT_ID = 'token-heist-client-id'
export const LS_PATHS = 'token-heist-paths'
export const LS_ADDRESSES = 'token-heist-addresses'

// TODO: store LS_PRIVATE_KEY and LS_CLIENT_ID in the same key
export function useLsUser() {}

export function useLsAddresses() {
	const store = useLocalStorage(LS_ADDRESSES, [] as string[])

	function addAddress(address: string) {
		if (store.value.includes(address)) return
		store.value.push(address)
	}

	function removeAddress(address: string) {
		store.value = store.value.filter(a => a !== address)
	}

	return {
		addresses: computed(() => store.value as string[]),
		addAddress,
		removeAddress,
	}
}

export function useLsPaths(address: string) {
	const store = useLocalStorage(LS_PATHS, {
		[address]: [
			[-1, -1],
			[-1, -1],
			[-1, -1],
			[-1, -1],
			[-1, -1],
		],
	})

	function setPaths(newPaths: Paths) {
		store.value[address] = newPaths
	}

	function removePaths(address: string) {
		delete store.value[address]
	}

	return {
		paths: computed(() => store.value[address] as [number, number][]),
		setPaths,
		removePaths,
	}
}
