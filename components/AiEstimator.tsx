'use client';

import React, { useState } from 'react';
import {
  ArrowRight,
  Sparkles,
  Cpu,
  Clock,
  DollarSign,
  RotateCcw,
  Check,
  CheckCircle2,
  Terminal,
  ShoppingBag,
  Smartphone,
  MessageSquare,
  Brain,
  Info,
  Calendar,
  Layers,
  HelpCircle,
  Plus
} from 'lucide-react';

interface EstimatorResult {
  costRange: string;
  minCost: number;
  maxCost: number;
  timeRange: string;
  techStack: string[];
  features: string[];
  suggestedMilestones: { title: string; percentage: number; cost: number }[];
}

export default function AiEstimator({ onImport }: { onImport?: (title: string, desc: string, budget: number, tech: string) => void }) {
  const [desc, setDesc] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [result, setResult] = useState<EstimatorResult | null>(null);

  // Advanced toggles
  const [hasMobile, setHasMobile] = useState(false);
  const [hasSaas, setHasSaas] = useState(false);
  const [hasChat, setHasChat] = useState(false);
  const [hasAi, setHasAi] = useState(false);

  const steps = [
    'Initializing AI Estimator Agent...',
    'Parsing project brief metadata...',
    'Scanning scope parameter overrides...',
    'Resolving database schema & architecture models...',
    'Calculating payment gateways & API dependencies...',
    'Synthesizing milestone phases and sprint cycles...',
    'Finalizing budget and timeline projections...'
  ];

  // Template Presets
  const presets = [
    {
      label: 'E-Commerce Store',
      title: 'Retail Storefront & Payment Engine',
      desc: 'Build a high-conversion retail store with secure checkout, automated invoice generation, live order tracking, and a robust admin inventory panel.',
      icon: ShoppingBag,
      config: { mobile: false, saas: true, chat: false, ai: false }
    },
    {
      label: 'SaaS Platform',
      title: 'Subscription-Based SaaS Portal',
      desc: 'A multi-tenant web application featuring recurring stripe billing, subscription plans management, role-based user access controls, and custom utilization metrics.',
      icon: Layers,
      config: { mobile: false, saas: true, chat: false, ai: false }
    },
    {
      label: 'Mobile Delivery App',
      title: 'Food/Product Courier Mobile Application',
      desc: 'A native-quality cross-platform app for iOS and Android featuring live courier tracking, real-time push notifications, and local offline cache synchronization.',
      icon: Smartphone,
      config: { mobile: true, saas: false, chat: true, ai: false }
    },
    {
      label: 'AI Support Chat',
      title: 'Autonomous AI Customer Support Bot',
      desc: 'An AI-powered client assistance agent using OpenAI GPT-4, Pinecone vector embeddings for private knowledge base files, and live messaging fallback.',
      icon: Brain,
      config: { mobile: false, saas: false, chat: true, ai: true }
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setTitle(preset.title);
    setDesc(preset.desc);
    setHasMobile(preset.config.mobile);
    setHasSaas(preset.config.saas);
    setHasChat(preset.config.chat);
    setHasAi(preset.config.ai);
  };

  const handleEstimate = () => {
    if (!desc || !title) return;
    setLoading(true);
    setLoadingStep(0);
    setResult(null);

    const interval = setInterval(() => {
      setLoadingStep((prev) => {
        if (prev >= steps.length - 1) {
          clearInterval(interval);
          setTimeout(() => {
            calculateEstimation();
          }, 300);
          return prev;
        }
        return prev + 1;
      });
    }, 450);
  };

  const calculateEstimation = () => {
    const text = (title + ' ' + desc).toLowerCase();
    
    let baseMinCost = 35000;
    let baseTime = 15;
    const techs: string[] = ['Tailwind CSS', 'React / Next.js', 'PostgreSQL'];
    const features: string[] = ['Responsive UI Layout', 'SEO Friendly Architecture', 'Admin Dashboard'];
    
    // Check text description and checkboxes
    if (hasMobile || text.includes('mobile') || text.includes('app') || text.includes('android') || text.includes('ios')) {
      baseMinCost += 25000;
      baseTime += 10;
      techs.push('Flutter', 'Firebase Push Notification');
      features.push('Mobile App Store guidelines audit', 'Offline State Management');
    }
    
    if (hasSaas || text.includes('saas') || text.includes('subscription') || text.includes('stripe') || text.includes('membership')) {
      baseMinCost += 20000;
      baseTime += 8;
      techs.push('bKash Subscription Gateway', 'Prisma ORM');
      features.push('Multi-tier Subscription management', 'Invoice generation pipeline');
    }

    if (hasChat || text.includes('chat') || text.includes('messaging') || text.includes('realtime') || text.includes('socket')) {
      baseMinCost += 15000;
      baseTime += 7;
      techs.push('WebSockets', 'Redis Cache');
      features.push('Instant messaging & real-time indicators', 'File attachments uploading');
    }

    if (hasAi || text.includes('ai') || text.includes('gpt') || text.includes('openai') || text.includes('llm') || text.includes('vector')) {
      baseMinCost += 30000;
      baseTime += 10;
      techs.push('OpenAI API SDK', 'Pinecone Vector DB');
      features.push('RAG (Retrieval Augmented Generation) pipeline', 'Streaming token response interface');
    }

    const minCost = baseMinCost;
    const maxCost = Math.round(baseMinCost * 1.25 / 5000) * 5000;
    const timeRange = `${baseTime} - ${baseTime + 8} Days`;

    const milestones = [
      { title: 'Phase 1: UI/UX Wireframes & Component Specs', percentage: 25, cost: Math.round((minCost * 0.25) / 1000) * 1000 },
      { title: 'Phase 2: Core Frontend Layout & Static Routes', percentage: 35, cost: Math.round((minCost * 0.35) / 1000) * 1000 },
      { title: 'Phase 3: Backend Business Logic & Integration Hook', percentage: 30, cost: Math.round((minCost * 0.3) / 1000) * 1000 },
      { title: 'Phase 4: Global Deployment, Pen-Test & Launch', percentage: 10, cost: Math.round((minCost * 0.1) / 1000) * 1000 }
    ];

    setResult({
      costRange: `${minCost.toLocaleString()} BDT - ${maxCost.toLocaleString()} BDT`,
      minCost,
      maxCost,
      timeRange,
      techStack: [...new Set(techs)],
      features,
      suggestedMilestones: milestones
    });
    setLoading(false);
  };

  const resetAll = () => {
    setTitle('');
    setDesc('');
    setHasMobile(false);
    setHasSaas(false);
    setHasChat(false);
    setHasAi(false);
    setResult(null);
  };

  const handleImport = () => {
    if (result && onImport) {
      const selectedTechs = result.techStack.join(', ');
      onImport(title, desc, result.minCost, selectedTechs);
    }
  };

  return (
    <div className="bg-white dark:bg-[#121214] border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-6 md:p-8 font-sans transition-all duration-300 relative shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] overflow-hidden">
      
      {/* Premium Background Gradients */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-rose-500/10 via-[#6A2D3D]/5 to-transparent pointer-events-none rounded-full blur-[80px]" />
      <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-gradient-to-tr from-indigo-500/5 via-violet-500/5 to-transparent pointer-events-none rounded-full blur-[60px]" />

      {/* Header Info */}
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-zinc-100 dark:border-zinc-800/60">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold uppercase tracking-widest rounded-full mb-2">
            <Sparkles className="w-3 h-3" /> AI Cost Modeling Agent
          </span>
          <h2 className="text-xl md:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">Scope & Cost Estimator</h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Configure project targets. Our logic compiles engineering sprint timelines and pricing matrices.</p>
        </div>
        
        {result && (
          <button
            onClick={resetAll}
            className="self-start md:self-auto inline-flex items-center gap-1.5 px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-lg text-[11px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all bg-white dark:bg-zinc-950/40"
          >
            <RotateCcw className="w-3 h-3" /> Reset Engine
          </button>
        )}
      </div>

      {/* ─── STATE 1: SETUP FORM ─── */}
      {!result && !loading && (
        <div className="relative z-10 space-y-6">
          
          {/* Quick Presets */}
          <div className="space-y-2.5">
            <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Select Preset Template</label>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {presets.map((preset, index) => {
                const Icon = preset.icon;
                return (
                  <button
                    key={index}
                    onClick={() => applyPreset(preset)}
                    className="flex items-start gap-2.5 p-3 rounded-xl border border-zinc-200/60 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/60 hover:border-[#6A2D3D] dark:hover:border-rose-800 text-left transition-all duration-200 group"
                  >
                    <div className="p-1.5 rounded-lg bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 group-hover:text-[#6A2D3D] dark:group-hover:text-rose-400 transition-colors">
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-[11px] font-extrabold text-zinc-800 dark:text-zinc-200 truncate leading-snug">{preset.label}</p>
                      <p className="text-[9px] text-zinc-400 mt-0.5 line-clamp-1">Auto-fill config</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Input Form Fields */}
            <div className="md:col-span-2 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Project Label / Title</label>
                <input
                  type="text"
                  placeholder="e.g., Enterprise E-Commerce SaaS"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 text-zinc-950 dark:text-white rounded-xl px-4 py-3 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6A2D3D]/20 focus:border-[#6A2D3D] dark:focus:border-rose-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Project Brief & Feature Details</label>
                <textarea
                  rows={5}
                  placeholder="Describe your project: e.g., We want a portal where users can register, choose pricing tiers, upload files, and send real-time alerts. Admin should have a dashboard to see usage statistics..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 text-zinc-950 dark:text-white rounded-xl p-4 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#6A2D3D]/20 focus:border-[#6A2D3D] dark:focus:border-rose-800 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 transition-all resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Scope Parameter Selectors */}
            <div className="space-y-4 bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200/60 dark:border-zinc-800/80 rounded-xl p-4.5">
              <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-3">Scope Parameters</label>
              
              <div className="space-y-2.5">
                {[
                  { state: hasMobile, set: setHasMobile, title: 'Mobile App Client', desc: 'iOS & Android Native codebases' },
                  { state: hasSaas, set: setHasSaas, title: 'SaaS Subscription Engine', desc: 'Stripe, invoice & user billing tiers' },
                  { state: hasChat, set: setHasChat, title: 'Real-Time WebSockets', desc: 'Instant chat, notifications, feeds' },
                  { state: hasAi, set: setHasAi, title: 'AI & LLM Integration', desc: 'RAG, vector DB & prompt queries' }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => item.set(!item.state)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left transition-all ${
                      item.state
                        ? 'border-[#6A2D3D] dark:border-rose-800 bg-[#6A2D3D]/5 dark:bg-rose-900/10'
                        : 'border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900/20'
                    }`}
                  >
                    <div className="overflow-hidden pr-2">
                      <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{item.title}</p>
                      <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5 truncate">{item.desc}</p>
                    </div>
                    <div className={`w-4 h-4 rounded-md border flex items-center justify-center flex-shrink-0 transition-all ${
                      item.state
                        ? 'bg-[#6A2D3D] dark:bg-rose-700 border-transparent text-white'
                        : 'border-zinc-300 dark:border-zinc-700 text-transparent'
                    }`}>
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Submit Trigger */}
          <button
            onClick={handleEstimate}
            disabled={!title || !desc}
            className="w-full py-3.5 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <Cpu className="w-4 h-4" />
            <span>Compile Cost & Timelines</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

        </div>
      )}

      {/* ─── STATE 2: COMPILING LOADER ─── */}
      {loading && (
        <div className="relative z-10 py-16 flex flex-col items-center justify-center space-y-6">
          {/* Radar Animation */}
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-rose-500/20 dark:border-rose-500/10 animate-ping" />
            <div className="absolute inset-2 rounded-full border-2 border-[#6A2D3D] dark:border-rose-700 flex items-center justify-center">
              <Terminal className="w-5 h-5 text-[#6A2D3D] dark:text-rose-400 animate-pulse" />
            </div>
          </div>

          <div className="w-full max-w-sm bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 text-left font-mono">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] mb-2 border-b border-zinc-100 dark:border-zinc-900 pb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 animate-pulse" />
              <span>LOG STREAM ACTIVE</span>
            </div>
            <div className="space-y-1 text-[10.5px]">
              <span className="text-zinc-400 dark:text-zinc-600 block">&gt; system.run_estimator()</span>
              <span className="text-[#6A2D3D] dark:text-rose-400 font-semibold block animate-pulse">&gt; {steps[loadingStep]}</span>
            </div>
          </div>

          {/* Glowing bar */}
          <div className="w-48 bg-zinc-150 dark:bg-zinc-900 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#6A2D3D] to-rose-500 h-full transition-all duration-300"
              style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* ─── STATE 3: DETAILED RESULTS DASHBOARD ─── */}
      {result && (
        <div className="relative z-10 space-y-8 animate-fade-in">
          
          {/* Main cost & time cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl flex items-start gap-4">
              <div className="p-3 bg-rose-500/10 rounded-xl text-rose-600 dark:text-rose-400">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 text-[10px] block uppercase tracking-wider font-bold mb-1">Cost Projection</span>
                <span className="font-extrabold text-zinc-950 dark:text-white text-lg md:text-xl tracking-tight">{result.costRange}</span>
                <p className="text-[9.5px] text-zinc-400 mt-1">Recommended budget envelope for baseline deliverables.</p>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 p-5 rounded-2xl flex items-start gap-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-zinc-400 dark:text-zinc-500 text-[10px] block uppercase tracking-wider font-bold mb-1">Time Schedule</span>
                <span className="font-extrabold text-zinc-950 dark:text-white text-lg md:text-xl tracking-tight">{result.timeRange}</span>
                <p className="text-[9.5px] text-zinc-400 mt-1">Sprint timelines include code review, QA checks, & deployment config.</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Col: Tech & Features */}
            <div className="space-y-5">
              <div>
                <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5">Recommended Technology Stack</span>
                <div className="flex flex-wrap gap-1.5">
                  {result.techStack.map((tech, idx) => (
                    <span
                      key={idx}
                      className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded-lg text-[10.5px] font-mono font-bold"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2.5">Key Deliverables</span>
                <div className="space-y-2">
                  {result.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-[11px] text-zinc-600 dark:text-zinc-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Milestones Vertical Pipeline */}
            <div className="space-y-3">
              <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Suggested Release Milestones</span>
              <div className="bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4.5 space-y-4">
                {result.suggestedMilestones.map((mil, idx) => (
                  <div key={idx} className="relative pl-6 last:mb-0 group">
                    {/* Visual Line connector */}
                    {idx !== result.suggestedMilestones.length - 1 && (
                      <div className="absolute left-[7px] top-[14px] bottom-[-22px] w-[1px] bg-zinc-200 dark:bg-zinc-800 group-hover:bg-rose-500/40 transition-colors" />
                    )}
                    {/* Visual dot indicator */}
                    <div className="absolute left-0 top-[3px] w-[15px] h-[15px] rounded-full border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-[#121214] flex items-center justify-center group-hover:border-rose-500 transition-colors">
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-700 group-hover:bg-rose-500 transition-colors" />
                    </div>

                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-[11.5px] font-bold text-zinc-800 dark:text-zinc-200 leading-tight">{mil.title}</h4>
                        <p className="text-[9px] text-zinc-400 dark:text-zinc-500 mt-0.5">{mil.percentage}% of project deliverables</p>
                      </div>
                      <span className="text-[11.5px] font-extrabold text-zinc-950 dark:text-white flex-shrink-0 text-right">{mil.cost.toLocaleString()} BDT</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Action Triggers */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/80">
            <button
              onClick={() => setResult(null)}
              className="flex-1 py-3 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600 rounded-xl text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white font-bold text-xs bg-white dark:bg-zinc-950/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Re-estimate Scope
            </button>
            {onImport && (
              <button
                onClick={handleImport}
                className="flex-2 py-3 bg-gradient-to-r from-[#6A2D3D] to-[#8B3A50] hover:from-[#8B3A50] hover:to-[#6A2D3D] text-white rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 hover:shadow-lg shadow-rose-950/10 cursor-pointer group"
              >
                <span>Import Estimate to Client Portal</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
