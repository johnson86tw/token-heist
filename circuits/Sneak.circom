pragma circom 2.1.7;

include "./node_modules/circomlib/circuits/poseidon.circom";
include "./circom/hasher.circom";
include "./circom/move.circom";
include "./circom/overlap.circom";
include "./circom/adjacent.circom";

/* 
	3x3 Board

	// 2D array
 	[[0, 0], [1, 0], [2, 0]
	 [0, 1], [1, 1], [2, 1]
	 [0, 2], [1, 2], [2, 2]]

	// 1D array only for hashing
	[0, 1, 2
	 3, 4, 5
	 6, 7, 8]
*/


// if there's only one step, return [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]]
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

// if there's only one step, return [-1, -1]
function get_last_move(paths) {
	var last_move[2] = [-1, -1];
	for (var i = 4; i > 0; i--) {
		if (paths[i][0] != -1) {
			last_move[0] = paths[i-1][0];
			last_move[1] = paths[i-1][1];
		}
	}
	return last_move;
}

function get_current_move(paths) {
	var move[2] = [-1, -1];
	for (var i = 4; i > 0; i--) {
		if (paths[i][0] != -1) {
			move[0] = paths[i][0];
			move[1] = paths[i][1];
		}
	}
	return move;
}

function get_last_ambush(ambushes) {
	var last_ambush[2] = [-1, -1];
	for (var i = 4; i > 0; i--) {
		if (ambushes[i][0] != -1) {
			last_ambush[0] = ambushes[i][0];
			last_ambush[1] = ambushes[i][1];
		}
	}
	return last_ambush;
}

template Sneak() {
	// secret
	signal input paths[5][2];

	// public	
	signal input ambushes[5][2];

	signal output last_commitment;
	signal output commitment;
	signal output noticed;

	// calculate commitments
	
	signal last_paths[5][2] <-- get_last_paths(paths);

	// should salt be added?
	signal last_paths_hash <== PathHasher()(last_paths);
	last_commitment <== last_paths_hash;

	signal paths_hash <== PathHasher()(paths);
	commitment <== paths_hash;

	// ------------------------------------------------------------

	signal last_move[2] <-- get_last_move(paths);
	signal move[2] <-- get_current_move(paths);

	/* Check if the move is valid */
	/* Check the move is within the range of -1 to 8 */
	/* Check the move is either to an adjacent cell or staying in place */
	component valid_move = Move();
	valid_move.x1 <== last_move[0];
	valid_move.y1 <== last_move[1];
	valid_move.x2 <== move[0];
	valid_move.y2 <== move[1];
	
	/* Check if the move overlaps with any ambush */
	component no_overlap = Overlap();
	no_overlap.x <== move[0];
	no_overlap.y <== move[1];
	no_overlap.ambushes <== ambushes;

	/* Check if the last move is adjacent to the last ambush */
	signal last_ambush[2] <-- get_last_ambush(ambushes);
	
	component is_adjacent = Adjacent();
	is_adjacent.x <== last_move[0];
	is_adjacent.y <== last_move[1];
	is_adjacent.ambush_x <== last_ambush[0];
	is_adjacent.ambush_y <== last_ambush[1];

	noticed <== is_adjacent.out;
}

component main {public [ambushes]} = Sneak();

