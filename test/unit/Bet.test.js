const { expect } = require("chai");
const { ethers, deployments } = require("hardhat");

describe("BetContract tests", function () {
  let betContract, deployer, player1, player2, player3;

  beforeEach(async () => {
    const namedAccounts = await ethers.getSigners();
    deployer = namedAccounts[0];
    player1 = namedAccounts[1];
    player2 = namedAccounts[2];
    player3 = namedAccounts[3];

    await deployments.fixture(["all"]);
    betContract = await ethers.getContract("BetContract");
  });

  describe("createBet", function () {
    it("Reverts if msg.value < minimumBet", async () => {
      await expect(
        betContract.createBet(player1.address, {
          value: ethers.parseEther("0.0005"),
        })
      ).to.be.revertedWith("Bet less than minimumBet");
    });

    it("Creates a new bet", async () => {
      await betContract.connect(player1).createBet(player1.address, {
        value: ethers.parseEther("0.1"),
      });

      const betArray = await betContract.getPendingBets();

      expect(betArray[0].id).to.equal(1); // id
      expect(betArray[0].status).to.equal(0); // BetStatus.Created
      expect(betArray[0].player1).to.equal(player1.address);
      expect(betArray[0].scorePlayer1).to.equal(0);
      expect(betArray[0].player2).to.equal(
        "0x0000000000000000000000000000000000000000"
      );
      expect(betArray[0].scorePlayer2).to.equal(0);
      expect(betArray[0].winner).to.equal(
        "0x0000000000000000000000000000000000000000"
      );
    });
  });

  //   describe("takeBet", function () {
  //     it("Reverts if bet status is not Created", async () => {
  //       await betContract.connect(player1).createBet(player2.address, {
  //         value: ethers.utils.parseEther("0.001"),
  //       });

  //       // Change the bet status to InProgress
  //       await betContract
  //         .connect(player2)
  //         .takeBet(0, { value: ethers.utils.parseEther("0.001") });

  //       await expect(
  //         betContract
  //           .connect(player3)
  //           .takeBet(0, { value: ethers.utils.parseEther("0.001") })
  //       ).to.be.revertedWith("You can't take this bet");
  //     });

  //     it("Updates the bet status to InProgress", async () => {
  //       await betContract.connect(player1).createBet(player2.address, {
  //         value: ethers.utils.parseEther("0.001"),
  //       });
  //       await betContract
  //         .connect(player2)
  //         .takeBet(0, { value: ethers.utils.parseEther("0.001") });

  //       const bet = await betContract.pendingBets(0);
  //       expect(bet.status).to.equal(1); // BetStatus.InProgress
  //     });
  //   });

  //   describe("updateScore", function () {
  //     beforeEach(async () => {
  //       await betContract.connect(player1).createBet(player2.address, {
  //         value: ethers.utils.parseEther("0.001"),
  //       });
  //       await betContract
  //         .connect(player2)
  //         .takeBet(0, { value: ethers.utils.parseEther("0.001") });
  //     });

  //     it("Reverts if bet status is not InProgress", async () => {
  //       await betContract.connect(deployer).updateScore(0, player1.address, 1);

  //       await expect(
  //         betContract.connect(deployer).updateScore(0, player2.address, 2)
  //       ).to.be.revertedWith("Bet status not inProgress");
  //     });

  //     it("Updates the score for player1", async () => {
  //       await betContract.connect(deployer).updateScore(0, player1.address, 1);

  //       const bet = await betContract.pendingBets(0);
  //       expect(bet.scorePlayer1).to.equal(1);
  //     });

  //     it("Updates the score for player2", async () => {
  //       await betContract.connect(deployer).updateScore(0, player2.address, 2);

  //       const bet = await betContract.pendingBets(0);
  //       expect(bet.scorePlayer2).to.equal(2);
  //     });

  //     it("Reverts if the player address is invalid", async () => {
  //       await expect(
  //         betContract.connect(deployer).updateScore(0, player3.address, 3)
  //       ).to.be.revertedWith("Invalid player address");
  //     });
  //   });
});
