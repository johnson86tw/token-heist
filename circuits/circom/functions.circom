pragma circom 2.1.7;

/**
 * @param paths[5][2]           ex. [[0, 0], [1, 0], [2, 0], [-1, -1], [-1, -1]]
 * @returns last_paths[5][2]    ex. [[0, 0], [1, 0], [-1, -1], [-1, -1], [-1, -1]]
 *
 * if there's only one valid step, return [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]]
 */
function get_last_paths(paths) {
	var last_paths[5][2] = [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]];
	for (var i = 4; i > 0; i--) {
		if (paths[i][0] != -1 && paths[i][1] != -1) {
			last_paths[i-1][0] = paths[i-1][0];
			last_paths[i-1][1] = paths[i-1][1];
		}
	}
	return last_paths;
}

/**
 * @param paths[5][2]           ex. [[0, 0], [1, 0], [2, 0], [-1, -1], [-1, -1]]
 * @param index        			ex. 0
 * @returns last_move by index  ex. 2
 *
 * if there's only one step, return -1
 */
function get_last_move(paths, index) {
	for (var i = 4; i > 0; i--) {
		if (paths[i][index] != -1 && paths[i][index] != -1) {
			return paths[i-1][index];
		}
	}
	return -1;
}

/**
 * @param moves[5][2]           ex. [[0, 0], [1, 0], [2, 0], [-1, -1], [-1, -1]]
 * @param index        			ex. 1
 * @returns move by index       ex. 0
 */
function get_move(moves, index) {
	for (var i = 4; i >= 0; i--) {
		if (moves[i][index] != -1 && moves[i][index] != -1) {
			return moves[i][index];
		}
	}
	return -1;
}

// weird, I don't know why the following function doesn't work in test, so I have to use the above one

/**
 * @param ambushes[5][2]     	ex. [[0, 0], [1, 0], [2, 0], [-1, -1], [-1, -1]]
 * @returns ambush[2]        	ex. [2, 0]
 */
// function get_move(moves) {
// 	var move[2] = [-1, -1];
// 	for (var i = 4; i >= 0; i--) {
// 		if (moves[i][0] != -1 && moves[i][1] != -1) {
// 			move[0] = moves[i][0];
// 			move[1] = moves[i][1];
// 		}
// 	}
// 	return move;
// }