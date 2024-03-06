import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ethers } from 'hardhat'
import { TokenHeist, TokenHeist__factory } from '../typechain-types'

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

	async function deployFixture() {
		const [owner, player1, player2] = await ethers.getSigners()

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
		const tokenHeistFactory = new TokenHeist__factory(
			{
				'poseidon-solidity/PoseidonT6.sol:PoseidonT6': PoseidonT6.address,
			},
			owner,
		)

		const prizeMap = [1, 2, 1, 2, 3, 4, 3, 5, 4]
		const timeLimitPerTurn = 180 // 3 minutes
		const timeUpPoints = 20

		const tokenHesit = await tokenHeistFactory.deploy(verifierAddr, prizeMap, timeLimitPerTurn, timeUpPoints)
		const tokenHesitAddr = await tokenHesit.getAddress()

		return {
			owner,
			player1,
			player2,
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

	describe('#hashSneakPaths', function () {
		it('should hash flattened sneak paths correctly', async function () {
			const { tokenHesit } = await loadFixture(deployFixture)
			const flattenedPaths = [1, 2, 3, 4, 5].map(x => BigInt(x)) as [bigint, bigint, bigint, bigint, bigint]
			const hash = await tokenHesit.hashSneakPaths(flattenedPaths)
			const expectedHash = poseidon.F.toString(poseidon(flattenedPaths))
			expect(hash).to.equal(expectedHash)
		})

		it('should hash negative one correctly', async function () {
			const { tokenHesit } = await loadFixture(deployFixture)
			const flattenedPaths = [1, 2, 3, -1, -1].map(x => BigInt(x)) as [bigint, bigint, bigint, bigint, bigint]
			const hash = await tokenHesit.hashSneakPaths(flattenedPaths)
			const expectedHash = poseidon.F.toString(poseidon(flattenedPaths))
			expect(hash).to.equal(expectedHash)
		})
	})

	describe('Simple Game Flow', async function () {
		/**
			Board:			Prize Map:
			[0, 1, 2,		[1, 2, 1,
			 3, 4, 5,		 2, 3, 4,
			 6, 7, 8]		 3, 5, 4]
		*/

		let tokenHeistPlayer1: TokenHeist
		let tokenHeistPlayer2: TokenHeist
		let player1: SignerWithAddress
		let player2: SignerWithAddress

		before(async function () {
			const fixture = await loadFixture(deployFixture)

			player1 = fixture.player1
			player2 = fixture.player2
			tokenHeistPlayer1 = fixture.tokenHesit.connect(player1)
			tokenHeistPlayer2 = fixture.tokenHesit.connect(player2)
		})

		it('should registry two players and start the game', async function () {
			await expect(tokenHeistPlayer1.register(1))
				.to.emit(tokenHeistPlayer1, 'Registered')
				.withArgs(player1.address)
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
		it('should play a round', async function () {
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
			// @ts-ignore
			await expect(tokenHeistPlayer1.sneak(dataResult.a, dataResult.b, dataResult.c, dataResult.Input))
				.to.emit(tokenHeistPlayer2, 'Sneak')
				.withArgs(1, player1.address, dataResult.Input[1])
		})

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
		 * scores: [8, 0]
		 */
		it('should be ended', async function () {})
	})
})
