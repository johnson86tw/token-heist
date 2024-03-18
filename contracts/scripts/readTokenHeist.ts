import { ethers } from 'hardhat'
import { TokenHeist__factory } from '../typechain-types'

/*
	pnpm hardhat run scripts/readTokenHeist.ts --network arbitrum-sepolia
*/

const tokenHeistAddress = '0xA33C6B2a730a1a70539AFC58aE6d7A6e154dC161'

async function main() {
	const tokenHeist = TokenHeist__factory.connect(tokenHeistAddress, (await ethers.getSigners())[0])

	console.log('TokenHeist', await tokenHeist.getAddress())
	console.log('Verifier', await tokenHeist.sneakVerifier())
	console.log('Forwarder', await tokenHeist.trustedForwarder())
	console.log('#gameState', await tokenHeist.gameState())
	console.log('#player1', await tokenHeist.player1())
	console.log('#player2', await tokenHeist.player2())
	console.log('#currentPlayer', await tokenHeist.currentPlayer())
	console.log('#currentRole', await tokenHeist.currentRole())
	const flattenedAmbushes = await tokenHeist.flattenedAmbushes()
	console.log('#flattenedAmbushes', flattenedAmbushes)
	console.log(
		'ambushes',
		flattenedAmbushes.reduce(
			(acc, cur, i) => {
				if (i % 2 === 0) acc.push([Number(cur), Number(flattenedAmbushes[i + 1])])
				return acc
			},
			[] as [number, number][],
		),
	)
}

main().catch(error => {
	console.error(error)
	process.exitCode = 1
})
