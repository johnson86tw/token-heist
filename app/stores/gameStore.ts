import { TokenHeist__factory, type TokenHeist } from '@token-heist/contracts/typechain-types'
import { Wallet, ZeroAddress, isAddress } from 'ethers'
import type { Provider } from 'ethers'
import { HDNodeWallet, ethers } from 'ethers'
import { defineStore } from 'pinia'
import { WS_RPC_URL } from '~/config'
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
		noticed: boolean
		player1Role: Role
		player2Role: Role
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
		noticed: false,
		player1Role: Role.None,
		player2Role: Role.None,
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
		currentPlayerN(): Player {
			return isAddress(this.currentPlayer)
				? this.currentPlayer === this.player1
					? Player.Player1
					: Player.Player2
				: Player.None
		},
	},
	actions: {
		setNoticed(bool: boolean) {
			this.noticed = bool
		},
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
			console.log('gameStore.fetchContractData')
			this.gameState = Number(await tokenHeist.gameState())

			// 先檢查是否已經有 player1, player2，避免每次取資料角色都會變動
			// fix: 不行，會取用到其他場遊戲的 player1, player2
			// 離開 /game/:address 時要清掉 gameStore 的資料
			if (this.player1 === '' || this.player2 === '') {
				const p1Addr = await tokenHeist.player1() // may return 0x0000... if not set
				const p2Addr = await tokenHeist.player2()
				this.player1 = p1Addr === ZeroAddress ? '' : p1Addr
				this.player2 = p2Addr === ZeroAddress ? '' : p2Addr
			}

			this.currentRole = Number(await tokenHeist.currentRole())
			this.currentPlayer = await tokenHeist.currentPlayer()

			if (this.currentPlayer === this.player1) {
				this.player1Role = this.currentRole
				this.player2Role = this.currentRole === Role.Police ? Role.Thief : Role.Police
			} else if (this.currentPlayer === this.player2) {
				this.player2Role = this.currentRole
				this.player1Role = this.currentRole === Role.Police ? Role.Thief : Role.Police
			}

			this.fetched = true

			// 取得最新的 event log，如果是 sneak，檢查有無 noticed，否則 noticed 皆為 false
			// 記得要判斷是否為上一次的 sneak event
			// filter Dispatch event, 有效的 Sneak 的 blockNumber 應該要大於 Dispatch 的 blockNumber
			const sneakEvents = await tokenHeist.queryFilter(tokenHeist.filters.Sneak, -7000)
			const dispatchEvents = await tokenHeist.queryFilter(tokenHeist.filters.Dispatch, -7000)

			if (sneakEvents.length > 0 && dispatchEvents.length > 0) {
				const lastDispatchEvent = dispatchEvents[dispatchEvents.length - 1]
				const lastSneakEvent = sneakEvents[sneakEvents.length - 1]
				if (lastSneakEvent.blockNumber > lastDispatchEvent.blockNumber) {
					const noticed = lastSneakEvent.args[2]
					this.setNoticed(noticed ?? false)
				} else {
					this.setNoticed(false)
				}
			} else {
				this.setNoticed(false)
			}

			// 因為這個會觸發 watch ambushes 然後可能會 reveal，因此等到 state 更新後再 modify ambushes 以免 watch ambushes 時資料還是舊的

			const flattenedAmbushes = (await tokenHeist.flattenedAmbushes()).map(x => Number(x))

			this.ambushes[0] = [flattenedAmbushes[0], flattenedAmbushes[1]]
			this.ambushes[1] = [flattenedAmbushes[2], flattenedAmbushes[3]]
			this.ambushes[2] = [flattenedAmbushes[4], flattenedAmbushes[5]]
			this.ambushes[3] = [flattenedAmbushes[6], flattenedAmbushes[7]]
			this.ambushes[4] = [flattenedAmbushes[8], flattenedAmbushes[9]]
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
			console.log('gameStore.sneak', paths)
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
			console.log('gameStore.dispatch', x, y)
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
		async reveal(paths: Paths, caught: boolean = false) {
			const input: CircuitInput = {
				paths,
				// thief admits defeat by sending a valid proof with valid commitment but invalid ambushes
				ambushes: caught ? Array(5).fill([-1, -1]) : this.ambushes,
			}
			console.log('gameStore.reveal', input.paths, input.ambushes, caught)
			const { a, b, c, Input } = await exportCallDataBigInt(input)
			const flattenedPaths = flatten(paths).map(x => BigInt(x)) as [bigint, bigint, bigint, bigint, bigint]
			const calldata = await genCalldata({
				tokenHeistAddress: this.tokenHeistAddress,
				provider: provider,
				signer: signer,
				data: tokenHeist.interface.encodeFunctionData('reveal', [flattenedPaths, a, b, c, Input, caught]),
			})
			const { httpPost } = useHttp()
			await httpPost('/relay', {
				body: calldata,
			})
		},
		// TODO: timeup
	},
})
