export enum WebSocketChannel {
	LobbyCount = 'LobbyCount',
	RoomCount = 'RoomCount',
	Registering = 'Registering',
	OpponentDisconnect = 'OpponentDisconnect',
}

export type ServerReceivedMessage<T = {}> = {
	route: WebSocketChannel
	data: {
		clientId: string
	} & T
}

export type LobbyCountServerData = {
	enter: boolean
}

export type ClientReceivedMessage<T = {}> = {
	route: WebSocketChannel
	data: T
}

export type LobbyCountClientData = {
	count: number
}

export type RoomCountData = {
	count: number
}
