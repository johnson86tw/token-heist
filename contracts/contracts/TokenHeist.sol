// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

interface IVerifier {
    function verifyProof(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[13] calldata _pubSignals
    ) external view returns (bool);
}

contract TokenHeist {
    IVerifier public immutable sneakVerifier;

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

    GameState public gameState = GameState.NotStarted;
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
    int8[2][5] public ambushes = [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]]; // why it's [2][5] instead of [5][2]?
    uint8 public copCount = 0;

    constructor(IVerifier _sneakVerifier) {
        sneakVerifier = _sneakVerifier;
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

        if (msg.sender == thief) {
            playerReady[Role.Thief] = true;
        } else {
            playerReady[Role.Police] = true;
        }

        if (playerReady[Role.Thief] && playerReady[Role.Police]) {
            gameState = GameState.InProgress;
        }
    }

    function sneak(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[13] calldata _pubSignals
    ) public onlyThief {
        // check public signal commitment is correct to contracts commitment

        if (!sneakVerifier.verifyProof(_pA, _pB, _pC, _pubSignals)) {
            revert InvalidProof();
        }

        // commitment = _pubSignals.commitment;

        if (copCount == MAX_COPS) {
            gameState = GameState.Ended;
            winner = thief;
        } else {
            currentPlayer = Role.Police;
        }
    }

    function reveal(
        int8[5][2] calldata _sneakPaths,
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[13] calldata _pubSignals
    ) external onlyThief {
        require(gameState == GameState.InProgress, "Game has not started yet");

        // check _sneakPaths === commitment

        // theif wins
        if (sneakVerifier.verifyProof(_pA, _pB, _pC, _pubSignals)) {
            // cops should be all dispatched
            winner = thief;
            // get treasure
            for (uint8 i = 0; i < _sneakPaths.length; i++) {
                // _sneakPaths value must be unsigned
                // change to erc20 mint
                thiefBalance += treasure[uint8(_sneakPaths[i][0]) + uint8(_sneakPaths[i][1]) * 3];
            }
        } else {
            // theif loses
            winner = police;
            thiefBalance = 0;
        }

        gameState = GameState.Ended;
    }

    function dispatch(uint8 x, uint8 y) public onlyPolice {
        require(copCount <= MAX_COPS, "All cops are already dispatched");
        require(x < 3 && x >= 0 && y < 3 && y >= 0, "Invalid coordinates");

        if (ambushes[0][0] == -1 && ambushes[0][1] == -1) {
            ambushes[0][0] = int8(x);
            ambushes[0][1] = int8(y);
            copCount++;
        } else {
            for (uint8 i = 0; i < MAX_COPS; i++) {
                require(ambushes[i][0] != int8(x) && ambushes[i][1] != int8(y), "Ambush already exists");

                if (ambushes[i][0] == -1 && ambushes[i][1] == -1) {
                    ambushes[i][0] = int8(x);
                    ambushes[i][1] = int8(y);
                    copCount++;
                    break;
                }
            }
        }

        currentPlayer = Role.Thief;
    }

    error InvalidProof();
}
