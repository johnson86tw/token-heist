import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers'
import { expect } from 'chai'
import { ERC2771Forwarder } from '../typechain-types'
import { buildPoseidon } from 'circomlibjs'
import { deployFixture } from './deployFixture'

describe('TokenHeist Meta Transaction', function () {
	let poseidon

	before(async function () {
		poseidon = await buildPoseidon()
	})

	describe('#register by forwarder', function () {
		it('should verify the signature and execute', async function () {
			const { provider, owner, tokenHeistPlayer1, tokenHesitAddr, forwarder, forwarderAddr, player1 } =
				await loadFixture(deployFixture)

			// sign typed data
			const domain = {
				name: 'Token Heist',
				version: '1',
				chainId: 31337,
				verifyingContract: forwarderAddr,
			}
			const types = {
				ForwardRequest: [
					{ name: 'from', type: 'address' },
					{ name: 'to', type: 'address' },
					{ name: 'value', type: 'uint256' },
					{ name: 'gas', type: 'uint256' },
					{ name: 'nonce', type: 'uint256' },
					{ name: 'deadline', type: 'uint48' },
					{ name: 'data', type: 'bytes' },
				],
			}
			const value = {
				from: player1.address,
				to: tokenHesitAddr,
				value: 0,
				gas: 100000,
				nonce: await forwarder.nonces(player1.address),
				deadline: (await provider.getBlock('latest'))!.timestamp + 60,
				data: tokenHeistPlayer1.interface.encodeFunctionData('register', [1]),
			}
			const signature = await player1.signTypedData(domain, types, value)

			const calldata: ERC2771Forwarder.ForwardRequestDataStruct = {
				from: value.from,
				to: value.to,
				value: value.value,
				gas: value.gas,
				deadline: value.deadline,
				data: value.data,
				signature,
			}

			expect(await forwarder.connect(owner).verify(calldata)).to.be.true

			await expect(forwarder.connect(owner).execute(calldata))
				.to.emit(tokenHeistPlayer1, 'Registered')
				.withArgs(player1.address)
		})

		it('should register 2 players', async function () {
			const {
				provider,
				owner,
				tokenHeistPlayer1,
				tokenHeistPlayer2,
				tokenHesitAddr,
				forwarder,
				forwarderAddr,
				player1,
				player2,
			} = await loadFixture(deployFixture)

			// sign typed data
			const domain = {
				name: 'Token Heist',
				version: '1',
				chainId: 31337,
				verifyingContract: forwarderAddr,
			}
			const types = {
				ForwardRequest: [
					{ name: 'from', type: 'address' },
					{ name: 'to', type: 'address' },
					{ name: 'value', type: 'uint256' },
					{ name: 'gas', type: 'uint256' },
					{ name: 'nonce', type: 'uint256' },
					{ name: 'deadline', type: 'uint48' },
					{ name: 'data', type: 'bytes' },
				],
			}
			const value = {
				from: player1.address,
				to: tokenHesitAddr,
				value: 0,
				gas: 100000,
				nonce: await forwarder.nonces(player1.address),
				deadline: (await provider.getBlock('latest'))!.timestamp + 60,
				data: tokenHeistPlayer1.interface.encodeFunctionData('register', [1]),
			}
			const signature = await player1.signTypedData(domain, types, value)

			const calldata: ERC2771Forwarder.ForwardRequestDataStruct = {
				from: value.from,
				to: value.to,
				value: value.value,
				gas: value.gas,
				deadline: value.deadline,
				data: value.data,
				signature,
			}

			expect(await forwarder.connect(owner).verify(calldata)).to.be.true

			await expect(forwarder.connect(owner).execute(calldata))
				.to.emit(tokenHeistPlayer1, 'Registered')
				.withArgs(player1.address)

			const value2 = {
				from: player2.address,
				to: tokenHesitAddr,
				value: 0,
				gas: 200000, // need more gas for the second registration
				nonce: await forwarder.nonces(player2.address),
				deadline: (await provider.getBlock('latest'))!.timestamp + 60,
				data: tokenHeistPlayer2.interface.encodeFunctionData('register', [2]),
			}
			const signature2 = await player2.signTypedData(domain, types, value2)

			const calldata2: ERC2771Forwarder.ForwardRequestDataStruct = {
				from: value2.from,
				to: value2.to,
				value: value2.value,
				gas: value2.gas,
				deadline: value2.deadline,
				data: value2.data,
				signature: signature2,
			}

			expect(await forwarder.connect(owner).verify(calldata2)).to.be.true
			await expect(forwarder.connect(owner).execute(calldata2))
				.to.emit(tokenHeistPlayer2, 'Registered')
				.withArgs(player2.address)
		})
	})
})
