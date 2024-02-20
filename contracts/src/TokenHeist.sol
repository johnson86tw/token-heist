// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract TokenHeist {
    // Constants
    uint256 public constant maxCops = 5;

    // Players
    address public thief;
    address public police;

    // Game
    uint256[] public treasureMap;
    // 0 - not started, 1 - in progress, 2 - ended
    uint256 public gameState = 0;
    // 0 - not started, 1 - thief, 2 - police
    uint256 public currentPlayer = 0;

    // Thief
    uint256 thiefCommitment;
    uint256 public thiefBalance = 0;

    // Police
    uint256[] public ambushLocations;
    uint256 public ambushCount = 0;


    constructor(uint256[] calldata _treasureMap) {
        treasureMap = _treasureMap;
    }

    modifier onlyThief() {
        require(msg.sender == thief, "Only thief can call this function");
        _;
    }

    modifier onlyPolice() {
        require(msg.sender == police, "Only police can call this function");
        _;
    }

    function registry() public {
        
    }

    function sneak(proof, newCommitment) onlyThief public {
        require(verifier(proof), "Invalid proof");
        thiefCommitment = newCommitment;
    }

    function surrender() onlyThief public {
    
    }

    function ambush() onlyPolice public {

    }
}
