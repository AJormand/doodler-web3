"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { fetchBetContract } from "../utils/appFeatures";
import { ethers } from "ethers";

const GameContext = createContext({});

export const GameContextProvider = ({ children }) => {
  const [signer, setSigner] = useState(null);
  const [betContract, setBetContract] = useState(null);
  const [betsArr, setBetsArr] = useState([]);
  const [filteredBetsArr, setFilteredBetsArr] = useState([]);

  const fetchPendingBets = async () => {
    const bets = await betContract.getPendingBets();
    const formatedBets = formatBetsData(bets);
    console.log(formatedBets);
    setBetsArr(formatedBets);
    setFilteredBetsArr(formatedBets);
  };

  const formatBetsData = (bets) => {
    return bets.map((bet) => ({
      id: parseInt(bet[0]),
      status: (() => {
        switch (parseInt(bet[1])) {
          case 0:
            return "Created";
          case 1:
            return "InProgress";
          case 2:
            return "Completed";
          case 3:
            return "Failed";
          default:
            return "Unknown";
        }
      })(),
      player1: bet[2],
      scorePlayer1: parseInt(bet[3]),
      player2:
        bet[4] == "0x0000000000000000000000000000000000000000" ? "" : bet[4],
      scorePlayer2: parseInt(bet[5]),
      winner:
        bet[6] == "0x0000000000000000000000000000000000000000" ? "" : bet[6],
      betAmount: ethers.formatEther(bet[7]),
    }));
  };

  useEffect(() => {
    const fetchContract = async () => {
      const { contract } = await fetchBetContract(signer);
      setBetContract(contract);
    };

    if (signer) {
      fetchContract();
    }
  }, [signer]);

  return (
    <GameContext.Provider
      value={{
        signer,
        setSigner,
        betContract,
        fetchPendingBets,
        betsArr,
        setBetsArr,
        filteredBetsArr,
        setFilteredBetsArr,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);
