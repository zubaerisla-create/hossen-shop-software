'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Brain } from 'lucide-react';
import Header from '@/components/Header';
import AiEstimator from '@/components/AiEstimator';

export default function EstimatorPage() {
  const router = useRouter();

  const handleImportToCustomForm = (title: string, desc: string, budget: number, tech: string) => {
    localStorage.setItem('apex_imported_estimate', JSON.stringify({ title, desc, budget, tech }));
    localStorage.setItem('apex_user_role', 'customer');
    router.push('/user');
  };

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans min-h-screen transition-colors relative overflow-hidden">

      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1400px] h-[500px] bg-gradient-to-b from-[#6A2D3D]/5 to-transparent pointer-events-none blur-[120px] z-0" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent z-10" />

      <Header />

      <main className="relative z-10 flex-1 max-w-6xl mx-auto w-full px-4 md:px-6 py-10 md:py-16 space-y-8">

        {/* Navigation back */}
        <button
          onClick={() => router.push('/')}
          className="inline-flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-white text-xs font-semibold transition-colors bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 px-3 py-1.5 rounded-lg cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </button>

        {/* Title Header with Gradient */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center gap-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-zinc-200/60 dark:border-zinc-800/80">
            <Brain className="w-3.5 h-3.5 text-[#6A2D3D] dark:text-rose-400" />
            <span>AI Cost Engine</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight leading-none">
            Project Cost <span className="bg-gradient-to-r from-[#6A2D3D] to-rose-600 bg-clip-text text-transparent italic font-serif">Estimator</span>
          </h1>

          <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm max-w-md mx-auto leading-relaxed">
            Provide details of your custom features. Our AI assistant analyzes technical requirements, database dependencies, and engineering timeline phases.
          </p>
        </div>

        {/* Estimator Wrapper */}
        <AiEstimator
          onImport={handleImportToCustomForm}
        />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950/40 py-8 text-center text-[11px] text-zinc-500">
        <p>© 2026 Hossen Shop Hybrid Marketplace & Software Engineering Firm. Uttara Sector 11 Dhaka BD.</p>
      </footer>
    </div>
  );
}
