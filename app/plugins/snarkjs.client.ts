import { groth16 } from 'snarkjs'

export default defineNuxtPlugin(nuxtApp => {
	return {
		provide: {
			groth16: groth16,
		},
	}
})
