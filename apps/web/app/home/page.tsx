'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import AuthGuard from '../../components/AuthGuard';
import UserDropdown from '../../components/UserDropdown';

type ConnectionState = 'disconnected' | 'searching' | 'connected';

export default function HomePage() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const router = useRouter();

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
    
    // Include token as query parameter
    const ws = new WebSocket(`ws://localhost:8080?token=${token}`);
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
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionState('disconnected');
    };

    if (typeof window !== 'undefined') {
      (window as any).gameWebSocket = ws;
    }
  };

  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    setConnectionState('disconnected');
  };

  const handleLogout = () => {
    // Clear WebSocket connection
    if (wsRef.current) {
      wsRef.current.close();
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
                <span>🏆</span>
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
                  <div className="text-4xl mb-4">🎮</div>
                  <h2 className="text-2xl font-semibold mb-4">Find Your Opponent</h2>
                  <p className="text-gray-400 mb-6">
                    Click the button below to join the matchmaking queue and get paired with another player instantly.
                  </p>
                  <button
                    onClick={connectToServer}
                    className="w-full px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    🔍 Find Player
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
                  <p className="text-gray-400 mb-6">
                    Looking for another player to challenge. This usually takes just a few seconds!
                  </p>
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
            <h3 className="text-xl font-semibold mb-4">🎯 Quick Rules Reminder</h3>
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
