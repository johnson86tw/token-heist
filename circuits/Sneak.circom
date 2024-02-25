pragma circom 2.1.7;

include "./node_modules/circomlib/circuits/poseidon.circom";
include "./circom/move.circom";
include "./circom/overlap.circom";
include "./circom/adjacent.circom";

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
	signal input last_move[2];
	signal input move[2];
	signal input salt;

	// public
	signal input last_commitment;
	signal input commitment;
	signal input ambushes[5][2];

	signal output out;

	signal last_ambush_x <-- find_last_ambush(ambushes, 0);
	signal last_ambush_y <-- find_last_ambush(ambushes, 1);

	// check if the last commitment and the commitment are valid
	signal last_move_hash <== Poseidon(3)([last_move[0], last_move[1], salt]);
	last_commitment === last_move_hash;

	signal move_hash <== Poseidon(3)([move[0], move[1], salt]);
	commitment === move_hash;

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
	component is_adjacent = Adjacent();
	is_adjacent.x <== move[0];
	is_adjacent.y <== move[1];
	is_adjacent.ambush_x <== last_ambush_x;
	is_adjacent.ambush_y <== last_ambush_y;

	out <== is_adjacent.out;
}

component main {public [commitment, last_commitment, ambushes]} = Sneak();