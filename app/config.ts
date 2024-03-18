export function getWebsocketUrl(): string {
	const runtimeConfig = useRuntimeConfig()

	if (process.env.NODE_ENV === 'development') {
		return 'ws://' + runtimeConfig.public.origin
	}
	return 'wss://' + runtimeConfig.public.origin
}

export function getApiUrl(): string {
	const runtimeConfig = useRuntimeConfig()

	if (process.env.NODE_ENV === 'development') {
		return 'http://' + runtimeConfig.public.origin
	}
	return 'https://' + runtimeConfig.public.origin
}

export const RPC_URL = 'https://sepolia-rollup.arbitrum.io/rpc'
// export const RPC_URL = 'https://public.stackup.sh/api/v1/node/arbitrum-sepolia'
// export const RPC_URL = 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public'
export const WS_RPC_URL = 'wss://arb-sepolia.g.alchemy.com/v2/ANLiQeZAwRkyUvxE8oEJX35rJV2QSW1D'
