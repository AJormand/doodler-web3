"use client";
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useGameContext } from "../context/GameContext";
import { fetchBetContract } from "../utils/appFeatures";

export default function Game() {
  const searchParams = useSearchParams();
  const { signer } = useGameContext();
  const [gameRunning, setGameRunning] = useState(true);
  const [platforms, setPlatforms] = useState([]);
  const [player, setPlayer] = useState({
    x: 140,
    y: 1,
  });
  const [moveHorizontalDirection, setMoveHorizontalDirection] = useState("");
  const [moveVerticalDirection, setMoveVerticalDirection] = useState("up");
  const [playerJumpPoint, setplayerJumpPoint] = useState(0);
  const [gameScore, setGameScore] = useState(0);
  //GRID
  let gridHeight = 500;
  let gridWidth = 300;
  //PLATFORMS
  let platformNumber = 5;
  let platformHeight = 20;
  let platformWidth = 80;
  let platformsIntervalID;
  //PLAYER
  let playerWidth = 20;
  let playerHeight = 40;
  let moveUpIntervalID;
  let moveDownIntervalID;
  let moveLeftIntervalID;
  let moveRightIntervalID;
  let playerJumpHeight = 150;

  const createPlatforms = (existingPlatforms) => {
    console.log("creating platforms");
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
    console.log("up interval");
    setPlayer((player) => {
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
    console.log("down interval");
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
      console.log(event.key);
      if (event.key == "ArrowUp") {
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
    <main className="flex min-h-screen flex-col items-center justify-start p-24">
      <div className="flex justify-start items-start">
        <h1>Game Score: {gameScore}</h1>
      </div>
      <div
        className="bg-yellow-300 relative"
        style={{ width: `${gridWidth}px`, height: `${gridHeight}px` }}
      >
        {/* Player */}
        {player && (
          <div
            className="absolute bg-black"
            style={{
              left: `${player.x || 0}px`,
              bottom: `${player.y || 0}px`,
              width: `${playerWidth}px`,
              height: `${playerHeight}px`,
            }}
          ></div>
        )}

        {/* Platforms */}
        {platforms &&
          platforms.map(
            (platform, index) =>
              platform && (
                <div
                  key={index}
                  className="absolute bg-green-800"
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

        {/* Game over */}
        {!gameRunning && (
          <div className="w-full h-full bg-gray-400 opacity-80 z-50 flex items-center justify-center flex-col">
            <h1 className="text-lg"> Game over</h1>
            <Link
              href="/"
              className="bg-slate-500 rounded-lg text-white z-50 p-2 mt-5"
            >
              Back
            </Link>
            <button onClick={() => updateScoreToContract()}>Test</button>
          </div>
        )}
      </div>
    </main>
  );
}
