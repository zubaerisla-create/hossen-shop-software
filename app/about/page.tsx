'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Users, Shield, Rocket, Target, Award, Code, Globe, HelpCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-[#070708] text-zinc-900 dark:text-zinc-100 font-sans min-h-screen transition-colors">
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-12 space-y-16">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-50 to-zinc-100/55 dark:from-zinc-900/30 dark:to-zinc-950/20 border border-zinc-200/80 dark:border-zinc-800/80 p-8 md:p-16 flex flex-col md:flex-row items-center gap-12">
          <div className="space-y-6 md:w-3/5">
            <span className="text-[10px] font-bold text-[#6A2D3D] dark:text-[#fca5a5] uppercase tracking-widest block">
              About Our Company
            </span>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-zinc-950 dark:text-white leading-[1.1]">
              Pioneering <br />
              Digital Excellence
            </h1>
            <p className="text-zinc-650 dark:text-zinc-400 text-sm md:text-base leading-relaxed font-medium">
              Hosen Software Shop is an elite engineering agency and digital product marketplace. We craft state-of-the-art SaaS boilerplates, mobile apps, web storeフロントs, and custom software systems designed to turn complex business logic into smooth, scalable, and profit-generating operations.
            </p>
          </div>
          <div className="md:w-2/5 flex justify-center relative">
            <div className="w-72 h-72 rounded-3xl bg-gradient-to-tr from-[#6A2D3D]/10 to-[#8B3A50]/20 absolute -z-10 blur-xl animate-pulse" />
            <img
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80"
              alt="Hosen Software Shop Team"
              className="w-full max-w-[340px] aspect-[4/3] object-cover rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl"
            />
          </div>
        </div>

        {/* Mission, Vision & Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-8 border border-zinc-200/60 dark:border-zinc-900 rounded-2xl bg-zinc-50/20 dark:bg-zinc-900/10 space-y-4 hover:border-zinc-350 dark:hover:border-zinc-850 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Our Mission</h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed">
              To deliver production-ready software components, templates, and customized systems that save engineering teams thousands of hours of development time and empower entrepreneurs worldwide.
            </p>
          </div>

          <div className="p-8 border border-zinc-200/60 dark:border-zinc-900 rounded-2xl bg-zinc-50/20 dark:bg-zinc-900/10 space-y-4 hover:border-zinc-350 dark:hover:border-zinc-850 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Rocket className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Our Vision</h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed">
              To become the world's most trusted partner for developers and businesses looking for high-quality starter codebases and custom digital transformations that don't compromise on architecture.
            </p>
          </div>

          <div className="p-8 border border-zinc-200/60 dark:border-zinc-900 rounded-2xl bg-zinc-50/20 dark:bg-zinc-900/10 space-y-4 hover:border-zinc-350 dark:hover:border-zinc-850 transition-all">
            <div className="w-10 h-10 rounded-xl bg-[#6A2D3D]/10 flex items-center justify-center text-[#6A2D3D] dark:text-[#fca5a5]">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-zinc-950 dark:text-white">Our Values</h3>
            <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed">
              We stand for clean code architectures, security-first methodologies, strict timelines, transparent multi-gateway billing practices, and lifelong dedicated post-delivery support.
            </p>
          </div>
        </div>

        {/* Narrative Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-8 space-y-8">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-white uppercase">
              The Engineering Journey
            </h2>
            <div className="space-y-6 text-zinc-650 dark:text-zinc-400 text-sm leading-relaxed font-semibold">
              <p>
                Founded in 2023, Hosen Software Shop started as a small collective of senior developers dedicated to solving the redundancy of bootstrapping web applications. We realized that teams were wasting weeks setting up authentication, setting up databases, designing UI components, and connecting payment integrations like Stripe and bKash over and over.
              </p>
              <p>
                To address this, we developed our curated marketplace of starter kits and SaaS boilerplates. Every template we publish is vetted for performance, SEO friendliness, clean directory structures, and responsive layouts. From there, we expanded our offerings to full custom software consulting, delivering production-ready platforms for e-commerce, tele-health, and AI workflow automation.
              </p>
              <p>
                Today, our software systems have been implemented by hundreds of clients globally. We remain dedicated to elite engineering standards, combining local support values with international technical standards.
              </p>
            </div>
          </div>

          {/* Key Facts Sidebar */}
          <div className="lg:col-span-4 p-8 border border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/20 rounded-2xl space-y-6">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Shop Achievements</h4>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-955 dark:text-white">99% Client Satisfaction</p>
                  <p className="text-[10px] text-zinc-500">Based on client review dashboard</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                  <Code className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-955 dark:text-white">10k+ Hours Bootstrapped</p>
                  <p className="text-[10px] text-zinc-500">Saved for engineering teams globally</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-lg bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-700 dark:text-zinc-300">
                  <Globe className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-955 dark:text-white">Global Footprint</p>
                  <p className="text-[10px] text-zinc-500">Deployments in over 30 countries</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-8 pt-8 border-t border-zinc-200 dark:border-zinc-900">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-955 dark:text-white uppercase flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-zinc-500" />
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-zinc-905 dark:text-white">Who builds your products?</h4>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-semibold">
                Every single boilerplate and code repository is built by our senior engineering panel. We do not resell white-labeled templates.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="text-sm font-bold text-zinc-905 dark:text-white">Do you offer post-purchase assistance?</h4>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-semibold">
                Yes! We offer dedicated developer support with ticket workspaces for package installations, configurations, and general developer advice.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
