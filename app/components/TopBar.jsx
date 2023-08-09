"use client";

import { useEffect, useState } from "react";
import {
  connectWallet,
  checkIfWalletIsConnected,
  shortenAddress,
  handleAccountsChanged,
} from "../utils/appFeatures";
import { useGameContext } from "../context/GameContext";

const TopBar = () => {
  const [connectedWalletAddress, setconnectedWalletAddress] = useState("");
  const { signer, setSigner } = useGameContext();

  const handleConnectWallet = async () => {
    console.log(signer);
    if (connectedWalletAddress == "") {
      const signer = await connectWallet();
      setconnectedWalletAddress(signer.address);
      setSigner(signer);
    }
  };

  const handelCheckIfWalletIsConnected = async () => {
    const signer = await checkIfWalletIsConnected();
    setSigner(signer);
    console.log(signer);
    setconnectedWalletAddress(signer.address);
  };

  useEffect(() => {
    handelCheckIfWalletIsConnected();

    //Add event listener for accountsChanged
    ethereum.on("accountsChanged", async (accounts) => {
      const newAccount = handleAccountsChanged(accounts);
      setconnectedWalletAddress(newAccount);
      const signer = await checkIfWalletIsConnected();
      setSigner(signer);
    });
    // Clean up the event listener on component unmount
    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged);
    };
  }, []);

  return (
    <div className="flex w-full justify-center shadow-sm">
      <div className="w-4/6 flex justify-between items-center py-2">
        <h1 className="text-blue-800 font-extrabold">Web3Jumper</h1>
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
