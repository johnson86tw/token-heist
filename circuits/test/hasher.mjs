import { assert, expect } from 'chai'
import { wasm } from 'circom_tester'
import { buildPoseidon } from 'circomlibjs'

import { F1Field } from 'ffjavascript'
import { Scalar } from 'ffjavascript'
const p = Scalar.fromString('21888242871839275222246405745257275088548364400416034343698204186575808495617')
const Fr = new F1Field(p)

describe('hasher', function () {
	let circuit
	let poseidon

	before(async function () {
		circuit = await wasm('test/hasher.t.circom')
		poseidon = await buildPoseidon()
	})

	it('Should generate the witness successfully', async function () {
		let input = {
			in: [
				[1, 2],
				[2, 2],
				[-1, -1],
				[-1, -1],
				[-1, -1],
			],
		}
		const witness = await circuit.calculateWitness(input)
		await circuit.assertOut(witness, {})
	})

	it('Should succeed', async function () {
		let input = {
			in: [
				[1, 2],
				[2, 2],
				[2, 1],
				[2, 1],
				[-1, -1],
			],
		}

		const flattened = flatten(input.in)
		assert(flattened, [7, 8, 5, 5, -1])

		const expectedOutput = poseidon.F.toString(poseidon(flattened))

		try {
			const witness = await circuit.calculateWitness(input)
			assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)))
			assert(Fr.eq(Fr.e(witness[1]), Fr.e(expectedOutput)))
		} catch (err) {
			assert(false, err.message)
		}
	})

	it('Should not be equal', async function () {
		let input = {
			in: [
				[1, 2],
				[2, 2],
				[-1, -1],
				[-1, -1],
				[-1, -1],
			],
		}

		const flattened = flatten([
			[1, 2],
			[2, 1],
			[-1, -1],
			[-1, -1],
			[-1, -1],
		])
		assert(flattened, [7, 5, -1, -1, -1])

		const expectedOutput = poseidon.F.toString(poseidon(flattened))

		try {
			const witness = await circuit.calculateWitness(input)
			assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)))
			expect(Fr.eq(Fr.e(witness[1]))).to.not.equal(Fr.e(expectedOutput))
		} catch (err) {
			assert(false, err.message)
		}
	})
})

function flatten(paths) {
	const res = [-1, -1, -1, -1, -1]
	for (let i = 0; i < paths.length; i++) {
		if (paths[i][0] !== -1 && paths[i][1] !== -1) {
			res[i] = paths[i][0] + paths[i][1] * 3
		}
	}
	return res
}
