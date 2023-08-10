"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGameContext } from "../context/GameContext";
import { fetchBetContract } from "../utils/appFeatures";
import LoadingSpinner from "../components/LoadingSpinner";
import TopBar from "../components/TopBar";

import images from "../assets";

export default function Game() {
  const searchParams = useSearchParams();
  const { signer } = useGameContext();
  const [gameRunning, setGameRunning] = useState(false);
  const [platforms, setPlatforms] = useState([]);
  const [player, setPlayer] = useState({
    x: 140,
    y: 1,
  });
  const [moveHorizontalDirection, setMoveHorizontalDirection] = useState("");
  const [moveVerticalDirection, setMoveVerticalDirection] = useState("");
  const [playerJumpPoint, setplayerJumpPoint] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  //GRID
  let gridHeight = 500;
  let gridWidth = 300;
  //PLATFORMS
  let platformNumber = 5;
  let platformHeight = 20;
  let platformWidth = 80;
  let platformsIntervalID;
  //PLAYER
  let playerWidth = 40;
  let playerHeight = 40;
  let moveUpIntervalID;
  let moveDownIntervalID;
  let moveLeftIntervalID;
  let moveRightIntervalID;
  let playerJumpHeight = 150;
  let gamePoints = 0;
  let numberOfJumps = 1;

  const createPlatforms = (existingPlatforms) => {
    let platformsArr = [...existingPlatforms];
    if (platformsArr.length === 0) {
      //create all platforms
      for (let i = platformsArr.length; i < platformNumber; i++) {
        let X = (gridWidth - platformWidth) * Math.random();
        let Y = (gridHeight / platformNumber) * i;
        platformsArr.push({ x: X, y: Y });
      }
    } else {
      //add 1 new platform
      let newPlatform = {
        x: (gridWidth - platformWidth) * Math.random(),
        y: (gridHeight / platformNumber) * platformNumber,
      };
      platformsArr.push(newPlatform);
      setGameScore((prev) => prev + 1);
      gamePoints++;
    }
    return platformsArr;
  };

  const movePlatforms = () => {
    setPlatforms((platforms) => {
      if (platforms && platforms.length >= platformNumber) {
        return platforms
          .map((platform) => ({
            ...platform,
            y: platform.y - 2,
          }))
          .filter((platform) => platform.y + platformHeight > 0);
      } else {
        let newPlatform = createPlatforms(platforms);
        return newPlatform;
      }
    });
  };

  const jump = () => {
    setPlayer((player) => {
      //If Player jumps through the platform on the way up the jump point resets
      if (player.y < playerJumpPoint + playerJumpHeight) {
        platforms.map((platform) => {
          if (
            player.y + playerHeight > platform.y &&
            player.x + playerWidth > platform.x &&
            player.x < platform.x + platformWidth
          ) {
            setplayerJumpPoint(platform.y);
          }
        });
        return { ...player, y: player.y + 2 };
      } else {
        setMoveVerticalDirection("down");
        return player;
      }
    });
  };

  const fall = () => {
    setPlayer((player) => {
      if (player.y > 0) {
        platforms.map((platform) => {
          if (
            player.y >= platform.y &&
            player.y <= platform.y + platformHeight &&
            player.x + playerWidth > platform.x &&
            player.x < platform.x + platformWidth
          ) {
            console.log("platform reached DOWN");
            clearInterval(moveDownIntervalID);
            setMoveVerticalDirection("up");
          }
        });
        return { ...player, y: player.y - 2 };
      } else {
        //game over
        setGameRunning(false);
        setMoveVerticalDirection("");
        setMoveHorizontalDirection("");
        clearInterval(moveDownIntervalID);
        clearInterval(moveLeftIntervalID);
        clearInterval(moveRightIntervalID);
        //update score only if real game
        const betId = searchParams.get("id");
        if (betId) updateScoreToContract();
        return player;
      }
    });
  };

  const moveLeft = () => {
    setPlayer((player) => ({ ...player, x: player.x - 2 }));
  };

  const moveRight = () => {
    setPlayer((player) => ({ ...player, x: player.x + 2 }));
  };

  const updateScoreToContract = async () => {
    setIsLoading(true);
    const betId = searchParams.get("id");
    console.log(betId);
    const { lastBetContractAddress, BetContractABI, currentChainId } =
      await fetchBetContract(signer);

    try {
      const response = await fetch("/api/bets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          betId,
          gameScore,
          lastBetContractAddress,
          BetContractABI,
          currentChainId,
          player: signer.address,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log(data); // Handle the JSON data returned from the backend
      } else {
        console.log("Request failed:", response.status);
      }
    } catch (error) {
      console.log(error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    //MOVE PLATFORMS
    if (gameRunning) {
      platformsIntervalID = setInterval(() => {
        movePlatforms();
      }, 20);
    } else {
      clearInterval(platformsIntervalID);
    }

    //MOVE PLAYER VERTICAL
    if (moveVerticalDirection == "up") {
      clearInterval(moveUpIntervalID);
      moveUpIntervalID = setInterval(() => {
        jump();
      }, 10);
    }
    if (moveVerticalDirection == "down") {
      moveDownIntervalID = setInterval(() => {
        fall();
      }, 10);
    }
    return () => {
      clearInterval(platformsIntervalID);
      clearInterval(moveUpIntervalID);
      clearInterval(moveDownIntervalID);
    };
  }, [gameRunning, moveVerticalDirection, platforms]);

  //MOVE PLAYER HORIZONTAL
  useEffect(() => {
    if (moveHorizontalDirection == "left") {
      moveLeftIntervalID = setInterval(() => {
        moveLeft();
      }, 10);
    } else if (moveHorizontalDirection == "right") {
      moveRightIntervalID = setInterval(() => {
        moveRight();
      }, 10);
    }

    return () => {
      clearInterval(moveLeftIntervalID);
      clearInterval(moveRightIntervalID);
    };
  }, [moveHorizontalDirection]);

  //EVENT LISTENER
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key == "ArrowUp") {
        console.log(
          event.key,
          "GP:",
          gamePoints,
          "GS:",
          gameScore,
          moveVerticalDirection
        );
        gamePoints++;
        setGameScore((prev) => prev + 1);
        setMoveVerticalDirection("up");
      } else if (event.key == "ArrowLeft") {
        setMoveHorizontalDirection("left");
      } else if (event.key == "ArrowRight") {
        setMoveHorizontalDirection("right");
      } else if (event.key == "ArrowDown") {
        setMoveHorizontalDirection("");
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24 bg-slate-400">
      {/* Loading spinner */}
      {isLoading && <LoadingSpinner />}

      <Image
        src={images.endless_sky_with_clouds}
        className="top-0 bottom-0 absolute w-full h-full object-cover"
      />

      <div className="flex justify-start items-start z-50 text-white font-bold">
        <h1>Game Score: {gameScore}</h1>
      </div>
      <div
        className="bg-gray-600  bg-opacity-50 relative"
        style={{ width: `${gridWidth}px`, height: `${gridHeight}px` }}
      >
        {/* Player */}
        {player && (
          <div
            className="absolute"
            style={{
              left: `${player.x || 0}px`,
              bottom: `${player.y || 0}px`,
              width: `${playerWidth}px`,
              height: `${playerHeight}px`,
            }}
          >
            <Image src={images.SimpleStoneGray} />
          </div>
        )}

        {/* Platforms */}
        {platforms &&
          platforms.map(
            (platform, index) =>
              platform && (
                <div
                  key={index}
                  className="absolute bg-gray-200"
                  style={{
                    left: `${platform.x || 0}px`,
                    bottom: `${platform.y || 0}px`,
                    width: `${platformWidth}px`,
                    height: `${platformHeight}px`,
                  }}
                >
                  {/* {pad.x}
            {pad.y} */}
                </div>
              )
          )}

        {/* Game start */}
        {!gameRunning && gameScore == 0 && (
          <div className="w-full h-full bg-gray-700 opacity-80 z-50 flex items-center justify-center flex-col">
            <h1 className="text-3xl font-bold text-white text-center">
              {" "}
              Click Start when ready!
            </h1>
            <button
              className="bg-slate-500 rounded-lg text-white z-50 p-2 mt-5 w-[40%] text-center"
              onClick={() => {
                setGameRunning(true);
              }}
            >
              Start Game
            </button>
          </div>
        )}

        {/* Game over */}
        {!gameRunning && gameScore > 0 && (
          <div className="w-full h-full bg-gray-700 opacity-80 z-50 flex items-center justify-center flex-col">
            <h1 className="text-3xl font-bold text-white"> Game over</h1>
            <Link
              href="/"
              className="bg-slate-500 rounded-lg text-white z-50 p-2 mt-5 w-[40%] text-center"
            >
              Back
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
