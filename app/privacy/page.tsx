'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Shield, Eye, Lock, FileText, Database, Share2, UserCheck } from 'lucide-react';

export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: 'collection',
      icon: Eye,
      title: '1. Information We Collect',
      desc: 'We collect several types of information to provide and improve our services, including registration data (name, email), billing information (via Stripe and bKash APIs), and project metadata associated with custom software contracts.'
    },
    {
      id: 'usage',
      icon: Database,
      title: '2. How We Use Information',
      desc: 'Your data is strictly used to process secure transactions, deliver instant template download links, manage Custom Deal milestones, coordinate chat responses in workspaces, and send important service-level announcements.'
    },
    {
      id: 'protection',
      icon: Lock,
      title: '3. Security & Data Protection',
      desc: 'We implement advanced encryption protocols to safeguard database keys, customer identifiers, and custom code assets. We do not store credit card credentials or mobile wallet PINs on our servers.'
    },
    {
      id: 'sharing',
      icon: Share2,
      title: '4. Third-Party Integrations',
      desc: 'We share limited, relevant data with trusted third-party providers (e.g. Stripe checkout pages, bKash Merchant APIs, Firebase Auth authentication databases) to execute transaction requests securely.'
    },
    {
      id: 'rights',
      icon: UserCheck,
      title: '5. Your Rights & Choice',
      desc: 'You maintain absolute ownership and control over your account settings. You can request deletion of custom deal assets, edit profile details, and export purchase receipts directly from your dashboard.'
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
              <Shield className="w-3.5 h-3.5" />
              Corporate Policy
            </span>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tight text-zinc-955 dark:text-white leading-[1.1]">
              Privacy & Data <br />
              Protection Policy
            </h1>
            <p className="text-zinc-550 dark:text-zinc-400 text-xs md:text-sm leading-relaxed font-semibold">
              Last Updated: July 15, 2026. This policy outlines our commitment to managing your digital data, licensing files, and workspace communication assets.
            </p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Quick links Table of Contents (Left) */}
          <div className="lg:col-span-4 p-8 border border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/10 rounded-2xl space-y-4 sticky top-24">
            <h4 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Policy Directory</h4>
            <div className="space-y-2">
              {sections.map((sect) => (
                <a
                  key={sect.id}
                  href={`#${sect.id}`}
                  className="flex items-center gap-2.5 text-xs text-zinc-550 dark:text-zinc-400 hover:text-[#6A2D3D] dark:hover:text-[#fca5a5] font-semibold transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  {sect.title}
                </a>
              ))}
            </div>
          </div>

          {/* Deep Content Details (Right) */}
          <div className="lg:col-span-8 space-y-12">
            
            {sections.map((sect) => {
              const IconComp = sect.icon;
              return (
                <section key={sect.id} id={sect.id} className="space-y-4 border-b border-zinc-150 dark:border-zinc-900/60 pb-8 last:border-0 last:pb-0 scroll-mt-24">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#6A2D3D]/10 flex items-center justify-center text-[#6A2D3D] dark:text-[#fca5a5]">
                      <IconComp className="w-4 h-4" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-905 dark:text-white uppercase tracking-tight">
                      {sect.title}
                    </h3>
                  </div>
                  <p className="text-zinc-650 dark:text-zinc-400 text-xs md:text-sm leading-relaxed font-semibold">
                    {sect.desc}
                  </p>
                  <div className="pl-11 space-y-3 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
                    <p>
                      We comply with international data security standards and regional IT regulations. In addition to transactional security, our team uses automated vulnerability checks on code repository outputs.
                    </p>
                    <p>
                      If you have specific compliance requirements (e.g. GDPR, CCPA, or HIPAA for customized setups), please reach out to our legal officer at legal@hossenshop.com.
                    </p>
                  </div>
                </section>
              );
            })}

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
