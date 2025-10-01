'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '../../components/AuthGuard';
import UserDropdown from '../../components/UserDropdown';
import { Trophy, Gamepad2, Target, Search, Bot } from 'lucide-react';
import { getWsBase } from '../../lib/config';

type ConnectionState = 'disconnected' | 'searching' | 'connected';

const MATCHMAKING_TIMEOUT_SECONDS = 10;

export default function HomePage() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [countdown, setCountdown] = useState<number>(MATCHMAKING_TIMEOUT_SECONDS);
  const wsRef = useRef<WebSocket | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  // Cleanup effect for countdown timer
  useEffect(() => {
    return () => {
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
    };
  }, []);

  const connectToServer = () => {
    if (connectionState !== 'disconnected') return;
    
    // Get JWT token from localStorage
    const token = localStorage.getItem('jwt');
    if (!token) {
      console.error('No JWT token found');
      router.replace('/signin');
      return;
    }
    
  setConnectionState('searching');
  setCountdown(MATCHMAKING_TIMEOUT_SECONDS);
    
    // Start countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    countdownRef.current = timer;
    
  // Include token as query parameter
  const ws = new WebSocket(`${getWsBase()}?token=${token}`);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('WebSocket connected successfully');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);
        
        switch (message.type) {
          case 'info':
            if (message.message === 'connected') {
              console.log('Connected to server, waiting for opponent...');
            }
            break;
            
          case 'start':
            console.log('Game starting!', message);
            sessionStorage.setItem('gameState', JSON.stringify(message.gameState));
            sessionStorage.setItem('playerSymbol', message.playerSymbol);
            if (message.opponentUsername) {
              console.log('Storing opponent username:', message.opponentUsername);
              sessionStorage.setItem('opponentUsername', message.opponentUsername);
            }
            
            ws.onmessage = null;
            (window as any).gameWebSocket = ws;
            
            setTimeout(() => {
              router.replace('/game');
            }, 100);
            break;
            
          default:
            console.log('Unknown message type:', message.type);
            break;
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket closed:', event.code, event.reason);
      setConnectionState('disconnected');
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionState('disconnected');
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
      }
    };

    if (typeof window !== 'undefined') {
      (window as any).gameWebSocket = ws;
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
  setConnectionState('disconnected');
  setCountdown(MATCHMAKING_TIMEOUT_SECONDS);
  };

  const handleLogout = () => {
    // Clear WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
    }
    
    // Clear countdown timer
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    
    // Clear local storage
    localStorage.removeItem('jwt');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    
    // Clear session storage
    sessionStorage.removeItem('gameState');
    sessionStorage.removeItem('playerSymbol');
    
    router.replace('/');
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
        {/* Header with User Dropdown */}
        <header className="max-w-4xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              FourPlay
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                href="/leaderboard"
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors duration-200 font-semibold flex items-center space-x-2"
              >
                <Trophy className="w-4 h-4" />
                <span>Leaderboard</span>
              </Link>
              <UserDropdown onLogout={handleLogout} />
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Ready to Play?
          </h1>
          
          <p className="text-xl text-gray-300 mb-12">
            Welcome back! Find an opponent and start your Connect Four battle.
          </p>

          {/* Connection Status */}
          <div className="mb-12">
            {connectionState === 'disconnected' && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 max-w-md mx-auto">
                  <div className="flex justify-center mb-4">
                    <Gamepad2 className="w-10 h-10 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-semibold mb-4">Find Your Opponent</h2>
                  <p className="text-gray-400 mb-6">
                    Join the matchmaking queue to get paired with another player. If no human opponent is found within 10 seconds, you'll be matched with a bot!
                  </p>
                  <button
                    onClick={connectToServer}
                    className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <Search className="w-5 h-5 inline mr-2" />
                    Find Opponent
                  </button>
                </div>
              </div>
            )}

            {connectionState === 'searching' && (
              <div className="space-y-6">
                <div className="bg-slate-800/50 p-8 rounded-xl border border-slate-700 max-w-md mx-auto">
                  <div className="flex items-center justify-center space-x-3 mb-6">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                    <p className="text-xl text-blue-400">Searching for opponent...</p>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <div className="text-3xl font-bold text-yellow-400">{countdown}</div>
                      <div className="text-gray-400">seconds remaining</div>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                      <div 
                        className="bg-gradient-to-r from-blue-500 to-yellow-500 h-2 rounded-full transition-all duration-1000"
                        style={{ width: `${(countdown / MATCHMAKING_TIMEOUT_SECONDS) * 100}%` }}
                      ></div>
                    </div>
                    
                    {countdown > MATCHMAKING_TIMEOUT_SECONDS / 2 ? (
                      <p className="text-gray-400 text-center">
                        Looking for another player to challenge...
                      </p>
                    ) : (
                      <p className="text-yellow-400 text-center font-semibold flex items-center justify-center gap-2">
                        <Bot className="w-5 h-5" />
                        No players found! You'll be matched with a bot soon...
                      </p>
                    )}
                  </div>
                  
                  <button
                    onClick={disconnect}
                    className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 font-semibold"
                  >
                    Cancel Search
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Game Rules Reminder */}
          <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-400" />
              Quick Rules Reminder
            </h3>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <p className="text-gray-300"><span className="text-red-400 font-semibold">Red (X)</span> goes first</p>
                <p className="text-gray-300"><span className="text-yellow-400 font-semibold">Yellow (O)</span> goes second</p>
              </div>
              <div className="space-y-2">
                <p className="text-gray-300">Get 4 in a row to win!</p>
                <p className="text-gray-300">Horizontal, vertical, or diagonal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
