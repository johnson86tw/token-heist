import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { CircuitInput, exportCallDataGroth16 } from '../utils/zkp'
import { get_last_paths, flatten, flatten2, exportFlatten2 } from '../utils'

import { F1Field } from 'ffjavascript'
import { Scalar } from 'ffjavascript'
const p = Scalar.fromString('21888242871839275222246405745257275088548364400416034343698204186575808495617')
const Fr = new F1Field(p)

import { buildPoseidon } from 'circomlibjs'

describe('SneakVerifier', function () {
	let poseidon

	before(async function () {
		poseidon = await buildPoseidon()
	})

	async function deployFixture() {
		const [owner, thief, police] = await ethers.getSigners()

		const Verifier = await ethers.getContractFactory('SneakVerifier')
		const verifier = await Verifier.deploy()
		const verifierAddr = await verifier.getAddress()

		return {
			owner,
			thief,
			police,
			verifier,
			verifierAddr,
		}
	}

	describe('Deployment', function () {
		it('should deploy successfully', async function () {
			const { verifierAddr } = await loadFixture(deployFixture)
			expect(verifierAddr).to.be.properAddress
		})
	})

	describe('Verification', function () {
		it('should verify proof', async function () {
			const { verifier } = await loadFixture(deployFixture)
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
			expect(await verifier.verifyProof(dataResult.a, dataResult.b, dataResult.c, dataResult.Input)).to.equal(
				true,
			)
		})

		it('should have correct public signals', async function () {
			const { verifier } = await loadFixture(deployFixture)
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

			const flattened = flatten(input.paths)
			const last_paths = get_last_paths(input.paths)
			const flattened_last_paths = flatten(last_paths)

			const expectedOutput1 = poseidon.F.toString(poseidon(flattened_last_paths))
			const expectedOutput2 = poseidon.F.toString(poseidon(flattened))
			const expectedOutput3 = '1'

			const dataResult = await exportCallDataGroth16(input)

			// public signal: commitment of flattened_last_paths
			expect(dataResult.Input[0]).to.deep.equal(expectedOutput1)
			// public signal: commitment of flattened move
			expect(dataResult.Input[1]).to.deep.equal(expectedOutput2)
			// public signal: noticed
			expect(dataResult.Input[2]).to.equal(expectedOutput3)

			// public signals: ambushes
			expect(dataResult.Input.slice(3, dataResult.Input.length)).to.deep.equal(exportFlatten2(input.ambushes))

			expect(await verifier.verifyProof(dataResult.a, dataResult.b, dataResult.c, dataResult.Input)).to.equal(
				true,
			)
		})
	})
})
