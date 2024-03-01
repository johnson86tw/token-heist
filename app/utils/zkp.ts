export type CircuitInput = {
	paths: [number, number][]
	ambushes: [number, number][]
}

export async function genProofAndPublicSignals(input: CircuitInput) {
	function format(n: number): bigint {
		if (n === -1) {
			return BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495616')
		}
		return BigInt(n)
	}

	const formatInput = {
		paths: input.paths.map(([x, y]) => [format(x), format(y)]),
		ambushes: input.ambushes.map(([x, y]) => [format(x), format(y)]),
	}

	// if directly importing groth16 from snarkjs here, it would lead to dev server error: Cannot destructure property 'mod' of 'threads.workerData' as it is undefined.
	const { $groth16 } = useNuxtApp()

	const origin = window.location.origin
	const wasmPath = `${origin}/sneak.wasm`
	const zkeyPath = `${origin}/sneak_final.zkey`

	const { proof, publicSignals } = await $groth16.fullProve(formatInput, wasmPath, zkeyPath)
	return { proof, publicSignals }
}

export async function exportCallData(input: CircuitInput) {
	function format(n: number): bigint {
		if (n === -1) {
			return BigInt('21888242871839275222246405745257275088548364400416034343698204186575808495616')
		}
		return BigInt(n)
	}
	const formatInput = {
		paths: input.paths.map(([x, y]) => [format(x), format(y)]),
		ambushes: input.ambushes.map(([x, y]) => [format(x), format(y)]),
	}

	const { $groth16 } = useNuxtApp()

	const origin = window.location.origin
	const wasmPath = `${origin}/sneak.wasm`
	const zkeyPath = `${origin}/sneak_final.zkey`

	const { proof, publicSignals } = await $groth16.fullProve(formatInput, wasmPath, zkeyPath)
	const calldata = await $groth16.exportSolidityCallData(proof, publicSignals)

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
	const Input: string[] = []

	for (let i = 8; i < argv.length; i++) {
		Input.push(argv[i])
	}

	return { a, b, c, Input }
}
