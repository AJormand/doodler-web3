"use client";

import Image from "next/image";
import Link from "next/link";
import { useGameContext } from "./context/GameContext";
import {
  connectWallet,
  checkIfWalletIsConnected,
  fetchBetContract,
} from "./utils/appFeatures";
import { ethers } from "ethers";

export default function Home() {
  const { signer } = useGameContext();

  const getPendingBetsHandler = async () => {
    // console.log("signer-getpendigbets", signer);
    const betContract = await fetchBetContract(signer);
    // const owner = await betContract.owner();
    // console.log(owner);

    const bets = await betContract.getPendingBets();
    console.log(bets);

    // const bet = await betContract.getBet(0);
    // console.log(bet);

    // const minimumBet = await betContract.minimumBet();
    // console.log(minimumBet);

    // const openBet = await betContract.getOpenBets();
    // console.log(openBet);

    // const test = await betContract.getTest();
    // console.log(test);

    // const test2 = await betContract.getTest2();
    // console.log(test2);
  };

  const createBet = async () => {
    const betContract = await fetchBetContract(signer);
    betContract.createBet(signer.address, {
      value: ethers.parseEther("0.2"),
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="font-bold text-xl">Web 3 jumper game</h1>

      <p>
        <Link href="second">Goto second page</Link>
      </p>

      <Link
        href="game"
        className="bg-slate-400 rounded-lg text-white p-4 mt-20"
      >
        Start game
      </Link>

      <button onClick={() => connectWallet()}>connect wallet</button>
      <button onClick={() => checkIfWalletIsConnected()}>check wallet</button>
      <button onClick={() => fetchBetContract(signer)}> BetContract</button>
      <button onClick={() => getPendingBetsHandler()}> getPendingBets</button>
      <button onClick={() => createBet()}> CreateBet</button>
    </main>
  );
}
