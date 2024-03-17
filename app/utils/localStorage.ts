import { LS_PATHS } from '~/config'
import type { Paths } from '~/types'

export function lsGetPaths(address: string): Paths | null {
	try {
		const lsPaths = localStorage.getItem(LS_PATHS)
		const parsed = lsPaths && JSON.parse(lsPaths)
		if (parsed.address === address) {
			return parsed.paths
		}
	} catch (e: any) {
		return null
	}
	return null
}

export function lsSetPaths(address: string, paths: Paths) {
	try {
		localStorage.setItem(LS_PATHS, JSON.stringify({ address, paths }))
	} catch (e: any) {
		console.error('Failed to set LS_PATHS', e)
	}
}
