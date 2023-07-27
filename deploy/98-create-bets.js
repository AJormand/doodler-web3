const { ethers, network, getNamedAccounts } = require("hardhat");

module.exports = async function () {
  if (network.config.chainId == 31337) {
    const { deployer, player1 } = await getNamedAccounts();
    console.log("----- creating some test bets -------");
    const betContract = await ethers.getContract("BetContract");
    const numberOfBets = 5;

    const createBets = async () => {
      for (i = 0; i < numberOfBets; i++) {
        const tx = await betContract.createBet(player1, {
          value: ethers.parseEther("0.2"),
        });
        txReceipt = await tx.wait();
      }
    };

    const updateScoreForBetCreator = async () => {
      for (i = 1; i < numberOfBets + 1; i++) {
        const tx = await betContract.updateScore(i, player1, 10 + i);
        const txReceipt = await tx.wait();
      }
    };

    await createBets();
    await updateScoreForBetCreator();
  }
};

module.exports.tags = ["all", "createBets"];
