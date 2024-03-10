export enum Channel {
	LobbyCount = 'LobbyCount',
	RoomCount = 'RoomCount',
	Registering = 'Registering',
	OpponentDisconnect = 'OpponentDisconnect',
	OpponentConnected = 'OpponentConnected',
}

export type ClientSendMsg<T> = {
	type: Channel
	data: T
}

export type CSLobbyCount = {
	clientId: string
	enter: boolean
}

export type CSRoomCount = {
	clientId: string
	roomId: string
	enter: boolean
}

export type ServerSendMsg<T> = {
	type: Channel
	data: T
}

export type SSLobbyCount = {
	count: number
}

export type SSRoomCount = {
	count: number
}
