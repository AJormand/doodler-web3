// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

error BetContract_LessThanMinimumBet();

contract BetContract is Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _id;
    uint256 public minimumBet = 0.001 ether;
    uint256 private protocolEarnings;
    mapping(uint256 => Bet) id2Bet;

    enum BetStatus {
        Created,
        InProgress,
        Completed,
        Failed
    }

    struct Bet {
        uint256 id;
        BetStatus status;
        address player1;
        uint256 scorePlayer1;
        address player2;
        uint256 scorePlayer2;
        address winner;
        uint256 betAmount;
    }

    event BetCreated(uint256 id, address indexed player1, uint256 amount);
    event BetTaken(uint256 id, address indexed player2, uint256 amount);
    event BetCompleted(
        uint256 id,
        address indexed player1,
        address indexed player2,
        uint256 betAmount
    );
    event BetFailed(uint256 id, address indexed player1, uint256 amount);

    function createBet(address player1) public payable {
        require(msg.value >= minimumBet, "Bet less than minimumBet");
        _id.increment();
        Bet memory newBet = Bet(
            _id.current(),
            BetStatus.Created,
            player1,
            0,
            address(0),
            0,
            address(0),
            msg.value
        );
        id2Bet[_id.current()] = newBet;
        emit BetCreated(_id.current(), player1, msg.value);
    }

    function takeBet(uint256 _betId, address _player2) public payable {
        Bet storage bet = id2Bet[_betId];
        require(bet.status == BetStatus.Created, "You can't take this bet");
        require(bet.betAmount == msg.value, "Bet amount not matched");
        bet.status = BetStatus.InProgress;
        bet.player2 = _player2;
        id2Bet[_betId] = bet;
        emit BetTaken(_betId, _player2, msg.value);
    }

    function updateScore(
        uint256 _betId,
        address _player,
        uint256 _score
    ) public onlyOwner {
        Bet storage updatedBet = id2Bet[_betId];
        require(
            updatedBet.status == BetStatus.InProgress ||
                updatedBet.status == BetStatus.Created,
            "Bet status not Created or inProgress"
        );
        if (updatedBet.player1 == _player) {
            updatedBet.scorePlayer1 = _score;
        } else if (updatedBet.player2 == _player) {
            updatedBet.scorePlayer2 = _score;
        } else {
            revert("Invalid player address");
        }

        declareWinner(updatedBet);
    }

    function declareWinner(Bet memory bet) private {
        if (bet.scorePlayer1 > 0 && bet.scorePlayer2 > 0) {
            // Determine the winner based on scores
            address winner = bet.scorePlayer1 > bet.scorePlayer2
                ? bet.player1
                : bet.player2;
            id2Bet[bet.id].winner = winner;
            //id2Bet[bet.id].status = BetStatus.Completed;

            //calculate amount of reward for winner
            uint256 winnerReward = ((bet.betAmount * 2) * 80) / 100;
            uint protocolFee = (bet.betAmount * 2) - winnerReward;
            protocolEarnings += protocolFee;

            //transfer funds to the winner
            (bool sent, bytes memory data) = payable(winner).call{
                value: winnerReward
            }("");

            emit BetCompleted(bet.id, bet.player1, bet.player2, bet.betAmount);
        }
    }

    //Getters//

    function getPendingBets() public view returns (Bet[] memory) {
        uint256 allBetsNumber = _id.current();
        uint256 pendingBetsNumber = 0;

        for (uint i = 1; i <= allBetsNumber; i++) {
            if (
                id2Bet[i].status == BetStatus.Created ||
                id2Bet[i].status == BetStatus.InProgress
            ) {
                pendingBetsNumber++;
            }
        }

        Bet[] memory pendingBetsArr = new Bet[](pendingBetsNumber);
        uint256 pendingBetArrLocation = 0;
        for (uint256 i = 1; i <= pendingBetsNumber; i++) {
            if (
                id2Bet[i].status == BetStatus.Created ||
                id2Bet[i].status == BetStatus.InProgress
            ) {
                pendingBetsArr[pendingBetArrLocation] = id2Bet[i];
                pendingBetArrLocation++;
            }
        }
        return pendingBetsArr;
    }

    function getBet(uint256 id) public view returns (Bet memory) {
        return id2Bet[id];
    }

    function getProtocolEarnings() public view returns (uint256) {
        return protocolEarnings;
    }
}
