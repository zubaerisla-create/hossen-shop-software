'use client';

import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';

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

  const steps = [
    'Analyzing project scope parameters...',
    'Resolving database schema dependencies...',
    'Calculating payment gateway & API integrations...',
    'Estimating engineering sprints and QA cycles...',
    'Finalizing cost projection milestones...'
  ];

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
          }, 400);
          return prev;
        }
        return prev + 1;
      });
    }, 600);
  };

  const calculateEstimation = () => {
    const text = (title + ' ' + desc).toLowerCase();
    
    let baseMinCost = 35000;
    let baseTime = 15;
    const techs: string[] = ['Tailwind CSS', 'React / Next.js', 'PostgreSQL'];
    const features: string[] = ['Responsive UI Layout', 'SEO Friendly Architecture', 'Admin Dashboard'];
    
    if (text.includes('mobile') || text.includes('app') || text.includes('android') || text.includes('ios')) {
      baseMinCost += 25000;
      baseTime += 10;
      techs.push('Flutter', 'Firebase Push');
      features.push('Mobile App Store guidelines audit', 'Offline State Management');
    }
    
    if (text.includes('saas') || text.includes('subscription') || text.includes('stripe') || text.includes('membership')) {
      baseMinCost += 20005;
      baseTime += 8;
      techs.push('bKash Subscription Gate', 'Prisma ORM');
      features.push('Multi-tier Subscription management', 'Invoice generation pipeline');
    }

    if (text.includes('chat') || text.includes('messaging') || text.includes('realtime') || text.includes('socket')) {
      baseMinCost += 15000;
      baseTime += 7;
      techs.push('WebSockets', 'Redis Cache');
      features.push('Instant messaging & real-time indicators', 'File attachments uploading');
    }

    if (text.includes('ai') || text.includes('gpt') || text.includes('openai') || text.includes('llm')) {
      baseMinCost += 30000;
      baseTime += 10;
      techs.push('OpenAI API SDK', 'Pinecone Vector DB');
      features.push('RAG (Retrieval Augmented Generation) pipeline', 'Streaming token response interface');
    }

    const minCost = baseMinCost;
    const maxCost = Math.round(baseMinCost * 1.25 / 5000) * 5000;
    const timeRange = `${baseTime} - ${baseTime + 8} Days`;

    const milestones = [
      { title: 'UI Design & Architecture Draft (25%)', percentage: 25, cost: Math.round((minCost * 0.25) / 1000) * 1000 },
      { title: 'Core Frontend & Layout Implementation (35%)', percentage: 35, cost: Math.round((minCost * 0.35) / 1000) * 1000 },
      { title: 'Backend Integration & Payments Hook (30%)', percentage: 30, cost: Math.round((minCost * 0.3) / 1000) * 1000 },
      { title: 'System Deployment & QA Audit (10%)', percentage: 10, cost: Math.round((minCost * 0.1) / 1000) * 1000 }
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

  const handleImport = () => {
    if (result && onImport) {
      onImport(title, desc, result.minCost, result.techStack.join(', '));
    }
  };

  return (
    <div className="bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded p-6 font-sans relative transition-colors">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">AI Estimate Engine</h3>
        <p className="text-[11px] text-zinc-500 mt-1">Specify your parameters to calculate resource costs and sprints.</p>
      </div>

      {!result && !loading && (
        <div className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Project Label</label>
            <input
              type="text"
              placeholder="e.g., Real Estate SaaS Portal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 placeholder:text-zinc-400 dark:placeholder:text-zinc-700"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Project Brief & Details</label>
            <textarea
              rows={4}
              placeholder="e.g., We need a dashboard where agents can sign up, list properties, receive client messages via WebSockets, and process billing deposits..."
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              className="w-full bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-3 text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-600 placeholder:text-zinc-400 dark:placeholder:text-zinc-700 resize-none"
            />
          </div>

          <button
            onClick={handleEstimate}
            disabled={!title || !desc}
            className="w-full py-2 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Analyze requirements</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center font-mono text-[11px] text-zinc-500 space-y-4">
          <div className="w-full max-w-xs bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 rounded text-left">
            <span className="text-zinc-500 dark:text-zinc-600 block">&gt; executing parser...</span>
            <span className="text-zinc-800 dark:text-zinc-300 block">&gt; {steps[loadingStep]}</span>
          </div>
          <div className="w-48 bg-zinc-200 dark:bg-zinc-950 h-1 rounded overflow-hidden">
            <div
              className="bg-zinc-950 dark:bg-white h-full transition-all duration-500"
              style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      )}

      {result && (
        <div className="space-y-6 text-xs animate-fadeIn">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 p-4 rounded">
              <span className="text-zinc-500 text-[10px] block uppercase tracking-wider mb-1">Cost Projection</span>
              <span className="font-bold text-zinc-950 dark:text-white text-sm">{result.costRange}</span>
            </div>

            <div className="bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 p-4 rounded">
              <span className="text-zinc-500 text-[10px] block uppercase tracking-wider mb-1">Time Schedule</span>
              <span className="font-bold text-zinc-950 dark:text-white text-sm">{result.timeRange}</span>
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Technologies</span>
            <div className="flex flex-wrap gap-1.5">
              {result.techStack.map((tech, idx) => (
                <span key={idx} className="bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded text-[10px] font-mono">
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Milestones</span>
            <div className="space-y-2 bg-white dark:bg-[#09090b] border border-zinc-200 dark:border-zinc-800 p-3.5 rounded">
              {result.suggestedMilestones.map((mil, idx) => (
                <div key={idx} className="flex justify-between items-center text-[11px] py-1 border-b border-zinc-100 dark:border-zinc-900 last:border-b-0">
                  <span className="text-zinc-500 dark:text-zinc-400">{mil.title}</span>
                  <span className="font-semibold text-zinc-950 dark:text-white">{mil.cost.toLocaleString()} BDT</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setResult(null)}
              className="flex-1 py-2 border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white rounded transition-colors cursor-pointer"
            >
              Re-estimate
            </button>
            {onImport && (
              <button
                onClick={handleImport}
                className="flex-2 py-2 bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Import Estimate to portal</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
