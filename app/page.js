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

export default function Home() {
  const router = useRouter();
  const { signer, betContract } = useGameContext();
  const [pendingBets, setPendingBets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchPendingBets = async () => {
    const bets = await betContract.getPendingBets();
    const formatedBets = formatBetsData(bets);
    console.log(formatedBets);
    setPendingBets(formatedBets);
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

  const createBet = async () => {
    setIsLoading(true);
    try {
      const tx = await betContract.createBet(signer.address, {
        value: ethers.parseEther("0.001"),
      });
      const receipt = await tx.wait(1);
    } catch (error) {
      console.error("Error while creating bet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const takeBet = async (betId) => {
    setIsLoading(true);
    console.log(betId, signer.address);
    const tx = await betContract.takeBet(betId, signer.address, {
      value: ethers.parseEther("0.001"),
    });
    // Wait for the transaction to be mined
    const receipt = await tx.wait(1);
    setIsLoading(false);
    router.push(`/game?id=${betId}`);
  };

  const getProtocolEarnings = async () => {
    const { contract } = await fetchBetContract(signer);
    const earnings = await contract.getProtocolEarnings();
    console.log(ethers.formatEther(`${earnings}`));
  };

  useEffect(() => {
    const setupEventListeners = async () => {
      console.log("setting listeners");
      try {
        // Subscribe to the "BetCreated" event
        betContract.on("BetCreated", (id, player1, amount) => {
          console.log("Bet Created:", id, player1, amount);
          // Do something with the event data
        });
      } catch (error) {
        console.error("Error while setting up event listener:", error);
      }
    };

    const fetchData = async () => {
      if (betContract) {
        setIsLoading(true);
        await fetchPendingBets();
        await setupEventListeners();
        setIsLoading(false);
      }
    };

    fetchData();

    // Clean up the event listener when the component unmounts
    return () => {
      if (betContract) {
        betContract.removeAllListeners("BetCreated");
      }
    };
  }, [signer, betContract]);

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
      <button onClick={() => fetchPendingBets()}> getPendingBets</button>
      <button onClick={() => createBet()}> CreateBet</button>
      <button onClick={() => getProtocolEarnings()}> getEarnings</button>

      {/* <div className="flex flex-wrap">
        {pendingBets?.map((bet, index) => (
          <div
            className="w-[200px] h-[200px] bg-white rounded-lg m-3 p-2 hover:scale-110 overflow-hidden"
            key={index}
          >
            <p>{bet.id}</p>
            <p>{bet.status}</p>
            <p>{bet.player1}</p>
            <p>{bet.scorePlayer1}</p>
            <p>{bet.player2}</p>
            <p>{bet.scorePlayer2}</p>
            <p>{bet.winner}</p>
          </div>
        ))}
      </div> */}

      <div className="flex flex-wrap">
        {pendingBets?.map((bet, index) => (
          <div
            className="w-[200px] h-[250px] bg-white rounded-lg m-3 p-4 hover:shadow-lg transition duration-300 overflow-hidden"
            key={index}
          >
            <div className="flex flex-row-reverse">
              <p className="text-xs font-bold text-gray-200">
                Bet ID: {bet.id}
              </p>
            </div>
            <div className="flex mt-2">
              <p className="text-gray-600 mb-2 font-bold">Status: </p>
              <p className="ml-1 font-bold">{bet.status}</p>
            </div>

            <div className="flex justify-between">
              <div className="text-sm">
                <p className="font-bold">Player 1:</p>
                <p>{shortenAddress(bet.player1)}</p>
                <p>Score: {bet.scorePlayer1}</p>
              </div>
              <div className="text-sm">
                <p className="font-bold">Player 2:</p>
                <p>{shortenAddress(bet.player2)}</p>
                <p>Score: {bet.scorePlayer2}</p>
              </div>
            </div>
            <div className="flex">
              <p className="text-sm mt-3">Bet amount:</p>
              <p className="text-sm mt-3 ml-1"> {bet.betAmount} eth</p>
            </div>

            <p className="font-bold text-sm mt-3">
              Winner: {shortenAddress(bet.winner)}
            </p>

            {signer.address != bet.player1 &&
              bet.scorePlayer2 == 0 &&
              (bet.status == "Created" || bet.status == "InProgress") && (
                <button
                  className="bg-slate-400 disabled:bg-slate-300 text-white px-2 py-1 rounded-md mt-5 text-sm"
                  onClick={() => takeBet(bet.id)}
                  disabled={bet.status != "Created"}
                >
                  Take bet
                </button>
              )}

            {signer.address == bet.player1 &&
              bet.scorePlayer1 == 0 &&
              (bet.status == "Created" || bet.status == "InProgress") && (
                <button
                  className="bg-slate-400 disabled:bg-slate-300 text-white px-2 py-1 rounded-md mt-5 text-sm"
                  onClick={() => router.push(`/game?id=${bet.id}`)}
                  disabled={
                    bet.status != "Created" &&
                    bet.status != "InProgress" &&
                    !player1.scorePlayer1 == 0
                  }
                >
                  Start Game
                </button>
              )}
          </div>
        ))}
      </div>

      {/* Loading spinner */}
      {isLoading && <LoadingSpinner />}
    </main>
  );
}
