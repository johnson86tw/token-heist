import { TokenHeist__factory, type TokenHeist } from '@token-heist/contracts/typechain-types'
import { Wallet } from 'ethers'
import type { Provider } from 'ethers'
import { HDNodeWallet, ethers } from 'ethers'
import { defineStore } from 'pinia'
import { LS_PRIVATE_KEY, RPC_URL, getApiUrl } from '~/config'
import type { Ambushes, CircuitInput, GameState, Paths } from '~/types'
import { exportCallDataBigInt } from '~/utils/zkp'

export let tokenHeist: TokenHeist
export let provider: Provider
export let signer: Wallet

export const useGameStore = defineStore('GameStore', {
	state: (): {
		tokenHeistAddress: string
		gameState: GameState
		player1: string
		player2: string
		paths: Paths
		ambushes: Ambushes
	} => ({
		tokenHeistAddress: '',
		gameState: 0,
		player1: '',
		player2: '',
		paths: [
			[-1, -1],
			[-1, -1],
			[-1, -1],
			[-1, -1],
			[-1, -1],
		],
		ambushes: [
			[-1, -1],
			[-1, -1],
			[-1, -1],
			[-1, -1],
			[-1, -1],
		],
	}),
	getters: {
		lastAmbush(state): [number, number] {
			for (let i = 4; i >= 0; i--) {
				if (state.ambushes[i][0] !== -1 && state.ambushes[i][1] !== -1) {
					return state.ambushes[i]
				}
			}
			return [-1, -1]
		},
	},
	actions: {
		async init(tokenHeistAddress: string) {
			if (!localStorage.getItem(LS_PRIVATE_KEY)) {
				const hdNodeWallet = HDNodeWallet.createRandom()
				localStorage.setItem(LS_PRIVATE_KEY, hdNodeWallet.privateKey)
			}
			const privateKey = localStorage.getItem(LS_PRIVATE_KEY) as string
			provider = new ethers.JsonRpcProvider(RPC_URL)
			signer = new Wallet(privateKey, provider)
			console.log('user', signer.address)
			tokenHeist = TokenHeist__factory.connect(tokenHeistAddress, signer)
			this.tokenHeistAddress = tokenHeistAddress
		},
		async fetchContractData() {
			this.gameState = Number(await tokenHeist.gameState())
			this.player1 = await tokenHeist.player1()
			this.player2 = await tokenHeist.player2()
			const flattenedAmbushes = (await tokenHeist.flattenedAmbushes()).map(x => Number(x))
			this.ambushes = [
				[flattenedAmbushes[0], flattenedAmbushes[1]],
				[flattenedAmbushes[2], flattenedAmbushes[3]],
				[flattenedAmbushes[4], flattenedAmbushes[5]],
				[flattenedAmbushes[6], flattenedAmbushes[7]],
				[flattenedAmbushes[8], flattenedAmbushes[9]],
			]
		},
		async register(n: number) {
			const calldata = await genCalldata({
				tokenHeistAddress: this.tokenHeistAddress,
				provider: provider,
				signer: signer,
				data: tokenHeist.interface.encodeFunctionData('register', [n]),
			})
			await $fetch(getApiUrl() + '/relay', {
				method: 'POST',
				body: calldata,
			})
		},
		async sneak(paths: Paths) {
			const input: CircuitInput = {
				paths: paths,
				ambushes: this.ambushes,
			}
			const { a, b, c, Input } = await exportCallDataBigInt(input)
			const calldata = await genCalldata({
				tokenHeistAddress: this.tokenHeistAddress,
				provider: provider,
				signer: signer,
				data: tokenHeist.interface.encodeFunctionData('sneak', [a, b, c, Input]),
			})
			await $fetch(getApiUrl() + '/relay', {
				method: 'POST',
				body: calldata,
			})
		},
		async dispatch(x: number, y: number) {
			const calldata = await genCalldata({
				tokenHeistAddress: this.tokenHeistAddress,
				provider: provider,
				signer: signer,
				data: tokenHeist.interface.encodeFunctionData('dispatch', [x, y]),
			})
			await $fetch(getApiUrl() + '/relay', {
				method: 'POST',
				body: calldata,
			})
		},
		async reveal() {
			const input: CircuitInput = {
				paths: this.paths,
				ambushes: this.ambushes,
			}
			const { a, b, c, Input } = await exportCallDataBigInt(input)
			const flattenedPaths = flatten(this.paths).map(x => BigInt(x)) as [bigint, bigint, bigint, bigint, bigint]
			const calldata = await genCalldata({
				tokenHeistAddress: this.tokenHeistAddress,
				provider: provider,
				signer: signer,
				data: tokenHeist.interface.encodeFunctionData('reveal', [flattenedPaths, a, b, c, Input]),
			})
			await $fetch(getApiUrl() + '/relay', {
				method: 'POST',
				body: calldata,
			})
		},
	},
})
