// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

contract TokenHeist {
    // Constants
    uint8 public constant MAX_COPS = 5;
    uint256 public constant STAKE_AMOUNT = 0.1 ether;

    enum Role {
        Thief,
        Police
    }

    enum GameState {
        NotStarted,
        InProgress,
        Ended
    }

    uint256[9] public treasure = [1, 2, 1, 2, 3, 4, 3, 5, 4];
    Role public currentPlayer = Role.Thief;
    mapping(address => uint256) public stakes;
    mapping(address => uint256) public bets;
    mapping(Role => bool) public playerReady;

    address public thief;
    address public police;
    address public winner;

    // Thief
    uint256 commitment;
    uint256 public thiefBalance = 0;

    // Police
    int8[5][2] public ambushes = [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]];
    uint8 public copCount = 0;

    constructor(uint256[9] calldata _treasure) {
        treasure = _treasure;
    }

    modifier onlyThief() {
        require(msg.sender == thief, "Only thief can call this function");
        _;
    }

    modifier onlyPolice() {
        require(msg.sender == police, "Only police can call this function");
        _;
    }

    modifier onlyPlayer() {
        require(msg.sender == thief || msg.sender == police, "Only players can call this function");
        _;
    }

    function register(Role role, uint256 bet) public payable {
        require(gameState == GameState.NotStarted, "Game has already started");
        require(msg.value == STAKE_AMOUNT + bet, "Invalid stake amount");

        if (role == Role.Thief) {
            require(thief == address(0), "Thief has already registered");
            thief = payable(msg.sender);
            stakes[msg.sender] = STAKE_AMOUNT;
            bets[msg.sender] = bet;
        } else if (role == Role.Police) {
            require(police == address(0), "Police has already registered");
            police = payable(msg.sender);
            stakes[msg.sender] = STAKE_AMOUNT;
            bets[msg.sender] = bet;
        }
    }

    function cancelRegistration() public onlyPlayer {
        require(gameState == GameState.NotStarted, "Game has already started");
        gameState = GameState.Ended;
    }

    function withdraw() public onlyPlayer {
        require(gameState == GameState.Ended, "Game has not ended yet");

        if (winner == address(0)) {
            payable(msg.sender).transfer(stakes[msg.sender]);
        } else {
            if (msg.sender == winner) {
                uint256 amount = stakes[msg.sender] + bets[thief] + bets[msg.sender];
                stakes[msg.sender] = 0;
                bets[thief] = 0;
                payable(msg.sender).transfer(amount);
            } else {
                stakes[msg.sender] = 0;
                payable(msg.sender).transfer(stakes[msg.sender]);
            }
        }
    }

    function ready() public onlyPlayer {
        require(stakes[msg.sender] > 0, "Player has not registered");

        playerReady[Role(msg.sender)] = true;

        if (playerReady[Role.Thief] && playerReady[Role.Police]) {
            gameState = GameState.InProgress;
        }
    }

    function sneak(proof, _commitment) public onlyThief {
        // public inputs: commitment
        require(verifier(proof), "Invalid proof");

        commitment = _commitment;

        if (copCount == MAX_COPS) {
            gameState = GameState.Ended;
            winner = thief;
        } else {
            currentPlayer = Role.Police;
        }
    }

    // theif reveal his path and rob the treasure
    function rob(int256[5][2] _sneakPaths) public onlyThief {
        require(gameState == GameState.Ended, "Game has not ended yet");
        require(winner == thief, "Thief is not the winner");
        // require commitment === hashed sneakPaths

        for (uint8 i = 0; i < _sneakPaths.length; i++) {
            int8[2] memory path = _sneakPaths[i];
            // change to erc20 mint
            thiefBalance += treasure[path[0] + path[1] * 3];
        }
    }

    function surrender() public onlyThief {
        require(gameState == GameState.InProgress, "Game has not started yet");
        gameState = GameState.Ended;
        thiefBalance = 0;
        winner = police;
    }

    function dispatch(uint8 x, uint8 y) public onlyPolice {
        require(copCount <= MAX_COPS, "All cops are already dispatched");
        require(x < 3 && x >= 0 && y < 3 && y >= 0, "Invalid coordinates");

        if (ambushes[0][0] == -1 && ambushes[0][1] == -1) {
            ambushes[0][0] = x;
            ambushes[0][1] = y;
            copCount++;
        } else {
            for (uint8 i = 0; i < MAX_COPS; i++) {
                require(ambushes[i][0] != x && ambushes[i][1] != y, "Ambush already exists");

                if (ambushes[i][0] == -1 && ambushes[i][1] == -1) {
                    ambushes[i][0] = x;
                    ambushes[i][1] = y;
                    copCount++;
                    break;
                }
            }
        }

        currentPlayer = Role.Thief;
    }
}
