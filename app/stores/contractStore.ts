import { TokenHeist__factory, type TokenHeist } from '@token-heist/contracts/typechain-types'
import { Wallet } from 'ethers'
import type { Provider } from 'ethers'
import { HDNodeWallet, ethers } from 'ethers'
import { defineStore } from 'pinia'
import { LS_PRIVATE_KEY, RPC_URL } from '~/config'

export let tokenHeist: TokenHeist
export let provider: Provider
export let signer: Wallet

export const useContractStore = defineStore('ContractStore', {
	state: (): {
		gameState: number
		player1: string
		player2: string
	} => ({
		gameState: 0,
		player1: '',
		player2: '',
	}),
	getters: {},
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
		},
		async fetchContractData() {
			this.gameState = Number(await tokenHeist.gameState())
			this.player1 = await tokenHeist.player1()
			this.player2 = await tokenHeist.player2()
		},
		async sneak() {},
		async reveal() {},
		async dispatch() {},
	},
})
