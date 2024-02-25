pragma circom 2.1.7;

include "../node_modules/circomlib/circuits/comparators.circom";

// Check the move cannot overlap the ambush locations

template Overlap() {
	signal input x;
	signal input y;

	signal input ambush_locations[5][2];

	signal eq_x[5];
	signal eq_y[5];
	signal is_equal[5];

	var total = 0;
	for (var i = 0; i < 5; i++) {
		eq_x[i] <== IsEqual()([x, ambush_locations[i][0]]);
		eq_y[i] <== IsEqual()([y, ambush_locations[i][1]]);

		is_equal[i] <== eq_x[i] * eq_y[i];
		total += is_equal[i];
	}

	signal is_zero <== IsZero()(total);
	is_zero === 1;

}

component main {public [ambush_locations]} = Overlap();