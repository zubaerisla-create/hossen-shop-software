'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '../types';
import { Monitor, Code, Smartphone, Terminal, Cpu, Shield, HeartHandshake, Globe, DownloadCloud, Award, Users, HelpCircle, Mail, Phone, MessageSquare, ArrowRight, Star, CheckCircle2, Search, Play, Pause } from 'lucide-react';
import AiEstimator from './AiEstimator';

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
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = React.useRef<HTMLVideoElement>(null);
  
  // Ensure video properties are fully initialized and enforced on mount
  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.loop = true;
      videoRef.current.play().catch(() => {});
    }
  }, []);

  React.useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = true;
      videoRef.current.defaultMuted = true;
      videoRef.current.loop = true;
      if (isVideoPlaying) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVideoPlaying]);
  
  const filteredProducts = products.filter(p => {
    const matchesFilter = activeFilter === 'all' || p.category === activeFilter;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.technologies.some(tech => tech.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const services = [
    { icon: <Monitor className="w-5 h-5 text-zinc-700 dark:text-zinc-400" />, title: 'Ready-made Websites', desc: 'Pre-built production-ready templates and full e-commerce platforms ready to launch.' },
    { icon: <Code className="w-5 h-5 text-zinc-700 dark:text-zinc-400" />, title: 'Custom Websites', desc: 'Tailored websites built from scratch to match your exact agency and scale requirements.' },
    { icon: <Smartphone className="w-5 h-5 text-zinc-700 dark:text-zinc-400" />, title: 'Mobile Apps', desc: 'High-performance native Android & iOS mobile applications using Flutter and React Native.' },
    { icon: <Terminal className="w-5 h-5 text-zinc-700 dark:text-zinc-400" />, title: 'SaaS Platforms', desc: 'Multi-tenant subscription models with dashboards, payment gateways, and custom metrics.' },
    { icon: <Cpu className="w-5 h-5 text-zinc-700 dark:text-zinc-400" />, title: 'AI Solutions', desc: 'OpenAI, LangChain, Pinecone vector indexing, RAG systems, and automated agent pipelines.' },
    { icon: <Shield className="w-5 h-5 text-zinc-700 dark:text-zinc-400" />, title: 'UI / UX Design', desc: 'Bespoke Figma wireframing, brand style-guides, and interactive responsive prototyping.' },
    { icon: <HeartHandshake className="w-5 h-5 text-zinc-700 dark:text-zinc-400" />, title: 'Maintenance', desc: 'Continuous updates, bug squashing, database maintenance, and security monitoring.' },
    { icon: <Globe className="w-5 h-5 text-zinc-700 dark:text-zinc-400" />, title: 'Premium Hosting', desc: 'Optimized Cloud hosting with AWS, Vercel, or custom VPS with 99.9% uptime setups.' }
  ];

  const portfolio = [
    { title: 'RentKart - Vehicle Rental App', type: 'Mobile App', image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=400&q=80', desc: 'A real-time ride booking and vehicle rental platform handling 50k+ bookings.' },
    { title: 'DocSphere - Medical Consultation Portal', type: 'Web App', image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=400&q=80', desc: 'Telemedicine web platform with calendar scheduling and WebRTC live calls.' },
    { title: 'AuraShop - Minimalist Fashion Store', type: 'Full Website', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80', desc: 'High-conversion, clean e-commerce system with custom animations and bKash.' }
  ];

  const reviews = [
    { name: 'Dr. Mahbubul Alam', role: 'Director, CareHospital', text: 'ApexDevs designed our entire consultation portal. The milestone system kept us aligned, and the Gantt timeline was 100% accurate. Highly recommended!', rating: 5 },
    { name: 'Sajid Mahmud', role: 'Founder, DevLaunch', text: 'Purchased their SaaS boilerplate. The code structure is incredibly clean, saving us at least 3 weeks of work. Lifetime support is excellent!', rating: 5 },
    { name: 'Maria K.', role: 'Product Lead, FinSolve', text: 'Their custom development flow is seamless. The electronic signing and milestone approval payments made the whole project feel highly secure.', rating: 5 }
  ];

  const stats = [
    { value: '180+', label: 'Projects Completed', icon: <CheckCircle2 className="w-4 h-4 text-zinc-700 dark:text-zinc-400" /> },
    { value: '2,500+', label: 'Happy Clients', icon: <Users className="w-4 h-4 text-zinc-700 dark:text-zinc-400" /> },
    { value: '15+', label: 'Countries Served', icon: <Globe className="w-4 h-4 text-zinc-700 dark:text-zinc-400" /> },
    { value: '12K+', label: 'Products Downloaded', icon: <DownloadCloud className="w-4 h-4 text-zinc-700 dark:text-zinc-400" /> },
    { value: '5+', label: 'Years Experience', icon: <Award className="w-4 h-4 text-zinc-700 dark:text-zinc-400" /> }
  ];

  const faqs = [
    { q: 'How does the Ready-made Digital Products purchase work?', a: 'You browse products, click buy, select your payment method (bKash/Card), complete the simulated checkout, and immediately receive the file downloads and invoice receipt.' },
    { q: 'What is the Custom Project development workflow?', a: 'First, submit requirements (or use the AI Estimator). Admin reviews it, you negotiate details in the chat portal, Admin sends a structured quotation with milestones, you sign the contract, complete the advance payment, and tracking begins via Gantt view.' },
    { q: 'Can I request customization on ready-made products?', a: 'Absolutely! On every product detail card, there is a "Request Customization" button. Clicking this pre-fills your Custom Deal form with the products specifications.' },
    { q: 'Do you offer support after project delivery?', a: 'Yes, all custom projects come with a 6-month free warranty support. We also offer monthly/annual maintenance plans.' }
  ];

  return (
    <div className="space-y-20 pb-16">
      
      {/* Hero Section */}
      <section 
        className="relative min-h-[480px] md:min-h-[520px] w-full bg-zinc-950 flex items-center overflow-hidden transition-all duration-700"
      >
        {/* Background Video */}
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className={`absolute inset-0 w-full h-full object-cover transition-transform duration-10000 ${
            isVideoPlaying ? 'scale-105' : 'scale-100'
          }`}
          style={{
            opacity: 0.55
          }}
        >
          <source src="/Create_a_premium_cinematic_her.mp4" type="video/mp4" />
        </video>
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-transparent z-10" />

        {/* Content Container */}
        <div className="relative z-20 max-w-[1440px] mx-auto w-full px-6 py-12 md:py-20 flex flex-col items-start text-left space-y-6">
          
          <h1 className="text-4xl md:text-6xl font-light text-white leading-[1.15] tracking-tight max-w-2xl animate-fade-in-up">
            Our software experts <br />
            <span className="font-semibold italic font-serif text-zinc-100">will take it from here</span>
          </h1>

          {/* Search bar */}
          <div className="relative max-w-xl w-full mt-4 shadow-2xl animate-fade-in-up animation-delay-100">
            <input 
              type="text" 
              placeholder="Search for templates, SaaS, apps, or services..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white text-zinc-900 placeholder:text-zinc-400 rounded-md pl-4 pr-12 py-3.5 text-xs font-semibold focus:outline-none border-none"
            />
            <div className="absolute right-1.5 top-1.5 bottom-1.5 bg-zinc-950 text-white px-3.5 rounded flex items-center justify-center cursor-pointer hover:bg-zinc-800 transition-colors">
              <Search className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Popular tags below search bar */}
          <div className="flex flex-wrap items-center gap-2 text-[10px] text-zinc-300 font-bold animate-fade-in-up animation-delay-200">
            <span className="mr-1 text-white font-extrabold uppercase tracking-wider">Popular:</span>
            <button 
              onClick={() => { setActiveFilter('all'); setSearchTerm(''); }}
              className="px-3.5 py-1.5 border border-white/20 rounded-full hover:bg-white/10 hover:border-white/40 transition-colors text-white cursor-pointer"
            >
              Website Templates →
            </button>
            <button 
              onClick={() => { setActiveFilter('SaaS'); setSearchTerm(''); }}
              className="px-3.5 py-1.5 border border-white/20 rounded-full hover:bg-white/10 hover:border-white/40 transition-colors text-white cursor-pointer"
            >
              SaaS Platforms →
            </button>
            <button 
              onClick={() => { setActiveFilter('Full Website'); setSearchTerm(''); }}
              className="px-3.5 py-1.5 border border-white/20 rounded-full hover:bg-white/10 hover:border-white/40 transition-colors text-white cursor-pointer"
            >
              Full Websites →
            </button>
            <button 
              onClick={() => { setActiveFilter('Mobile App'); setSearchTerm(''); }}
              className="px-3.5 py-1.5 border border-white/20 rounded-full hover:bg-white/10 hover:border-white/40 transition-colors text-white cursor-pointer"
            >
              Mobile Apps →
            </button>
            <button 
              onClick={onStartCustomProject}
              className="px-3.5 py-1.5 border border-white/20 rounded-full hover:bg-white/10 hover:border-white/40 transition-colors text-white cursor-pointer"
            >
              Custom Request →
            </button>
          </div>

          {/* Trusted by section & play/pause indicator */}
          <div className="w-full pt-10 border-t border-white/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mt-12 animate-fade-in-up animation-delay-300">
            <div className="flex flex-wrap items-center gap-4 md:gap-6 text-zinc-400 font-bold text-[10px]">
              <span className="text-zinc-500 uppercase tracking-wider text-[9px]">Trusted by:</span>
              <span className="text-white text-xs font-black tracking-tight hover:text-zinc-300 transition-colors">META</span>
              <span className="text-white text-xs font-black tracking-tight hover:text-zinc-300 transition-colors">Google</span>
              <span className="text-white text-xs font-black tracking-tight hover:text-zinc-300 transition-colors">NETFLIX</span>
              <span className="text-white text-xs font-black tracking-tight hover:text-zinc-300 transition-colors">P&G</span>
              <span className="text-white text-xs font-black tracking-tight hover:text-zinc-300 transition-colors">PayPal</span>
              <span className="text-white text-xs font-black tracking-tight hover:text-zinc-300 transition-colors">Payoneer</span>
            </div>

            {/* Play/Pause background animation indicator */}
            <button 
              onClick={() => setIsVideoPlaying(!isVideoPlaying)}
              className="w-7 h-7 border border-white/20 rounded-full flex items-center justify-center text-white/80 hover:text-white hover:border-white/50 transition-all cursor-pointer"
              title={isVideoPlaying ? 'Pause background animation' : 'Play background animation'}
            >
              {isVideoPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            </button>
          </div>

        </div>
      </section>

      {/* Services Grid */}
      <section id="services" className="max-w-[1440px] mx-auto px-4 space-y-8 animate-fade-in animation-delay-100">
        <div className="text-center space-y-1">
          <h2 className="text-xl md:text-2xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Our Capabilities</h2>
          <p className="text-zinc-500 text-xs max-w-sm mx-auto">Instant templates and tailored systems designed for scalability.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((ser, i) => (
            <div key={i} className="bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 rounded p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className="bg-white dark:bg-zinc-950 p-2 w-fit rounded border border-zinc-200 dark:border-zinc-800/80 mb-3">
                {ser.icon}
              </div>
              <h3 className="text-xs font-bold text-zinc-900 dark:text-white mb-1.5">{ser.title}</h3>
              <p className="text-zinc-500 dark:text-zinc-500 text-[11px] leading-relaxed">{ser.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Products Section */}
      <section id="products" className="max-w-[1440px] mx-auto px-4 space-y-8 scroll-mt-20 animate-fade-in animation-delay-200">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-200 dark:border-zinc-900 pb-4">
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Digital Templates</h2>
            <p className="text-zinc-500 text-xs">Buy and download direct license archives.</p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-1.5">
            {(['all', 'SaaS', 'Full Website', 'Mobile App', 'UI/UX'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat)}
                className={`px-2.5 py-1 rounded text-[10px] font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                  activeFilter === cat
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-black'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredProducts.slice(0, 6).map((prod) => (
            <div
              key={prod.id}
              onClick={() => onSelectProduct(prod)}
              className="bg-zinc-50 dark:bg-[#121214]/60 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden group cursor-pointer transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-zinc-300 dark:hover:border-zinc-700 flex flex-col justify-between"
            >
              <div className="relative aspect-video overflow-hidden bg-zinc-200 dark:bg-zinc-950">
                <img
                  src={prod.images[0]}
                  alt={prod.name}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                />
                <span className="absolute top-2.5 left-2.5 bg-white/90 dark:bg-black/70 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-700 dark:text-zinc-300">
                  {prod.category}
                </span>
              </div>

              <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <h3 className="font-bold text-zinc-900 dark:text-white text-xs group-hover:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors leading-snug line-clamp-2">
                    {prod.name}
                  </h3>
                  <p className="text-zinc-500 dark:text-zinc-500 text-[11px] leading-relaxed line-clamp-2">{prod.description}</p>
                </div>

                <div className="space-y-3 pt-1">
                  <div className="flex flex-wrap gap-1">
                    {prod.technologies.slice(0, 3).map((tech, idx) => (
                      <span key={idx} className="bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded text-[9px] font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-900/80 pt-2.5">
                    <span className="text-xs font-bold text-zinc-950 dark:text-white">{prod.price.toLocaleString()} BDT</span>
                    <span className="text-zinc-950 dark:text-white text-[10px] font-bold flex items-center gap-1">
                      Details <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length > 6 && (
          <div className="flex justify-center pt-4">
            <Link
              href="/products"
              className="px-6 py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <span>View All Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </section>

      {/* Portfolio Projects */}
      <section id="portfolio" className="max-w-[1440px] mx-auto px-4 space-y-8 animate-fade-in animation-delay-300">
        <div className="text-center space-y-1">
          <h2 className="text-xl md:text-2xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Case Studies</h2>
          <p className="text-zinc-500 text-xs">A selection of recent development releases from our engineering agency.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {portfolio.map((port, i) => (
            <div key={i} className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden group transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700">
              <div className="overflow-hidden h-40">
                <img src={port.image} alt={port.title} className="w-full h-full object-cover opacity-90 group-hover:scale-105 group-hover:opacity-100 transition-all duration-500" />
              </div>
              <div className="p-4 space-y-1.5">
                <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[9px] uppercase tracking-wide">{port.type}</span>
                <h3 className="font-bold text-zinc-900 dark:text-white text-xs">{port.title}</h3>
                <p className="text-zinc-500 dark:text-zinc-500 text-[11px] leading-relaxed">{port.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Choose Us & Statistics */}
      <section className="bg-zinc-50 dark:bg-zinc-950 border-y border-zinc-200 dark:border-zinc-900 py-12">
        <div className="max-w-[1440px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          
          <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Structured Agency Delivery</h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs md:text-sm leading-relaxed">
              We focus on clean, standardized packages. All products are audited, structured using clean component hierarchies, and ready to merge instantly.
            </p>

            <div className="space-y-3">
              {[
                { title: 'Standardized Architecture', desc: 'Consistent folders, clean states, and direct setups.' },
                { title: 'Secure Escrow flow', desc: 'Milestone tracking and digital signatures keep details locked.' },
                { title: 'Clean updates', desc: 'Receive standard patch upgrades straight to your dashboard.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-2">
                  <div className="mt-0.5 bg-zinc-200 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-300 p-0.5 rounded-full h-fit">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white">{item.title}</h4>
                    <p className="text-[10px] text-zinc-500 leading-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            {stats.map((stat, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded p-4 flex flex-col justify-between space-y-3 transition-all duration-300 hover:scale-[1.02] hover:border-zinc-300 dark:hover:border-zinc-700">
                <div className="bg-zinc-100 dark:bg-zinc-950 p-1.5 w-fit rounded border border-zinc-200 dark:border-zinc-800">
                  {stat.icon}
                </div>
                <div>
                  <span className="text-xl font-bold text-zinc-950 dark:text-white block">{stat.value}</span>
                  <span className="text-zinc-500 text-[9px] font-bold uppercase tracking-wider">{stat.label}</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* AI Estimator Embed */}
      <section id="ai-estimator" className="max-w-5xl mx-auto px-4 scroll-mt-20">
        <AiEstimator onImport={onImportToCustomForm} />
      </section>

      {/* Reviews & Testimonials */}
      <section className="max-w-[1440px] mx-auto px-4 space-y-8">
        <div className="text-center space-y-1">
          <h2 className="text-xl md:text-2xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Testimonials</h2>
          <p className="text-zinc-500 text-xs">Verified accounts from businesses who utilized our custom portals.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {reviews.map((rev, i) => (
            <div key={i} className="bg-zinc-50 dark:bg-zinc-900/45 border border-zinc-200 dark:border-zinc-800 p-5 rounded flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="flex text-zinc-400 dark:text-zinc-600">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <p className="text-zinc-600 dark:text-zinc-300 italic text-[11px] leading-relaxed">"{rev.text}"</p>
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-800/60 pt-2.5 flex justify-between items-center text-[10px]">
                <span className="text-zinc-800 dark:text-white font-bold">{rev.name}</span>
                <span className="text-zinc-500">{rev.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ & Contact Details */}
      <section id="contact" className="max-w-[1440px] mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
        
        {/* FAQs */}
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white uppercase tracking-tight">FAQ</h2>
            <p className="text-zinc-500 text-xs">Purchase rules and support workflows.</p>
          </div>
          
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded p-4 space-y-1">
                <h4 className="font-bold text-zinc-900 dark:text-white text-xs flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                  {faq.q}
                </h4>
                <p className="text-zinc-500 dark:text-zinc-400 text-[11px] leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Channels */}
        <div className="bg-zinc-50 dark:bg-zinc-900/35 border border-zinc-200 dark:border-zinc-800 rounded p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Connect channels</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">Submit a message via email, WhatsApp, or request an initial consultation estimate.</p>
            
            <div className="space-y-3 pt-2 text-xs">
              <a href="mailto:support@apexdevs.com" className="flex items-center gap-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors text-zinc-700 dark:text-zinc-300">
                <Mail className="w-4 h-4 text-zinc-500" />
                <div>
                  <span className="block text-[9px] text-zinc-400 uppercase font-bold">Email Support</span>
                  <span>support@apexdevs.com</span>
                </div>
              </a>

              <a href="https://wa.me/8801711000000" target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors text-zinc-700 dark:text-zinc-300">
                <MessageSquare className="w-4 h-4 text-zinc-500" />
                <div>
                  <span className="block text-[9px] text-zinc-400 uppercase font-bold">WhatsApp Direct</span>
                  <span>+880 1711 000000</span>
                </div>
              </a>

              <div className="flex items-center gap-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded text-zinc-700 dark:text-zinc-300">
                <Phone className="w-4 h-4 text-zinc-500" />
                <div>
                  <span className="block text-[9px] text-zinc-400 uppercase font-bold">Office Address</span>
                  <span>Uttara Sector 11, Dhaka, BD</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-zinc-200 dark:border-zinc-800 pt-5">
            <button
              onClick={onStartCustomProject}
              className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Request custom quote proposal</span>
            </button>
          </div>
        </div>

      </section>

    </div>
  );
}
