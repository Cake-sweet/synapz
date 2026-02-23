'use client';

import { ReactNode } from 'react';
import { Navbar } from './Navbar';

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-900">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
      <footer className="mt-auto border-t border-slate-800 bg-slate-900/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-violet-400 font-semibold">⚡</span>
              <span className="text-slate-400">Synapz © {new Date().getFullYear()}</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <span>Learn daily. Earn rewards. Expand your mind.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
