import WebSocket, { WebSocketServer } from 'ws'
import http from 'http'
import { logger } from '../config'
import { ServerSendMsg, ClientSendMsg, Channel } from '../types/socketTypes'
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

export function createWebSocketServer(server: http.Server, allowOrigin: string) {
	wss = new WebSocketServer({ server, host: 'local' })

	wss.on('connection', (ws, req) => {
		const origin = req.headers.origin
		console.log(origin)
		if (origin !== allowOrigin) {
			ws.terminate()
		}

		// 什麼情況會發生 error 事件？
		ws.on('error', logger.error)

		ws.on('message', function message(data) {
			let message: ClientSendMsg<any>
			try {
				message = parseMessage(data)
			} catch (err) {
				logger.error(err)
				ws.close()
				return
			}

			const clientId = message.data.clientId
			logger.info(`ws:${clientId}:${JSON.stringify(message)}`)

			switch (message.type) {
				case Channel.LobbyCount || Channel.RoomCount:
					onlineCountHandler(ws, message, store)
					break
				case Channel.Registering:
					break
				case Channel.OpponentDisconnect:
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
		parsed = JSON.parse(data.toString()) as ClientSendMsg<any>
	} catch (err) {
		throw new Error('Invalid message')
	}

	const type = parsed.type
	if (!Object.values(Channel).includes(type)) {
		throw new Error('Invalid channel type')
	}

	return parsed
}

export function broadcast<T>(msg: ServerSendMsg<T>) {
	for (let client of wss.clients) {
		if (client.readyState === WebSocket.OPEN) {
			client.send(JSON.stringify(msg))
		}
	}
}
