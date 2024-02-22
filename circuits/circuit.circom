pragma circom 2.1.7;

include "./node_modules/circomlib/circuits/comparators.circom";

/* 
	3x3 Board
 	[-1,-1,-1,-1,-1,-1,-1,-1,-1] == [0, 1, 2]
						   			[3, 4, 5]
						   			[6, 7, 8]
*/

template NotEqual() {
    signal input in[2];
    signal tmp <== IsZero()(in[0] - in[1]); // this
    signal output out <== -1 * tmp + 1;
}

template ThiefSneakVerifier() {
	// max steps the thief can take and the amount of ambushes the police can set up
	var LEN = 5; 

	// thief
	// i.e. [3, 4, 5, 5, -1] means the thief moves from 3 to 4, 4 to 5, 5 to 5, and theif has one more move.
	signal input sneak_paths[LEN];
	signal input commitment;
	signal input new_commitment;

	// cops
	// i.e. [3, 6, -1, -1, -1] means two cops are ambushing at the index 3 and 6 sequentially.
	signal input ambush_locations[LEN];

	// ** Check whether the number in sneak_paths and ambush_locations are within the range of -1 to 8.

	// ** Check whether the format of sneak_paths and ambush_locations are correct.

	// ** Check whether the hash of the sneak excluding the last move matches the commitment.
	
	// ** Check whether the hash of the sneak matches the new_commitment.

	// ** Check whether the penultimate move of the sneak is not the same as the last location of the ambush.


	var previous_move = -1;
	for (var i = LEN - 1; i > 0; i--) {
		if (previous_move == -1 && sneak_paths[i] != -1) {
			previous_move = sneak_paths[i-1];
		}
	}

	var m = -1;
	for (var i = LEN-1; i >= 0; i--) {
		if (m == -1 && sneak_paths[i] != -1) {
			m = sneak_paths[i];
			log(m);
		}
	}
	signal move <-- m; // 變回 signal 是為了之後可以用在 NotEqual() 裡面, right?

	// ** Check the move made by the thief is not in any of the ambush locations set up by the cops.

	signal neq[LEN]; // 可否使用 var?

	var move_without_cops_total = 0;
	for (var i = 0; i < LEN; i++) {
		neq[i] <== NotEqual()([move, ambush_locations[i]]);
		move_without_cops_total += neq[i];
	}

	component move_without_cops = IsEqual();
	move_without_cops.in[0] <== move_without_cops_total;
	move_without_cops.in[1] <== LEN;
	move_without_cops.out === 1;

	// ** Check the move made by the thief is either to an adjacent cell or staying in place.

	var total = 0;
	signal eq[5];

	var moves[4] = [-3, 3, -1, 1];
	for (var i = 0; i < 4; i++) {
		var new_index = move + moves[i];

		// @bug: There are constraints depending on the value of the condition and it can be unknown during the constraint generation phase
		if (new_index >= 0 && new_index < 9) {
			if (moves[i] == -1 && move % 3 == 0) {
				
			} else if (moves[i] == 1 && move % 3 == 2) {

			} else {
				eq[i] <== IsEqual()([moves[i], move]);
				total += eq[i];
			}
		}
	}

	// eq[4] <== IsEqual()([previous_move, move]);
	// total += eq[4];

	// component valid_move = IsEqual();
	// valid_move.in[0] <== total;
	// valid_move.in[1] <== 1;
	// valid_move.out === 1;

	
	// ** Check if the last location of the ambush is adjacent to the penultimate move of the sneak
	
	// 0: not noticed, 1: noticed
	// signal output noticed[1];
}

component main { public [ ambush_locations, commitment, new_commitment ] } = ThiefSneakVerifier();