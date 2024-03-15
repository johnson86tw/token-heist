import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { TokenHeist, TokenHeist__factory } from '../typechain-types'
import { CircuitInput, exportCallDataGroth16 } from '../utils/zkp'
import { get_last_paths, flatten, exportFlatten } from '../utils'
import { buildPoseidon } from 'circomlibjs'
import { deployFixture } from './deployFixture'

describe('TokenHeist Core Functions', function () {
	let poseidon

	before(async function () {
		poseidon = await buildPoseidon()
	})

	describe('#sneak', function () {
		it('should play the first move', async function () {
			const { tokenHeistPlayer1, tokenHeistPlayer2, player1 } = await loadFixture(deployFixture)
			await tokenHeistPlayer1.register(1)
			await tokenHeistPlayer2.register(2)
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
				.withArgs(1, player1.address, false)
		})
		it('should check ambushes correctly', async function () {
			const { tokenHeistPlayer1, tokenHeistPlayer2 } = await loadFixture(deployFixture)
			await tokenHeistPlayer1.register(1)
			await tokenHeistPlayer2.register(2)
			const input: CircuitInput = {
				paths: [
					[1, 0],
					[-1, -1],
					[-1, -1],
					[-1, -1],
					[-1, -1],
				],
				ambushes: [
					[1, 2],
					[-1, -1],
					[-1, -1],
					[-1, -1],
					[-1, -1],
				],
			}
			const dataResult = await exportCallDataGroth16(input)
			await expect(
				tokenHeistPlayer1.sneak(dataResult.a, dataResult.b, dataResult.c, dataResult.Input),
			).to.be.revertedWithCustomError(tokenHeistPlayer1, 'InvalidAmbushes')
		})
	})
	describe('#register', function () {})
	describe('#dispatch', function () {})
	describe('#reveal', function () {
		// feat: the path that has been walked cannot be calculated repeatedly
		it('should not calculate the walked path twice', async function () {})
	})
	describe('#timeUp', function () {})
})
