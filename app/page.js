"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGameContext } from "./context/GameContext";
import {
  connectWallet,
  checkIfWalletIsConnected,
  fetchBetContract,
  shortenAddress,
} from "./utils/appFeatures";
import { ethers } from "ethers";
import LoadingSpinner from "./components/LoadingSpinner";
import LeftBar from "./components/LeftBar";
import images from "./assets";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center">
      {/* Page content */}

      <div className="flex max-w-[60%] mt-24">
        {/* left */}
        <div className="flex-1 p-3 relative">
          <Image
            className=" rounded-lg"
            src={images.PlatformJumperCover}
            alt="Background Image"
          />
          <h1 className="absolute -rotate-45 w-56 h-56 inset-0 flex items-center justify-center text-2xl font-semibold text-white">
            JUMP & EARN!
          </h1>
        </div>

        {/* right */}
        <div className="flex-1 p-3 flex flex-col">
          <p className="text-2xl font-bold">
            Welcome to the{" "}
            <span className="text-blue-800">Web3 Platform Jumper</span> Game!
          </p>{" "}
          <p className="text-xl mb-8">
            <br />
            Click on <span className="font-bold text-blue-800"> Practice </span>
            to hone your jumping skills, or select
            <span className="font-bold text-blue-800"> Real Game </span> to
            place bets and go head-to-head against other players. Get ready to
            jump into the world of excitement and competition!
          </p>
          <div>
            <div className="flex">
              <button className="bg-slate-400 rounded-lg text-white p-3 m-1 w-36 text-center z-50">
                <Link href="game">Practice Game</Link>
              </button>
              <div className="text-3xl flex items-center">
                <p>🎮</p>
              </div>
            </div>

            <div className="flex">
              <button className="bg-slate-400 rounded-lg text-white p-3 m-1 w-36 text-center">
                <Link href="bets">Real Game</Link>
              </button>
              <div className="text-3xl flex items-center">
                <p>💰</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
