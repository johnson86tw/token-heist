import { assert } from 'chai'
import { wasm } from 'circom_tester'

describe('adjacent', function () {
	let circuit

	before(async function () {
		circuit = await wasm('circom/adjacent.circom')
	})

	it('Should generate the witness successfully', async function () {
		let input = {
			x1: 1,
			y1: 1,
			x2: 2,
			y2: 1,
			out: 1,
		}
		const witness = await circuit.calculateWitness(input)
		await circuit.assertOut(witness, {})
	})

	it('Should be adjacent', async function () {
		let input = {
			x1: 1,
			y1: 1,
			x2: 2,
			y2: 1,
			out: 1,
		}

		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			assert(false, err.message)
		}
	})

	it('Should not be adjacent', async function () {
		let input = {
			x1: 1,
			y1: 1,
			x2: 2,
			y2: 2,
			out: 0,
		}

		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			assert(false, err.message)
		}
	})
})
