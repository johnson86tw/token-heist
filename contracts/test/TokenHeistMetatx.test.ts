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
			// read forwarder nonce
			const forwarderNonce = await forwarder.nonces(player1.address)
			// encode register function data
			const registerData = tokenHeistPlayer1.interface.encodeFunctionData('register', [1])
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
				nonce: forwarderNonce,
				deadline: (await provider.getBlock('latest'))!.timestamp + 60,
				data: registerData,
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
	})
})
