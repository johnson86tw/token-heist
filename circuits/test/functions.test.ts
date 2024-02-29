import { assert, expect } from 'chai'
import { wasm } from 'circom_tester'

describe('get_last_paths', function () {
	let circuit

	before(async function () {
		circuit = await wasm('test/circom/get_last_paths.t.circom')
	})

	it('should succeed', async function () {
		let input = {
			paths: [
				[1, 1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
			],
			last_paths: [
				[-1, -1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
			],
		}
		await circuit.calculateWitness(input)
		input.last_paths = [
			[0, 0],
			[-1, -1],
			[-1, -1],
			[-1, -1],
			[-1, -1],
		]
		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			expect(err).to.match(/Assert Failed/)
		}
	})
	it('should succeed 2', async function () {
		let input = {
			paths: [
				[1, 1],
				[2, 1],
				[2, 2],
				[0, 1],
				[0, 0],
			],
			last_paths: [
				[1, 1],
				[2, 1],
				[2, 2],
				[0, 1],
				[-1, -1],
			],
		}
		await circuit.calculateWitness(input)
		input.last_paths = [
			[1, 1],
			[2, 1],
			[2, 2],
			[0, 1],
			[0, 0],
		]
		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			expect(err).to.match(/Assert Failed/)
		}
	})

	it('should succeed 3', async function () {
		let input = {
			paths: [
				[1, 1],
				[2, 1],
				[2, 2],
				[-1, -1],
				[-1, -1],
			],
			last_paths: [
				[1, 1],
				[2, 1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
			],
		}
		await circuit.calculateWitness(input)
		input.last_paths = [
			[1, 1],
			[2, 1],
			[2, 2],
			[-1, -1],
			[-1, -1],
		]
		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			expect(err).to.match(/Assert Failed/)
		}
	})
})

describe('get_last_move', function () {
	let circuit

	before(async function () {
		circuit = await wasm('test/circom/get_last_move.t.circom')
	})

	it('should succeed', async function () {
		let input = {
			paths: [
				[1, 1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
			],
			last_move: [-1, -1],
		}
		await circuit.calculateWitness(input)
		input.last_move = [1, 1]
		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			expect(err).to.match(/Assert Failed/)
		}
	})

	it('should succeed 2', async function () {
		let input = {
			paths: [
				[1, 1],
				[2, 1],
				[0, 2],
				[0, 0],
				[2, 2],
			],
			last_move: [0, 0],
		}
		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			assert(false, err.message)
		}

		input.last_move = [2, 2]
		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			expect(err).to.match(/Assert Failed/)
		}
	})
	it('should succeed 3', async function () {
		let input = {
			paths: [
				[1, 1],
				[2, 1],
				[0, 2],
				[-1, -1],
				[-1, -1],
			],
			last_move: [2, 1],
		}
		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			assert(false, err.message)
		}

		// input.last_move = [0, 0]
		// try {
		// 	await circuit.calculateWitness(input)
		// } catch (err) {
		// 	expect(err).to.match(/Assert Failed/)
		// }
	})
})

describe('get_move', function () {
	let circuit

	before(async function () {
		circuit = await wasm('test/circom/get_move.t.circom')
	})

	it('Should generate the witness successfully', async function () {
		let input = {
			moves: [
				[1, 1],
				[2, 1],
				[0, 2],
				[-1, -1],
				[-1, -1],
			],
			move: [0, 2],
		}
		const witness = await circuit.calculateWitness(input)
		await circuit.assertOut(witness, {})
	})

	it('Should succeed', async function () {
		let input = {
			moves: [
				[1, 1],
				[2, 1],
				[0, 2],
				[-1, -1],
				[-1, -1],
			],
			move: [0, 2],
		}

		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			assert(false, err.message)
		}

		input = {
			moves: [
				[-1, -1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
				[-1, -1],
			],
			move: [-1, -1],
		}

		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			assert(false, err.message)
		}

		input = {
			moves: [
				[2, 3],
				[2, 3],
				[2, 3],
				[2, 3],
				[3, 5],
			],
			move: [3, 5],
		}

		try {
			await circuit.calculateWitness(input)
		} catch (err) {
			assert(false, err.message)
		}
	})

	it('Should fail', async function () {
		let input = {
			moves: [
				[0, 0],
				[2, 2],
				[3, 3],
				[-1, -1],
				[-1, -1],
			],
			move: [2, 2],
		}
		try {
			await circuit.calculateWitness(input)
			assert(false)
		} catch (err) {
			assert(err.message.includes('Assert Failed'))
		}
	})
})
