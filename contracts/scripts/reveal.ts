import { ethers } from 'hardhat'
import { TokenHeist__factory } from '../typechain-types'
import { CircuitInput, exportCallDataGroth16 } from '../utils/zkp'
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
	const flattenedAmbushes = await tokenHeist.flattenedAmbushes()
	const ambushes = flattenedAmbushes.reduce(
		(acc, cur, i) => {
			if (i % 2 === 0) acc.push([Number(cur), Number(flattenedAmbushes[i + 1])])
			return acc
		},
		[] as [number, number][],
	)
	const input: CircuitInput = {
		paths,
		ambushes,
	}
	const dataResult = await exportCallDataGroth16(input)

	console.log(exportFlatten(input.paths))

	const estimatedGas = await tokenHeist.reveal.estimateGas(
		exportFlatten(input.paths),
		dataResult.a,
		dataResult.b,
		dataResult.c,
		dataResult.Input,
	)
	console.log('estimatedGas', estimatedGas)

	const tx = await tokenHeist.reveal(
		exportFlatten(input.paths),
		dataResult.a,
		dataResult.b,
		dataResult.c,
		dataResult.Input,
	)
	await tx.wait()
	console.log('sneak tx', tx.hash)
}

main().catch(error => {
	console.error(error)
	process.exit(1)
})
