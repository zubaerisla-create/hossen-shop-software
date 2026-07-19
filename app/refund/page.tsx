'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, RefreshCcw, HelpCircle, FileText, AlertCircle, ShoppingBag, Terminal, CheckCircle2 } from 'lucide-react';

export default function RefundPolicyPage() {
  const customMilestoneRefunds = [
    {
      phase: 'Phase 1: Contract Signing & Initiation',
      detail: 'If the client requests cancellation before the workspace developers commit any code to the deal branch, a 90% refund is processed (excluding 10% processing charges).'
    },
    {
      phase: 'Phase 2: Active Development',
      detail: 'Once a milestone phase is completed and approved by the client, the corresponding invoice total is non-refundable. Subsequent unpaid phases can be cancelled at any time.'
    }
  ];

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-[#070708] text-zinc-900 dark:text-zinc-100 font-sans min-h-screen transition-colors">
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-12 space-y-16">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-955 dark:hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-50 to-zinc-100/55 dark:from-zinc-900/30 dark:to-zinc-950/20 border border-zinc-200/80 dark:border-zinc-800/80 p-8 md:p-12">
          <div className="space-y-4 max-w-2xl">
            <span className="text-[10px] font-bold text-[#6A2D3D] dark:text-[#fca5a5] uppercase tracking-widest block flex items-center gap-1.5">
              <RefreshCcw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
              Refund & Cancellation
            </span>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-zinc-955 dark:text-white leading-[1.1]">
              Refund & Project <br />
              Cancellation Policy
            </h1>
            <p className="text-zinc-550 dark:text-zinc-400 text-xs md:text-sm leading-relaxed font-semibold">
              Last Updated: July 15, 2026. This policy clarifies transaction terms for digital product purchases and custom service development phases.
            </p>
          </div>
        </div>

        {/* Core Policy Divisions */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Content (Left) */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Division 1: Digital Products */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-955 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#6A2D3D] dark:text-[#fca5a5]" />
                1. Marketplace Templates & Boilerplates
              </h3>
              <p className="text-xs md:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                Since our templates are distributed as downloadable digital assets containing open-source code (Next.js, Flutter, React), we maintain a strict **no-refund policy** once the download link is generated. This is because digital access cannot be revoked.
              </p>
              <div className="pl-6 border-l-2 border-zinc-200 dark:border-zinc-800 space-y-2 text-xs text-zinc-500 dark:text-zinc-400">
                <p className="font-semibold">Exception Scenarios:</p>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>The codebase has a fatal compile error that our support engineers cannot resolve within 5 business days.</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Double charges occurred due to network dropouts during gateway processing.</span>
                </div>
              </div>
            </div>

            {/* Division 2: Custom Milestone Projects */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-955 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#6A2D3D] dark:text-[#fca5a5]" />
                2. Custom Milestone Settlements
              </h3>
              <p className="text-xs md:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                Custom deals are structured stage-by-stage. If you cancel your custom deal contract mid-way:
              </p>

              <div className="space-y-3 mt-4">
                {customMilestoneRefunds.map((refund, idx) => (
                  <div key={idx} className="p-6 border border-zinc-200 dark:border-zinc-900 rounded-xl bg-zinc-50/20 dark:bg-zinc-900/10 space-y-2">
                    <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase">{refund.phase}</h4>
                    <p className="text-[11px] text-zinc-550 dark:text-zinc-400 leading-relaxed">{refund.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Division 3: Support Subscriptions */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-955 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#6A2D3D] dark:text-[#fca5a5]" />
                3. Maintenance Subscriptions
              </h3>
              <p className="text-xs md:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                Ongoing support and website maintenance subscriptions (e.g. BDT 5,000/month agreements) can be cancelled at any time by the client via their support ticket interface. Cancellation becomes effective at the end of the current billing cycle, and no partial refunds are offered.
              </p>
            </div>

          </div>

          {/* Quick Guidance Sidebar (Right) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 border border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/10 rounded-2xl space-y-6">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Inquiry & Claims</h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                To submit an exception refund claim or cancellation notice, please open a support ticket under the **Billing** category or send a message to:
              </p>
              <p className="text-xs font-bold text-[#6A2D3D] dark:text-[#fca5a5] block">
                billing@hosenshop.com
              </p>
            </div>

            <div className="p-8 border border-rose-500/20 bg-rose-500/5 rounded-2xl flex gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
              <div className="space-y-1">
                <h5 className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase">Important Note</h5>
                <p className="text-[10px] text-zinc-550 dark:text-zinc-400 leading-relaxed">
                  Refund claims made via external chargebacks (without emailing support first) will result in permanent customer bans and revocation of all software licenses.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
