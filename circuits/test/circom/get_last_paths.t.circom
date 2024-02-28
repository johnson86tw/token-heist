pragma circom 2.1.7;

include "../../circom/functions.circom";
include "../../node_modules/circomlib/circuits/comparators.circom";

template GetLastPaths() {
	signal input paths[5][2];
	signal input last_paths[5][2];

	signal last_paths_res[5][2] <-- get_last_paths(paths);
	
	signal eq_x[5];
	signal eq_y[5];
	signal eq[5];
	var total = 0;
	for (var i = 0; i < 5; i++) {
		eq_x[i] <== IsEqual()([last_paths_res[i][0], last_paths[i][0]]);
		eq_y[i] <== IsEqual()([last_paths_res[i][1], last_paths[i][1]]);
		eq[i] <== eq_x[i] * eq_y[i];
		total += eq[i];
	}

	signal all_eq;
	all_eq <== IsEqual()([total, 5]);
	all_eq === 1;
}

component main = GetLastPaths();