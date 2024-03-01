import { groth16 } from 'snarkjs'

const wasmPath = './sneak.wasm'
const zkeyPath = './sneak_final.zkey'

export type CircuitInput = {
	paths: [number, number][]
	ambushes: [number, number][]
}

export async function genProofAndPublicSignals(input: CircuitInput) {
	function format(n: number): BigInt {
		if (n === -1) {
			return BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495616')
		}
		return BigInt(n)
	}

	const formatInput = {
		paths: input.paths.map(([x, y]) => [format(x), format(y)]),
		ambushes: input.ambushes.map(([x, y]) => [format(x), format(y)]),
	}

	const { proof, publicSignals } = await groth16.fullProve(formatInput, wasmPath, zkeyPath)
	return { proof, publicSignals }
}
