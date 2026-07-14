'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Product, Blog, CaseStudy } from '@/app/types';
import { useCurrency } from '@/app/utils/currency';
import { Monitor, Code, Smartphone, Terminal, Cpu, Shield, HeartHandshake, Globe, DownloadCloud, Award, Users, HelpCircle, Mail, Phone, MessageSquare, ArrowRight, Star, CheckCircle2, Search, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import AiEstimator from './AiEstimator';
import { servicesData } from '@/app/data/services';
import { ServiceIcon } from '@/app/utils/icons';

import { API_BASE_URL } from '@/app/utils/api';

function ProductCardVideo({ src, isHovered }: { src: string; isHovered: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isHovered) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isHovered]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-10 ${
        isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      muted
      loop
      playsInline
    />
  );
}

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
  const router = useRouter();
  const { format } = useCurrency();
  const [activeFilter, setActiveFilter] = useState<'all' | 'SaaS' | 'Full Website' | 'Mobile App' | 'UI/UX'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Interactive FAQ & Contact Form State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactEmail.trim() || !contactSubject.trim() || !contactMessage.trim()) {
      setSubmitError('Please fill out all fields.');
      return;
    }
    setIsSubmitting(true);
    setSubmitSuccess(null);
    setSubmitError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: contactName,
          email: contactEmail,
          subject: contactSubject,
          message: contactMessage
        })
      });

      const data = await response.json();
      if (response.ok) {
        setSubmitSuccess('Thank you! Your inquiry was sent successfully.');
        setContactName('');
        setContactEmail('');
        setContactSubject('');
        setContactMessage('');
      } else {
        setSubmitError(data.message || 'Failed to send inquiry. Please try again.');
      }
    } catch (err) {
      console.error('Contact submission error:', err);
      setSubmitError('Connection error. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSearchSubmit = () => {
    if (searchTerm.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      router.push('/products');
    }
  };

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

  const [portfolio, setPortfolio] = useState<CaseStudy[]>([]);

  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    const fetchCaseStudies = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/casestudies`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.data && data.data.caseStudies) {
            setPortfolio(data.data.caseStudies);
          }
        }
      } catch (err) {
        console.error('Failed to fetch case studies:', err);
      }
    };

    const fetchBlogs = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/blogs`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.data && data.data.blogs) {
            setBlogs(data.data.blogs);
          }
        }
      } catch (err) {
        console.error('Failed to fetch blogs:', err);
      }
    };

    fetchCaseStudies();
    fetchBlogs();
  }, []);

  const [reviewsList, setReviewsList] = useState<any[]>([
    { name: 'Dr. Mahbubul Alam', role: 'Director, CareHospital', comment: 'Hossen Shop designed our entire consultation portal. The milestone system kept us aligned, and the Gantt timeline was 100% accurate. Highly recommended!', rating: 5, productName: 'AI SmartWriter - Automated SEO Content Creator', productId: '92d3c302-e80f-4970-95b8-6402af24c1f1', date: '2026-06-20' },
    { name: 'Sajid Mahmud', role: 'Founder, DevLaunch', comment: 'Purchased their SaaS boilerplate. The code structure is incredibly clean, saving us at least 3 weeks of work. Lifetime support is excellent!', rating: 5, productName: 'DevFlow - Next.js 15 SaaS Boilerplate & Starter Kit', productId: 'e74014c7-44e9-48a3-849d-782b62adeec9', date: '2026-06-20' },
    { name: 'Maria K.', role: 'Product Lead, FinSolve', comment: 'Their custom development flow is seamless. The electronic signing and milestone approval payments made the whole project feel highly secure.', rating: 5, productName: 'EcoShop - High-Conversion Next.js E-Commerce Storefront', productId: '36115d79-22fb-47f5-a034-bf7b45c62519', date: '2026-06-20' }
  ]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/reviews/all`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.data && data.data.reviews) {
            if (data.data.reviews.length > 0) {
              setReviewsList(data.data.reviews);
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch dynamic testimonials:', err);
      }
    };
    fetchReviews();
  }, []);

  const [stats, setStats] = useState<{ value: string; label: string; iconKey: string }[]>([
    { value: '180+', label: 'Projects Completed', iconKey: 'check' },
    { value: '2,500+', label: 'Happy Clients', iconKey: 'users' },
    { value: '15+', label: 'Countries Served', iconKey: 'globe' },
    { value: '12K+', label: 'Products Downloaded', iconKey: 'download' },
    { value: '5+', label: 'Years Experience', iconKey: 'award' }
  ]);

  useEffect(() => {
    const saved = localStorage.getItem('apex_agency_stats');
    if (saved) {
      try {
        setStats(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  function getStatIcon(key: string) {
    const cls = "w-5 h-5";
    switch (key) {
      case 'check': return <CheckCircle2 className={`${cls} text-emerald-500`} />;
      case 'users': return <Users className={`${cls} text-violet-500`} />;
      case 'globe': return <Globe className={`${cls} text-blue-500`} />;
      case 'download': return <DownloadCloud className={`${cls} text-rose-500`} />;
      case 'award': return <Award className={`${cls} text-amber-500`} />;
      default: return <CheckCircle2 className={`${cls} text-emerald-500`} />;
    }
  }

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
            <Sparkles className="w-3.5 h-3.5 text-purple-400 animate-pulse" /> Elite Engineering Studio & Marketplace
          </div>

          <h1 className="text-4xl md:text-7xl font-extrabold text-white leading-[1.05] tracking-tight max-w-4xl animate-fade-in-up font-sans">
            Crafting Elite Software & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-300 font-black">Production-Ready Codebases</span>
          </h1>

          <p className="text-zinc-200 dark:text-zinc-100 text-xs md:text-sm max-w-xl font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.95)]">
            We design, build, and deliver high-performance web applications and source codes for modern founders. Skip the developer search and launch verified, optimized architectures instantly.
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
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearchSubmit();
                }
              }}
              className="w-full bg-white/10 dark:bg-black/40 text-white placeholder:text-zinc-400 rounded-xl pl-10 pr-20 py-4 text-xs font-semibold focus:outline-none border border-white/15 dark:border-zinc-800/80 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition-all backdrop-blur-lg shadow-[0_0_50px_-12px_rgba(168,85,247,0.2)]"
            />
            <button 
              onClick={handleSearchSubmit}
              className="absolute right-2 top-2 bottom-2 bg-white hover:bg-zinc-200 text-black px-4 rounded-lg flex items-center justify-center cursor-pointer transition-colors text-[10px] font-extrabold uppercase tracking-wider"
            >
              Search
            </button>
          </div>

          {/* Popular tags below search bar */}
          <div className="flex flex-wrap items-center gap-2.5 text-[9px] text-zinc-300 font-bold animate-fade-in-up animation-delay-200">
            <span className="text-zinc-400 uppercase tracking-widest text-[8px] font-extrabold mr-1">Popular Channels:</span>
            <button
              onClick={() => { setActiveFilter('all'); setSearchTerm(''); }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/15 hover:border-white/20 transition-all text-white cursor-pointer shadow-sm backdrop-blur-sm"
            >
              All Codebases
            </button>
            <button
              onClick={() => { setActiveFilter('SaaS'); setSearchTerm(''); }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/15 hover:border-white/20 transition-all text-white cursor-pointer shadow-sm backdrop-blur-sm"
            >
              SaaS Boilerplates
            </button>
            <button
              onClick={() => { setActiveFilter('Full Website'); setSearchTerm(''); }}
              className="px-4 py-2 bg-white/5 border border-white/10 rounded-full hover:bg-white/15 hover:border-white/20 transition-all text-white cursor-pointer shadow-sm backdrop-blur-sm"
            >
              Full Websites
            </button>
            <button
              onClick={onStartCustomProject}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-full transition-all flex items-center gap-1 cursor-pointer shadow-md shadow-purple-900/20"
            >
              Start Custom Workspace <Zap className="w-3 h-3 text-amber-300 fill-amber-300 animate-pulse" />
            </button>
          </div>

          {/* Trusted by section */}
          <div className="w-full pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-12 animate-fade-in-up animation-delay-300">
            <div className="flex flex-wrap items-center gap-6 md:gap-8 text-zinc-400 font-bold text-[9px] uppercase tracking-widest">
              <span className="text-zinc-550 normal-case tracking-normal">Trusted by builders at:</span>
              <span className="hover:text-white transition-colors cursor-default">Hossen Academy</span>
             
              
            </div>
          </div>

        </div>
      </section>

      {/* Services Grid (Capabilities) */}
      <section id="services" className="max-w-[1400px] mx-auto px-6 space-y-12 animate-fade-in">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest">Expertise & Fields</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-zinc-955 dark:text-white uppercase tracking-tight font-sans">Our Capabilities</h2>
          <p className="text-zinc-500 dark:text-zinc-450 text-xs max-w-md mx-auto">High-performance production architectures tailored precisely for your business needs.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesData.map((ser) => (
            <Link
              key={ser.slug}
              href={`/services/${ser.slug}`}
              className="glass-panel rounded-2xl p-6 transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.1)] hover:border-purple-500/30 dark:hover:border-purple-400/25 block cursor-pointer group"
            >
              <div className="bg-zinc-100/50 dark:bg-zinc-950 p-2.5 w-fit rounded-xl border border-zinc-200/60 dark:border-zinc-850 shadow-xs group-hover:border-purple-500/30 transition-all">
                <ServiceIcon name={ser.icon} className="w-5.5 h-5.5 text-zinc-800 dark:text-zinc-350 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
              </div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white mt-5 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors tracking-wide uppercase">{ser.title}</h3>
              <p className="text-zinc-550 dark:text-zinc-400 text-[11px] leading-relaxed line-clamp-3 font-medium">{ser.shortDesc}</p>
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
              onMouseEnter={() => setHoveredProductId(prod.id)}
              onMouseLeave={() => setHoveredProductId(null)}
              className="digital-product-card rounded-2xl cursor-pointer flex flex-col justify-between group"
            >
              <div className="relative flex flex-col flex-1 overflow-hidden rounded-[15px] bg-white/80 dark:bg-[#0d0d11]/85 backdrop-blur-md group-hover:bg-white dark:group-hover:bg-[#09090b] transition-colors duration-500">
                {/* Media Section */}
                <div className="relative aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-950 border-b border-zinc-150 dark:border-zinc-900/60">
                  {prod.videoUrl && (
                    <ProductCardVideo
                      src={prod.videoUrl}
                      isHovered={hoveredProductId === prod.id}
                    />
                  )}
                  <img
                    src={prod.images[0]}
                    alt={prod.name}
                    className={`w-full h-full object-cover group-hover:scale-102 transition-transform duration-700 ease-out ${
                      hoveredProductId === prod.id ? 'opacity-0' : 'opacity-95 group-hover:opacity-100'
                    }`}
                  />
                  <span className="absolute top-3 left-3 bg-zinc-950/85 dark:bg-black/75 backdrop-blur-md border border-zinc-800/30 dark:border-white/10 px-2.5 py-0.5 rounded text-[8px] font-mono text-zinc-100 dark:text-white tracking-widest uppercase z-20 font-extrabold shadow-sm">
                    {prod.category}
                  </span>
                  <div className="absolute bottom-3 right-3 bg-zinc-950/85 dark:bg-black/70 backdrop-blur-sm border border-zinc-800/50 px-2 py-0.5 rounded flex items-center gap-1 z-20 shadow-xs">
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    <span className="text-[9px] font-extrabold text-white font-mono">{(prod.rating || 5.0).toFixed(1)}</span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="font-bold text-zinc-900 dark:text-white text-xs group-hover:text-purple-650 dark:group-hover:text-purple-400 transition-colors duration-300 leading-snug line-clamp-2 uppercase tracking-wide">
                      {prod.name}
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-450 text-[11px] leading-relaxed line-clamp-2">{prod.description}</p>
                  </div>

                  <div className="space-y-4 pt-2">
                    <div className="flex flex-wrap gap-1">
                      {prod.technologies.slice(0, 4).map((tech, idx) => (
                        <span key={idx} className="bg-zinc-100/70 dark:bg-zinc-900/60 text-zinc-650 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-850/60 px-2 py-0.5 rounded text-[8px] font-mono tracking-wide">
                          {tech}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center border-t border-zinc-150/80 dark:border-zinc-900/80 pt-3">
                      <div className="flex flex-col">
                        <span className="text-[8px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest leading-none mb-1">License Cost</span>
                        <span className="text-[11px] font-bold text-zinc-950 dark:text-white">{format(prod.price)}</span>
                      </div>
                      <span className="text-zinc-950 dark:text-white text-[9px] font-extrabold uppercase tracking-wider flex items-center gap-1 group-hover:translate-x-0.5 transition-transform duration-300">
                        Explore Code <ArrowRight className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-550 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                      </span>
                    </div>
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
          {portfolio.map((port, i) => {
            const cardContent = (
              <>
                <div className="overflow-hidden aspect-video bg-zinc-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={port.image} alt={port.title} className="w-full h-full object-cover opacity-95 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
                </div>
                <div className="p-5 space-y-2.5">
                  <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-450 font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-extrabold border border-zinc-200 dark:border-zinc-850">{port.type}</span>
                  <h3 className="font-bold text-zinc-900 dark:text-white text-xs mt-1.5">{port.title}</h3>
                  <p className="text-zinc-500 dark:text-zinc-450 text-[11px] leading-relaxed">{port.desc}</p>
                </div>
              </>
            );

            const cardClasses = "bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-900 rounded-xl overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-zinc-300 dark:hover:border-zinc-850 block cursor-pointer";

            return (
              <Link key={port.id || i} href={`/casestudies/${port.id}`} className={cardClasses}>
                {cardContent}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Blogs Section */}
      <section id="blogs" className="max-w-[1400px] mx-auto px-6 space-y-12 animate-fade-in">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-sans">Articles & News</span>
          <h2 className="text-2xl md:text-4xl font-extrabold text-zinc-955 dark:text-white uppercase tracking-tight">Recent Insights</h2>
          <p className="text-zinc-500 dark:text-zinc-400 text-xs max-w-md mx-auto">Stay up to date with the latest industry news, technology trends, and development strategies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {blogs.slice(0, 3).map((blog, i) => (
            <Link
              key={blog.id || i}
              href={`/blogs/${blog.slug}`}
              className="bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-900 rounded-xl overflow-hidden group transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:border-zinc-300 dark:hover:border-zinc-850 block cursor-pointer flex flex-col justify-between"
            >
              <div className="flex flex-col flex-1">
                <div className="overflow-hidden aspect-video bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-100 dark:border-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={blog.image} alt={blog.title} className="w-full h-full object-cover opacity-95 group-hover:scale-105 group-hover:opacity-100 transition-all duration-700" />
                </div>
                <div className="p-5 space-y-2.5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="flex flex-wrap gap-1">
                      {blog.tags && blog.tags.slice(0, 3).map((tag: string, idx: number) => (
                        <span key={idx} className="bg-zinc-50 dark:bg-zinc-900 text-zinc-650 dark:text-zinc-450 font-mono text-[8px] uppercase tracking-widest px-2 py-0.5 rounded font-extrabold border border-zinc-200 dark:border-zinc-850">{tag}</span>
                      ))}
                    </div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-xs mt-1.5 line-clamp-2 uppercase tracking-wide group-hover:text-zinc-650 dark:group-hover:text-zinc-350 transition-colors leading-snug">{blog.title}</h3>
                    <p className="text-zinc-550 dark:text-zinc-450 text-[11px] leading-relaxed line-clamp-2">
                      {blog.excerpt || (blog.content ? blog.content.replace(/<[^>]*>/g, '') : '')}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-900 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                    <span>By {blog.author}</span>
                    <span>{new Date(blog.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {blogs.length > 3 && (
          <div className="flex justify-center pt-6">
            <Link
              href="/blogs"
              className="px-6 py-3 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-lg font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <span>View All Blogs</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
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
                  {getStatIcon(stat.iconKey)}
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
          {reviewsList.slice(0, 3).map((rev, i) => (
            <Link
              href={`/products/${rev.productId}`}
              key={i}
              className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 p-6 rounded-xl flex flex-col justify-between space-y-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
            >
              <div className="space-y-4">
                {/* Product Reviewed Badge & Date */}
                <div className="flex justify-between items-start gap-4">
                  <div className="bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-md text-[9px] font-bold text-zinc-750 dark:text-zinc-300 tracking-wide uppercase line-clamp-1 flex-1 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors">
                    <span className="text-zinc-450 dark:text-zinc-500 font-medium normal-case mr-1">Reviewed:</span>
                    {rev.productName}
                  </div>
                  {rev.date && (
                    <span className="text-[9px] text-zinc-450 dark:text-zinc-500 font-mono shrink-0 pt-1">
                      {new Date(rev.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  )}
                </div>

                {/* Stars & Comment */}
                <div className="space-y-2">
                  <div className="flex text-amber-400 gap-0.5">
                    {[...Array(5)].map((_, idx) => (
                      <Star
                        key={idx}
                        className={`w-3.5 h-3.5 ${
                          idx < (rev.rating || 5)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-zinc-200 dark:text-zinc-800'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-zinc-650 dark:text-zinc-300 italic text-[11px] leading-relaxed line-clamp-3 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                    "{rev.comment || rev.text}"
                  </p>
                </div>
              </div>

              {/* Customer Profile Info */}
              <div className="border-t border-zinc-200/80 dark:border-zinc-850 pt-4 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 shadow-sm font-bold text-xs uppercase text-zinc-600 dark:text-zinc-350 select-none">
                  {rev.avatar ? (
                    <img src={rev.avatar} alt={rev.user || rev.name} className="w-full h-full object-cover" />
                  ) : (
                    (rev.user || rev.name || 'C').charAt(0)
                  )}
                </div>
                <div className="flex flex-col text-[10px]">
                  <span className="text-zinc-900 dark:text-white font-bold group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                    {rev.user || rev.name}
                  </span>
                  <span className="text-zinc-500 font-medium">
                    {rev.role || 'Verified Customer'}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {reviewsList.length > 3 && (
          <div className="flex justify-center pt-4">
            <Link
              href="/reviews"
              className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-lg font-bold text-[10.5px] uppercase tracking-wider flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-100 shadow-sm cursor-pointer"
            >
              <span>View All Feedback</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
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
              <div key={i} className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 rounded-xl overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                  className="w-full text-left p-5 flex items-center justify-between font-bold text-zinc-900 dark:text-white text-xs cursor-pointer select-none hover:bg-zinc-100/40 dark:hover:bg-zinc-850/40 transition-colors"
                >
                  <span className="flex items-start gap-2.5">
                    <HelpCircle className="w-4.5 h-4.5 text-zinc-450 shrink-0 mt-0.5" />
                    <span>{faq.q}</span>
                  </span>
                  <span className={`text-zinc-400 transition-transform duration-300 ${openFaqIndex === i ? 'rotate-180' : 'rotate-0'}`}>
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                
                <div
                  className="transition-all duration-350 ease-in-out overflow-hidden"
                  style={{
                    maxHeight: openFaqIndex === i ? '200px' : '0px',
                    opacity: openFaqIndex === i ? 1 : 0
                  }}
                >
                  <p className="text-zinc-500 dark:text-zinc-450 text-[11px] leading-relaxed px-5 pb-5 pl-11.5">
                    {faq.a}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-5 bg-zinc-50/70 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-6 md:p-8 flex flex-col justify-between space-y-6">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">Connect channels</span>
            <h3 className="text-lg font-extrabold text-zinc-900 dark:text-white uppercase tracking-wider mt-1">Get in Touch</h3>
            <p className="text-zinc-500 dark:text-zinc-450 text-[11px] leading-relaxed mt-1">Send a direct message to our support desk via secure SMTP routing.</p>
          </div>

          <form onSubmit={handleContactSubmit} className="space-y-4">
            {submitSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 rounded-lg text-[10px] font-bold">
                {submitSuccess}
              </div>
            )}
            {submitError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-450 rounded-lg text-[10px] font-bold">
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-zinc-950 dark:text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all font-medium text-xs shadow-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="john@example.com"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-zinc-950 dark:text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all font-medium text-xs shadow-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">Subject</label>
              <input
                type="text"
                required
                placeholder="Custom project details / General query"
                value={contactSubject}
                onChange={(e) => setContactSubject(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-zinc-950 dark:text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all font-medium text-xs shadow-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-zinc-450 dark:text-zinc-500 uppercase tracking-wider block">Message Description</label>
              <textarea
                required
                rows={4}
                placeholder="Describe your requirements or questions here..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-zinc-950 dark:text-white rounded-lg px-3.5 py-2.5 focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all font-medium text-xs resize-none shadow-xs"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black disabled:opacity-50 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white dark:border-black/20 dark:border-t-black animate-spin" />
              ) : (
                <span>Send Direct Inquiry</span>
              )}
            </button>
          </form>
        </div>

      </section>

    </div>
  );
}
