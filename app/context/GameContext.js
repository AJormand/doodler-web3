"use client";

import { createContext, useContext, useState } from "react";

const GameContext = createContext({});

export const GameContextProvider = ({ children }) => {
  const [signer, setSigner] = useState(null);

  return (
    <GameContext.Provider value={{ signer, setSigner }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);
