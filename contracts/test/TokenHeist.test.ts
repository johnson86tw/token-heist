import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { TokenHeist, TokenHeist__factory } from '../typechain-types'

import { CircuitInput, exportCallDataGroth16 } from '../utils/zkp'
import { get_last_paths, flatten, exportFlatten } from '../utils'

import { buildPoseidon } from 'circomlibjs'
import { deployFixture } from './deployFixture'

describe('TokenHeist', function () {
	let poseidon

	before(async function () {
		poseidon = await buildPoseidon()
	})

	describe('Deployment', function () {
		it('should deploy successfully', async function () {
			const { tokenHeist, verifierAddr } = await loadFixture(deployFixture)
			expect(await tokenHeist.sneakVerifier()).to.equal(verifierAddr)
		})
	})

	describe('#hashCommitment', function () {
		it('should hash flattened sneak paths correctly', async function () {
			const { tokenHeist } = await loadFixture(deployFixture)
			const flattenedPaths = [1, 2, 3, 4, 5].map(x => BigInt(x)) as [bigint, bigint, bigint, bigint, bigint]
			const hash = await tokenHeist.hashCommitment(flattenedPaths)
			const expectedHash = poseidon.F.toString(poseidon(flattenedPaths))
			expect(hash).to.equal(expectedHash)
		})

		it('should hash negative one correctly', async function () {
			const { tokenHeist } = await loadFixture(deployFixture)
			const flattenedPaths = [1, 2, 3, -1, -1].map(x => BigInt(x)) as [bigint, bigint, bigint, bigint, bigint]
			const hash = await tokenHeist.hashCommitment(flattenedPaths)
			const expectedHash = poseidon.F.toString(poseidon(flattenedPaths))
			expect(hash).to.equal(expectedHash)
		})
	})

	describe('Ambushes', function () {
		it('should return flattened ambushes correctly', async function () {
			const { tokenHeist } = await loadFixture(deployFixture)
			expect(await tokenHeist.flattenedAmbushes()).to.deep.equal(Array(10).fill(-1))
		})

		it('should check ambushes correctly', async function () {
			const { tokenHeist } = await loadFixture(deployFixture)
			let input: CircuitInput = {
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
			expect(await tokenHeist.isValidAmbushes(dataResult.Input)).to.be.true

			input.ambushes = [
				[1, 2],
				[-1, -1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
			]
			const dataResult2 = await exportCallDataGroth16(input)
			expect(await tokenHeist.isValidAmbushes(dataResult2.Input)).to.be.false
		})
	})
})
