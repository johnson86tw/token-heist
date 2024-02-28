import { assert } from 'chai'
import { wasm } from 'circom_tester'

import { F1Field } from 'ffjavascript'
import { Scalar } from 'ffjavascript'
const p = Scalar.fromString('21888242871839275222246405745257275088548364400416034343698204186575808495617')
const Fr = new F1Field(p)

describe('adjacent', function () {
	let circuit

	before(async function () {
		circuit = await wasm('test/circom/adjacent.t.circom')
	})

	it('Should generate the witness successfully', async function () {
		let input = {
			x: 1,
			y: 1,
			ambush_x: 2,
			ambush_y: 1,
		}
		const witness = await circuit.calculateWitness(input)
		await circuit.assertOut(witness, {})
	})

	it('Should be adjacent', async function () {
		let input = {
			x: 1,
			y: 1,
			ambush_x: 2,
			ambush_y: 1,
		}
		const expectedOutput = 1

		try {
			const witness = await circuit.calculateWitness(input)
			assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)))
			assert(Fr.eq(Fr.e(witness[1]), Fr.e(expectedOutput)))
		} catch (err) {
			assert(false, err.message)
		}
	})

	it('Should not be adjacent', async function () {
		let input = {
			x: 1,
			y: 1,
			ambush_x: 2,
			ambush_y: 2,
		}
		const expectedOutput = 0

		try {
			const witness = await circuit.calculateWitness(input)
			assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)))
			assert(Fr.eq(Fr.e(witness[1]), Fr.e(expectedOutput)))
		} catch (err) {
			assert(false, err.message)
		}
	})
})
