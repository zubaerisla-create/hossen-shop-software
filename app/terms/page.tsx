'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Scale, Award, Code, CheckCircle, AlertTriangle, Cpu, CircleDot } from 'lucide-react';

export default function TermsConditionsPage() {
  const licenseRules = [
    {
      title: 'Standard License',
      desc: 'Grants you permission to run the purchased codebase for one personal or commercial project. Redistribution or white-label resale is strictly prohibited.'
    },
    {
      title: 'Extended/Developer License',
      desc: 'Allows implementation on unlimited client domains. Code modifications are permitted, but codebase files cannot be packaged into nested distribution kits.'
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
              <Scale className="w-3.5 h-3.5" />
              Terms of Service
            </span>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-zinc-955 dark:text-white leading-[1.1]">
              Terms & General <br />
              Conditions of Use
            </h1>
            <p className="text-zinc-550 dark:text-zinc-400 text-xs md:text-sm leading-relaxed font-semibold">
              Last Updated: July 15, 2026. By accessing Hosen Software Shop, purchasing templates, or signing custom milestone agreements, you consent to these terms.
            </p>
          </div>
        </div>

        {/* Core Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Main Terms Body */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* Section 1 */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-[#6A2D3D] dark:text-[#fca5a5]" />
                1. Account Registration & Security
              </h3>
              <p className="text-xs md:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                To access product downloads or create Custom Deal workspaces, users must register accounts using authentic email addresses. You are solely responsible for maintaining the privacy of your session tokens and password hashes. Any unauthorized logins must be reported to support immediately.
              </p>
            </div>

            {/* Section 2 */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-[#6A2D3D] dark:text-[#fca5a5]" />
                2. Software Licensing Models
              </h3>
              <p className="text-xs md:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                All templates, source code files, and custom delivery assets remain the intellectual property of Hosen Software Shop. When purchasing ready products, the following terms apply:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                {licenseRules.map((rule, idx) => (
                  <div key={idx} className="p-6 border border-zinc-200 dark:border-zinc-900 rounded-xl bg-zinc-50/20 dark:bg-zinc-900/10 space-y-2">
                    <h4 className="text-xs font-bold text-zinc-950 dark:text-white uppercase">{rule.title}</h4>
                    <p className="text-[11px] text-zinc-550 dark:text-zinc-400 leading-relaxed">{rule.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Section 3 */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-[#6A2D3D] dark:text-[#fca5a5]" />
                3. Custom Milestone Agreements
              </h3>
              <p className="text-xs md:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                Custom software agreements are structured as step-by-step milestones. When an admin posts a quotation, the client must digitally sign the contract to initiate development. Each milestone phase requires separate invoice settlement (via bKash or Stripe) before subsequent phases commence.
              </p>
            </div>

            {/* Section 4 */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-zinc-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
                <CircleDot className="w-4 h-4 text-[#6A2D3D] dark:text-[#fca5a5]" />
                4. Liability Disclaimer
              </h3>
              <p className="text-xs md:text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed font-semibold">
                Our templates are provided on an "as-is" basis without warranties of any kind. While we write secure code, we are not liable for server downtime, operational losses, or third-party database issues arising from customized configurations.
              </p>
            </div>

          </div>

          {/* Quick Stats / Compliance Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="p-8 border border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/10 rounded-2xl space-y-6">
              <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">General Compliance</h4>
              
              <div className="space-y-4 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Secure multi-gateway payment compliance (Stripe/bKash).</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Strict code privacy and encryption policies.</span>
                </div>
                <div className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Clear developer communication guidelines.</span>
                </div>
              </div>
            </div>

            <div className="p-8 border border-amber-500/20 bg-amber-500/5 rounded-2xl flex gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
              <div className="space-y-1">
                <h5 className="text-[11px] font-bold text-amber-700 dark:text-amber-400 uppercase">License Warning</h5>
                <p className="text-[10px] text-zinc-550 dark:text-zinc-400 leading-relaxed">
                  Sharing or distributing purchased boilerplates on public GitHub repositories will result in permanent account termination without refunds.
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
