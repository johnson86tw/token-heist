import type { Dayjs } from 'dayjs'

declare module 'nuxt/schema' {
	// interface RuntimeConfig {
	//   apiSecret: string
	// }
	interface PublicRuntimeConfig {
		origin: string
	}
}
// It is always important to ensure you import/export something when augmenting a type
export {}

export enum Role {
	Spectator,
	Thief,
	Police,
}

export enum Player {
	None,
	Player1,
	Player2,
}

export enum GameState {
	NotStarted,
	RoundOneInProgress,
	RoundTwoInProgress,
	Ended,
}

export type PrizeMap = [number, number, number, number, number, number, number, number, number] | number[]
export type Ambushes = [number, number, number, number, number] | number[]
export type CopUsedCount = number
export type Countdown = Dayjs
