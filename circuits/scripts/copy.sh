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

cp ./build/sneak_js/sneak.wasm ../app/public

echo "Copied sneak.wasm to app/public/"

cp ./build/sneak_final.zkey ../app/public

echo "Copied sneak_final.zkey to app/public/"
