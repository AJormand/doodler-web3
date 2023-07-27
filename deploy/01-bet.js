// deploy/00_deploy_my_contract.js
const { ethers } = require("hardhat");
module.exports = async ({ getNamedAccounts, deployments, network }) => {
  const { deploy } = deployments;
  const { deployer, player1 } = await getNamedAccounts();

  const arguments = [];

  console.log("Deploying contracts..... on chain ID:", network.config.chainId);

  const BetContract = await deploy("BetContract", {
    from: deployer,
    args: arguments,
    log: true,
    waitConfirmations: network.config.blockConfirmations || 1,
  });
};
module.exports.tags = ["all", "betcontract"];
