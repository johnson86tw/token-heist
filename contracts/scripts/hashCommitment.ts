import { ethers } from 'hardhat'
import { TokenHeist__factory } from '../typechain-types'
import { exportFlatten } from '../utils'

/*
	pnpm hardhat run scripts/sneak.ts --network arbitrum-sepolia
*/

const tokenHeistAddress = '0xA33C6B2a730a1a70539AFC58aE6d7A6e154dC161'
const paths: [number, number][] = [
	[1, 0],
	[1, 1],
	[0, 1],
	[0, 0],
	[0, 1],
]

async function main() {
	const [, player1] = await ethers.getSigners()
	console.log('Signer', player1.address)
	const tokenHeist = TokenHeist__factory.connect(tokenHeistAddress, player1)

	console.log('params', exportFlatten(paths))

	const commitment = await tokenHeist.hashCommitment(exportFlatten(paths))
	console.log('commitment', commitment)
}

main().catch(error => {
	console.error(error)
	process.exit(1)
})
