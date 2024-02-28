#!/bin/bash

# Variable to store the name of the circuit
CIRCUIT=sneak

# Variable to store the number of the ptau file
PTAU=14

# In case there is a circuit name as an input
if [ "$1" ]; then
    CIRCUIT=$1
fi

# In case there is a ptau file number as an input
if [ "$2" ]; then
    PTAU=$2
fi

# Check if the necessary ptau file already exists. If it does not exist, it will be downloaded from the data center
if [ -f ./ptau/powersOfTau28_hez_final_${PTAU}.ptau ]; then
    echo "----- powersOfTau28_hez_final_${PTAU}.ptau already exists -----"
else
    echo "----- Download powersOfTau28_hez_final_${PTAU}.ptau -----"
    wget -P ./ptau https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_${PTAU}.ptau
fi

# Delete the build folder, if it exists
rm -r -f build

# Create the build folder
mkdir -p build

# Compile the circuit
circom ${CIRCUIT}.circom --r1cs --wasm --sym --c -o build

# Generate the witness.wtns
node build/${CIRCUIT}_js/generate_witness.js build/${CIRCUIT}_js/${CIRCUIT}.wasm input.json build/${CIRCUIT}_js/witness.wtns

echo "----- Generate .zkey file -----"
# Generate a .zkey file that will contain the proving and verification keys together with all phase 2 contributions
snarkjs groth16 setup build/${CIRCUIT}.r1cs ptau/powersOfTau28_hez_final_${PTAU}.ptau build/${CIRCUIT}_0000.zkey

echo "----- Contribute to the phase 2 of the ceremony -----"
# Contribute to the phase 2 of the ceremony
snarkjs zkey contribute build/${CIRCUIT}_0000.zkey build/${CIRCUIT}_final.zkey --name="1st Contributor Name" -v -e="some random text"

echo "----- Export the verification key -----"
# Export the verification key
snarkjs zkey export verificationkey build/${CIRCUIT}_final.zkey build/verification_key.json

echo "----- Generate zk-proof -----"
# Generate a zk-proof associated to the circuit and the witness. This generates proof.json and public.json
snarkjs groth16 prove build/${CIRCUIT}_final.zkey build/${CIRCUIT}_js/witness.wtns build/proof.json build/public.json

echo "----- Verify the proof -----"
# Verify the proof
snarkjs groth16 verify build/verification_key.json build/public.json build/proof.json

echo "----- Generate Solidity verifier -----"

CIRCUIT_CAP=$(echo ${CIRCUIT:0:1} | tr '[a-z]' '[A-Z]')${CIRCUIT:1}

# Generate a Solidity verifier that allows verifying proofs on Ethereum blockchain
snarkjs zkey export solidityverifier build/${CIRCUIT}_final.zkey build/${CIRCUIT_CAP}Verifier.sol

# Update the contract name in the Solidity verifier
sed -i "" "s/contract Groth16Verifier/contract ${CIRCUIT_CAP}Verifier/g" build/${CIRCUIT_CAP}Verifier.sol

echo "----- Generate and print parameters of call -----"
# Generate and print parameters of call
snarkjs generatecall build/public.json build/proof.json | tee build/parameters.txt
