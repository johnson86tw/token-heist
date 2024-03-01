<script setup lang="ts">
import { ethers, Interface } from 'ethers'

const provider = new ethers.JsonRpcProvider('https://rpc.ankr.com/eth_sepolia')

const iface = new Interface([
	'function verifyProof(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[13] calldata _pubSignals) public view returns (bool)',
])
const sneakVerifierAddr = '0x08fAa4e244623C3205ADFfCB2A9709042ec71f19'
const sneakVerifier = new ethers.Contract(sneakVerifierAddr, iface, provider)

const input: CircuitInput = {
	paths: [
		[1, 2],
		[2, 2],
		[2, 1],
		[-1, -1],
		[-1, -1],
	],
	ambushes: [
		[1, 1],
		[1, 2],
		[-1, -1],
		[-1, -1],
		[-1, -1],
	],
}

async function onClickGenerateProof() {
	const { proof, publicSignals } = await genProofAndPublicSignals(input)
	console.log(proof, publicSignals)
}

async function onClickVerifyProof() {
	const { a, b, c, Input } = await exportCallData(input)
	const verified = await sneakVerifier.verifyProof(a, b, c, Input)
	console.log(verified)
}
</script>

<template>
	<div>
		<div>hi</div>
		<button @click="onClickGenerateProof">generate proof</button>
		<button @click="onClickVerifyProof">verify proof</button>
	</div>
</template>

<style lang="scss"></style>
