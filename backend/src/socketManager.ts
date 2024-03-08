import { Server } from 'socket.io'
import { DefaultEventsMap } from 'socket.io/dist/typed-events'
import http from 'http'
import { CLIENT_URL } from './config'

export enum WebSocketEvent {
	LobbyCount = 'LobbyCount',
	RoomCount = 'RoomCount',
	Registering = 'Registering',
	OpponentDisconnect = 'OpponentDisconnect',
}

class SocketManager {
	io: Server<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>

	clientIdSet = new Set<string>()

	constructor(httpServer: http.Server) {
		this.io = new Server(httpServer, {
			cors: {
				origin: CLIENT_URL,
				methods: ['GET', 'POST'],
			},
		})

		this.io.of('/lobby').on('connection', socket => {
			let clientId: string

			socket.on(WebSocketEvent.LobbyCount, _clientId => {
				clientId = _clientId
				this.clientIdSet.add(clientId)
				this.io.of('/lobby').emit(WebSocketEvent.LobbyCount, this.clientIdSet.size)
			})

			socket.on('disconnect', () => {
				this.clientIdSet.delete(clientId)
				this.io.of('/lobby').emit(WebSocketEvent.LobbyCount, this.clientIdSet.size)
			})
		})
	}

	close() {
		this.io.disconnectSockets(true)
		this.io.close(err => {
			console.log('all sockets closed')
		})
	}
}

export function createSocketManager(httpServer: http.Server) {
	socketManager = new SocketManager(httpServer)
}

export let socketManager: SocketManager
