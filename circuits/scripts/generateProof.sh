#!/bin/bash

# Variable to store the name of the circuit
CIRCUIT=sneak

# In case there is a circuit name as input
if [ "$1" ]; then
    CIRCUIT=$1
fi

# Compile the circuit
snarkjs groth16 prove build/${CIRCUIT}_final.zkey build/${CIRCUIT}_js/witness.wtns build/proof.json build/public.json
