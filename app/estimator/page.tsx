'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '../components/Header';
import AiEstimator from '../components/AiEstimator';

export default function EstimatorPage() {
  const router = useRouter();

  const handleImportToCustomForm = (title: string, desc: string, budget: number, tech: string) => {
    localStorage.setItem('apex_imported_estimate', JSON.stringify({ title, desc, budget, tech }));
    localStorage.setItem('apex_user_role', 'customer');
    router.push('/portal');
  };

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans min-h-screen transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 md:px-6 py-12 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white">AI-Powered Project Cost Estimator</h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs max-w-md mx-auto">
            Input your custom project features. Our AI agent will calculate recommended budget, milestone phases and development days.
          </p>
        </div>

        <div className="bg-zinc-100/50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-2 shadow-xl dark:shadow-2xl">
          <AiEstimator
            onImport={handleImportToCustomForm}
          />
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950/40 py-8 text-center text-xs text-zinc-500">
        <p>© 2026 ApexDevs Hybrid Marketplace & Software Engineering Firm. Uttara Sector 11 Dhaka BD.</p>
      </footer>
    </div>
  );
}
