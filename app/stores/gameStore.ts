import { TokenHeist__factory, type TokenHeist } from '@token-heist/contracts/typechain-types'
import { Wallet, ZeroAddress, isAddress } from 'ethers'
import type { Provider } from 'ethers'
import { HDNodeWallet, ethers } from 'ethers'
import { defineStore } from 'pinia'
import { LS_PRIVATE_KEY, RPC_URL, getApiUrl } from '~/config'
import { Role, type Ambushes, type CircuitInput, type GameState, type Paths, Player, type PrizeMap } from '~/types'
import { exportCallDataBigInt } from '~/utils/zkp'

export let tokenHeist: TokenHeist
export let provider: Provider
export let signer: Wallet

export const useGameStore = defineStore('GameStore', {
	state: (): {
		tokenHeistAddress: string
		gameState: GameState
		currentRole: Role
		currentPlayer: Player
		player1: string
		player2: string
		paths: Paths
		ambushes: Ambushes
		prizeMap: PrizeMap
	} => ({
		tokenHeistAddress: '',
		gameState: 0,
		currentRole: Role.None,
		currentPlayer: Player.None,
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
		// temporary not fetch from contract
		prizeMap: [1, 2, 1, 2, 3, 4, 3, 5, 4],
	}),
	getters: {
		userAddress(): string {
			if (!signer) return '' // important!
			return signer.address
		},
		userIsPlayer(): Player {
			switch (this.userAddress) {
				case this.player1:
					return Player.Player1
				case this.player2:
					return Player.Player2
				default:
					return Player.None
			}
		},
		userIsRole(): Role {
			if (!this.userIsPlayer) return Role.None
			if (this.currentPlayer === this.userIsPlayer) {
				return this.currentRole
			} else {
				return this.currentRole === Role.Police ? Role.Thief : Role.Police
			}
		},
		lastPath(): [number, number] {
			return findLastValidCell(this.paths)
		},
		lastAmbush(): [number, number] {
			return findLastValidCell(this.ambushes)
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
			tokenHeist = TokenHeist__factory.connect(tokenHeistAddress, signer)

			if (!provider || !signer || !tokenHeist) {
				throw new Error('Failed to init')
			}

			console.log('user', signer.address)

			this.tokenHeistAddress = tokenHeistAddress
		},
		async fetchContractData() {
			this.gameState = Number(await tokenHeist.gameState())
			const p1Addr = await tokenHeist.player1() // may return 0x0000... if not set
			const p2Addr = await tokenHeist.player2()

			this.player1 = p1Addr === ZeroAddress ? '' : p1Addr
			this.player2 = p2Addr === ZeroAddress ? '' : p2Addr

			const flattenedAmbushes = (await tokenHeist.flattenedAmbushes()).map(x => Number(x))
			this.ambushes = [
				[flattenedAmbushes[0], flattenedAmbushes[1]],
				[flattenedAmbushes[2], flattenedAmbushes[3]],
				[flattenedAmbushes[4], flattenedAmbushes[5]],
				[flattenedAmbushes[6], flattenedAmbushes[7]],
				[flattenedAmbushes[8], flattenedAmbushes[9]],
			]
			this.currentRole = Number(await tokenHeist.currentRole()) as Role
			this.currentPlayer = Number(await tokenHeist.currentPlayer()) as Player
		},
		async register(n: Player.Player1 | Player.Player2) {
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
