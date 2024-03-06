import { groth16 } from 'snarkjs'
import path from 'path'

import { F1Field } from 'ffjavascript'
import { Scalar } from 'ffjavascript'
const p = Scalar.fromString('21888242871839275222246405745257275088548364400416034343698204186575808495617')
const Fr = new F1Field(p)

export function toFiniteField(x: number): bigint {
	return Fr.e(x)
}

const wasmPath = path.join(__dirname, '../node_modules/@token-heist/circuits/build/sneak_js/sneak.wasm')
const zkeyPath = path.join(__dirname, '../node_modules/@token-heist/circuits/build/sneak_final.zkey')

export type CircuitInput = {
	paths: [number, number][]
	ambushes: [number, number][]
}

export async function genProofAndPublicSignals(input: CircuitInput) {
	const formatInput = {
		paths: input.paths.map(([x, y]) => [Fr.e(x), Fr.e(y)]),
		ambushes: input.ambushes.map(([x, y]) => [Fr.e(x), Fr.e(y)]),
	}
	const { proof, publicSignals } = await groth16.fullProve(formatInput, wasmPath, zkeyPath)
	return { proof, publicSignals }
}

export async function exportCallDataGroth16(input: CircuitInput) {
	const formatInput = {
		paths: input.paths.map(([x, y]) => [Fr.e(x), Fr.e(y)]),
		ambushes: input.ambushes.map(([x, y]) => [Fr.e(x), Fr.e(y)]),
	}
	const { proof: _proof, publicSignals: _publicSignals } = await groth16.fullProve(formatInput, wasmPath, zkeyPath)
	const calldata = await groth16.exportSolidityCallData(_proof, _publicSignals)

	const argv = calldata
		.replace(/["[\]\s]/g, '')
		.split(',')
		.map(x => BigInt(x))

	const a: [bigint, bigint] = [argv[0], argv[1]]
	const b: [[bigint, bigint], [bigint, bigint]] = [
		[argv[2], argv[3]],
		[argv[4], argv[5]],
	]
	const c: [bigint, bigint] = [argv[6], argv[7]]
	const Input: bigint[] = []

	for (let i = 8; i < argv.length; i++) {
		Input.push(argv[i])
	}

	return { a, b, c, Input }
}
