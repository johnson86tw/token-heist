import { assert, expect } from 'chai'
import { wasm } from 'circom_tester'
import { buildPoseidon } from 'circomlibjs'

import { F1Field } from 'ffjavascript'
import { Scalar } from 'ffjavascript'
const p = Scalar.fromString('21888242871839275222246405745257275088548364400416034343698204186575808495617')
const Fr = new F1Field(p)

describe('Sneak', function () {
	let circuit
	let poseidon

	before(async function () {
		circuit = await wasm('Sneak.circom')
		poseidon = await buildPoseidon()
	})

	it('Should generate the witness successfully', async function () {
		let input = {
			paths: [
				[1, 2],
				[2, 2],
				[-1, -1],
				[-1, -1],
				[-1, -1],
			],
			ambushes: [
				[1, 1],
				[1, 2],
				[1, 3],
				[-1, -1],
				[-1, -1],
			],
		}
		const witness = await circuit.calculateWitness(input)
		await circuit.assertOut(witness, {})
	})
	it('Should succeed with 3 outputs', async function () {
		let input = {
			paths: [
				[1, 1],
				[2, 1],
				[2, 1],
				[-1, -1],
				[-1, -1],
			],
			ambushes: [
				[0, 1],
				[1, 2],
				[2, 0],
				[-1, -1],
				[-1, -1],
			],
		}
		const flattened = flatten(input.paths)
		expect(flattened).to.deep.equal([4, 5, 5, -1, -1])

		let last_paths = get_last_paths(input.paths)
		const flattened_last_paths = flatten(last_paths)
		expect(flattened_last_paths).to.deep.equal([4, 5, -1, -1, -1])

		const expectedOutput1 = poseidon.F.toString(poseidon(flattened_last_paths))
		const expectedOutput2 = poseidon.F.toString(poseidon(flattened))
		const expectedOutput3 = 1

		const witness = await circuit.calculateWitness(input)
		assert(Fr.eq(Fr.e(witness[0]), Fr.e(1)))
		assert(Fr.eq(Fr.e(witness[1]), Fr.e(expectedOutput1)))
		assert(Fr.eq(Fr.e(witness[2]), Fr.e(expectedOutput2)))
		assert(Fr.eq(Fr.e(witness[3]), Fr.e(expectedOutput3)))
	})
})

function get_last_paths(paths) {
	let last_paths = [
		[-1, -1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
		[-1, -1],
	]
	for (let i = 4; i > 0; i--) {
		if (paths[i][0] !== -1 && paths[i][1] !== -1) {
			last_paths[i - 1] = paths[i - 1]
		}
	}
	return last_paths
}

function flatten(paths) {
	const res = [-1, -1, -1, -1, -1]
	for (let i = 0; i < paths.length; i++) {
		if (paths[i][0] !== -1 && paths[i][1] !== -1) {
			res[i] = paths[i][0] + paths[i][1] * 3
		}
	}
	return res
}
