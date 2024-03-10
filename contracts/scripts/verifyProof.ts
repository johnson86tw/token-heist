import { ethers, network } from 'hardhat'
import { SneakVerifier__factory, SneakVerifier } from '../typechain-types'
import fs from 'fs'
import path from 'path'
import { CircuitInput, exportCallDataGroth16 } from '../utils/zkp'

async function main() {
	const [signer] = await ethers.getSigners()
	console.log('Signer:', signer.address)

	// read deployment file based on network
	const deploymentFileName = `${network.name}.json`
	const deploymentFilePath = path.join(__dirname, '../deployment', deploymentFileName)
	const deploymentFile = fs.readFileSync(deploymentFilePath, 'utf-8')
	const deployment = JSON.parse(deploymentFile)

	const input: CircuitInput = {
		paths: [
			[1, 2],
			[2, 2],
			[2, 1],
			[-1, -1],
			[-1, -1],
		],
		ambushes: [
			[1, 1],
			[1, 2],
			[-1, -1],
			[-1, -1],
			[-1, -1],
		],
	}
	const dataResult = await exportCallDataGroth16(input)
	const verifier = new SneakVerifier__factory(signer).attach(deployment.sneakVerifier) as SneakVerifier
	const isVerified = await verifier.verifyProof(dataResult.a, dataResult.b, dataResult.c, dataResult.Input)
	console.log('Proof verified:', isVerified)
}

main().catch(error => {
	console.error(error)
	process.exitCode = 1
})
