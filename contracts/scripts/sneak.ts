import { ethers } from 'hardhat'
import { TokenHeist__factory } from '../typechain-types'
import { CircuitInput, exportCallDataGroth16 } from '../utils/zkp'

/*
	pnpm hardhat run scripts/sneak.ts --network arbitrum-sepolia
*/

const tokenHeistAddress = '0x2bb2F59B2F316e1Fd68616b83920A1fe15E32a81'
const paths: [number, number][] = [
	[1, 2],
	[1, 1],
	[1, 0],
	[1, 0],
	[2, 0],
]

async function main() {
	const [, player1] = await ethers.getSigners()
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

	const tx = await tokenHeist.sneak(dataResult.a, dataResult.b, dataResult.c, dataResult.Input)
	await tx.wait()
	console.log('sneak tx', tx.hash)
}

main().catch(error => {
	console.error(error)
	process.exit(1)
})
