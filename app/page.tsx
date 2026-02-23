import { Brain } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-violet-400" />
            <span className="text-xl font-bold bg-gradient-to-r from-violet-400 to-emerald-400 bg-clip-text text-transparent">
              Synapz
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline" className="border-violet-500 text-violet-400">
                Login
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-violet-600 hover:bg-violet-700">
                Get Started
              </Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-violet-500/20 to-emerald-500/20 mb-8">
            <Brain className="w-12 h-12 text-violet-400" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent">
              Learn Something New Every Day
            </span>
          </h1>
          
          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto">
            Discover fascinating facts, earn streaks, and expand your knowledge with our AI-powered learning platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-violet-600 hover:bg-violet-700 text-lg px-8">
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-800 text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-20">
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="w-12 h-12 rounded-lg bg-violet-500/20 flex items-center justify-center mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Daily Facts</h3>
            <p className="text-slate-400">Discover new and interesting facts curated from various topics</p>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🔥</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Track Streaks</h3>
            <p className="text-slate-400">Build a learning habit with daily streak tracking</p>
          </div>
          
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6">
            <div className="w-12 h-12 rounded-lg bg-amber-500/20 flex items-center justify-center mb-4">
              <span className="text-2xl">🏆</span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Earn Points</h3>
            <p className="text-slate-400">Gamify your learning journey and earn rewards</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-slate-400">
          <p>⚡ Synapz © {new Date().getFullYear()} - Learn daily. Earn rewards. Expand your mind.</p>
        </div>
      </footer>
    </div>
  );
}
