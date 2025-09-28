'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type GameState = {
  board: string[][];
  currentPlayer: "X" | "O";
  gameOver: boolean;
  winner?: "X" | "O";
  isDraw?: boolean;
};

export default function GamePage() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerSymbol, setPlayerSymbol] = useState<"X" | "O" | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedGameState = sessionStorage.getItem('gameState');
    const savedPlayerSymbol = sessionStorage.getItem('playerSymbol');

    if (!savedGameState || !savedPlayerSymbol) {
      router.replace('/home');
      return;
    }

    setGameState(JSON.parse(savedGameState));
    setPlayerSymbol(savedPlayerSymbol as "X" | "O");

    const ws = (window as any).gameWebSocket;

    if (ws && ws.readyState === WebSocket.OPEN) {
      wsRef.current = ws;
      setIsConnected(true);

      ws.onmessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          
          switch (message.type) {
            case 'start':
              sessionStorage.setItem('gameState', JSON.stringify(message.gameState));
              sessionStorage.setItem('playerSymbol', message.playerSymbol);
              setGameState(message.gameState);
              setPlayerSymbol(message.playerSymbol);
              break;
              
            case 'move':
              setGameState(message.gameState);
              break;
              
            default:
              break;
          }
        } catch (error) {
          console.error('Error parsing message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        router.replace('/home');
      };

      ws.onerror = (error: Event) => {
        console.error('WebSocket error:', error);
        setIsConnected(false);
        router.replace('/home');
      };
    } else {
      router.replace('/home');
    }
  }, [router]);

  const makeMove = (column: number) => {
    if (!wsRef.current || !isConnected || !gameState) return;
    if (gameState.currentPlayer !== playerSymbol || gameState.gameOver) return;
    
    wsRef.current.send(JSON.stringify({
      type: 'move',
      column: column
    }));
  };

  const leaveGame = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    sessionStorage.removeItem('gameState');
    sessionStorage.removeItem('playerSymbol');
    
    router.replace('/home');
  };

  const playAgain = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    sessionStorage.removeItem('gameState');
    sessionStorage.removeItem('playerSymbol');
    
    router.replace('/home');
  };

  const renderBoard = () => {
    if (!gameState) return null;

    return (
      <div className="grid grid-cols-7 gap-2 bg-blue-600 p-4 rounded-lg max-w-md mx-auto">
        {gameState.board.map((row, rowIndex) => 
          row.map((cell, colIndex) => (
            <button
              key={`${rowIndex}-${colIndex}`}
              onClick={() => makeMove(colIndex)}
              disabled={gameState.currentPlayer !== playerSymbol || gameState.gameOver || !isConnected}
              className={`
                w-16 h-16 rounded-full border-2 border-blue-400 font-bold text-2xl
                ${cell === 'X' ? 'bg-red-500 text-white' : 
                  cell === 'O' ? 'bg-yellow-400 text-black' : 
                  'bg-white hover:bg-gray-100'} 
                ${gameState.currentPlayer === playerSymbol && !gameState.gameOver && isConnected ? 'cursor-pointer hover:bg-gray-200' : 'cursor-not-allowed'}
                transition-colors duration-200
              `}
            >
              {cell === '.' ? '' : cell}
            </button>
          ))
        )}
      </div>
    );
  };

  if (!gameState || !playerSymbol) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading game...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
      {/* Header */}
      <header className="max-w-4xl mx-auto mb-8">
        <div className="flex justify-between items-center">
          <Link href="/home" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            FourPlay
          </Link>
          <div className="flex items-center space-x-4">
            <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isConnected ? 'bg-green-600' : 'bg-red-600'
            }`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </div>
            <button
              onClick={leaveGame}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 font-semibold"
            >
              🚪 Leave Game
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Connect Four Battle
        </h1>

        <div className="text-center mb-8">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-6 mb-4">
              <div className="text-lg">
                <span className="text-gray-400">You are:</span>
                <span className={`ml-2 px-3 py-1 rounded font-bold text-lg ${
                  playerSymbol === 'X' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                }`}>
                  {playerSymbol} {playerSymbol === 'X' ? '(Red)' : '(Yellow)'}
                </span>
              </div>
              <div className="text-lg">
                <span className="text-gray-400">Current turn:</span>
                <span className={`ml-2 px-3 py-1 rounded font-bold text-lg ${
                  gameState.currentPlayer === 'X' ? 'bg-red-500 text-white' : 'bg-yellow-500 text-black'
                }`}>
                  {gameState.currentPlayer} {gameState.currentPlayer === 'X' ? '(Red)' : '(Yellow)'}
                </span>
              </div>
            </div>

            {!gameState.gameOver && isConnected && (
              <>
                {gameState.currentPlayer === playerSymbol ? (
                  <p className="text-green-400 font-semibold text-lg">
                    🎯 Your turn! Click a column to drop your piece.
                  </p>
                ) : (
                  <p className="text-orange-400 font-semibold text-lg">
                    ⏳ Waiting for opponent's move...
                  </p>
                )}
              </>
            )}

            {!isConnected && (
              <p className="text-red-400 font-semibold text-lg">
                ⚠️ Connection lost! Redirecting...
              </p>
            )}

            {gameState.gameOver && (
              <div className="space-y-4">
                <div className="text-3xl font-bold">
                  {gameState.winner ? (
                    <p className={gameState.winner === playerSymbol ? 'text-green-400' : 'text-red-400'}>
                      {gameState.winner === playerSymbol ? '🎉 You Win!' : '😔 You Lose!'}
                    </p>
                  ) : (
                    <p className="text-yellow-400">🤝 It's a Draw!</p>
                  )}
                </div>
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={playAgain}
                    className="px-6 py-3 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-lg font-semibold transition-all duration-200"
                  >
                    🔄 Play Again
                  </button>
                  <button
                    onClick={leaveGame}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-semibold transition-colors duration-200"
                  >
                    🏠 Back to Home
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center mb-8">
          {renderBoard()}
        </div>

        <div className="flex justify-center">
          <div className="grid grid-cols-7 gap-2 max-w-md">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="w-16 text-center text-gray-400 font-semibold">
                {i}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
