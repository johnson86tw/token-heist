import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { TokenHeist } from '../typechain-types'
import { CircuitInput, exportCallDataGroth16 } from '../utils/zkp'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import { deployFixture } from './deployFixture'
import { exportFlatten, flatten } from '../utils/board'
/**
	Board:			Prize Map:
	[0, 1, 2,		[1, 2, 1,
	 3, 4, 5,		 2, 3, 4,
	 6, 7, 8]		 3, 5, 4]
*/
describe('TokenHeist Simple Game Flow', function () {
	let tokenHeistPlayer1: TokenHeist
	let tokenHeistPlayer2: TokenHeist
	let player1: SignerWithAddress
	let player2: SignerWithAddress

	before(async function () {
		const fixture = await loadFixture(deployFixture)

		player1 = fixture.player1
		player2 = fixture.player2
		tokenHeistPlayer1 = fixture.tokenHeistPlayer1
		tokenHeistPlayer2 = fixture.tokenHeistPlayer2
	})

	it('should register two players and start the game', async function () {
		await expect(tokenHeistPlayer1.register(1)).to.emit(tokenHeistPlayer1, 'Registered').withArgs(player1.address)
		await expect(tokenHeistPlayer2.register(2))
			.to.emit(tokenHeistPlayer2, 'GameStarted')
			.withArgs(player1.address, player2.address)
	})

	it("should be player1's turn", async function () {
		expect(await tokenHeistPlayer1.currentPlayer()).to.equal(player1.address)
	})

	/**
		Round 1: thief (player1) wins

		thief:                  police:                 notice:
		[1, -1, -1, -1, -1]     [7, -1, -1, -1, -1]     false
		[1, 4, -1, -1, -1]		[7, 8, -1, -1, -1]		false
		[1, 4, 3, -1, -1]		[7, 8, 4, -1, -1] 		true
		[1, 4, 3, 0, -1]		[7, 8, 4, 5, -1]		false
		[1, 4, 3, 0, 1]			[7, 8, 4, 5, 6]			false
		reveal()

		thief's score: 8
	*/
	it('should play the first move by thief', async function () {
		const input: CircuitInput = {
			paths: [
				[1, 0],
				[-1, -1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
			],
			ambushes: [
				[-1, -1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
			],
		}
		const dataResult = await exportCallDataGroth16(input)

		await expect(tokenHeistPlayer1.sneak(dataResult.a, dataResult.b, dataResult.c, dataResult.Input))
			.to.emit(tokenHeistPlayer2, 'Sneak')
			.withArgs(1, player1.address, dataResult.Input[1])
	})

	it('should dispatch a cop by police', async function () {})
	/**
		Round 2: police (player1) wins

		thief:                  police:                 notice:
		[5, -1, -1, -1, -1]     [1, -1, -1, -1, -1]     false
		[5, 8, -1, -1, -1]		[1, 7, -1, -1, -1]		true
		[5, 8, 5, -1, -1]		[1, 7, 5, -1, -1] 		
		reveal()

		thief's score: 0
	*/
	it('should interchange turns and play next round', async function () {})

	/**
		scores: [8, 0]
	 */
	it('should be ended', async function () {})
})
