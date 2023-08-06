"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { fetchBetContract } from "../utils/appFeatures";

const GameContext = createContext({});

export const GameContextProvider = ({ children }) => {
  const [signer, setSigner] = useState(null);
  const [betContract, setBetContract] = useState(null);

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
    <GameContext.Provider value={{ signer, setSigner, betContract }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);
