import { groth16 } from 'snarkjs'
import path from 'path'

const wasmPath = path.join(__dirname, '../node_modules/@token-heist/circuits/build/sneak_js/sneak.wasm')
const zkeyPath = path.join(__dirname, '../node_modules/@token-heist/circuits/build/sneak_final.zkey')

export type CircuitInput = {
	paths: [number, number][]
	ambushes: [number, number][]
}

export async function genProofAndPublicSignals(input: CircuitInput) {
	const { proof, publicSignals } = await groth16.fullProve(input, wasmPath, zkeyPath)
	return { proof, publicSignals }
}

export async function exportCallDataGroth16(input: CircuitInput) {
	const { proof: _proof, publicSignals: _publicSignals } = await groth16.fullProve(input, wasmPath, zkeyPath)
	const calldata = await groth16.exportSolidityCallData(_proof, _publicSignals)

	const argv = calldata
		.replace(/["[\]\s]/g, '')
		.split(',')
		.map(x => BigInt(x).toString())

	const a = [argv[0], argv[1]]
	const b = [
		[argv[2], argv[3]],
		[argv[4], argv[5]],
	]
	const c = [argv[6], argv[7]]
	const Input = []

	for (let i = 8; i < argv.length; i++) {
		Input.push(argv[i])
	}

	return { a, b, c, Input }
}
