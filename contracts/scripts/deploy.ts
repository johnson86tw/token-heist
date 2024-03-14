import { ethers, network } from 'hardhat'
import { ERC2771Forwarder__factory, SneakVerifier__factory, TokenHeist__factory } from '../typechain-types'
import fs from 'fs'
import path from 'path'

const PoseidonT6Address = '0x666333F371685334CdD69bdDdaFBABc87CE7c7Db'

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

	// deploy TokenHeist
	const prizeMap = [1, 2, 1, 2, 3, 4, 3, 5, 4]
	const timeLimitPerTurn = 180 // 3 minutes
	const timeUpPoints = 20

	const tokenHeist = await new TokenHeist__factory(
		{
			'poseidon-solidity/PoseidonT6.sol:PoseidonT6': PoseidonT6Address,
		},
		deployer,
	).deploy(verifierAddr, forwarderAddr, prizeMap, timeLimitPerTurn, timeUpPoints)

	const tokenHesitAddr = await tokenHeist.getAddress()
	console.log('TokenHeist deployed to:', tokenHesitAddr)

	const addresses = {
		poseidonT6: PoseidonT6Address,
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
