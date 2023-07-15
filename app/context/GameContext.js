"use client";

import { createContext, useContext, useState } from "react";

const GameContext = createContext({});

export const GameContextProvider = ({ children }) => {
  const [signer, setSetsigner] = useState(null);

  const [color, setColor] = useState("red");

  return (
    <GameContext.Provider value={{ color, setColor, signer, setSetsigner }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGameContext = () => useContext(GameContext);
