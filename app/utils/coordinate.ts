export function flatten(paths: [number, number][]): number[] {
	const res = [-1, -1, -1, -1, -1]
	for (let i = 0; i < paths.length; i++) {
		if (paths[i][0] !== -1 && paths[i][1] !== -1) {
			res[i] = paths[i][0] + paths[i][1] * 3
		}
	}
	return res
}

export function findLastValidCell(paths: [number, number][]): [number, number] {
	for (let i = 4; i >= 0; i--) {
		if (paths[i][0] !== -1 && paths[i][1] !== -1) {
			return paths[i]
		}
	}
	return [-1, -1]
}
