import { Express } from 'express'
import { ethers, Wallet } from 'ethers'
import { ERC2771Forwarder, ERC2771Forwarder__factory } from '@token-heist/contracts/typechain-types'
import { FORWARDER_ADDRESS, logger, PRIVATE_KEY, RPC_URL } from '../config'

type ReqData = ERC2771Forwarder.ForwardRequestDataStruct

export default (app: Express) => {
	app.post('/relay', async (req, res) => {
		const { from, to, value, gas, deadline, data, signature } = req.body as ReqData

		if (!from || !to || value === undefined || !gas || !deadline || !data || !signature) {
			return res.status(400).json({ error: 'Invalid request' })
		}

		const calldata = {
			from,
			to,
			value,
			gas,
			deadline,
			data,
			signature,
		}

		logger.debug(`relay calldata: ${JSON.stringify(calldata)}`)

		const provider = new ethers.JsonRpcProvider(RPC_URL)
		const signer = new Wallet(PRIVATE_KEY, provider)

		const forwarder = ERC2771Forwarder__factory.connect(FORWARDER_ADDRESS, signer)

		try {
			const verified = await forwarder.verify(calldata)
			if (!verified) {
				throw new Error('Invalid signature')
			}

			const tx = await forwarder.execute(calldata)
			await tx.wait()

			logger.info(`Relayed tx ${tx.hash}`)
			res.json({ txHash: tx.hash })
		} catch (err: any) {
			logger.error(`Relay error: ${err.message}`)
			return res.status(500).json({ error: err.message })
		}
	})
}
