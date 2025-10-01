import Link from 'next/link';
import AuthAwareButton from '../components/AuthAwareButton';
import { Gamepad2, BookOpen, Target, Rocket, Globe, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      {/* Header */}
      <header className="p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            FourPlay
          </h1>
          <div className="space-x-4">
            <Link 
              href="/signin"
              className="px-4 py-2 border border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg transition-colors duration-200"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 rounded-lg font-semibold transition-all duration-200"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Connect Four
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            The classic strategy game reimagined for the modern web. Play real-time matches against opponents from around the world!
          </p>
          <div className="space-x-4">
            <AuthAwareButton>
              <Gamepad2 className="w-5 h-5 inline mr-2" />
              Start Playing
            </AuthAwareButton>
            <Link
              href="#how-to-play"
              className="inline-block px-8 py-4 border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white rounded-lg font-semibold text-lg transition-all duration-200"
            >
              <BookOpen className="w-5 h-5 inline mr-2" />
              How to Play
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <div className="text-4xl mb-4 flex justify-center">
              <Zap className="w-10 h-10 text-yellow-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Real-Time Gameplay</h3>
            <p className="text-gray-400">
              Experience lightning-fast, real-time matches with WebSocket technology. Every move happens instantly!
            </p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <div className="text-4xl mb-4 flex justify-center">
              <Globe className="w-10 h-10 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Global Matchmaking</h3>
            <p className="text-gray-400">
              Get matched with players from around the world. Find opponents instantly and start playing!
            </p>
          </div>
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <div className="text-4xl mb-4 flex justify-center">
              <Target className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Classic Strategy</h3>
            <p className="text-gray-400">
              The timeless 4-in-a-row gameplay you know and love, with smooth animations and responsive design.
            </p>
          </div>
        </div>

        {/* How to Play */}
        <section id="how-to-play" className="mb-16">
          <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            How to Play
          </h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">1</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Create Account & Login</h3>
                    <p className="text-gray-400">Sign up for free and log in to start playing against real opponents.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">2</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Find a Player</h3>
                    <p className="text-gray-400">Click "Find Player" to get matched with an opponent instantly.</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">3</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Take Turns</h3>
                    <p className="text-gray-400">Click on columns to drop your pieces. Red goes first (X), then Yellow (O).</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <div className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold flex-shrink-0">4</div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Connect Four!</h3>
                    <p className="text-gray-400">Get 4 pieces in a row horizontally, vertically, or diagonally to win!</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-slate-800/30 p-8 rounded-xl border border-slate-700">
              <div className="grid grid-cols-7 gap-2 bg-blue-600 p-4 rounded-lg">
                {/* Sample game board */}
                {Array.from({ length: 42 }, (_, i) => {
                  const row = Math.floor(i / 7);
                  const col = i % 7;
                  let piece = '';
                  // Add some sample pieces for demonstration
                  if ((row === 5 && col === 0) || (row === 4 && col === 1) || (row === 3 && col === 2)) piece = 'X';
                  if ((row === 5 && col === 1) || (row === 4 && col === 2) || (row === 3 && col === 3)) piece = 'O';
                  
                  return (
                    <div
                      key={i}
                      className={`w-8 h-8 rounded-full border-2 border-blue-400 font-bold text-sm flex items-center justify-center
                        ${piece === 'X' ? 'bg-red-500 text-white' : 
                          piece === 'O' ? 'bg-yellow-400 text-black' : 'bg-white'}`}
                    >
                      {piece}
                    </div>
                  );
                })}
              </div>
              <p className="text-center text-gray-400 mt-4 text-sm">Sample game board</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-12 rounded-2xl border border-blue-500/30">
          <h2 className="text-3xl font-bold mb-4">Ready to Challenge the World?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of players in epic Connect Four battles!
          </p>
          <AuthAwareButton className="inline-block px-10 py-4 bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 rounded-lg font-bold text-lg transition-all duration-200 transform hover:scale-105 shadow-lg">
            <Rocket className="w-5 h-5 inline mr-2" />
            Get Started Now
          </AuthAwareButton>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-8 border-t border-slate-700">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-400">
          <p>&copy; 2025 FourPlay. Built with Next.js and WebSockets.</p>
        </div>
      </footer>
    </div>
  );
}