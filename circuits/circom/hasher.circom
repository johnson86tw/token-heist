pragma circom 2.1.7;

include "../node_modules/circomlib/circuits/poseidon.circom";

function flatten(paths) {
	var res[5] = [-1, -1, -1, -1, -1];
	for (var i = 0; i < 5; i++) {
		if (paths[i][0] != -1 && paths[i][1] != -1) {
			res[i] = paths[i][0] + paths[i][1] * 3;
		}
	}
	return res;
}

template PathHasher() {
	signal input in[5][2];
	signal output out;

	signal flattened_paths[5] <-- flatten(in);
	
	out <== Poseidon(5)(flattened_paths);
}