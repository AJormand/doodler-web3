import { ethers } from "ethers";

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
  // targets Rinkeby chain, id 4
  const targetNetworkId = "0x4";

  if (window.ethereum) {
    const currentChainId = await window.ethereum.request({
      method: "eth_chainId",
    });

    if (currentChainId == targetNetworkId) {
      console.log("correct network");
    } else {
      console.log("pls change network");
    }
  }
};

//SHORTEN ADDRESS
export const shortenAddress = (address) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
};

//----------------FETCHING CONTRACT------------------------

//FETCH BetContract

//CONNECT BetContract
