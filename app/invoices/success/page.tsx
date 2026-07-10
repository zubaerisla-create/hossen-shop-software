'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { syncWithBackend } from '../../utils/storage';
import Header from '@/components/Header';
import { CheckCircle2, ArrowRight, Download, CreditCard } from 'lucide-react';
import Link from 'next/link';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const invoiceId = searchParams.get('invoice_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function sync() {
      // Sync local storage state with the backend
      await syncWithBackend();
      setLoading(false);
    }
    sync();
  }, [invoiceId]);

  return (
    <div className="w-full max-w-md bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-8 text-center space-y-6 animate-fade-in-up">
      {/* Dynamic Animated Success Ring */}
      <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
        <div className="absolute inset-0 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 animate-ping" />
        <CheckCircle2 className="w-16 h-16 text-emerald-500 relative z-10" />
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
          Payment Successful!
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
          Thank you for your purchase. Your payment was verified and processed securely.
        </p>
      </div>

      {invoiceId && (
        <div className="bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200/60 dark:border-zinc-900/60 rounded-xl p-4 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-zinc-500">
            <CreditCard className="w-4 h-4" />
            <span>Invoice Ref:</span>
          </div>
          <span className="font-mono font-bold text-zinc-900 dark:text-white">
            {invoiceId.substring(0, 8).toUpperCase()}...
          </span>
        </div>
      )}

      <div className="pt-2 flex flex-col gap-2.5">
        <Link
          href="/user/products"
          className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl font-bold transition-all text-xs flex items-center justify-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer"
        >
          <Download className="w-4 h-4" />
          Access Downloads
        </Link>
        <Link
          href="/user/deals"
          className="w-full py-2.5 bg-transparent border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded-xl font-semibold transition-colors text-xs flex items-center justify-center gap-1 cursor-pointer"
        >
          Go to Workspace Dashboard
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans transition-colors relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/5 dark:bg-emerald-500/2 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 dark:bg-indigo-500/2 blur-[100px] pointer-events-none" />

      <Header />

      <main className="flex-1 flex items-center justify-center px-4 py-16 z-10">
        <Suspense fallback={
          <div className="text-center text-xs text-zinc-500">
            Verifying secure session...
          </div>
        }>
          <SuccessPageContent />
        </Suspense>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#09090b] py-8 text-center text-xs text-zinc-500 mt-auto">
        <p>© 2026 Hossen Shop. All rights reserved.</p>
      </footer>
    </div>
  );
}
