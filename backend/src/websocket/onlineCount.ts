import { broadcast } from './wss'
import {
	WebSocketChannel,
	ServerReceivedMessage,
	LobbyCountClientData,
	RoomCountData,
	LobbyCountServerData,
} from '../types/socketTypes'
import { WebSocket } from 'ws'

export function onlineCountHandler(ws: WebSocket, message: ServerReceivedMessage, store: any) {
	switch (message.route) {
		case WebSocketChannel.LobbyCount:
			handleLobbyCount(ws, message as ServerReceivedMessage<LobbyCountServerData>, store)
			break
		case WebSocketChannel.RoomCount:
			handleRoomCount(ws, message, store)
			break
		default:
			break
	}

	// // TODO: 在這裡監聽，跟在 wss.on('connection', ...) 監聽有什麼不同？會不會造成重複監聽？
	ws.on('close', () => {
		if (store.lobbyCount.has(message.data.clientId)) {
			store.lobbyCount.delete(message.data.clientId)
			broadcast<LobbyCountClientData>({
				route: WebSocketChannel.LobbyCount,
				data: {
					count: store.lobbyCount.size,
				},
			})
		}
		if (store.roomCount.has(message.data.clientId)) {
			store.roomCount.delete(message.data.clientId)
			broadcast<RoomCountData>({
				route: WebSocketChannel.RoomCount,
				data: {
					count: store.roomCount.size,
				},
			})
		}
	})
}

function handleLobbyCount(ws: WebSocket, message: ServerReceivedMessage<LobbyCountServerData>, store: any) {
	if (message.data.enter) {
		store.lobbyCount.add(message.data.clientId)
	} else {
		store.lobbyCount.delete(message.data.clientId)
	}
	broadcast<LobbyCountClientData>({
		route: WebSocketChannel.LobbyCount,
		data: {
			count: store.lobbyCount.size,
		},
	})
}

function handleRoomCount(ws: WebSocket, message: ServerReceivedMessage, store: any) {
	store.roomCount.add(message.data.clientId)
	broadcast<RoomCountData>({
		route: WebSocketChannel.RoomCount,
		data: {
			count: store.roomCount.size,
		},
	})
}
