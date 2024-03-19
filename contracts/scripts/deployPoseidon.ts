import { ethers, network } from 'hardhat'
import fs from 'fs'
import path from 'path'
import { version } from '../package.json'
import { PoseidonT6 } from 'poseidon-solidity'

// Note that you should have the deployment file of the network before running this script

async function main() {
	const [deployer] = await ethers.getSigners()
	console.log('Deployer:', deployer.address)

	try {
		if ((await deployer.provider.getCode(PoseidonT6.proxyAddress)) === '0x') {
			console.log('deploying proxy')
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
		}
	} catch (err) {
		console.error('Failed to deploy PoseidonT6:', err)
	}

	console.log('Poseidon deployed to:', PoseidonT6.address)

	// Save deployment
	const filePath = path.join(__dirname, '../deployment', `${network.name}.json`)
	if (!fs.existsSync(filePath)) {
		fs.writeFileSync(filePath, '{}')
	}
	const deploymentFile = fs.readFileSync(filePath, 'utf-8')
	const deployment = JSON.parse(deploymentFile)

	deployment.poseidonT6 = PoseidonT6.address

	fs.writeFileSync(filePath, JSON.stringify(deployment))
}

main().catch(error => {
	console.error(error)
	process.exitCode = 1
})
