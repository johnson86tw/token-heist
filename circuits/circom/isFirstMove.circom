pragma circom 2.1.7;

include "../node_modules/circomlib/circuits/comparators.circom";


template IsNotEqual() {
    signal input in[2];
    signal output out;

	signal eq <== IsEqual()([in[0], in[1]]);
	out <== IsZero()(eq);
}

template IsFirstMove() {
	signal input paths[5][2];
	signal output out;

	var total = 0;

	// Check if path[1] ~ path[4] are all -1
	signal is_negative_one_x[4];
	signal is_negative_one_y[4];
	signal is_negative_one[4];

	for (var i = 4; i > 0; i--) {
		is_negative_one_x[i-1] <== IsEqual()([paths[i][0], -1]);
		is_negative_one_y[i-1] <== IsEqual()([paths[i][1], -1]);
		is_negative_one[i-1] <== is_negative_one_x[i-1] * is_negative_one_y[i-1];
		total += is_negative_one[i-1]; // 1
	}

	// Check if path[0][0] and path[0][1] are not -1
	signal is_not_negative_one_x <== IsNotEqual()([paths[0][0], -1]);
	signal is_not_negative_one_y <== IsNotEqual()([paths[0][1], -1]);

	total += is_not_negative_one_x; // 1
	total += is_not_negative_one_y; // 1

	out <== IsEqual()([total, 6]);
}