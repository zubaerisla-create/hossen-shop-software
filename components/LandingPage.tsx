'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Product } from '@/app/types';
import { Monitor, Code, Smartphone, Terminal, Cpu, Shield, HeartHandshake, Globe, DownloadCloud, Award, Users, HelpCircle, Mail, Phone, MessageSquare, ArrowRight, Star, CheckCircle2, Search, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import AiEstimator from './AiEstimator';
import { servicesData } from '@/app/data/services';
import { ServiceIcon } from '@/app/utils/icons';

interface LandingPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onStartCustomProject: () => void;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  onImportToCustomForm: (title: string, desc: string, budget: number, tech: string) => void;
}

export default function LandingPage({
  products,
  onSelectProduct,
  onStartCustomProject,
  isLoggedIn,
  onOpenLogin,
  onImportToCustomForm
}: LandingPageProps) {
  const [activeFilter, setActiveFilter] = useState<'all' | 'SaaS' | 'Full Website' | 'Mobile App' | 'UI/UX'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);

  // Force video to always play — even after tab switch or browser throttling
  const forcePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    v.loop = true;
    if (v.paused) {
      v.play().catch(() => { });
    }
  }, []);

  useEffect(() => {
    forcePlay();

    // Re-play whenever the tab becomes visible again
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        forcePlay();
      }
    };

    // Restart if video somehow ends (shouldn't happen with loop, but safety net)
    const handleEnded = () => forcePlay();
    const handlePause = () => {
      // If video gets paused by browser, force it back
      setTimeout(forcePlay, 50);
    };

    document.addEventListener('visibilitychange', handleVisibility);
    videoRef.current?.addEventListener('ended', handleEnded);
    videoRef.current?.addEventListener('pause', handlePause);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      videoRef.current?.removeEventListener('ended', handleEnded);
      videoRef.current?.removeEventListener('pause', handlePause);
    };
  }, [forcePlay]);

  const filteredProducts = products.filter(p => {
    const matchesFilter = activeFilter === 'all' || p.category === activeFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const portfolio = [
    { title: 'RentKart - Vehicle Rental App', type: 'Mobile App', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80', desc: 'A real-time ride booking and vehicle rental platform handling 50k+ bookings.', productId: 'prod-3' },
    { title: 'DocSphere - Medical Consultation Portal', type: 'Web App', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80', desc: 'Telemedicine web platform with calendar scheduling and WebRTC live calls.', productId: 'prod-7' },
    { title: 'AuraShop - Minimalist Fashion Store', type: 'Full Website', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=600&q=80', desc: 'High-conversion, clean e-commerce system with custom animations and bKash.', productId: 'prod-2' }
  ];

  const reviews = [
    { name: 'Dr. Mahbubul Alam', role: 'Director, CareHospital', text: 'Hossen Shop designed our entire consultation portal. The milestone system kept us aligned, and the Gantt timeline was 100% accurate. Highly recommended!', rating: 5 },
    { name: 'Sajid Mahmud', role: 'Founder, DevLaunch', text: 'Purchased their SaaS boilerplate. The code structure is incredibly clean, saving us at least 3 weeks of work. Lifetime support is excellent!', rating: 5 },
    { name: 'Maria K.', role: 'Product Lead, FinSolve', text: 'Their custom development flow is seamless. The electronic signing and milestone approval payments made the whole project feel highly secure.', rating: 5 }
  ];

  const stats = [
    { value: '180+', label: 'Projects Completed', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
    { value: '2,500+', label: 'Happy Clients', icon: <Users className="w-5 h-5 text-violet-500" /> },
    { value: '15+', label: 'Countries Served', icon: <Globe className="w-5 h-5 text-blue-500" /> },
    { value: '12K+', label: 'Products Downloaded', icon: <DownloadCloud className="w-5 h-5 text-rose-500" /> },
    { value: '5+', label: 'Years Experience', icon: <Award className="w-5 h-5 text-amber-500" /> }
  ];

  const faqs = [
    { q: 'How does the Ready-made Digital Products purchase work?', a: 'You browse products, click buy, select your payment method (bKash/Card), complete the simulated checkout, and immediately receive the file downloads and invoice receipt.' },
    { q: 'What is the Custom Project development workflow?', a: 'First, submit requirements (or use the AI Estimator). Admin reviews it, you negotiate details in the chat portal, Admin sends a structured quotation with milestones, you sign the contract, complete the advance payment, and tracking begins via Gantt view.' },
    { q: 'Can I request customization on ready-made products?', a: 'Absolutely! On every product detail card, there is a "Request Customization" button. Clicking this pre-fills your Custom Deal form with the products specifications.' },
    { q: 'Do you offer support after project delivery?', a: 'Yes, all custom projects come with a 6-month free warranty support. We also offer monthly/annual maintenance plans.' }
  ];

  return (
    <div className="space-y-32 pb-24 bg-white dark:bg-[#070708] transition-all duration-500">

      {/* Hero Section */}
      <section className="relative min-h-[580px] md:min-h-[680px] w-full bg-zinc-950 flex items-center overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: 0.65 }}
        >
          <source src="/Create_a_premium_cinematic_her.mp4" type="video/mp4" />
        </video>

        {/* Futuristic Radial/Linear Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/35 to-[#070708]/70 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent z-10" />

        {/* Backdrop Grid lines */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] z-10" />

        {/* Content Container */}
        <div className="relative z-20 max-w-[1400px] mx-auto w-full px-6 pt-32 pb-20 md:pt-44 md:pb-28 flex flex-col items-start text-left space-y-8">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 dark:bg-zinc-900/80 border border-white/20 dark:border-zinc-800 backdrop-blur-md text-white text-[10px] font-bold tracking-widest uppercase animate-fade-in">
            <Sparkles className="w-3.5 h-3.5 text-yellow-450 animate-pulse" /> Elite Engineering Agency & Marketplace
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold text-white leading-[1.08] tracking-tight max-w-4xl animate-fade-in-up font-sans">
            Our engineering experts <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-200 via-zinc-400 to-zinc-650 italic font-serif">will take it from here</span>
          </h1>

          <p className="text-zinc-100 dark:text-zinc-50 text-xs md:text-sm max-w-xl font-bold leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            Hossen Shop turns complex business requirements into fast, robust, and scalable custom solutions. Browse production-ready codes or start a direct custom workflow.
          </p>

          {/* Search bar */}
          <div className="relative max-w-xl w-full mt-4 shadow-2xl animate-fade-in-up animation-delay-100">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-zinc-400" />
            </div>
            <input
              type="text"
              placeholder="Search templates, SaaS boilerplates, custom estimates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/95 dark:bg-zinc-900/90 text-zinc-900 dark:text-white placeholder:text-zinc-400 rounded-lg pl-10 pr-16 py-4 text-xs font-semibold focus:outline-none border border-white/10 dark:border-zinc-800 focus:border-zinc-300 focus:ring-1 focus:ring-zinc-350 dark:focus:border-zinc-700 dark:focus:ring-zinc-800 transition-all backdrop-blur-md"
            />
            <button className="absolute right-2 top-2 bottom-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 rounded-md flex items-center justify-center cursor-pointer transition-colors text-[10px] font-bold uppercase tracking-wider">
              Search
            </button>
          </div>

          {/* Popular tags below search bar */}
          <div className="flex flex-wrap items-center gap-2.5 text-[9px] text-zinc-350 font-bold animate-fade-in-up animation-delay-200">
            <span className="text-zinc-400 uppercase tracking-widest text-[8px] font-extrabold mr-1">Popular Channels:</span>
            <button
              onClick={() => { setActiveFilter('all'); setSearchTerm(''); }}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-all text-white cursor-pointer shadow-sm"
            >
              All Codebases
            </button>
            <button
              onClick={() => { setActiveFilter('SaaS'); setSearchTerm(''); }}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-all text-white cursor-pointer shadow-sm"
            >
              SaaS Boilerplates
            </button>
            <button
              onClick={() => { setActiveFilter('Full Website'); setSearchTerm(''); }}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-full hover:bg-white/20 transition-all text-white cursor-pointer shadow-sm"
            >
              Full Websites
            </button>
            <button
              onClick={onStartCustomProject}
              className="px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-950 font-extrabold rounded-full transition-all flex items-center gap-1 cursor-pointer"
            >
              Start Custom Workspace <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
            </button>
          </div>

          {/* Trusted by section */}
          <div className="w-full pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-12 animate-fade-in-up animation-delay-300">
            <div className="flex flex-wrap items-center gap-6 md:gap-8 text-zinc-450 font-bold text-[9px] uppercase tracking-widest">
              <span className="text-zinc-650 normal-case tracking-normal">Trusted by builders at:</span>
              <span className="hover:text-white transition-colors cursor-default">Google</span>
              <span className="hover:text-white transition-colors cursor-default">Vercel</span>
              <span className="hover:text-white transition-colors cursor-default">Linear</span>
              <span className="hover:text-white transition-colors cursor-default">Stripe</span>
              <span className="hover:text-white transition-colors cursor-default">Retool</span>
            </div>
          </div>

        </div>
      </section>

      {/* Services Grid (Capabilities) */}
      <section id="services" className="max-w-[1400px] mx-auto px-6 space-y-12 animate-fade-in">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Expertise & Fields</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-zinc-950 dark:text-white uppercase tracking-tight font-sans">Our Capabilities</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs max-w-md mx-auto">High-performance production architectures tailored precisely for your business needs.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesData.map((ser) => (
            <Link
              key={ser.slug}
              href={`/services/${ser.slug}`}
              className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 rounded-xl p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-xl hover:bg-white dark:hover:bg-zinc-900/60 hover:border-zinc-300 dark:hover:border-zinc-800 block cursor-pointer group"
            >
              <div className="bg-white dark:bg-zinc-950 p-2.5 w-fit rounded-lg border border-zinc-200 dark:border-zinc-900 shadow-xs group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-all">
                <ServiceIcon name={ser.icon} className="w-5.5 h-5.5 text-zinc-900 dark:text-zinc-450" />
              </div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white mt-4 mb-2 group-hover:text-zinc-650 dark:group-hover:text-zinc-300 transition-colors tracking-wide uppercase">{ser.title}</h3>
              <p className="text-zinc-500 dark:text-zinc-450 text-[11px] leading-relaxed line-clamp-3">{ser.shortDesc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="max-w-[1400px] mx-auto px-6 space-y-12 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-205 dark:border-zinc-900 pb-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Marketplace</span>
            <h2 className="text-2xl md:text-4xl font-extrabold text-zinc-950 dark:text-white uppercase tracking-tight">Digital Templates</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs">Instantly download clean, verified full-stack codebases.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-1.5 items-center">
            {(['all', 'SaaS', 'Full Website', 'Mobile App', 'UI/UX'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-3.5 py-2 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${activeFilter === cat
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-md'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
                  }`}
              >
                {cat}
              </button>
            ))}

            <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1.5 hidden sm:block" />

            <Link
              href="/products"
              className="px-3.5 py-2 rounded-lg text-[9px] font-extrabold uppercase tracking-wider transition-all cursor-pointer bg-zinc-950 text-white dark:bg-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-md flex items-center gap-1.5"
            >
              <span>View All Products</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {filteredProducts.slice(0, 6).map((prod) => (
            <div
              key={prod.id}
              onClick={() => onSelectProduct(prod)}
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl overflow-hidden group cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-zinc-300 dark:hover:border-zinc-800 flex flex-col justify-between"
            >
              <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  className="w-full h-full object-cover opacity-95 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
                <span className="absolute top-3 left-3 bg-zinc-900/90 dark:bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[8px] font-mono text-white tracking-widest uppercase">
                  {prod.category}
                </span>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold text-zinc-900 dark:text-white text-xs group-hover:text-zinc-650 dark:group-hover:text-zinc-350 transition-colors leading-snug line-clamp-2 uppercase tracking-wide">
                    {prod.name}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-450 text-[11px] leading-relaxed line-clamp-2">{prod.description}</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex flex-wrap gap-1">
                    {prod.technologies.slice(0, 4).map((tech, idx) => (
                      <span key={idx} className="bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-450 border border-zinc-200 dark:border-zinc-850 px-2 py-0.5 rounded text-[8px] font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-900 pt-3">
                    <span className="text-[11px] font-bold text-zinc-950 dark:text-white">{prod.price.toLocaleString()} BDT</span>
                    <span className="text-zinc-950 dark:text-white text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1">
                      Explore Code <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length > 6 && (
          <div className="flex justify-center pt-6">
            <Link
              href="/products"
              className="px-6 py-3 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <span>Explore Marketplace Store</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* Case Studies (Portfolio) */}
      <section id="portfolio" className="max-w-[1400px] mx-auto px-6 space-y-12 animate-fade-in">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Case Studies</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-zinc-950 dark:text-white uppercase tracking-tight font-sans">Recent Deployments</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs max-w-md mx-auto">Explore high-quality systems launched and fully managed by our design & development team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {portfolio.map((port, i) => (
            <Link key={i} href={`/products/${port.productId}`} className="bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-900 rounded-xl overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-zinc-300 dark:hover:border-zinc-850 block cursor-pointer">
              <div className="overflow-hidden aspect-video bg-zinc-100">
                <img src={port.image} alt={port.title} className="w-full h-full object-cover opacity-95 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
              </div>
              <div className="p-5 space-y-2.5">
                <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-450 font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-extrabold border border-zinc-200 dark:border-zinc-850">{port.type}</span>
                <h3 className="font-bold text-zinc-900 dark:text-white text-xs mt-1.5">{port.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-450 text-[11px] leading-relaxed">{port.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Why Choose Us & Statistics */}
      <section className="bg-zinc-50 dark:bg-zinc-950/40 border-y border-zinc-200/80 dark:border-zinc-900/80 py-16">
        <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          <div className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Our Methodology</span>
              <h2 className="text-2xl md:text-4xl font-extrabold text-zinc-950 dark:text-white uppercase tracking-tight">Structured Agency Delivery</h2>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm leading-relaxed">
              We focus on clean, standardized packages. All templates and custom applications are heavily audited, structured using modular component hierarchies, and ready to deploy instantly.
            </p>

            <div className="space-y-4">
              {[
                { title: 'Standardized Architecture', desc: 'Consistent folders, clean state management, and clear configuration documentation.' },
                { title: 'Secure Escrow Payment Flow', desc: 'Clear milestone tracking, deliverables submission, and digital e-signatures.' },
                { title: 'Clean Updates & Patches', desc: 'Receive code upgrades, vulnerability patches, and upgrades directly.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="mt-0.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 p-1.5 rounded-full h-fit border border-emerald-100 dark:border-emerald-500/20">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wide">{item.title}</h4>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-450 leading-relaxed mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {stats.map((stat, i) => (
              <div key={i} className={`bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 flex flex-col justify-between space-y-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-800 ${i === 4 ? 'col-span-2 flex-row items-center space-y-0 py-4' : ''}`}>
                <div className="bg-zinc-50 dark:bg-zinc-900/60 p-2 w-fit rounded-lg border border-zinc-200 dark:border-zinc-850 shadow-xs">
                  {stat.icon}
                </div>
                <div>
                  <span className="text-2xl font-black text-zinc-950 dark:text-white block tracking-tight">{stat.value}</span>
                  <span className="text-zinc-500 dark:text-zinc-400 text-[8px] font-extrabold uppercase tracking-widest">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* AI Estimator Embed */}
      <section id="ai-estimator" className="max-w-[1400px] mx-auto px-6 scroll-mt-24">
        <div className="relative">
          <AiEstimator onImport={onImportToCustomForm} />
        </div>
      </section>

      {/* Reviews & Testimonials */}
      <section className="max-w-[1400px] mx-auto px-6 space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Testimonials</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-zinc-955 dark:text-white uppercase tracking-tight">Client Reviews</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs">Verified comments from businesses and founders who built with us.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {reviews.map((rev, i) => (
            <div key={i} className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 p-6 rounded-xl flex flex-col justify-between space-y-6 hover:shadow-xl transition-all duration-300">
              <div className="space-y-3">
                <div className="flex text-amber-500 gap-0.5">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="text-zinc-650 dark:text-zinc-300 italic text-[11px] leading-relaxed">"{rev.text}"</p>
              </div>
              <div className="border-t border-zinc-200/80 dark:border-zinc-850 pt-4 flex justify-between items-center text-[10px]">
                <span className="text-zinc-900 dark:text-white font-bold">{rev.name}</span>
                <span className="text-zinc-500 font-medium">{rev.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ & Contact Details */}
      <section id="contact" className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 scroll-mt-24">

        {/* FAQs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Got Questions?</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-950 dark:text-white uppercase tracking-tight">Frequently Asked Questions</h2>
            <p className="text-zinc-500 dark:text-zinc-405 text-xs">Essential information about custom workflows, purchases, and warranties.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 space-y-2 hover:border-zinc-300 dark:hover:border-zinc-850 transition-colors">
                <h4 className="font-bold text-zinc-900 dark:text-white text-xs flex items-start gap-2.5">
                  <HelpCircle className="w-4 h-4 text-zinc-450 shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h4>
                <p className="text-zinc-500 dark:text-zinc-450 text-[11px] leading-relaxed pl-6.5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Channels */}
        <div className="lg:col-span-5 bg-zinc-50/70 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-8">
          <div className="space-y-5">
            <div>
              <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Connect channels</span>
              <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider mt-1">Get in Touch</h3>
              <p className="text-zinc-500 dark:text-zinc-450 text-[11px] leading-relaxed mt-1">Connect with our support team or schedule a custom product planning session.</p>
            </div>

            <div className="space-y-3 text-xs">
              <a href="mailto:support@Hossen Shop.com" className="flex items-center gap-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-4 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-800 transition-all text-zinc-700 dark:text-zinc-300 group">
                <div className="bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 group-hover:scale-105 transition-transform">
                  <Mail className="w-4.5 h-4.5 text-zinc-500" />
                </div>
                <div>
                  <span className="block text-[8px] text-zinc-450 uppercase font-bold tracking-wider">Email support Desk</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">support@Hossen Shop.com</span>
                </div>
              </a>

              <a href="https://wa.me/8801711000000" target="_blank" rel="noreferrer" className="flex items-center gap-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-4 rounded-xl hover:border-zinc-300 dark:hover:border-zinc-800 transition-all text-zinc-700 dark:text-zinc-300 group">
                <div className="bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 group-hover:scale-105 transition-transform">
                  <MessageSquare className="w-4.5 h-4.5 text-zinc-500" />
                </div>
                <div>
                  <span className="block text-[8px] text-zinc-450 uppercase font-bold tracking-wider">WhatsApp chat direct</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">+880 1711 000000</span>
                </div>
              </a>

              <div className="flex items-center gap-4 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-4 rounded-xl text-zinc-700 dark:text-zinc-300">
                <div className="bg-zinc-50 dark:bg-zinc-900 p-2 rounded-lg border border-zinc-200 dark:border-zinc-850">
                  <Phone className="w-4.5 h-4.5 text-zinc-500" />
                </div>
                <div>
                  <span className="block text-[8px] text-zinc-450 uppercase font-bold tracking-wider">Main Headquarters</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">Uttara Sector 11, Dhaka, BD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-200 dark:border-zinc-850 pt-6">
            <button
              onClick={onStartCustomProject}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <span>Launch a Custom Project Request</span>
            </button>
          </div>
        </div>

      </section>

    </div>
  );
}
