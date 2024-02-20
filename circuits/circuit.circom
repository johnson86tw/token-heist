pragma circom 2.1.7;

/* 
	3x3 Board
 	[0,0,0,0,0,0,0,0,0] == [0, 1, 2]
						   [3, 4, 5]
						   [6, 7, 8]
*/

template ThiefSneakVerifier() {
	var MAX_STEPS = 5;

	// thief
	signal input sneak_paths[MAX_STEPS]; // i.e. [3, 4, 5, 4, 4] means the thief moves from 3 to 4, 4 to 5, 5 to 4, 4 to 4
	signal input commitment;
	signal input new_commitment;

	// cops
	signal input ambush_locations[MAX_STEPS]; // i.e. [3, 6] means the cops are ambushing at the index 3 and 6 sequentially.
	
	// Check whether the hash of the sneak excluding the last move matches the commitment.
	
	// Check whether the hash of the sneak matches the new_commitment.

	// Check whether the penultimate move of the sneak is not the same as the last location of the ambush.

	signal move = sneak_paths[MAX_STEPS - 1];

	// Check the move made by the thief is not in any of the ambush locations set up by the cops.

	// Check the move made by the thief is either to an adjacent cell or staying in place.


	signal output noticed; // 0: not noticed, 1: noticed

	// Check if the last location of the ambush is adjacent to the penultimate move of the sneak

}

component main { public [ ambush_locations, commitment, new_commitment ] } = ThiefSneakVerifier();