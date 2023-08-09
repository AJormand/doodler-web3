import { ethers } from "ethers";
import networkMapping from "../../constants/networkMapping.json";
import BetContractABI from "../../constants/BetContract.json";

//CHECK IF WALLET IS CONNECT
export const checkIfWalletIsConnected = async () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  await ethereum.request({ method: "eth_requestAccounts" });
  const accounts = await provider.listAccounts();
  return accounts[0];
};

//CONNECT WALLET
export const connectWallet = async () => {
  console.log("Trying to connect wallet...");
  if (typeof window.ethereum !== "undefined") {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const accounts = await provider.listAccounts();
      const connectedAccount = accounts[0];
      console.log("Connected account:", connectedAccount);
      const signer = await provider.getSigner();
      console.log("signer", signer);
      return signer;
    } catch (error) {
      console.error("Failed to connect account:", error);
    }
  } else {
    console.log("Please install metamask!");
  }
};

//ACCOUNTS CHANGED
export const handleAccountsChanged = (accounts) => {
  if (accounts.length > 0) {
    const newAccount = accounts[0];
    console.log("Account changed", newAccount);
    return newAccount;
  } else {
    console.log("No account found");
  }
};

//CHECK NETWORK
export const checkNetwork = async () => {
  if (window.ethereum) {
    const currentChainIdHex = await window.ethereum.request({
      method: "eth_chainId",
    });
    const currentChainId = parseInt(currentChainIdHex, 16);

    if (networkMapping.hasOwnProperty(currentChainId)) {
      console.log("Contract exists for this network", currentChainId);
      return currentChainId;
    } else {
      console.log("pls change network ", currentChainId);
    }
  }
};

//SHORTEN ADDRESS
export const shortenAddress = (address) => {
  if (!address) {
    return "";
  }
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

//----------------FETCHING CONTRACT------------------------

//FETCH BetContract
export const fetchBetContract = async (signer) => {
  //get latest contract address
  const currentChainId = await checkNetwork();
  if (currentChainId) {
    const betContractAddresses = networkMapping[currentChainId]?.BetContract;
    //newest betContract address is the last in the array
    const lastBetContractAddress =
      betContractAddresses?.[betContractAddresses.length - 1];
    console.log(lastBetContractAddress);

    const contract = new ethers.Contract(
      lastBetContractAddress,
      BetContractABI,
      signer
    );
    return { contract, lastBetContractAddress, BetContractABI, currentChainId };
  }
};

//CONNECT BetContract
