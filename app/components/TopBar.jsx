"use client";

import { useEffect, useState } from "react";
import {
  connectWallet,
  checkIfWalletIsConnected,
  shortenAddress,
  handleAccountsChanged,
} from "../utils/appFeatures";

const TopBar = () => {
  const [connectedWalletAddress, setconnectedWalletAddress] = useState("");

  const handleConnectWallet = async () => {
    if (connectedWalletAddress == "") {
      const signer = await connectWallet();
      setconnectedWalletAddress(signer.address);
    }
  };

  const handelCheckIfWalletIsConnected = async () => {
    const signer = await checkIfWalletIsConnected();
    console.log(signer);
    setconnectedWalletAddress(signer.address);
  };

  useEffect(() => {
    handelCheckIfWalletIsConnected();

    //Add event listener for accountsChanged
    ethereum.on("accountsChanged", (accounts) => {
      const newAccount = handleAccountsChanged(accounts);
      setconnectedWalletAddress(newAccount);
    });
    // Clean up the event listener on component unmount
    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return (
    <div className="flex w-full justify-center">
      <div className="w-4/6 flex justify-between items-center py-2">
        <h1>Web3Jumper</h1>
        <button
          className="bg-slate-500 text-white rounded-full px-2 py-1"
          onClick={() => handleConnectWallet()}
        >
          {connectedWalletAddress == ""
            ? "Connect Wallet"
            : shortenAddress(connectedWalletAddress)}
        </button>
      </div>
    </div>
  );
};

export default TopBar;
