"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGameContext } from "../context/GameContext";
import {
  connectWallet,
  checkIfWalletIsConnected,
  fetchBetContract,
  shortenAddress,
} from "../utils/appFeatures";
import { ethers } from "ethers";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Bets() {
  const router = useRouter();
  const {
    signer,
    betContract,
    fetchPendingBets,
    filteredBetsArr,
    setFilteredBetsArr,
  } = useGameContext();
  const [isLoading, setIsLoading] = useState(false);
  const [betInputValue, setBetInputValue] = useState(0.0001);
  const [createBetVisible, setCreateBetVisible] = useState(false);

  //   const fetchPendingBets = async () => {
  //     const bets = await betContract.getPendingBets();
  //     const formatedBets = formatBetsData(bets);
  //     console.log(formatedBets);
  //     setPendingBets(formatedBets);
  //   };

  //   const formatBetsData = (bets) => {
  //     return bets.map((bet) => ({
  //       id: parseInt(bet[0]),
  //       status: (() => {
  //         switch (parseInt(bet[1])) {
  //           case 0:
  //             return "Created";
  //           case 1:
  //             return "InProgress";
  //           case 2:
  //             return "Completed";
  //           case 3:
  //             return "Failed";
  //           default:
  //             return "Unknown";
  //         }
  //       })(),
  //       player1: bet[2],
  //       scorePlayer1: parseInt(bet[3]),
  //       player2:
  //         bet[4] == "0x0000000000000000000000000000000000000000" ? "" : bet[4],
  //       scorePlayer2: parseInt(bet[5]),
  //       winner:
  //         bet[6] == "0x0000000000000000000000000000000000000000" ? "" : bet[6],
  //       betAmount: ethers.formatEther(bet[7]),
  //     }));
  //   };

  const createBet = async (betValue) => {
    console.log(betValue);
    setCreateBetVisible(false);
    setIsLoading(true);
    try {
      const tx = await betContract.createBet(signer.address, {
        value: ethers.parseEther(betValue.toString()),
      });
      const receipt = await tx.wait(1);
      console.log(receipt);
    } catch (error) {
      console.error("Error while creating bet:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const takeBet = async (betId) => {
    setIsLoading(true);
    const betAmount = pendingBets.find((bet) => bet.id == betId)?.betAmount;
    console.log(betId, signer.address);
    const tx = await betContract.takeBet(betId, signer.address, {
      value: ethers.parseEther(betAmount.toString()),
    });
    // Wait for the transaction to be mined

    const receipt = await tx.wait(1);
    console.log(receipt);
    setIsLoading(false);
    router.push(`/game?id=${betId}`);
  };

  const getProtocolEarnings = async () => {
    const { contract } = await fetchBetContract(signer);
    const earnings = await contract.getProtocolEarnings();
    console.log(ethers.formatEther(`${earnings}`));
  };

  useEffect(() => {
    // const setupEventListeners = async () => {
    //   console.log("setting listeners");
    //   try {
    //     // Subscribe to the "BetCreated" event
    //     betContract.on("BetCreated", (id, player1, amount) => {
    //       console.log("BetCreagted Event emmited", id, player1, amount);
    //       setPendingBets((prevBets) => {
    //         return [...prevBets, { id, player1, player2: "", amount }];
    //       });
    //       console.log("Bet Created:", id, player1, amount);
    //       // Do something with the event data
    //     });
    //   } catch (error) {
    //     console.error("Error while setting up event listener:", error);
    //   }
    // };

    const fetchData = async () => {
      if (betContract) {
        setIsLoading(true);
        await fetchPendingBets();

        //setFilteredPendingBets(bets);
        //await setupEventListeners();
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

  useEffect(() => {
    const setupEventListeners = async () => {
      console.log("setting listeners");
      try {
        // Subscribe to the "BetCreated" event
        betContract.on("BetCreated", (id, player1, amount) => {
          console.log("BetCreagted Event emmited", id, player1, amount);
          setFilteredBetsArr((prevBets) => {
            return [
              {
                id: parseInt(id),
                status: "Created",
                player1,
                player2: "",
                scorePlayer1: 0,
                scorePlayer1: 0,
                betAmount: ethers.formatEther(amount),
              },
              ...prevBets,
            ];
          });
          console.log("Bet Created:", id, player1, amount);
          // Do something with the event data
        });
      } catch (error) {
        console.error("Error while setting up event listener:", error);
      }
    };

    setupEventListeners();

    // Clean up the event listener when the component unmounts
    return () => {
      if (betContract) {
        betContract.removeAllListeners("BetCreated");
      }
    };
  }, [betContract]);

  return (
    <div className="flex flex-col">
      <div className="flex">
        <button
          className="bg-blue-800 rounded-lg text-white p-2 m-1 w-36 ml-auto"
          onClick={() => setCreateBetVisible(true)}
        >
          Create Bet 🎲
        </button>
        <button
          className="font-bold text-4xl"
          onClick={() => fetchPendingBets()}
        >
          ↻
        </button>
      </div>

      <div className="flex flex-wrap">
        {filteredBetsArr?.map((bet, index) => (
          <div
            className={`w-[200px] h-[250px] bg-slate-50 rounded-lg m-3 p-4 hover:shadow-lg transition duration-300 overflow-hidden ${
              bet.player1 == signer.address ? "border-green-500 border-2" : ""
            }`}
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

        {/* Create Bet PopUp */}
        {createBetVisible && (
          <div className="fixed top-0 bottom-0 left-0 right-0 z-50 flex items-center justify-center">
            <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-xl p-10 z-50">
              <h1 className="text-2xl mb-6">Place bet</h1>
              <div className="flex items-center mb-8">
                <input
                  type="number"
                  className="bg-slate-50 rounded-lg p-2"
                  defaultValue={betInputValue}
                  onChange={(e) => setBetInputValue(e.target.value)}
                />
                <p>ETH</p>
              </div>

              <button
                className="bg-slate-400 rounded-lg text-white p-3 m-1 w-36"
                onClick={() => createBet(betInputValue)}
              >
                Create Bet
              </button>
            </div>
            <div
              className="fixed top-0 bottom-0 left-0 right-0 bg-slate-50 bg-opacity-70 flex items-center justify-center "
              onClick={() => setCreateBetVisible(false)}
            />
          </div>
        )}

        {/* Loading spinner */}
        {isLoading && <LoadingSpinner />}
      </div>
    </div>
  );
}
