pragma circom 2.1.7;

include "../node_modules/circomlib/circuits/comparators.circom";


function find_last_ambush(ambushes, pos) {
    for (var i = 4; i >= 0; i--) {
		if (ambushes[i][pos] != -1) {
			return ambushes[i][pos];
		}
	}
	return -1;
}

template FindLast() {
	signal input ambushes[5][2];
	signal input last_ambush[2];

	signal ambush_x <-- find_last_ambush(ambushes, 0);
	signal ambush_y <-- find_last_ambush(ambushes, 1);
	
	signal eq_x;
	signal eq_y;
	
	eq_x <== IsEqual()([ambush_x, last_ambush[0]]);
	eq_y <== IsEqual()([ambush_y, last_ambush[1]]);

	signal eq <== eq_x * eq_y;
	eq === 1;

}

component main = FindLast();