import dotenv from 'dotenv'
import { HardhatUserConfig } from 'hardhat/config'
import '@nomicfoundation/hardhat-ethers'
import '@nomicfoundation/hardhat-toolbox'
import '@nomicfoundation/hardhat-chai-matchers'
import 'hardhat-gas-reporter'

dotenv.config()
const PRIVATE_KEY = process.env.PRIVATE_KEY

const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : []
if (process.env.PRIVATE_KEY_PLAYER_1) {
	accounts.push(process.env.PRIVATE_KEY_PLAYER_1)
}

const config: HardhatUserConfig = {
	solidity: {
		version: '0.8.24',
		settings: {
			optimizer: {
				enabled: true,
				runs: 200,
			},
		},
	},
	gasReporter: {
		enabled: true,
		// currency: 'CHF',
		// gasPrice: 21
	},
	networks: {
		sepolia: {
			url: 'https://rpc.ankr.com/eth_sepolia',
			accounts,
			gasPrice: 3000000000, // deploy TokenHeist 時避免產生 ProviderError: INTERNAL_ERROR: could not replace existing tx
		},
		'arbitrum-sepolia': {
			url: 'https://sepolia-rollup.arbitrum.io/rpc',
			accounts,
		},
	},
}

export default config
