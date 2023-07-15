"use client";

import Image from "next/image";
import Link from "next/link";
import { useGameContext } from "./context/GameContext";
import { connectWallet, checkIfWalletIsConnected } from "./utils/appFeatures";

export default function Home() {
  const { color, setColor } = useGameContext();
  return (
    <main className="flex min-h-screen flex-col items-center p-24">
      <h1 className="font-bold text-xl">Web 3 jumper game</h1>

      <h1 style={{ color: color }}>Main page </h1>
      <p>Current color: {color}</p>
      <button onClick={() => setColor("blue")}>Set color to blue</button>
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
    </main>
  );
}
