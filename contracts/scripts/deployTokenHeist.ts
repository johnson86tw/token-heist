import { ethers, network } from 'hardhat'
import { TokenHeist__factory } from '../typechain-types'
import fs from 'fs'
import path from 'path'
import { version } from '../package.json'

// Note that you should have the deployment file of the network before running this script

async function main() {
	const [deployer] = await ethers.getSigners()
	console.log('Deployer:', deployer.address)

	// Read addresses from deployment file

	const deploymentFileName = `${network.name}.json`
	const deploymentFilePath = path.join(__dirname, '../deployment', deploymentFileName)
	if (!fs.existsSync(deploymentFilePath)) {
		throw new Error('Deployment file not found')
	}
	const deploymentFile = fs.readFileSync(deploymentFilePath, 'utf-8')
	const deployment = JSON.parse(deploymentFile)

	const poseidonT6Address = deployment.poseidonT6
	const verifierAddress = deployment.sneakVerifier
	const forwarderAddress = deployment.forwarder

	// Deploy TokenHeist

	const prizeMap = [1, 2, 1, 2, 3, 4, 3, 5, 4]
	const timeLimitPerTurn = 180 // 3 minutes
	const timeUpPoints = 20

	const tokenHeist = await new TokenHeist__factory(
		{
			'poseidon-solidity/PoseidonT6.sol:PoseidonT6': poseidonT6Address,
		},
		deployer,
	).deploy(verifierAddress, forwarderAddress, prizeMap, timeLimitPerTurn, timeUpPoints)

	const tokenHesitAddr = await tokenHeist.getAddress()
	console.log('TokenHeist deployed to:', tokenHesitAddr)

	const addresses = {
		poseidonT6: poseidonT6Address,
		sneakVerifier: verifierAddress,
		forwarder: forwarderAddress,
		tokenHeist: tokenHesitAddr,
	}

	// Save deployment

	if (!fs.existsSync(path.join(__dirname, '../deployment', network.name))) {
		fs.mkdirSync(path.join(__dirname, '../deployment', network.name))
	}

	let number = 1

	while (fs.existsSync(path.join(__dirname, '../deployment', network.name, `v${version}-${number}.json`))) {
		number++
	}

	fs.writeFileSync(
		path.join(__dirname, '../deployment', network.name, `v${version}-${number}.json`),
		JSON.stringify(addresses),
	)
}

main().catch(error => {
	console.error(error)
	process.exitCode = 1
})
