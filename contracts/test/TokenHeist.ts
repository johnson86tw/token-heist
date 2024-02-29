import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { CircuitInput, exportCallDataGroth16, genProofAndPublicSignals } from '../utils/zkp'

describe('TokenHeist', function () {
	// We define a fixture to reuse the same setup in every test.
	// We use loadFixture to run this setup once, snapshot that state,
	// and reset Hardhat Network to that snapshot in every test.
	async function deployFixture() {
		const [owner, thief, police] = await ethers.getSigners()

		const Verifier = await ethers.getContractFactory('SneakVerifier')
		const verifier = await Verifier.deploy()
		const verifierAddr = await verifier.getAddress()
		const TokenHeist = await ethers.getContractFactory('TokenHeist')
		const tokenHesit = await TokenHeist.deploy(verifierAddr)
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

	describe('Sneak', function () {
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
			const { proof, publicSignals } = await genProofAndPublicSignals(input)
			console.log(publicSignals)
			// let dataResult = await exportCallDataGroth16(input)
			// expect(await verifier.verifyProof(dataResult.a, dataResult.b, dataResult.c, dataResult.Input)).to.equal(
			// 	true,
			// )
		})
	})
})
