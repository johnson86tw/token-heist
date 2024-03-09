import { v4 as uuidv4 } from 'uuid'
import {
	WebSocketChannel,
	type ServerReceivedMessage,
	type LobbyCountServerData,
} from '@token-heist/backend/src/types/socketTypes'

export let ws: WebSocket
export let clientId: string

export function createWebSocket() {
	clientId = uuidv4()

	try {
		ws = new WebSocket('ws://localhost:8000')

		ws.onopen = () => {
			console.log('Connected to the ws server')

			const route = useRoute()

			if (route.path === '/') {
				sendLobbyCount(true)
			}
		}

		ws.onclose = () => {
			console.log('Disconnected from the server')
		}
	} catch (error: any) {
		error = error
		console.error('Failed to connect to the ws server', error)
		return
	}
}

export function sendLobbyCount(enter: boolean) {
	const message: ServerReceivedMessage<LobbyCountServerData> = {
		route: WebSocketChannel.LobbyCount,
		data: {
			clientId,
			enter,
		},
	}
	ws.send(JSON.stringify(message))
}
