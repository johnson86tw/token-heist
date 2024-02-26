pragma circom 2.1.7;

include "./node_modules/circomlib/circuits/poseidon.circom";
include "./circom/hasher.circom";
include "./circom/move.circom";
include "./circom/overlap.circom";
include "./circom/adjacent.circom";

// 如果是第一步，返回 [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]]
function get_last_paths(paths) {
	var last_paths[5][2] = [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]];
	for (var i = 4; i > 0; i--) {
		if (paths[i][0] != -1) {
			last_paths[i-1][0] = paths[i][0];
			last_paths[i-1][1] = paths[i][1];
		}
	}
	return last_paths;
}

// 如果是第一步，返回 [-1, -1]
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

function find_last_ambush(ambushes, pos) {
    for (var i = 4; i >= 0; i--) {
		if (ambushes[i][pos] != -1) {
			return ambushes[i][pos];
		}
	}
	return -1;
}

template Sneak() {
	// secret
	signal input paths[5][2];

	// public	
	signal input ambushes[5][2];

	signal output last_commitment;
	signal output commitment;
	signal output noticed;

	// check commitments, should salt be added?
	signal last_paths[5][2] <-- get_last_paths(paths);

	signal last_paths_hash <== PathHasher()(last_paths);
	last_commitment <== last_paths_hash;

	signal paths_hash <== PathHasher()(paths);
	commitment <== paths_hash;

	// ------------------------------------------------------------

	signal last_move[2] <-- get_last_move(paths);
	signal move[2] <-- get_current_move(paths);

	// check if the move is valid
	component valid_move = Move();
	valid_move.x1 <== last_move[0];
	valid_move.y1 <== last_move[1];
	valid_move.x2 <== move[0];
	valid_move.y2 <== move[1];
	
	// check if the move overlaps with any ambush
	component no_overlap = Overlap();
	no_overlap.x <== move[0];
	no_overlap.y <== move[1];
	no_overlap.ambushes <== ambushes;

	// check if the move is adjacent to the last ambush
	signal last_ambush_x <-- find_last_ambush(ambushes, 0);
	signal last_ambush_y <-- find_last_ambush(ambushes, 1);
	
	component is_adjacent = Adjacent();
	is_adjacent.x <== move[0];
	is_adjacent.y <== move[1];
	is_adjacent.ambush_x <== last_ambush_x;
	is_adjacent.ambush_y <== last_ambush_y;

	noticed <== is_adjacent.out;
}

component main {public [ambushes]} = Sneak();