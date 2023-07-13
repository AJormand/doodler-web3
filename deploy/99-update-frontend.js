const { ethers, network } = require("hardhat");
const fs = require("fs");
//using dotenv as env.local works only inside app folder in nextjs
require("dotenv").config();

const frontEndContractFile = "../doodler-web3/constants/networkMapping.json";
const frontendAbiLocation = "../doodler-web3/constants/";

module.exports = async function () {
  console.log(process.env.UPDATE_FRONT_END);

  if (process.env.UPDATE_FRONT_END) {
    await updateContractAddress();
    await updateAbi();
  }
};

async function updateAbi() {
  const betContract = await ethers.getContract("BetContract");

  fs.writeFileSync(
    `${frontendAbiLocation}BetContract.json`,
    betContract.interface.formatJson()
  );
}

async function updateContractAddress() {
  const betContract = await ethers.getContract("BetContract");
  console.log(betContract.target);
  const chainId = network.config.chainId.toString();
  console.log(chainId);
  const contractAddresses = JSON.parse(
    fs.readFileSync(frontEndContractFile, "utf8")
  );
  console.log(contractAddresses);

  console.log(chainId in contractAddresses);

  if (chainId in contractAddresses) {
    if (
      !contractAddresses[chainId]["BetContract"].includes(betContract.target)
    ) {
      contractAddresses[chainId]["BetContract"].push(betContract.target);
    }
  } else {
    console.log(betContract.target);
    contractAddresses[chainId] = {
      BetContract: [betContract.target],
    };
  }

  fs.writeFileSync(frontEndContractFile, JSON.stringify(contractAddresses));
}

module.exports.tags = ["all", "frontend"];
