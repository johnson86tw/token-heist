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
 * @returns last_move[2]        ex. [1, 0]
 *
 * if there's only one valid step, return [-1, -1]
 */
function get_last_move(paths) {
	var last_move[2] = [-1, -1];
	for (var i = 4; i > 0; i--) {
		if (paths[i][0] != -1 && paths[i][1] != -1) {
			last_move[0] = paths[i-1][0];
			last_move[1] = paths[i-1][1];
		}
	}
	return last_move;
}

/**
 * @param paths[5][2]           ex. [[0, 0], [1, 0], [2, 0], [-1, -1], [-1, -1]]
 * @returns move[2]       		ex. [2, 0]
 */
function get_move(paths) {
	var move[2] = [-1, -1];
	for (var i = 4; i >= 0; i--) {
		if (paths[i][0] != -1 && paths[i][1] != -1) {
			move[0] = paths[i][0];
			move[1] = paths[i][1];
		}
	}
	return move;
}

/**
 * @param ambushes[5][2]     	ex. [[0, 0], [1, 0], [2, 0], [-1, -1], [-1, -1]]
 * @returns ambush[2]        	ex. [2, 0]
 */
function get_ambush(ambushes) {
	var ambush[2] = [-1, -1];
	for (var i = 4; i >= 0; i--) {
		if (ambushes[i][0] != -1 && ambushes[i][1] != -1) {
			ambush[0] = ambushes[i][0];
			ambush[1] = ambushes[i][1];
		}
	}
	return ambush;
}