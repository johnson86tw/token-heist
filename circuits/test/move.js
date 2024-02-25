import { assert } from 'chai'
import { wasm } from 'circom_tester'

describe('move', function () {
	let circuit

	before(async function () {
		circuit = await wasm('test/move.t.circom')
	})

	it('Should generate the witness successfully', async function () {
		let input = {
			x1: 1,
			y1: 1,
			x2: 2,
			y2: 1,
		}
		const witness = await circuit.calculateWitness(input)
		await circuit.assertOut(witness, {})
	})

	// [[0,0], [1,0], [2,0]
	// [0,1], [1,1], [2,1]
	// [0,2], [1,2], [2,2]]

	it('Should move or stay put', async function () {
		const pos = [
			[0, 0],
			[1, 0],
			[2, 0],
			[0, 1],
			[1, 1],
			[2, 1],
			[0, 2],
			[1, 2],
			[2, 2],
		]

		const moves = [
			[0, 0],
			[1, 0],
			[0, 1],
			[-1, 0],
			[0, -1],
		]

		for (let i = 0; i < pos.length; i++) {
			const x1 = pos[i][0]
			const y1 = pos[i][1]

			for (let j = 0; j < moves.length; j++) {
				const x2 = x1 + moves[j][0]
				const y2 = y1 + moves[j][1]
				if (x2 >= 0 && x2 < 3 && y2 >= 0 && y2 < 3) {
					// console.log('x1:', x1, 'y1:', y1, 'x2:', x2, 'y2:', y2)
					try {
						await circuit.calculateWitness({
							x1,
							y1,
							x2,
							y2,
						})
					} catch (err) {
						assert(false, err.message)
					}
				}
			}
		}
	})

	it('Should fail because of invalid move', async function () {
		const pos = [
			[0, 0],
			[1, 0],
			[2, 0],
			[0, 1],
			[1, 1],
			[2, 1],
			[0, 2],
			[1, 2],
			[2, 2],
		]

		const moves = [
			[0, 0],
			[1, 0],
			[0, 1],
			[-1, 0],
			[0, -1],
		]

		for (let i = 0; i < pos.length; i++) {
			const x1 = pos[i][0]
			const y1 = pos[i][1]

			for (let j = 0; j < moves.length; j++) {
				const x2 = x1 + moves[j][0]
				const y2 = y1 + moves[j][1]
				if (x2 >= 0 && x2 < 3 && y2 >= 0 && y2 < 3) {
					// adjacent cells
					continue
				}
				try {
					await circuit.calculateWitness({
						x1,
						y1,
						x2,
						y2,
					})
				} catch (err) {
					assert(err.message.includes('Assert Failed'))
				}
			}
		}
	})
})
