import { ERC2771Forwarder__factory, TokenHeist__factory } from '@token-heist/contracts/typechain-types'
import type { Wallet } from 'ethers'
import type { Provider } from 'ethers'

type Options = {
	tokenHeistAddress: string
	provider: Provider
	signer: Wallet
	data: string
}

export async function genCalldata(opt: Options) {
	const { tokenHeistAddress, provider, signer, data } = opt
	const tokenHeist = TokenHeist__factory.connect(tokenHeistAddress, signer)
	const forwarderAddress = await tokenHeist.trustedForwarder()

	const domain = {
		name: 'Token Heist',
		version: '1',
		chainId: (await provider.getNetwork()).chainId,
		verifyingContract: forwarderAddress,
	}
	const types = {
		ForwardRequest: [
			{ name: 'from', type: 'address' },
			{ name: 'to', type: 'address' },
			{ name: 'value', type: 'uint256' },
			{ name: 'gas', type: 'uint256' },
			{ name: 'nonce', type: 'uint256' },
			{ name: 'deadline', type: 'uint48' },
			{ name: 'data', type: 'bytes' },
		],
	}

	const forwarder = ERC2771Forwarder__factory.connect(forwarderAddress, signer)

	const value = {
		from: signer.address,
		to: tokenHeistAddress,
		value: 0,
		gas: 1000000,
		nonce: await forwarder.nonces(signer),
		deadline: (await provider.getBlock('latest'))!.timestamp + 60,
		data: data,
	}

	const signature = await signer.signTypedData(domain, types, value)

	return {
		from: value.from,
		to: value.to,
		value: value.value,
		gas: value.gas,
		deadline: value.deadline,
		data: value.data,
		signature,
	}
}
