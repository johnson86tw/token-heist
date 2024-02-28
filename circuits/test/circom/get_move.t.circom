pragma circom 2.1.7;

include "../../circom/functions.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template GetMove() {
	signal input moves[5][2];
	signal input move[2];

	signal move_res[2];
	move_res[0] <-- get_move(moves, 0);
	move_res[1] <-- get_move(moves, 1);
	
	signal eq_x <== IsEqual()([move_res[0], move[0]]);
	signal eq_y <== IsEqual()([move_res[1], move[1]]);
	eq_x * eq_y === 1;
}

component main = GetMove();