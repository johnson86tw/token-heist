import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'

import { CircuitInput, exportCallDataGroth16 } from '../utils/zkp'
import { get_last_paths, flatten } from '../utils/paths'

import { F1Field } from 'ffjavascript'
import { Scalar } from 'ffjavascript'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
const p = Scalar.fromString('21888242871839275222246405745257275088548364400416034343698204186575808495617')
const Fr = new F1Field(p)

import { PoseidonT6 } from 'poseidon-solidity'
import { buildPoseidon } from 'circomlibjs'

describe('TokenHeist', function () {
	let poseidon

	before(async function () {
		poseidon = await buildPoseidon()
	})

	// We define a fixture to reuse the same setup in every test.
	// We use loadFixture to run this setup once, snapshot that state,
	// and reset Hardhat Network to that snapshot in every test.
	async function deployFixture() {
		const [owner, thief, police] = await ethers.getSigners()

		// deploy SneakVerifier
		const Verifier = await ethers.getContractFactory('SneakVerifier')
		const verifier = await Verifier.deploy()
		const verifierAddr = await verifier.getAddress()

		// deploy PoseidonT6
		try {
			if ((await owner.provider.getCode(PoseidonT6.proxyAddress)) === '0x') {
				console.log('no proxy')
				// fund the keyless account
				await owner.sendTransaction({
					to: PoseidonT6.from,
					value: PoseidonT6.gas,
				})

				// then send the presigned transaction deploying the proxy
				await ethers.provider.broadcastTransaction(PoseidonT6.tx)
			}

			// Then deploy the hasher, if needed
			if ((await owner.provider.getCode(PoseidonT6.address)) === '0x') {
				await owner.sendTransaction({
					to: PoseidonT6.proxyAddress,
					data: PoseidonT6.data,
				})
			}
		} catch (err) {
			console.error('Failed to deploy PoseidonT6:', err)
		}

		// deploy TokenHeist
		const TokenHeist = await ethers.getContractFactory('TokenHeist', {
			libraries: {
				'poseidon-solidity/PoseidonT6.sol:PoseidonT6': PoseidonT6.address,
			},
		})

		const thiefPrizeMap = [1, 2, 1, 2, 3, 4, 3, 5, 4]
		const policePrize = 10
		const timeLimitPerTurn = 180 // 3 minutes

		const tokenHesit = await TokenHeist.deploy(verifierAddr, thiefPrizeMap, policePrize, timeLimitPerTurn)
		const tokenHesitAddr = await tokenHesit.getAddress()

		return {
			owner,
			thief,
			police,
			verifier,
			verifierAddr,
			tokenHesit,
			tokenHesitAddr,
		}
	}

	describe('Deployment', function () {
		it('should deploy successfully', async function () {
			const { tokenHesit, verifierAddr } = await loadFixture(deployFixture)
			expect(await tokenHesit.sneakVerifier()).to.equal(verifierAddr)
		})
	})

	describe('#verifyProof', function () {
		it('should verify proof', async function () {
			const { verifier } = await loadFixture(deployFixture)
			const input = {
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

			const circuitInputs: CircuitInput = {
				paths: input.paths.map(([x, y]) => [Fr.e(x), Fr.e(y)]),
				ambushes: input.ambushes.map(([x, y]) => [Fr.e(x), Fr.e(y)]),
			}

			const dataResult = await exportCallDataGroth16(circuitInputs)
			expect(await verifier.verifyProof(dataResult.a, dataResult.b, dataResult.c, dataResult.Input)).to.equal(
				true,
			)
		})
	})

	describe('#hashSneakPaths', function () {
		it('should hash flattened sneak paths correctly', async function () {
			const { tokenHesit } = await loadFixture(deployFixture)
			const flattenedPaths = [1, 2, 3, 4, 5]
			const hash = await tokenHesit.hashSneakPaths(flattenedPaths)
			const expectedHash = poseidon.F.toString(poseidon(flattenedPaths))
			expect(hash).to.equal(expectedHash)
		})

		it('should hash negative one correctly', async function () {
			const { tokenHesit } = await loadFixture(deployFixture)
			const flattenedPaths = [1, 2, 3, -1, -1]
			const hash = await tokenHesit.hashSneakPaths(flattenedPaths)
			const expectedHash = poseidon.F.toString(poseidon(flattenedPaths))
			expect(hash).to.equal(expectedHash)
		})
	})
})
