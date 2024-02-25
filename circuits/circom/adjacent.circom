pragma circom 2.1.7;

include "../node_modules/circomlib/circuits/comparators.circom";

// Check whether it's adjacent to ambush locations

template Adjacent() {
	signal input x;
	signal input y;

	signal input ambush_locations[5][2];

	signal output out; // 0 if not adjacent, 1 if adjacent


}

component main = Adjacent();