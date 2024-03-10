import { broadcast, wss } from './wss'
import { Channel, ClientSendMsg, SSLobbyCount, CSLobbyCount, CSRoomCount } from '../types/socketTypes'
import { WebSocket } from 'ws'
import { logger } from '../config'

const store = {
	lobbyCount: new Set<string>(),
	roomCount: {} as { [key: string]: Set<string> }, // address => clientId set
	roomCountWS: {} as { [key: string]: Set<WebSocket> }, // address => ws set
}

export function onlineCountHandler(ws: WebSocket, message: ClientSendMsg<CSLobbyCount> | ClientSendMsg<CSRoomCount>) {
	switch (message.type) {
		case Channel.LobbyCount:
			handleLobbyCount(ws, message as ClientSendMsg<CSLobbyCount>)
			break
		case Channel.RoomCount:
			handleRoomCount(ws, message as ClientSendMsg<CSRoomCount>)
			break
		default:
			break
	}
}

export function onlineCountOnCloseHandler(ws: WebSocket, clientId: string, roomId: string) {
	// handle lobbyCount on close
	if (store.lobbyCount.has(clientId)) {
		store.lobbyCount.delete(clientId)
		broadcast<SSLobbyCount>({
			type: Channel.LobbyCount,
			data: {
				count: store.lobbyCount.size,
			},
		})
	}

	// handle roomCount on close
	store.roomCount[roomId] = store.roomCount[roomId] || new Set<string>()
	store.roomCountWS[roomId] = store.roomCountWS[roomId] || new Set<WebSocket>()

	if (store.roomCount[roomId].has(clientId)) {
		store.roomCount[roomId].delete(clientId)
	}
	if (store.roomCountWS[roomId].has(ws)) {
		store.roomCountWS[roomId].delete(ws)
	}

	// only broadcast to the clients in the same room
	wss.clients.forEach(client => {
		if (store.roomCountWS[roomId].has(client) && client.readyState === WebSocket.OPEN) {
			client.send(
				JSON.stringify({
					type: Channel.RoomCount,
					data: {
						count: store.roomCount[roomId].size,
					},
				}),
			)
		}
	})
}

function handleLobbyCount(ws: WebSocket, message: ClientSendMsg<CSLobbyCount>) {
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

function handleRoomCount(ws: WebSocket, message: ClientSendMsg<CSRoomCount>) {
	const roomData = message.data as CSRoomCount
	store.roomCount[roomData.roomId] = store.roomCount[roomData.roomId] || new Set<string>()
	store.roomCountWS[roomData.roomId] = store.roomCountWS[roomData.roomId] || new Set<WebSocket>()

	if (roomData.enter) {
		store.roomCount[roomData.roomId].add(roomData.clientId)
		store.roomCountWS[roomData.roomId].add(ws)
	} else {
		store.roomCount[roomData.roomId].delete(roomData.clientId)
		store.roomCountWS[roomData.roomId].delete(ws)
	}

	Object.keys(store.roomCount).forEach(key => {
		logger.info(`roomCount[${key}]: ${store.roomCount[key].size}`)
	})

	// only broadcast to the clients in the same room
	wss.clients.forEach(client => {
		if (store.roomCountWS[roomData.roomId].has(client) && client.readyState === WebSocket.OPEN) {
			client.send(
				JSON.stringify({
					type: Channel.RoomCount,
					data: {
						count: store.roomCount[roomData.roomId].size,
					},
				}),
			)
		}
	})
}
