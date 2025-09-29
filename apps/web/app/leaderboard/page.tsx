'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AuthGuard from '../../components/AuthGuard';
import UserDropdown from '../../components/UserDropdown';
import { useRouter } from 'next/navigation';

interface Player {
  id: string;
  username: string;
  points: number;
}

export default function LeaderboardPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('http://localhost:3001/leaderBoard');
      const data = await response.json();

      if (response.ok) {
        setPlayers(data.leaderBoard);
      } else {
        setError(data.message || 'Failed to fetch leaderboard');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('jwt');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    
    // Clear session storage
    sessionStorage.removeItem('gameState');
    sessionStorage.removeItem('playerSymbol');
    sessionStorage.removeItem('opponentUsername');
    
    router.replace('/');
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500 text-black';
      case 3:
        return 'bg-gradient-to-r from-orange-400 to-orange-600 text-black';
      default:
        return 'bg-slate-700 text-white';
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white p-8">
        {/* Header */}
        <header className="max-w-6xl mx-auto mb-8">
          <div className="flex justify-between items-center">
            <Link href="/home" className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              FourPlay
            </Link>
            <div className="flex items-center space-x-4">
              <Link 
                href="/home"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 font-semibold"
              >
                🏠 Home
              </Link>
              <UserDropdown onLogout={handleLogout} />
            </div>
          </div>
        </header>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              🏆 Leaderboard
            </h1>
            <p className="text-xl text-gray-300">
              Top players ranked by their total points
            </p>
          </div>

          {loading && (
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-xl">Loading leaderboard...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-6 py-4 rounded-lg max-w-md mx-auto text-center">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-4">
              {players.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🎮</div>
                  <h2 className="text-2xl font-semibold mb-2 text-gray-300">No players yet!</h2>
                  <p className="text-gray-400">Be the first to start playing and earn points.</p>
                </div>
              ) : (
                <div className="grid gap-4 max-w-4xl mx-auto">
                  {players.map((player, index) => {
                    const rank = index + 1;
                    const currentUser = localStorage.getItem('username');
                    const isCurrentUser = player.username === currentUser;
                    
                    return (
                      <div
                        key={player.id}
                        className={`
                          flex items-center justify-between p-6 rounded-xl border transition-all duration-200 hover:scale-105
                          ${isCurrentUser 
                            ? 'bg-blue-900/50 border-blue-400 ring-2 ring-blue-400' 
                            : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                          }
                        `}
                      >
                        <div className="flex items-center space-x-6">
                          {/* Rank */}
                          <div className={`
                            w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg
                            ${getRankStyle(rank)}
                          `}>
                            {getRankIcon(rank)}
                          </div>
                          
                          {/* Player Info */}
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="text-xl font-semibold">
                                {player.username}
                              </h3>
                              {isCurrentUser && (
                                <span className="px-2 py-1 bg-blue-600 text-xs rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400">
                              {rank === 1 ? 'Champion' : 
                               rank <= 3 ? 'Top Player' : 
                               rank <= 10 ? 'Elite' : 'Player'}
                            </p>
                          </div>
                        </div>

                        {/* Points */}
                        <div className="text-right">
                          <div className="text-2xl font-bold text-yellow-400">
                            {player.points.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-400">
                            {player.points === 1 ? 'point' : 'points'}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Actions */}
              <div className="text-center mt-12 space-y-4">
                <div className="bg-slate-800/30 p-6 rounded-xl border border-slate-700 max-w-2xl mx-auto">
                  <h3 className="text-xl font-semibold mb-4">🎯 How to Earn Points</h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="text-2xl">🏆</div>
                      <p className="text-green-400 font-semibold">Win a Game</p>
                      <p className="text-gray-400">+10 points</p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl">🤝</div>
                      <p className="text-blue-400 font-semibold">Draw Game</p>
                      <p className="text-gray-400">+3 points</p>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl">🎮</div>
                      <p className="text-purple-400 font-semibold">Play Game</p>
                      <p className="text-gray-400">+1 point</p>
                    </div>
                  </div>
                </div>
                
                <Link
                  href="/home"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-lg font-semibold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  🎮 Play Now & Earn Points
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </AuthGuard>
  );
}