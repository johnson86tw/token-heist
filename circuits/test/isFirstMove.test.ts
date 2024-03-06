import { assert } from 'chai'
import { wasm } from 'circom_tester'
import { buildPoseidon } from 'circomlibjs'

import { F1Field } from 'ffjavascript'
import { Scalar } from 'ffjavascript'
const p = Scalar.fromString('21888242871839275222246405745257275088548364400416034343698204186575808495617')
const Fr = new F1Field(p)

describe('IsFirstMove', function () {
	let circuit
	let poseidon

	before(async function () {
		circuit = await wasm('test/circom/isFirstMove.t.circom')
		poseidon = await buildPoseidon()
	})

	it('should be the first move', async function () {
		let input = {
			paths: [
				[1, 2],
				[-1, -1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
			],
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

	it('should not be the first move', async function () {
		let input = {
			paths: [
				[-1, -1],
				[1, 2],
				[-1, -1],
				[-1, -1],
				[-1, -1],
			],
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
