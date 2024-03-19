import { ethers } from 'hardhat'
import { ERC2771Forwarder__factory, TokenHeist__factory } from '../typechain-types'

import { PoseidonT6 } from 'poseidon-solidity'

export async function deployFixture() {
	const [owner, player1, player2] = await ethers.getSigners()

	// deploy SneakVerifier
	const Verifier = await ethers.getContractFactory('SneakVerifier')
	const verifier = await Verifier.deploy()
	const verifierAddr = await verifier.getAddress()

	// deploy PoseidonT6
	try {
		if ((await owner.provider.getCode(PoseidonT6.proxyAddress)) === '0x') {
			console.log('deploying PoseidonT6.proxy')
			// fund the keyless account
			await owner.sendTransaction({
				to: PoseidonT6.from,
				value: PoseidonT6.gas,
			})

			// then send the presigned transaction deploying the proxy
			await ethers.provider.broadcastTransaction(PoseidonT6.tx)
		}

		// Then deploy the hasher, if needed
		if ((await owner.provider.getCode(PoseidonT6.address)) === '0x') {
			console.log('deploying PoseidonT6')
			await owner.sendTransaction({
				to: PoseidonT6.proxyAddress,
				data: PoseidonT6.data,
			})
			console.log('Poseidon deployed to:', PoseidonT6.address)
		} else {
			console.log('PoseidonT6 already deployed to:', PoseidonT6.address)
		}
	} catch (err) {
		console.error('Failed to deploy PoseidonT6:', err)
	}

	// deploy ERC2771Forwarder
	const forwarder = await new ERC2771Forwarder__factory(owner).deploy('Token Heist')
	const forwarderAddr = await forwarder.getAddress()

	// deploy TokenHeist
	const tokenHeistFactory = new TokenHeist__factory(
		{
			'poseidon-solidity/PoseidonT6.sol:PoseidonT6': PoseidonT6.address,
		},
		owner,
	)

	const prizeMap = [1, 2, 1, 2, 3, 4, 3, 5, 4]
	const timeLimitPerTurn = 180 // 3 minutes
	const timeUpPoints = 20

	const tokenHeist = await tokenHeistFactory.deploy(
		verifierAddr,
		forwarderAddr,
		prizeMap,
		timeLimitPerTurn,
		timeUpPoints,
	)
	const tokenHesitAddr = await tokenHeist.getAddress()
	const tokenHeistPlayer1 = tokenHeist.connect(player1)
	const tokenHeistPlayer2 = tokenHeist.connect(player2)

	return {
		provider: owner.provider,
		owner,
		player1,
		player2,
		verifier,
		verifierAddr,
		forwarder,
		forwarderAddr,
		tokenHeist,
		tokenHesitAddr,
		tokenHeistPlayer1,
		tokenHeistPlayer2,
	}
}
