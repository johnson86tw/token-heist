import WebSocket, { WebSocketServer } from 'ws'
import http from 'http'
import { logger } from '../config'
import { ClientReceivedMessage, ServerReceivedMessage, WebSocketChannel } from '../types/socketTypes'
import { onlineCountHandler } from './onlineCount'

/**
 * TODO:
 * - only specific ClientUrl can connect to the websocket server
 */

const store = {
	lobbyCount: new Set<string>(),
	roomCount: new Set<string>(),
}

export let wss: WebSocketServer

export function createWebSocketServer(server: http.Server) {
	wss = new WebSocketServer({ server })

	wss.on('connection', function connection(ws) {
		// 什麼情況會發生 error 事件？
		ws.on('error', logger.error)

		ws.on('message', function message(data) {
			let message: ServerReceivedMessage
			try {
				message = parseMessage(data)
			} catch (err) {
				logger.error(err)
				ws.close()
				return
			}

			const clientId = message.data.clientId
			logger.info(`ws:${clientId}:${JSON.stringify(message)}`)

			switch (message.route) {
				case WebSocketChannel.LobbyCount || WebSocketChannel.RoomCount:
					onlineCountHandler(ws, message, store)
					break
				case WebSocketChannel.Registering:
					break
				case WebSocketChannel.OpponentDisconnect:
					break
				default:
					break
			}
		})

		ws.on('close', () => {})
	})
}

function parseMessage(data: WebSocket.RawData) {
	let parsed
	try {
		parsed = JSON.parse(data.toString()) as ServerReceivedMessage
	} catch (err) {
		throw new Error('Invalid message')
	}

	const route = parsed.route
	if (!Object.values(WebSocketChannel).includes(route)) {
		throw new Error('Invalid route')
	}

	return parsed
}

export function broadcast<T>(msg: ClientReceivedMessage<T>) {
	for (let client of wss.clients) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(msg))
		}
	}
}
