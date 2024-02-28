pragma circom 2.1.7;

include "../../circom/functions.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template GetLastMove() {
	signal input paths[5][2];
	signal input last_move[2];

	signal last_move_res[2];
	last_move_res[0] <-- get_last_move(paths, 0);
	last_move_res[1] <-- get_last_move(paths, 1);
	
	signal eq_x <== IsEqual()([last_move[0], last_move_res[0]]);
	signal eq_y <== IsEqual()([last_move[1], last_move_res[1]]);
	eq_x === 1;
	eq_y === 1;
}

component main = GetLastMove();