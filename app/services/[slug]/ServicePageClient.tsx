'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, CheckCircle2, Clock, DollarSign, Layers,
  ArrowRight, Zap, Star, ChevronRight, Sparkles
} from 'lucide-react';
import { ServiceItem, servicesData } from '../../data/services';
import { ServiceIcon } from '@/app/utils/icons';
import AuthModal from '@/components/AuthModal';

export default function ServicePageClient({ service }: { service: ServiceItem }) {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const otherServices = servicesData.filter((s) => s.slug !== service.slug).slice(0, 3);

  const handleCustomQuoteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('apex_user_token');
    if (token) {
      router.push('/user/deals');
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .fade-up-d1 { animation-delay: 0.08s; }
        .fade-up-d2 { animation-delay: 0.16s; }
        .fade-up-d3 { animation-delay: 0.24s; }

        .feature-card {
          background: #fafafa;
          border: 1px solid #e4e4e7;
          border-radius: 12px;
          padding: 20px;
          transition: all 0.2s ease;
        }
        .dark .feature-card { background: #121214; border-color: #27272a; }
        .feature-card:hover {
          border-color: #a1a1aa;
          transform: translateY(-2px);
          box-shadow: 0 8px 24px -8px rgba(0,0,0,0.1);
        }
        .dark .feature-card:hover { border-color: #52525b; box-shadow: 0 8px 24px -8px rgba(0,0,0,0.4); }

        .tech-tag {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          background: white;
          border: 1px solid #e4e4e7;
          color: #52525b;
        }
        .dark .tech-tag { background: #18181b; border-color: #3f3f46; color: #a1a1aa; }

        .deliverable-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid #f4f4f5;
          font-size: 0.8rem;
          font-weight: 500;
          color: #3f3f46;
        }
        .dark .deliverable-item { border-color: #27272a; color: #a1a1aa; }
        .deliverable-item:last-child { border-bottom: none; }

        .cta-section {
          background: linear-gradient(135deg, #09090b 0%, #18181b 100%);
          border-radius: 20px;
          padding: 48px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .cta-section::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 200px; height: 200px;
          background: radial-gradient(circle, rgba(106,45,61,0.3) 0%, transparent 70%);
          pointer-events: none;
        }

        .service-card-mini {
          background: #fafafa;
          border: 1px solid #e4e4e7;
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.2s ease;
          text-decoration: none;
          display: block;
        }
        .dark .service-card-mini { background: #121214; border-color: #27272a; }
        .service-card-mini:hover {
          border-color: #a1a1aa;
          transform: translateY(-3px);
          box-shadow: 0 12px 32px -8px rgba(0,0,0,0.12);
        }
        .dark .service-card-mini:hover { border-color: #52525b; }
      `}</style>

      {/* ─── Hero ─── */}
      <section className={`relative w-full bg-gradient-to-br ${service.color} overflow-hidden`}>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '28px 28px'
        }} />
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 max-w-[1200px] mx-auto px-6 py-20 md:py-28">
          <a href="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white text-xs font-semibold mb-8 transition-colors fade-up">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
          </a>

          <div className="flex items-start gap-5">
            <div className="p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex-shrink-0 fade-up">
              <ServiceIcon name={service.icon} className="w-10 h-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-3 fade-up fade-up-d1">
                <span className="px-3 py-1 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full text-[10px] font-bold text-white uppercase tracking-widest">
                  {service.badge}
                </span>
              </div>
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4 fade-up fade-up-d1">
                {service.heroTitle}
              </h1>
              <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-2xl fade-up fade-up-d2">
                {service.heroSubtitle}
              </p>

              <div className="flex flex-wrap gap-4 mt-8 fade-up fade-up-d3">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-2.5">
                  <Clock className="w-4 h-4 text-white/70" />
                  <div>
                    <p className="text-[9px] text-white/60 font-semibold uppercase tracking-wider">Timeline</p>
                    <p className="text-xs font-bold text-white">{service.timeline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-xl px-4 py-2.5">
                  <DollarSign className="w-4 h-4 text-white/70" />
                  <div>
                    <p className="text-[9px] text-white/60 font-semibold uppercase tracking-wider">Starting at</p>
                    <p className="text-xs font-bold text-white">{service.startingPrice}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Body ─── */}
      <div className="max-w-[1200px] mx-auto px-6 py-16 space-y-20">

        {/* Overview */}
        <section>
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Overview</h2>
          <p className="text-zinc-700 dark:text-zinc-300 text-base md:text-lg leading-relaxed max-w-3xl">
            {service.overview}
          </p>
        </section>

        {/* Features Grid */}
        <section>
          <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-6">What's Included</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {service.features.map((feature, i) => (
              <div key={i} className="feature-card">
                <div className="flex items-start gap-3">
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-1">{feature.title}</h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack + Deliverables */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div>
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <Layers className="w-3.5 h-3.5" /> Tech Stack
            </h2>
            <div className="flex flex-wrap gap-2">
              {service.techStack.map((tech, i) => (
                <span key={i} className="tech-tag">{tech}</span>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-5 flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5" /> What You Get
            </h2>
            <div>
              {service.deliverables.map((item, i) => (
                <div key={i} className="deliverable-item">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section>
          <div className="cta-section">
            <div className="relative z-10">
              <div className="flex justify-center mb-4">
                <Sparkles className="w-8 h-8 text-amber-400 animate-pulse" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Ready to JOIN?</h2>
              <p className="text-zinc-400 text-sm mb-8 max-w-md mx-auto">
                Use our AI estimator to get a budget estimate, or request a custom quote directly from our team.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <a href="/estimator" className="flex items-center gap-2 px-6 py-3 bg-white hover:bg-zinc-100 text-zinc-900 rounded-xl font-bold text-sm transition-all hover:shadow-lg cursor-pointer">
                  <Star className="w-4 h-4 text-amber-500" /> Try AI Estimator
                </a>
                <button onClick={handleCustomQuoteClick} className="flex items-center gap-2 px-6 py-3 bg-transparent border border-white/20 hover:border-white/40 text-white rounded-xl font-bold text-sm transition-all cursor-pointer">
                  Request Custom Quote <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Other Services */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Other Services</h2>
            <a href="/" className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center gap-1 transition-colors">
              View all <ChevronRight className="w-3 h-3" />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {otherServices.map((s) => (
              <a key={s.slug} href={`/services/${s.slug}`} className="service-card-mini">
                <span className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                  <ServiceIcon name={s.icon} className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                </span>
                <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-1">{s.title}</h3>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-2">{s.shortDesc}</p>
                <div className="mt-3 flex items-center gap-1 text-[11px] font-semibold text-zinc-400">
                  Learn more <ChevronRight className="w-3 h-3" />
                </div>
              </a>
            ))}
          </div>
        </section>

      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="signin"
        isModal={true}
        redirectUrl="/user/deals"
      />
    </>
  );
}
