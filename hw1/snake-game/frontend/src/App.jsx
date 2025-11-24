import { useState, useEffect, useCallback } from 'react'
import './App.css'

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 400;

function App() {
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [food, setFood] = useState({ x: 15, y: 15 });
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [leaderboard, setLeaderboard] = useState([]);

  const generateFood = useCallback(() => {
    const newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE)
    };
    return newFood;
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setFood(generateFood());
    setDirection(INITIAL_DIRECTION);
    setGameOver(false);
    setScore(0);
    setGameStarted(true);
    setIsPaused(false);
  };

  const togglePause = () => {
    if (gameStarted && !gameOver) {
      setIsPaused(!isPaused);
    }
  };

  const saveScore = async () => {
    try {
      await fetch('http://localhost:8000/api/scores/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          player_name: 'Player',
          score: score
        })
      });
      fetchLeaderboard();
    } catch (error) {
      console.error('Error saving score:', error);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/scores/leaderboard/');
      const data = await response.json();
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  useEffect(() => {
    if (gameOver && score > 0) {
      saveScore();
    }
  }, [gameOver, score]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!gameStarted && e.key === ' ') {
        resetGame();
        return;
      }

      if (e.key === ' ' && gameStarted && !gameOver) {
        e.preventDefault();
        togglePause();
        return;
      }

      if (gameOver || isPaused) return;

      switch (e.key) {
        case 'ArrowUp':
          if (direction.y === 0) setDirection({ x: 0, y: -1 });
          break;
        case 'ArrowDown':
          if (direction.y === 0) setDirection({ x: 0, y: 1 });
          break;
        case 'ArrowLeft':
          if (direction.x === 0) setDirection({ x: -1, y: 0 });
          break;
        case 'ArrowRight':
          if (direction.x === 0) setDirection({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [direction, gameOver, gameStarted, isPaused]);

  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) return;

    const moveSnake = () => {
      setSnake(prevSnake => {
        const newHead = {
          x: prevSnake[0].x + direction.x,
          y: prevSnake[0].y + direction.y
        };

        // Wrap around walls
        if (newHead.x < 0) newHead.x = GRID_SIZE - 1;
        if (newHead.x >= GRID_SIZE) newHead.x = 0;
        if (newHead.y < 0) newHead.y = GRID_SIZE - 1;
        if (newHead.y >= GRID_SIZE) newHead.y = 0;

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setFood(generateFood());
          setScore(s => s + 10);
          return newSnake;
        }

        newSnake.pop();
        return newSnake;
      });
    };

    const gameLoop = setInterval(moveSnake, GAME_SPEED);
    return () => clearInterval(gameLoop);
  }, [direction, food, gameOver, gameStarted, isPaused, generateFood]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-8">
      <div className="max-w-7xl w-full">
        <h1 className="text-5xl font-bold text-center mb-8 text-white">
          🐍 Snake Game
        </h1>
        
        <div className="flex flex-col lg:flex-row gap-8 items-center justify-center">
          {/* Game Board */}
          <div className="flex flex-col items-center">
            <div className="mb-8 text-2xl font-bold text-white">
              Score: {score}
            </div>

            <div className="mb-10 flex gap-8">
              <button
                onClick={resetGame}
                className="px-8 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors shadow-lg"
              >
                {gameStarted && !gameOver ? 'Restart' : 'Play'}
              </button>
              <button
                onClick={togglePause}
                disabled={!gameStarted || gameOver}
                className={`px-8 py-3 font-bold rounded-lg transition-colors shadow-lg ${
                  !gameStarted || gameOver
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : isPaused
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-red-500 text-white hover:bg-red-600'
                }`}
              >
                {isPaused ? 'Resume' : 'Pause'}
              </button>
            </div>
            
            <div 
              className="relative border-4 border-green-500 rounded-lg shadow-2xl m-4"
              style={{
                width: GRID_SIZE * CELL_SIZE,
                height: GRID_SIZE * CELL_SIZE,
                backgroundColor: '#1a1a1a',
                backgroundImage: `
                  linear-gradient(to right, rgba(255,255,255,0.3) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(255,255,255,0.3) 1px, transparent 1px)
                `,
                backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`
              }}
            >
              {/* Snake */}
              {snake.map((segment, index) => (
                <div
                  key={index}
                  className="absolute bg-green-400 rounded-sm transition-all"
                  style={{
                    left: segment.x * CELL_SIZE + 1,
                    top: segment.y * CELL_SIZE + 1,
                    width: CELL_SIZE - 2,
                    height: CELL_SIZE - 2,
                    backgroundColor: index === 0 ? '#4ade80' : '#22c55e'
                  }}
                />
              ))}
              
              {/* Food */}
              <div
                className="absolute rounded-full shadow-lg"
                style={{
                  left: food.x * CELL_SIZE + 2,
                  top: food.y * CELL_SIZE + 2,
                  width: CELL_SIZE - 4,
                  height: CELL_SIZE - 4,
                  backgroundColor: '#ef4444',
                  boxShadow: '0 0 10px #ef4444'
                }}
              />

              {/* Pause Overlay */}
              {isPaused && !gameOver && (
                <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-4xl font-bold text-yellow-500 mb-4">PAUSED</h2>
                    <p className="text-white text-xl">Press SPACE or click Resume to continue</p>
                  </div>
                </div>
              )}

              {/* Game Over Overlay */}
              {gameOver && (
                <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-4xl font-bold text-red-500 mb-4">Game Over!</h2>
                    <p className="text-2xl text-white mb-4">Final Score: {score}</p>
                    <button
                      onClick={resetGame}
                      className="px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-colors"
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              )}

              {/* Start Screen */}
              {!gameStarted && !gameOver && (
                <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">Click Play to Start</h2>
                    <p className="text-gray-400">or press SPACE</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Instructions and Controls */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-2xl lg:min-w-[300px]">
            <h2 className="text-2xl font-bold text-white mb-4">🎮 How to Play</h2>
            <div className="space-y-3 text-gray-300">
              <div>
                <h3 className="font-bold text-white mb-2">Controls:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• <span className="text-green-400">Arrow Keys</span> - Move the snake</li>
                  <li>• <span className="text-green-400">SPACE</span> - Pause/Resume</li>
                  <li>• <span className="text-green-400">Play Button</span> - Start/Restart game</li>
                  <li>• <span className="text-green-400">Pause Button</span> - Pause the game</li>
                </ul>
              </div>
              <div>
                <h3 className="font-bold text-white mb-2">Objective:</h3>
                <ul className="space-y-1 text-sm">
                  <li>• Eat the <span className="text-red-400">red food</span> to grow</li>
                  <li>• Each food gives <span className="text-yellow-400">10 points</span></li>
                  <li>• Don't run into yourself!</li>
                  <li>• Walls wrap around to opposite side</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-gray-800 rounded-lg p-6 shadow-2xl lg:min-w-[300px]">
            <h2 className="text-2xl font-bold text-white mb-4">🏆 Leaderboard</h2>
            <div className="space-y-2">
              {leaderboard.length > 0 ? (
                leaderboard.map((entry, index) => (
                  <div 
                    key={entry.id}
                    className="flex justify-between items-center p-3 bg-gray-700 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-bold text-yellow-400">#{index + 1}</span>
                      <span className="text-white">{entry.player_name}</span>
                    </div>
                    <span className="text-green-400 font-bold">{entry.score}</span>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">No scores yet!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
