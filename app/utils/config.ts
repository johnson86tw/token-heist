export function getWebsocketUrl(): string {
	const runtimeConfig = useRuntimeConfig()
	return 'ws://' + runtimeConfig.public.apiOrigin
}

export function getApiUrl(): string {
	const runtimeConfig = useRuntimeConfig()
	return 'http://' + runtimeConfig.public.apiOrigin
}
