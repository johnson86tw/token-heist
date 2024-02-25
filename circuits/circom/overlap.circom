pragma circom 2.1.7;

include "../node_modules/circomlib/circuits/comparators.circom";

template Overlap() {
	signal input x;
	signal input y;

	signal input ambush_locations[5][2];

	signal eq[5][2];
	signal isz[5];

	var total = 0;
	for (var i = 0; i < 5; i++) {
		eq[i][0] <== IsEqual()([x, ambush_locations[i][0]]);
		eq[i][1] <== IsEqual()([y, ambush_locations[i][1]]);

		var temp = eq[i][0] * eq[i][1];
		isz[i] <== IsZero()(temp);
		total += isz[i];
	}

	component check_cover = IsEqual();
	check_cover.in[0] <== total;
	check_cover.in[1] <== 5;
	check_cover.out === 1;
}

component main {public [ambush_locations]} = Overlap();