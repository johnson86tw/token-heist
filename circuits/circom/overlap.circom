pragma circom 2.1.7;

include "../node_modules/circomlib/circuits/comparators.circom";

// Check the move cannot overlap the ambush locations

template Overlap() {
	signal input x;
	signal input y;

	signal input ambushes[5][2];

	signal eq_x[5];
	signal eq_y[5];
	signal is_equal[5];
	signal not_equal_check[5];
	for (var i = 0; i < 5; i++) {
		eq_x[i] <== IsEqual()([x, ambushes[i][0]]);
		eq_y[i] <== IsEqual()([y, ambushes[i][1]]);

		is_equal[i] <== eq_x[i] * eq_y[i];
		not_equal_check[i] <== IsZero()(is_equal[i]);
		not_equal_check[i] === 1;
	}
}