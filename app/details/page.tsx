'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Cpu, Globe, MobileIcon, Layers, Server, Zap, Database, ArrowRight } from 'lucide-react';

export default function DetailsPage() {
  const serviceCategories = [
    {
      title: 'SaaS Boilerplates & Boilerplate Kits',
      tech: ['Next.js 15', 'React 19', 'Prisma', 'Stripe', 'Tailwind v4'],
      desc: 'Complete starter kits with built-in user authentication, multi-tenant databases, transaction webhooks, metadata settings, and dynamic billing loops. Save over 80 hours of setup time.',
      icon: Layers
    },
    {
      title: 'Full E-Commerce Storefronts',
      tech: ['Next.js App Router', 'bKash API', 'Redux Toolkit', 'PostgreSQL'],
      desc: 'High-conversion, blazing-fast storefronts featuring dynamic search autocomplete, cart local persistence, multi-currency handling, and responsive checkout portals.',
      icon: Globe
    },
    {
      title: 'Mobile App Templates',
      tech: ['Flutter SDK', 'Dart', 'Firebase Auth', 'Agora WebRTC'],
      desc: 'Premium cross-platform templates built utilizing Clean architecture & BLoC state patterns. Ready-to-go structures for taxi-hailing, food delivery, and chat interfaces.',
      icon: Cpu
    },
    {
      title: 'Custom Development Services',
      tech: ['NodeJS', 'FastAPI', 'Socket.io', 'PostgreSQL', 'Docker'],
      desc: 'Elite custom engineering projects designed from scratch. We handle system architecture, database design, background queue processing, and third-party API integrations.',
      icon: Server
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-50 to-zinc-100/55 dark:from-zinc-900/30 dark:to-zinc-950/20 border border-zinc-200/80 dark:border-zinc-800/80 p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
          <div className="space-y-6 md:w-3/5">
            <span className="text-[10px] font-bold text-[#6A2D3D] dark:text-[#fca5a5] uppercase tracking-widest block">
              Our Catalog & Services
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-zinc-955 dark:text-white leading-[1.1]">
              Engineered for <br />
              High Performance
            </h1>
            <p className="text-zinc-650 dark:text-zinc-400 text-sm md:text-base leading-relaxed font-semibold">
              Explore our core products, boilerplate licenses, custom consultation models, and tech stacks. We build clean architectures that scale.
            </p>
          </div>
          <div className="md:w-2/5 flex justify-center relative">
            <div className="w-72 h-72 rounded-3xl bg-gradient-to-tr from-[#6A2D3D]/10 to-[#8B3A50]/20 absolute -z-10 blur-xl animate-pulse" />
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"
              alt="Hossen Software Shop Coding"
              className="w-full max-w-[340px] aspect-[4/3] object-cover rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="space-y-8">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-955 dark:text-white uppercase">
            Core Service Offerings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {serviceCategories.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className="p-8 border border-zinc-200/60 dark:border-zinc-900 rounded-2xl bg-zinc-50/20 dark:bg-zinc-900/10 space-y-4 hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-[#6A2D3D]/10 flex items-center justify-center text-[#6A2D3D] dark:text-[#fca5a5]">
                    <IconComp className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-zinc-905 dark:text-white uppercase tracking-tight">{item.title}</h3>
                  <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-semibold">{item.desc}</p>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {item.tech.map((t, index) => (
                      <span key={index} className="px-2.5 py-1 rounded bg-zinc-150/60 dark:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400 text-[10px] font-bold font-mono">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dynamic CTA */}
        <div className="p-8 md:p-12 border border-zinc-200 dark:border-zinc-800 bg-gradient-to-tr from-zinc-50/60 to-zinc-100/30 dark:from-zinc-950/20 dark:to-zinc-900/10 rounded-3xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-2 md:max-w-xl">
            <h3 className="text-xl font-bold uppercase text-zinc-955 dark:text-white tracking-tight">Need a custom feature set or product configuration?</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
              We design specialized enterprise APIs, scale databases, deploy high-performance applications, and integrate local gateways like bKash.
            </p>
          </div>
          <Link
            href="/estimator"
            className="px-6 py-3 bg-[#6A2D3D] hover:bg-[#582432] text-white text-xs font-bold rounded-lg uppercase tracking-wide flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            Run AI Cost Estimator
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
