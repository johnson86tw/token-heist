import { broadcast } from './wss'
import { Channel, ClientSendMsg, SSLobbyCount, SSRoomCount, CSLobbyCount, CSRoomCount } from '../types/socketTypes'
import { WebSocket } from 'ws'

export function onlineCountHandler(
	ws: WebSocket,
	message: ClientSendMsg<CSLobbyCount> | ClientSendMsg<CSRoomCount>,
	store: any,
) {
	switch (message.type) {
		case Channel.LobbyCount:
			handleLobbyCount(ws, message, store)
			break
		case Channel.RoomCount:
			handleRoomCount(ws, message, store)
			break
		default:
			break
	}

	// // TODO: 在這裡監聽，跟在 wss.on('connection', ...) 監聽有什麼不同？會不會造成重複監聽？
	ws.on('close', () => {
		if (store.lobbyCount.has(message.data.clientId)) {
			store.lobbyCount.delete(message.data.clientId)
			broadcast<SSLobbyCount>({
				type: Channel.LobbyCount,
				data: {
					count: store.lobbyCount.size,
				},
			})
		}
		if (store.roomCount.has(message.data.clientId)) {
			store.roomCount.delete(message.data.clientId)
			broadcast<SSRoomCount>({
				type: Channel.RoomCount,
				data: {
					count: store.roomCount.size,
				},
			})
		}
	})
}

function handleLobbyCount(ws: WebSocket, message: ClientSendMsg<CSLobbyCount>, store: any) {
	if (message.data.enter) {
		store.lobbyCount.add(message.data.clientId)
	} else {
		store.lobbyCount.delete(message.data.clientId)
	}
	broadcast<SSLobbyCount>({
		type: Channel.LobbyCount,
		data: {
			count: store.lobbyCount.size,
		},
	})
}

function handleRoomCount(ws: WebSocket, message: ClientSendMsg<CSRoomCount>, store: any) {
	if (message.data.enter) {
		store.roomCount.add(message.data.clientId)
	} else {
		store.roomCount.delete(message.data.clientId)
	}
	broadcast<SSRoomCount>({
		type: Channel.RoomCount,
		data: {
			count: store.roomCount.size,
		},
	})
}
