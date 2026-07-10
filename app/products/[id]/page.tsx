'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '../../types';
import { getProducts, purchaseProduct, addInvoice } from '../../utils/storage';
import Header from '@/components/Header';
import { Check, ArrowLeft, Terminal, Shield, ExternalLink, ArrowRight } from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);

  // Checkout States
  const [showCheckout, setShowCheckout] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'faq'>('overview');

  useEffect(() => {
    const prods = getProducts();
    const found = prods.find(p => p.id === params.id);
    if (found) {
      setProduct(found);
    }
  }, [params.id]);

  if (!product) {
    return (
      <div className="flex flex-col flex-1 bg-white dark:bg-[#09090b] text-zinc-500 dark:text-zinc-400 justify-center items-center h-screen">
        <p className="text-xs">Loading codebase details...</p>
      </div>
    );
  }

  const handleBuyClick = () => {
    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }
    setShowCheckout(true);
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    
    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Create Invoice on backend
      const response = await fetch('http://localhost:5000/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product.id,
          title: `Purchase: ${product.name}`,
          amount: product.price,
          tax: Math.round(product.price * 0.05),
          type: 'ready_product'
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to initialize invoice');
      }

      const invoiceId = resData.data.invoice.id;

      // 2. Create Stripe checkout session
      const payResponse = await fetch(`http://localhost:5000/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const payData = await payResponse.json();
      if (!payResponse.ok) {
        throw new Error(payData.message || 'Failed to start payment session');
      }

      const checkoutUrl = payData.data.checkoutUrl;
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Stripe checkout session was not returned');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err?.message || 'Payment initialization failed. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleCustomizationRequest = () => {
    const estimateData = {
      title: `Customized ${product.name}`,
      desc: `I want to customize the ready-made template: ${product.name}. My features request: `,
      budget: product.price + 15000,
      tech: product.technologies.join(', ')
    };
    localStorage.setItem('apex_imported_estimate', JSON.stringify(estimateData));
    localStorage.setItem('apex_user_role', 'customer');
    router.push('/user');
  };

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-300 font-sans min-h-screen transition-colors">
      <Header />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12">

        {/* Back Link */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors text-xs font-semibold mb-8 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to listings
        </button>

        {/* Core Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Technical Specs & Tabs */}
          <div className="lg:col-span-8 space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-400 text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wide">
                  {product.category}
                </span>
                <span className="text-[10px] text-zinc-500 dark:text-zinc-500">v{product.version}</span>
              </div>
              <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">{product.name}</h1>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed max-w-2xl">{product.description}</p>
            </div>

            {/* Tech Tags */}
            <div className="flex flex-wrap gap-1.5 py-1">
              {product.technologies.map((t, idx) => (
                <span key={idx} className="bg-zinc-100 dark:bg-[#161618] border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded text-[10px] font-mono">
                  {t}
                </span>
              ))}
            </div>

            {/* Clean Flat Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 flex gap-6 text-xs font-medium text-zinc-500">
              {[
                { id: 'overview', label: 'Features' },
                { id: 'reviews', label: 'Feedback' },
                { id: 'faq', label: 'FAQ' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`pb-2 transition-colors cursor-pointer ${activeTab === t.id ? 'text-zinc-950 dark:text-white border-b-2 border-zinc-950 dark:border-white font-semibold' : 'hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
                <div className="space-y-3">
                  <span className="font-bold text-zinc-950 dark:text-white block">Functional Modules</span>
                  <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
                    {product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <span className="font-bold text-zinc-950 dark:text-white block">System Dependencies</span>
                  <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
                    {product.requirements.map((r, i) => (
                      <li key={i} className="flex items-start gap-2 font-mono text-[11px]">
                        <Terminal className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-4 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                  <span>Client Rating:</span>
                  <span className="text-zinc-950 dark:text-white font-bold">{product.rating} / 5.0</span>
                </div>

                <div className="space-y-2.5">
                  {[
                    { user: 'S. Talukder', comment: 'Clean Next.js layout structure. Integration took less than an hour.', date: '2026-06-28' },
                    { user: 'Rahman K.', comment: 'Saves considerable design and setup hours.', date: '2026-06-15' }
                  ].map((rev, i) => (
                    <div key={i} className="border border-zinc-200 dark:border-zinc-800 p-4 rounded bg-zinc-50 dark:bg-zinc-900/10 space-y-1">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-zinc-950 dark:text-white">{rev.user}</span>
                        <span className="text-zinc-500">{rev.date}</span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-normal text-[11px]">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'faq' && (
              <div className="space-y-3 text-xs">
                {[
                  { q: 'Will I receive updates?', a: 'Yes. Free updates and patch versions are downloadable directly from the dashboard client portal.' },
                  { q: 'Is a developer license included?', a: 'Standard commercial license allows 1 production domain. Select custom deal request if you require unlimited deployment keys.' }
                ].map((item, i) => (
                  <div key={i} className="space-y-1">
                    <span className="font-bold text-zinc-950 dark:text-white block">Q: {item.q}</span>
                    <p className="text-zinc-600 dark:text-zinc-400 text-[11px] leading-relaxed">A: {item.a}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Checkout Widget */}
          <div className="lg:col-span-4 space-y-6">
            <div className="border border-zinc-200 dark:border-zinc-800 p-6 rounded bg-zinc-50 dark:bg-[#121214] space-y-5">
              <div className="space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Pricing</span>
                <span className="text-xl font-extrabold text-zinc-950 dark:text-white block">{product.price.toLocaleString()} BDT</span>
              </div>

              {product.demoUrl && (
                <a
                  href={product.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 text-white rounded font-bold transition-all duration-300 cursor-pointer text-center flex items-center justify-center gap-2 text-xs shadow-lg hover:shadow-xl hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0"
                >
                  <span>Live Preview Demo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}

              <div className="space-y-2 text-xs">
                <button
                  onClick={handleBuyClick}
                  className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold transition-colors cursor-pointer text-center"
                >
                  Buy License
                </button>
                <button
                  onClick={handleCustomizationRequest}
                  className="w-full py-2 bg-transparent border border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 text-zinc-700 dark:text-zinc-300 rounded font-semibold transition-colors cursor-pointer text-center"
                >
                  Request Customization
                </button>
              </div>

              {/* Purchase Notice */}
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 space-y-3 text-[10px] text-zinc-500 font-medium">
                <div className="bg-zinc-100/50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800/80 p-3 rounded space-y-2 font-normal text-zinc-500">
                  <div className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[8px] flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500" />
                    <span>Purchase &amp; Support Info</span>
                  </div>
                  <p className="leading-relaxed">
                    Paying the listed price grants you immediate license ownership and codebase zip access.
                  </p>
                  <p className="leading-relaxed">
                    Every template purchase includes <strong className="text-zinc-900 dark:text-white">6 months of free support and maintenance</strong> covering bugs and version updates.
                  </p>
                  <div className="border-t border-zinc-205 dark:border-zinc-800/85 pt-2 mt-1">
                    <p className="leading-relaxed font-bold text-zinc-800 dark:text-zinc-300">
                      Need Permanent Support?
                    </p>
                    <p className="leading-relaxed mt-0.5">
                      If you require lifetime support, additional customized features, or a dedicated developer workspace, you can request a <strong className="text-zinc-950 dark:text-white">Custom Deal</strong> for separate estimation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Instant dispatch via Client Portal</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Stripe Payment Checkout overlay */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl relative font-sans">
            <button 
              onClick={() => setShowCheckout(false)} 
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            >
              ✕
            </button>

            <div className="bg-zinc-50 dark:bg-zinc-950 py-3.5 px-6 border-b border-zinc-200 dark:border-zinc-850 flex justify-between items-center">
              <span className="font-extrabold text-[10px] text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-zinc-400" /> Stripe Secure Checkout
              </span>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wide">License Order</span>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-5 text-xs">
              {errorMessage && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-3 rounded text-[10px] font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* Order Invoice Breakdown */}
              <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-lg space-y-2">
                <div className="text-center pb-2 border-b border-zinc-200/60 dark:border-zinc-900/60">
                  <span className="text-zinc-500 text-[9px] block uppercase tracking-wider">Item Selected</span>
                  <span className="font-bold text-zinc-950 dark:text-white text-xs block truncate mt-0.5">{product.name}</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Base Price</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{product.price.toLocaleString()} BDT</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>VAT (5%)</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{(Math.round(product.price * 0.05)).toLocaleString()} BDT</span>
                </div>
                <div className="flex justify-between text-xs pt-1.5 border-t border-zinc-200/60 dark:border-zinc-900/60 font-bold">
                  <span className="text-zinc-900 dark:text-white">Total Amount</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{(product.price + Math.round(product.price * 0.05)).toLocaleString()} BDT</span>
                </div>
              </div>

              {/* Card illustration decoration */}
              <div className="relative h-20 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 dark:from-violet-600/5 dark:to-indigo-600/5 border border-zinc-200/50 dark:border-zinc-850 rounded-lg flex items-center justify-center overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                <div className="flex items-center gap-3 z-10">
                  {/* Credit Card Icon representation */}
                  <div className="w-10 h-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded flex flex-col justify-between p-1 shadow-md border border-zinc-800 dark:border-zinc-200">
                    <span className="text-[4px] font-bold tracking-widest font-mono">STRIPE</span>
                    <span className="text-[5px] text-right font-mono mt-1">••••</span>
                  </div>
                  <div>
                    <span className="font-bold text-zinc-900 dark:text-white text-[10px] block">Pay Securely with Card</span>
                    <span className="text-zinc-400 text-[8px] block">Visa, Mastercard, American Express</span>
                  </div>
                </div>
              </div>

              {isProcessing ? (
                <button
                  disabled
                  className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-bold flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider opacity-60"
                >
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400 border-t-white animate-spin"></span>
                  Redirecting to Stripe...
                </button>
              ) : (
                <button
                  type="submit"
                  className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-lg font-bold transition-all hover:scale-[1.01] cursor-pointer text-center text-[10px] uppercase tracking-wider shadow-md flex items-center justify-center gap-1.5"
                >
                  Proceed to Payment <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </form>
          </div>
        </div>
      )}

      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#09090b] py-8 text-center text-xs text-zinc-500">
        <p>© 2026 Hossen Shop. All rights reserved.</p>
      </footer>
    </div>
  );
}
