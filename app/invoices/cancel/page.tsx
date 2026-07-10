'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { XCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function PaymentCancelPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans transition-colors relative overflow-hidden font-sans">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-red-500/5 dark:bg-red-500/2 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-500/5 dark:bg-zinc-500/2 blur-[100px] pointer-events-none" />

      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16 z-10 font-sans">
        <div className="w-full max-w-md bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-8 text-center space-y-6 animate-fade-in-up">
          {/* Cancel Icon ring */}
          <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-red-500/10 dark:bg-red-500/5 animate-pulse" />
            <XCircle className="w-16 h-16 text-red-500 relative z-10" />
          </div>

          <div className="space-y-2 font-sans">
            <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
              Payment Cancelled
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
              Your transaction was cancelled. No charges were made to your account.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            <button
              onClick={() => router.back()}
              className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              Try Checkout Again
            </button>
            <Link
              href="/products"
              className="w-full py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold transition-colors text-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Browse Other Codebases
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#09090b] py-8 text-center text-xs text-zinc-500 mt-auto">
        <p>© 2026 Hossen Shop. All rights reserved.</p>
      </footer>
    </div>
  );
}
