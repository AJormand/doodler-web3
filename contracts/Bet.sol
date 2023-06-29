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
    Bet[] pendingBets;
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
    }

    function createBet(address player1) public payable {
        require(msg.value > minimumBet, "Bet less than minimumBet");
        _id.increment();
        Bet memory newBet = Bet(
            _id.current(),
            BetStatus.Created,
            player1,
            0,
            address(0),
            0,
            address(0)
        );
        pendingBets.push(newBet);
    }

    function takeBet(uint256 _betId, address _player2) public payable {
        Bet memory bet = id2Bet[_betId];
        require(bet.status == BetStatus.Created, "You can't take this bet");
        bet.status = BetStatus.InProgress;
        bet.player2 = _player2;
    }

    function updateScore(
        uint256 _betId,
        address _player,
        uint256 _score
    ) public onlyOwner {
        Bet storage updatedBet = id2Bet[_betId];
        require(
            updatedBet.status == BetStatus.InProgress,
            "Bet status not inProgress"
        );
        if (updatedBet.player1 == _player) {
            updatedBet.scorePlayer1 = _score;
        } else if (updatedBet.player2 == _player) {
            updatedBet.scorePlayer2 == _score;
        } else {
            revert("Invalid player address");
        }
    }

    //Getters//

    function getPendingBets() public view returns (Bet[] memory) {
        return pendingBets;
    }
}
