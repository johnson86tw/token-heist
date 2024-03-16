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
	None,
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
export type CopUsedCount = number
export type Countdown = Dayjs
export type Noticed = boolean

export type CircuitInput = {
	paths: [number, number][]
	ambushes: [number, number][]
}

export type Ambushes = CircuitInput['ambushes']
export type Paths = CircuitInput['paths']
