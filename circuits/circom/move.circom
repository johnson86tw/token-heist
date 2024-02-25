pragma circom 2.1.7;

include "../node_modules/circomlib/circuits/comparators.circom";

// Check whether it's a valid move

template Move() {
	// last move
	signal input x1;
	signal input y1;

	// new move
	signal input x2;
	signal input y2;

	// check if the new move is within the board

	signal upper_x <==  LessThan(2)([x2, 3]);
	signal lower_x <==  GreaterEqThan(2)([x2, 0]);
	1 === upper_x * lower_x;

	signal upper_y <==  LessThan(2)([y2, 3]);
	signal lower_y <==  GreaterEqThan(2)([y2, 0]);
	1 === upper_y * lower_y;

	// check if the new move is a valid move

	var total = 0;
	var moves[5][2] = [[0, 0], [1, 0], [0, 1], [-1, 0], [0, -1]];

	signal move_x[5];
	signal move_y[5];
	signal move[5];
	
	for (var i = 0; i < 5; i++) {
		move_x[i] <== IsEqual()([x2, x1 + moves[i][0]]);
		move_y[i] <== IsEqual()([y2, y1 + moves[i][1]]);
		move[i] <== move_x[i] * move_y[i];
		total += move[i];
	}

	signal valid_move <== IsEqual()([total, 1]);
	valid_move === 1;
}