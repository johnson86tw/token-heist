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
			console.error(err)
			assert(false)
		}

		input.last_move = [[2, 2]]
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
			console.error(err)
			assert(false)
		}

		// input.last_move = [0, 0]
		// try {
		// 	await circuit.calculateWitness(input)
		// } catch (err) {
		// 	expect(err).to.match(/Assert Failed/)
		// }
	})
})
