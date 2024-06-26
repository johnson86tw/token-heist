import { ethers } from 'hardhat'
import { TokenHeist__factory } from '../typechain-types'

/*
	pnpm hardhat run scripts/readTokenHeist.ts --network arbitrum-sepolia
*/

const tokenHeistAddress = process.env.READ_TOKEN_HEIST as string
if (!tokenHeistAddress) throw new Error('READ_TOKEN_HEIST is not set')

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
	const player1Score = await tokenHeist.scores(0)
	const player2Score = await tokenHeist.scores(1)
	console.log('scores', player1Score, player2Score)
}

main().catch(error => {
	console.error(error)
	process.exitCode = 1
})
