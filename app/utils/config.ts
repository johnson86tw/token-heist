export function getWebsocketUrl(): string {
	const runtimeConfig = useRuntimeConfig()

	if (process.env.NODE_ENV === 'development') {
		return 'ws://localhost:3000'
	}

	return 'wss://' + runtimeConfig.public.backendOrigin
}

export function getApiUrl(): string {
	const runtimeConfig = useRuntimeConfig()

	if (process.env.NODE_ENV === 'development') {
		return 'http://localhost:3000'
	}

	return 'https://' + runtimeConfig.public.backendOrigin
}
