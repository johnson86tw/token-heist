pragma circom 2.1.7;

include "../node_modules/circomlib/circuits/comparators.circom";

// Check whether it's adjacent to ambush locations

template Adjacent() {
	signal input x;
	signal input y;
	signal input ambush_x;
	signal input ambush_y;

	signal output out; // 0 if not adjacent, 1 if adjacent

	signal eq_x[4];
	signal eq_y[4];
	signal eq[4];

	var total = 0;
	var moves[4][2] = [[1, 0], [0, 1], [-1, 0], [0, -1]];
	for (var i = 0; i < 4; i++) {
		var nx = x + moves[i][0];
		var ny = y + moves[i][1];

		eq_x[i] <== IsEqual()([nx, ambush_x]);
		eq_y[i] <== IsEqual()([ny, ambush_y]);
		eq[i] <== eq_x[i] * eq_y[i];
		total += eq[i];
	}

	out <== IsEqual()([total, 1]);
}