// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "poseidon-solidity/PoseidonT6.sol";

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

    uint8 public constant MAX_COPS = 5;

    enum Role {
        None,
        Thief,
        Police
    }

    enum GameState {
        NotStarted,
        InProgress,
        Ended
    }

    GameState public gameState = GameState.NotStarted;
    Role public currentPlayer;
    uint256 timeLimitPerTurn;
    uint256[9] public thiefPrizeMap;
    uint256 public policePrize;
    Role public winnerRole;

    address public thief;
    address public police;

    // Thief
    uint256 commitment;
    uint256 public thiefPrizeBalance;
    uint256 public thiefTime;

    // Police
    int8[2][5] public ambushes = [[-1, -1], [-1, -1], [-1, -1], [-1, -1], [-1, -1]]; // why it's [2][5] instead of [5][2]?
    uint8 public copUsedCount = 0;
    uint256 public policeTime;

    constructor(
        IVerifier _sneakVerifier,
        uint256[9] memory _thiefPrizeMap,
        uint256 _policePrize,
        uint256 _timeLimitPerTurn
    ) {
        sneakVerifier = _sneakVerifier;
        thiefPrizeMap = _thiefPrizeMap;
        policePrize = _policePrize;
        timeLimitPerTurn = _timeLimitPerTurn;
    }

    function register(Role role) public payable gameNotStarted {
        if (role == Role.Thief) {
            if (thief != address(0)) {
                revert HasRegistered(Role.Thief);
            }
            thief = payable(msg.sender);
        } else if (role == Role.Police) {
            if (police != address(0)) {
                revert HasRegistered(Role.Police);
            }
            police = payable(msg.sender);
        }

        // start game if both players are registered
        if (thief != address(0) && police != address(0)) {
            gameState = GameState.InProgress;
            currentPlayer = Role.Thief;
            thiefTime = block.timestamp + timeLimitPerTurn;
        }
    }

    function cancelRegistration() public gameNotStarted onlyPlayer {
        if (msg.sender == thief) {
            thief = address(0);
        } else if (msg.sender == police) {
            police = address(0);
        }
    }

    function sneak(
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[13] calldata _pubSignals
    ) public onlyThief gameInProgress {
        if (thiefTime > block.timestamp) {
            revert TimeUp(Role.Thief);
        }
        if (copUsedCount == MAX_COPS) {
            revert ShouldReveal();
        }
        if (commitment != _pubSignals[0]) {
            revert InvalidCommitment();
        }
        if (!sneakVerifier.verifyProof(_pA, _pB, _pC, _pubSignals)) {
            revert InvalidProof();
        }

        commitment = _pubSignals[1];

        // change to police's turn
        currentPlayer = Role.Police;
        policeTime = block.timestamp + timeLimitPerTurn;
    }

    // theif's last move, also the game's last move
    // when theif can't call sneak, theif should call reveal
    // note that if theif generates a wrong proof and reveal, theif will lose even if theif might win.
    // If the thief think the proof would be correct, theif should call verifier.verifyProof at first to guarantee the proof is correct.
    function reveal(
        int8[5] calldata _flattenedSneakPaths,
        uint256[2] calldata _pA,
        uint256[2][2] calldata _pB,
        uint256[2] calldata _pC,
        uint256[13] calldata _pubSignals
    ) external onlyThief gameInProgress {
        if (thiefTime > block.timestamp) {
            revert TimeUp(Role.Thief);
        }

        uint256 hash = hashSneakPaths(_flattenedSneakPaths);

        if (hash != commitment || hash != _pubSignals[1]) {
            revert InvalidCommitment();
        }

        if (sneakVerifier.verifyProof(_pA, _pB, _pC, _pubSignals)) {
            // theif wins
            if (copUsedCount == MAX_COPS) {
                // calculate thief's prize
                for (uint8 i = 0; i < _flattenedSneakPaths.length; i++) {
                    // _sneakPaths value must be unsigned
                    if (_flattenedSneakPaths[i] < 0) {
                        revert InvalidSneakPath();
                    }
                    thiefPrizeBalance += thiefPrizeMap[uint8(_flattenedSneakPaths[i])];
                }
                winnerRole = Role.Thief;
            } else {
                revert ShouldSneak();
            }
        } else {
            // theif loses
            winnerRole = Role.Police;
        }

        gameState = GameState.Ended;
    }

    function dispatch(uint8 x, uint8 y) public onlyPolice gameInProgress {
        if (policeTime > block.timestamp) {
            revert TimeUp(Role.Police);
        }

        if (copUsedCount == MAX_COPS) {
            revert CopExhausted();
        }

        if (x > 2 || x < 0 || y > 2 || y < 0) {
            revert InvalidCoordinates();
        }

        if (ambushes[0][0] == -1 && ambushes[0][1] == -1) {
            ambushes[0][0] = int8(x);
            ambushes[0][1] = int8(y);
            copUsedCount++;
        } else {
            for (uint8 i = 0; i < MAX_COPS; i++) {
                if (ambushes[i][0] == int8(x) && ambushes[i][1] == int8(y)) {
                    revert AmbushExists();
                }

                if (ambushes[i][0] == -1 && ambushes[i][1] == -1) {
                    ambushes[i][0] = int8(x);
                    ambushes[i][1] = int8(y);
                    copUsedCount++;
                    break;
                }
            }
        }

        // change to thief's turn
        currentPlayer = Role.Thief;
        thiefTime = block.timestamp + timeLimitPerTurn;
    }

    function endGameIfTimeUp() public gameInProgress {
        if (currentPlayer == Role.Thief && thiefTime < block.timestamp) {
            winnerRole = Role.Police;
        } else if (currentPlayer == Role.Police && policeTime < block.timestamp) {
            winnerRole = Role.Thief;
        }

        gameState = GameState.Ended;
    }

    function claimPrize() public onlyWinner gameEnded {
        if (winnerRole == Role.Thief) {
            payable(thief).transfer(thiefPrizeBalance);
        } else if (winnerRole == Role.Police) {
            payable(police).transfer(policePrize);
        }
        reset();
    }

    function reset() public gameEnded {
        thief = address(0);
        police = address(0);
        winnerRole = Role.None;
        currentPlayer = Role.None;
        gameState = GameState.NotStarted;
        thiefTime = 0;
        policeTime = 0;
        copUsedCount = 0;
        for (uint8 i = 0; i < MAX_COPS; i++) {
            ambushes[i][0] = -1;
            ambushes[i][1] = -1;
        }
    }

    // ================================ Errors ================================
    error HasRegistered(Role);
    error InvalidProof();
    error InvalidCommitment();
    error ShouldReveal();
    error ShouldSneak();
    error TimeUp(Role);
    error InvalidSneakPath();
    error InvalidCoordinates();
    error CopExhausted();
    error AmbushExists();

    // ================================ View functions ================================

    function theifTimeLeft() public view returns (uint256) {
        if (currentPlayer == Role.Thief) {
            return thiefTime - block.timestamp;
        }
        return 0;
    }

    function policeTimeLeft() public view returns (uint256) {
        if (currentPlayer == Role.Police) {
            return policeTime - block.timestamp;
        }
        return 0;
    }

    function hashSneakPaths(int8[5] calldata _flattenedSneakPaths) public pure returns (uint256) {
        uint256 negativeOne = 21888242871839275222246405745257275088548364400416034343698204186575808495616;
        return PoseidonT6.hash(
            [
                _flattenedSneakPaths[0] == -1 ? negativeOne : uint256(uint8(_flattenedSneakPaths[0])),
                _flattenedSneakPaths[1] == -1 ? negativeOne : uint256(uint8(_flattenedSneakPaths[1])),
                _flattenedSneakPaths[2] == -1 ? negativeOne : uint256(uint8(_flattenedSneakPaths[2])),
                _flattenedSneakPaths[3] == -1 ? negativeOne : uint256(uint8(_flattenedSneakPaths[3])),
                _flattenedSneakPaths[4] == -1 ? negativeOne : uint256(uint8(_flattenedSneakPaths[4]))
            ]
        );
    }

    // ================================ Modifiers ================================

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

    modifier onlyWinner() {
        require(
            (msg.sender == thief && winnerRole == Role.Thief) || (msg.sender == police && winnerRole == Role.Police),
            "Only winner can call this function"
        );
        _;
    }

    modifier gameNotStarted() {
        require(gameState == GameState.NotStarted, "Game is already in progress or ended");
        _;
    }

    modifier gameInProgress() {
        require(gameState == GameState.InProgress, "Game is not in progress");
        _;
    }

    modifier gameEnded() {
        require(gameState == GameState.Ended, "Game has not ended yet");
        _;
    }
}
