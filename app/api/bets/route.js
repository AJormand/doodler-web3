import { NextRequest, NextResponse } from "next/server";
import { fetchBetContract } from "../../utils/appFeatures";
import { ethers } from "ethers";
const PRIVATE_KEY = process.env.NEXT_PUBLIC_PRIVATE_KEY;

//http://localhost:3000/api/users

export async function GET(request) {
  //handle get request for api/bets
  //retrieve users from the database or any other source
  const users = [
    { id: 1, name: "John" },
    { id: 1, name: "John" },
    { id: 1, name: "John" },
  ];

  return new Response(JSON.stringify(users));
}

export async function POST(request) {
  const {
    betId,
    gameScore,
    lastBetContractAddress,
    BetContractABI,
    currentChainId,
    player,
  } = await request.json();
  let RPC_URL;

  console.log(currentChainId);

  if (currentChainId == 31337) {
    RPC_URL = "http://127.0.0.1:8545";
  }
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const adminSigner = new ethers.Wallet(PRIVATE_KEY, provider);
  // const betContract = await fetchBetContract(signer);
  // const res = await betContract.updateScore(
  //   data.betId,
  //   signer.address,
  //   data.gameScore
  // );
  const betContract = new ethers.Contract(
    lastBetContractAddress,
    BetContractABI,
    adminSigner
  );

  try {
    const res = await betContract.updateScore(betId, player, gameScore);
    const transactionReceipt = await res.wait();
    console.log("Transaction receipt:", transactionReceipt);
  } catch (error) {
    console.log(error);
  }

  // const resData = await res.json();
  // console.log(resData);
  // return NextResponse.json(data);
  return NextResponse.json({});
}

//GET (read)
//PACTH (update)
//DELETE (delete)
