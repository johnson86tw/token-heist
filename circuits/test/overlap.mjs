import { assert } from 'chai'
import { wasm } from 'circom_tester'

describe('overlap', function () {
	let circuit

	before(async function () {
		circuit = await wasm('test/overlap.t.circom')
	})

	it('Should generate the witness successfully', async function () {
		let input = {
			x: 1,
			y: 1,
			ambushes: [
				[0, 0],
				[2, 2],
				[3, 3],
				[4, 4],
				[5, 5],
			],
		}
		const witness = await circuit.calculateWitness(input)
		await circuit.assertOut(witness, {})
	})

	it('Should succeed', async function () {
		let input = {
			x: 2,
			y: 3,
			ambushes: [
				[0, 0],
				[2, 2],
				[1, 2],
				[2, 1],
				[5, 5],
			],
		}

		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			assert(false, err.message)
		}
	})

	it('Should fail because it overlaps', async function () {
		let input = {
			x: 2,
			y: 1,
			ambushes: [
				[0, 0],
				[2, 2],
				[1, 1],
				[2, 1],
				[5, 5],
			],
		}
		try {
			await circuit.calculateWitness(input)
			assert(false)
		} catch (err) {
			assert(err.message.includes('Assert Failed'))
		}
	})
})
