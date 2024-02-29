#!/bin/bash

# Variable to store the name of the circuit
CIRCUIT=sneak

# In case there is a circuit name as input
if [ "$1" ]; then
    CIRCUIT=$1
fi

cp ./build/SneakVerifier.sol ../contracts/contracts

echo ------------------------------------------------------------
echo "Copied SneakVerifier.sol to contracts/contracts/"
