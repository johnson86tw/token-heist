import { Express } from 'express'
import { ethers, Wallet } from 'ethers'
import { TokenHeist__factory } from '@token-heist/contracts/typechain-types'
import { FORWARDER_ADDRESS, logger, PRIVATE_KEY, SNEAK_VERIFIER_SEPOLIA } from '../config'

const POSEIDON_T6_ADDRESS = '0x666333F371685334CdD69bdDdaFBABc87CE7c7Db'

export default (app: Express) => {
	app.post('/deploy/:network', async (req, res) => {
		res.status(400).json({ error: 'This route is temporarily blocked' })
		return

		const { network } = req.params

		if (network !== 'sepolia') {
			res.status(400).json({ error: 'Invalid network' })
			return
		}

		const provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/eth_sepolia')
		const signer = new Wallet(PRIVATE_KEY, provider)

		const prizeMap = [1, 2, 1, 2, 3, 4, 3, 5, 4]
		const timeLimitPerTurn = 180 // 3 minutes
		const timeUpPoints = 20

		const tokenHeist = await new TokenHeist__factory(
			{
				'poseidon-solidity/PoseidonT6.sol:PoseidonT6': POSEIDON_T6_ADDRESS,
			},
			signer,
		).deploy(SNEAK_VERIFIER_SEPOLIA, FORWARDER_ADDRESS, prizeMap, timeLimitPerTurn, timeUpPoints)

		const address = await tokenHeist.getAddress()

		logger.info(`TokenHeist deployed at ${address}`)

		res.json({ address })
	})
}
