"use client";
import Link from "next/link";
import React from "react";
import { useGameContext } from "../context/GameContext";

const LeftBar = () => {
  const { signer, betsArr, setFilteredBetsArr } = useGameContext();

  const filterMyBets = () => {
    const filteredBets = betsArr.filter((bet) => bet.player1 == signer.address);
    setFilteredBetsArr(filteredBets);
  };

  return (
    <div className="flex flex-col ">
      <Link href={"/"} className="text-5xl font-extrabold">
        ⇦
      </Link>

      <button
        className="bg-slate-400 rounded-lg text-white p-3 m-1 w-36"
        onClick={() => filterMyBets()}
      >
        My Bets
      </button>
      <button
        className="bg-slate-400 rounded-lg text-white p-3 m-1 w-36"
        onClick={() => setFilteredBetsArr(betsArr)}
      >
        All Bets
      </button>
    </div>
  );
};

export default LeftBar;
