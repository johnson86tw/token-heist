import { v4 as uuidv4 } from 'uuid'
import {
	Channel,
	type ClientSendMsg,
	type CSLobbyCount,
	type CSRoomCount,
} from '@token-heist/backend/src/types/socketTypes'

export let ws: WebSocket
export let clientId: string

export function createWebSocket() {
	clientId = uuidv4()

	try {
		// change to SERVER_URL
		ws = new WebSocket('ws://localhost:8000')

		ws.onopen = () => {
			console.log('Connected to the ws server')

			const route = useRoute()
			switch (route.name) {
				case 'index':
					sendLobbyCount(true)
					break
				case 'game-address':
					const address = route.params.address as string
					if (!address) console.error('No address in route params')
					sendRoomCount(address, true)
					break
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
	const message: ClientSendMsg<CSLobbyCount> = {
		type: Channel.LobbyCount,
		data: {
			clientId,
			enter,
		},
	}
	ws.send(JSON.stringify(message))
}

export function sendRoomCount(roomId: string, enter: boolean) {
	const message: ClientSendMsg<CSRoomCount> = {
		type: Channel.RoomCount,
		data: {
			clientId,
			roomId,
			enter,
		},
	}
	ws.send(JSON.stringify(message))
}
