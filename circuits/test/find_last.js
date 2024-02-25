import { assert } from 'chai'
import { wasm } from 'circom_tester'

describe('find_last', function () {
	let circuit

	before(async function () {
		circuit = await wasm('circom/find_last.circom')
	})

	it('Should generate the witness successfully', async function () {
		let input = {
			ambushes: [
				[0, 0],
				[2, 2],
				[3, 3],
				[-1, -1],
				[-1, -1],
			],
			last_ambush: [3, 3],
		}
		const witness = await circuit.calculateWitness(input)
		await circuit.assertOut(witness, {})
	})

	it('Should succeed', async function () {
		let input = {
			ambushes: [
				[0, 0],
				[2, 2],
				[3, 3],
				[-1, -1],
				[-1, -1],
			],
			last_ambush: [3, 3],
		}

		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			assert(false, err.message)
		}

		input = {
			ambushes: [
				[-1, -1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
			],
			last_ambush: [-1, -1],
		}

		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			assert(false, err.message)
		}

		input = {
			ambushes: [
				[2, 3],
				[2, 3],
				[2, 3],
				[2, 3],
				[3, 5],
			],
			last_ambush: [3, 5],
		}

		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			assert(false, err.message)
		}
	})

	it('Should fail', async function () {
		let input = {
			ambushes: [
				[0, 0],
				[2, 2],
				[3, 3],
				[-1, -1],
				[-1, -1],
			],
			last_ambush: [2, 2],
		}
		try {
			await circuit.calculateWitness(input)
			assert(false)
		} catch (err) {
			assert(err.message.includes('Assert Failed'))
		}
	})
})
