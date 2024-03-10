import WebSocket, { WebSocketServer } from 'ws'
import http from 'http'
import { logger } from '../config'
import { ServerSendMsg, ClientSendMsg, Channel } from '../types/socketTypes'
import { onlineCountHandler, onlineCountOnCloseHandler } from './onlineCount'

/**
 * TODO:
 * - only specific ClientUrl can connect to the websocket server
 */

export let wss: WebSocketServer

export function createWebSocketServer(server: http.Server, allowOrigin: string) {
	wss = new WebSocketServer({ server, host: 'local' })

	wss.on('connection', (ws, req) => {
		const origin = req.headers.origin
		if (origin !== allowOrigin) {
			ws.close(1002, 'Invalid client URL')
		}

		// 什麼情況會發生 error 事件？
		ws.on('error', logger.error)

		let clientId = ''
		let roomId = ''

		ws.on('message', function message(data) {
			let message: ClientSendMsg<any>
			try {
				message = parseMessage(data)
			} catch (err) {
				logger.error(err)
				ws.close(1007, `Invalid message: ${err}`)
				return
			}

			switch (message.type) {
				case Channel.LobbyCount:
					clientId = message.data.clientId
					onlineCountHandler(ws, message)
					break
				case Channel.RoomCount:
					roomId = message.data.roomId
					onlineCountHandler(ws, message)
					break
				case Channel.Registering:
					break
				case Channel.OpponentDisconnect:
					break
				default:
					break
			}

			logger.info(`ws:${clientId}:${roomId}:${JSON.stringify(message)}`)
		})

		ws.on('close', (code, reason) => {
			onlineCountOnCloseHandler(ws, clientId, roomId)
		})
	})
}

function parseMessage(data: WebSocket.RawData) {
	let parsed
	try {
		parsed = JSON.parse(data.toString()) as ClientSendMsg<any>
	} catch (err) {
		throw new Error('Invalid JSON format')
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
