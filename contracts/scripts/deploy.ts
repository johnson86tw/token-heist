import { ethers, network } from 'hardhat'
import { ERC2771Forwarder__factory, SneakVerifier__factory, TokenHeist__factory } from '../typechain-types'
import fs from 'fs'
import path from 'path'
import { PoseidonT6 } from 'poseidon-solidity'

async function main() {
	const [deployer] = await ethers.getSigners()
	console.log('Deploying contracts with the account:', deployer.address)

	const verifier = await new SneakVerifier__factory(deployer).deploy()
	const verifierAddr = await verifier.getAddress()
	console.log('SneakVerifier deployed to:', verifierAddr)

	// deploy ERC2771Forwarder
	const forwarder = await new ERC2771Forwarder__factory(deployer).deploy('Token Heist')
	const forwarderAddr = await forwarder.getAddress()
	console.log('ERC2771Forwarder deployed to:', forwarderAddr)

	// deploy PoseidonT6
	try {
		if ((await deployer.provider.getCode(PoseidonT6.proxyAddress)) === '0x') {
			console.log('deploying PoseidonT6.proxy')
			// fund the keyless account
			await deployer.sendTransaction({
				to: PoseidonT6.from,
				value: PoseidonT6.gas,
			})

			// then send the presigned transaction deploying the proxy
			await ethers.provider.broadcastTransaction(PoseidonT6.tx)
		}

		// Then deploy the hasher, if needed
		if ((await deployer.provider.getCode(PoseidonT6.address)) === '0x') {
			console.log('deploying PoseidonT6')
			await deployer.sendTransaction({
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

	// deploy TokenHeist
	const prizeMap = [1, 2, 1, 2, 3, 4, 3, 5, 4]
	const timeLimitPerTurn = 180 // 3 minutes
	const timeUpPoints = 20

	const tokenHeist = await new TokenHeist__factory(
		{
			'poseidon-solidity/PoseidonT6.sol:PoseidonT6': PoseidonT6.address,
		},
		deployer,
	).deploy(verifierAddr, forwarderAddr, prizeMap, timeLimitPerTurn, timeUpPoints)

	const tokenHesitAddr = await tokenHeist.getAddress()
	console.log('TokenHeist deployed to:', tokenHesitAddr)

	const addresses = {
		poseidonT6: PoseidonT6.address,
		sneakVerifier: verifierAddr,
		forwarder: forwarderAddr,
		tokenHeist: tokenHesitAddr,
	}

	const deploymentFileName = `${network.name}.json`
	if (!fs.existsSync(path.join(__dirname, '../deployment'))) {
		fs.mkdirSync(path.join(__dirname, '../deployment'))
	}
	fs.writeFileSync(path.join(__dirname, '../deployment', deploymentFileName), JSON.stringify(addresses))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch(error => {
	console.error(error)
	process.exitCode = 1
})
