import { TokenHeist__factory, type TokenHeist } from '@token-heist/contracts/typechain-types'
import { Wallet, ZeroAddress, isAddress } from 'ethers'
import type { Provider } from 'ethers'
import { HDNodeWallet, ethers } from 'ethers'
import { defineStore } from 'pinia'
import { LS_PRIVATE_KEY, RPC_URL, WS_RPC_URL, getApiUrl } from '~/config'
import { useHttp } from '~/core/http'
import { Role, type Ambushes, type CircuitInput, type GameState, type Paths, Player, type PrizeMap } from '~/types'
import { exportCallDataBigInt } from '~/utils/zkp'

export let tokenHeist: TokenHeist
export let provider: Provider
export let signer: Wallet

export const useGameStore = defineStore('GameStore', {
	state: (): {
		fetched: boolean
		userAddress: string
		tokenHeistAddress: string
		gameState: GameState
		currentRole: Role
		currentPlayer: string
		player1: string
		player2: string
		ambushes: Ambushes
		prizeMap: PrizeMap
	} => ({
		fetched: false, // contract data first fetched
		userAddress: '',
		tokenHeistAddress: '',
		gameState: 0,
		currentRole: Role.None,
		currentPlayer: '',
		player1: '',
		player2: '',
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
		userPlayerN(): Player {
			switch (this.userAddress) {
				case this.player1:
					return Player.Player1
				case this.player2:
					return Player.Player2
				default:
					return Player.None
			}
		},
		userRole(): Role {
			if (this.userPlayerN === Player.None) return Role.None
			if (this.currentPlayer === this.userAddress) {
				return this.currentRole
			}
			return this.currentRole === Role.Police ? Role.Thief : Role.Police
		},
		lastAmbush(): [number, number] {
			return findLastValidCell(this.ambushes)
		},
		isMyTurn(): boolean {
			return this.currentPlayer === this.userAddress
		},
	},
	actions: {
		initializeGame(tokenHeistAddress: string) {
			if (!localStorage.getItem(LS_PRIVATE_KEY)) {
				const hdNodeWallet = HDNodeWallet.createRandom()
				localStorage.setItem(LS_PRIVATE_KEY, hdNodeWallet.privateKey)
			}
			const privateKey = localStorage.getItem(LS_PRIVATE_KEY) as string
			provider = new ethers.WebSocketProvider(WS_RPC_URL)
			signer = new Wallet(privateKey, provider)
			tokenHeist = TokenHeist__factory.connect(tokenHeistAddress, signer)

			if (!provider || !signer || !tokenHeist) {
				throw new Error('Failed to initialize')
			}

			this.userAddress = signer.address
			this.tokenHeistAddress = tokenHeistAddress

			console.log(`%cuser ${signer.address}`, 'color: #90EE90;')
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
			this.currentRole = Number(await tokenHeist.currentRole())
			this.currentPlayer = await tokenHeist.currentPlayer()
			this.fetched = true
		},
		async register(n: Player.Player1 | Player.Player2) {
			const calldata = await genCalldata({
				tokenHeistAddress: this.tokenHeistAddress,
				provider: provider,
				signer: signer,
				data: tokenHeist.interface.encodeFunctionData('register', [n]),
			})

			const { httpPost } = useHttp()
			await httpPost('/relay', {
				body: calldata,
			})
		},
		async sneak(paths: Paths) {
			const input: CircuitInput = {
				paths,
				ambushes: this.ambushes,
			}
			const { a, b, c, Input } = await exportCallDataBigInt(input)
			const calldata = await genCalldata({
				tokenHeistAddress: this.tokenHeistAddress,
				provider: provider,
				signer: signer,
				data: tokenHeist.interface.encodeFunctionData('sneak', [a, b, c, Input]),
			})
			const { httpPost } = useHttp()
			await httpPost('/relay', {
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
			const { httpPost } = useHttp()
			await httpPost('/relay', {
				body: calldata,
			})
		},
		async reveal(paths: Paths) {
			const input: CircuitInput = {
				paths,
				ambushes: this.ambushes,
			}
			const { a, b, c, Input } = await exportCallDataBigInt(input)
			const flattenedPaths = flatten(paths).map(x => BigInt(x)) as [bigint, bigint, bigint, bigint, bigint]
			const calldata = await genCalldata({
				tokenHeistAddress: this.tokenHeistAddress,
				provider: provider,
				signer: signer,
				data: tokenHeist.interface.encodeFunctionData('reveal', [flattenedPaths, a, b, c, Input]),
			})
			const { httpPost } = useHttp()
			await httpPost('/relay', {
				body: calldata,
			})
		},
		// TODO: timeup
	},
})
