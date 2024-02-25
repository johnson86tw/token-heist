import { assert } from 'chai'
import { wasm } from 'circom_tester'

describe('sneak', function () {
	let circuit

	before(async function () {
		circuit = await wasm('Sneak.circom')
	})

	it('Should generate the witness successfully', async function () {
		// let input = {
		// 	last_move: [1, 1],
		// 	move: [1, 2],
		// 	salt: '2',
		// 	commitment: '3',
		// 	ambushes: [
		// 		[1, 1],
		// 		[1, 2],
		// 		[1, 3],
		// 		[-1, -1],
		// 		[-1, -1],
		// 	],
		// }
		const witness = await circuit.calculateWitness(input)
		await circuit.assertOut(witness, {})
	})
})
