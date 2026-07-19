'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product } from '../../types';
import { getProducts, purchaseProduct, addInvoice, saveProducts, getPurchasedProducts } from '../../utils/storage';
import { useCurrency } from '@/app/utils/currency';
import Header from '@/components/Header';
import AuthModal from '@/components/AuthModal';
import PreOrderModal from '@/components/PreOrderModal';
import Link from 'next/link';
import { Check, ArrowLeft, Terminal, Shield, ExternalLink, ArrowRight } from 'lucide-react';
import { showSuccessAlert, showErrorAlert, showSuccessToast, showErrorToast } from '../../utils/alert';
import { API_BASE_URL } from '@/app/utils/api';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);

  // Checkout States
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Multi-currency and dynamic gateway states
  const [selectedGateway, setSelectedGateway] = useState<'stripe' | 'bkash'>('bkash');
  const [selectedCurrency, setSelectedCurrency] = useState<'BDT' | 'USD'>('BDT');
  const [showBkashModal, setShowBkashModal] = useState(false);
  const [bkashStep, setBkashStep] = useState<1 | 2 | 3 | 4>(1);
  const [bkashWallet, setBkashWallet] = useState('');
  const [bkashOTP, setBkashOTP] = useState('');
  const [bkashPIN, setBkashPIN] = useState('');
  const [bkashInvoiceId, setBkashInvoiceId] = useState('');
  const [bkashAmount, setBkashAmount] = useState(0);

  const { format, currencyCode } = useCurrency();

  useEffect(() => {
    if (currencyCode === 'BDT') {
      setSelectedCurrency('BDT');
      setSelectedGateway('bkash');
    } else {
      setSelectedCurrency('USD');
      setSelectedGateway('stripe');
    }
  }, [currencyCode]);

  const handleCurrencyChange = (curr: 'BDT' | 'USD') => {
    setSelectedCurrency(curr);
    if (curr === 'USD') {
      setSelectedGateway('stripe');
    } else {
      setSelectedGateway('bkash');
    }
  };

  const handleGatewayChange = (gw: 'stripe' | 'bkash') => {
    setSelectedGateway(gw);
    if (gw === 'bkash') {
      setSelectedCurrency('BDT');
    }
  };

  // Active Tab
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'faq'>('reviews');

  // Purchased & Feedback States
  const [isPurchased, setIsPurchased] = useState(false);
  const [feedbacks, setFeedbacks] = useState<{ user: string; comment: string; date: string }[]>([]);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [commentError, setCommentError] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRedirectUrl, setAuthRedirectUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const fetchProduct = async () => {
      // 1. Try local storage first
      const prods = getProducts();
      const found = prods.find(p => p.id === params.id);
      if (found) {
        setProduct(found);
      }

      // 2. Fetch from backend API
      try {
        const response = await fetch(`${API_BASE_URL}/api/products/${params.id}`);
        if (response.ok) {
          const resData = await response.json();
          if (resData.data?.product) {
            setProduct(resData.data.product);
            
            // Sync local storage so it has this product too
            if (!prods.some(p => p.id === params.id)) {
              saveProducts([...prods, resData.data.product]);
            } else {
              saveProducts(prods.map(p => p.id === params.id ? resData.data.product : p));
            }
          }
        }
      } catch (err) {
        console.error('Failed to fetch product details from backend:', err);
      }
    };

    fetchProduct();
  }, [params.id]);

  useEffect(() => {
    if (!product) return;

    // Check if purchased
    const purchasedIds = getPurchasedProducts();
    if (purchasedIds.includes(product.id)) {
      setIsPurchased(true);
    }

    // Load feedbacks from database if present, otherwise fall back to local storage
    if (product.reviews && Array.isArray(product.reviews) && product.reviews.length > 0) {
      setFeedbacks(product.reviews as any);
    } else {
      const key = `apex_feedbacks_${product.id}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        setFeedbacks(JSON.parse(stored));
      } else {
        const initial = [
          { user: 'S. Talukder', comment: 'Clean Next.js layout structure. Integration took less than an hour.', date: '2026-06-28' },
          { user: 'Rahman K.', comment: 'Saves considerable design and setup hours.', date: '2026-06-15' }
        ];
        localStorage.setItem(key, JSON.stringify(initial));
        setFeedbacks(initial);
      }
    }
  }, [product]);

  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('apex_user_token');
      if (token) {
        setShowAuthModal(false);
        // Refresh purchased state
        if (product) {
          const purchasedIds = getPurchasedProducts();
          if (purchasedIds.includes(product.id)) {
            setIsPurchased(true);
          }
        }
      }
    };

    window.addEventListener('auth-change', handleAuthChange);
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [product]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    setCommentError('');

    if (!product) return;

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      setAuthRedirectUrl(undefined);
      setShowAuthModal(true);
      return;
    }

    if (!newComment.trim()) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          comment: newComment.trim(),
          rating: newRating
        })
      });

      const resData = await response.json();
      if (response.ok) {
        if (resData.data?.product?.reviews) {
          const dbReviews = resData.data.product.reviews;
          setFeedbacks(dbReviews);
          localStorage.setItem(`apex_feedbacks_${product.id}`, JSON.stringify(dbReviews));
          setNewComment('');
          setNewRating(5);
          setHoverRating(0);
          showSuccessToast('Review submitted successfully!');
          return;
        }
      } else {
        setCommentError(resData.message || 'Failed to submit feedback.');
        showErrorToast(resData.message || 'Failed to submit feedback.');
        return;
      }
    } catch (err) {
      console.error('Failed to post review to backend, falling back to local storage:', err);
    }

    // Fallback to local storage only
    const userName = localStorage.getItem('apex_user_name') || 'Customer';
    const userAvatar = localStorage.getItem('apex_user_avatar') || null;
    const newFeedback = {
      user: userName,
      avatar: userAvatar,
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toISOString().split('T')[0]
    };

    const updated = [newFeedback, ...feedbacks];
    setFeedbacks(updated);
    localStorage.setItem(`apex_feedbacks_${product.id}`, JSON.stringify(updated));
    setNewComment('');
    setNewRating(5);
    setHoverRating(0);
    showSuccessToast('Review submitted successfully!');
  };

  if (!product) {
    return (
      <div className="flex flex-col flex-1 bg-white dark:bg-[#09090b] text-zinc-500 dark:text-zinc-400 justify-center items-center h-screen">
        <p className="text-xs">Loading codebase details...</p>
      </div>
    );
  }

  const basePrice = selectedCurrency === 'USD' ? Math.round(product.price / 120) : product.price;
  const vatAmount = Math.round(basePrice * 0.05);
  const totalAmount = basePrice + vatAmount;
  const currencySymbol = selectedCurrency === 'USD' ? '$' : 'BDT';

  const handleBuyClick = () => {
    setShowPreOrderModal(true);
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
      const response = await fetch(`${API_BASE_URL}/api/invoices`, {
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

      // 2. Create payment session
      const payResponse = await fetch(`${API_BASE_URL}/api/invoices/${invoiceId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gateway: selectedGateway,
          currency: selectedCurrency
        })
      });

      const payData = await payResponse.json();
      if (!payResponse.ok) {
        throw new Error(payData.message || 'Failed to start payment session');
      }

      const checkoutUrl = payData.data.checkoutUrl;
      if (checkoutUrl) {
        if (checkoutUrl.startsWith('mock_bkash_checkout')) {
          setBkashInvoiceId(invoiceId);
          setBkashAmount(product.price + Math.round(product.price * 0.05));
          setBkashStep(1);
          setShowBkashModal(true);
          setShowCheckout(false);
          setIsProcessing(false);
        } else {
          window.location.href = checkoutUrl;
        }
      } else {
        throw new Error('Payment gateway session URL was not returned');
      }
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || 'Payment initialization failed. Please try again.';
      setErrorMessage(errMsg);
      showErrorAlert('Payment Initialization Failed', errMsg);
      setIsProcessing(false);
    }
  };

  const handleCustomizationRequest = () => {
    const token = localStorage.getItem('apex_user_token');
    const estimateData = {
      title: `Customized ${product.name}`,
      desc: `I want to customize the ready-made template: ${product.name}. My features request: `,
      budget: product.price + 15000,
      tech: product.technologies.join(', ')
    };
    localStorage.setItem('apex_imported_estimate', JSON.stringify(estimateData));

    if (!token) {
      setAuthRedirectUrl('/user/deals');
      setShowAuthModal(true);
      return;
    }
    
    router.push('/user/deals');
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

            {/* Live Demo Video Section */}
            {product.videoUrl && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 font-bold text-zinc-950 dark:text-white uppercase tracking-wider text-[10px]">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Interactive Product Walkthrough</span>
                  </div>
                  <span className="text-zinc-450 dark:text-zinc-500 text-[10px] font-mono">Demo Preview</span>
                </div>
                
                {/* Browser / Mock Window Frame */}
                <div className="border border-zinc-200 dark:border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl bg-zinc-50 dark:bg-[#121214]/60">
                  {/* Browser Header Bar */}
                  <div className="bg-zinc-150/80 dark:bg-zinc-950/80 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-400 dark:bg-red-500/80 block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 dark:bg-amber-500/80 block"></span>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 dark:bg-emerald-500/80 block"></span>
                    </div>
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono select-none truncate max-w-[200px] md:max-w-xs">{product.name.toLowerCase().replace(/\s+/g, '_')}_demo.mp4</span>
                    <div className="w-12"></div> {/* spacer */}
                  </div>
                  
                  {/* Video Element */}
                  <div className="relative aspect-video bg-black flex items-center justify-center">
                    <video
                      src={product.videoUrl}
                      controls
                      autoPlay
                      muted
                      loop
                      playsInline
                      poster={product.images[0]}
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* High-Contrast Segmented Tabs */}
            <div className="flex gap-1.5 bg-zinc-100 dark:bg-zinc-900/60 p-1 rounded-lg max-w-sm mb-6 border border-zinc-200/50 dark:border-zinc-800/80 shadow-sm">
              {[
                { id: 'reviews', label: 'Feedback' },
                { id: 'overview', label: 'Features' },
                { id: 'faq', label: 'FAQ' }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex-1 py-2 px-3 rounded-md text-[10px] font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer text-center ${
                    activeTab === t.id
                      ? 'bg-white dark:bg-zinc-800 text-[#6A2D3D] dark:text-[#fca5a5] shadow-md ring-1 ring-zinc-200/10'
                      : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
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
              <div className="space-y-5 text-xs">
                <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 font-medium">
                  <span>Client Rating:</span>
                  <span className="text-zinc-950 dark:text-white font-bold">{product.rating} / 5.0</span>
                </div>

                {/* Leave feedback form */}
                <form onSubmit={handleAddComment} className="border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/20 space-y-3.5">
                  <span className="font-bold text-zinc-950 dark:text-white block text-[10px] uppercase tracking-wider">Leave a Review</span>

                  {/* Interactive Star Rating Picker */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Your Rating</span>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => {
                            const token = localStorage.getItem('apex_user_token');
                            if (!token) {
                              setAuthRedirectUrl(undefined);
                              setShowAuthModal(true);
                              return;
                            }
                            setNewRating(star);
                          }}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="cursor-pointer transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                        >
                          <svg
                            className={`w-6 h-6 transition-colors ${
                              star <= (hoverRating || newRating)
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-zinc-300 dark:text-zinc-700 fill-zinc-300 dark:fill-zinc-700'
                            }`}
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </button>
                      ))}
                      <span className="ml-2 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {hoverRating || newRating}.0 / 5.0
                      </span>
                    </div>
                  </div>

                  {/* Comment Textarea */}
                  <div className="space-y-1.5">
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wide">Your Review</span>
                    <textarea
                      value={newComment}
                      onChange={(e) => {
                        setNewComment(e.target.value);
                        setCommentError('');
                      }}
                      onFocus={() => {
                        const token = localStorage.getItem('apex_user_token');
                        if (!token) {
                          setAuthRedirectUrl(undefined);
                          setShowAuthModal(true);
                        }
                      }}
                      placeholder="Write your honest review, feedback or experience with this template..."
                      className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 rounded-lg p-3 text-xs font-semibold focus:outline-none min-h-[80px] resize-y transition-colors"
                    />
                  </div>

                  <div className="flex justify-between items-center gap-4">
                    <div className="text-red-500 font-bold text-[10px] uppercase tracking-wide">
                      {commentError}
                    </div>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-5 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded-lg text-[10px] uppercase tracking-wider cursor-pointer transition-all hover:scale-[1.02] active:scale-100 shadow-sm"
                    >
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                      Post Review
                    </button>
                  </div>
                </form>

                <div className="space-y-3">
                  {feedbacks.map((rev: any, i) => (
                    <div key={i} className="border border-zinc-200 dark:border-zinc-800 p-4 rounded-xl bg-zinc-50/50 dark:bg-zinc-900/10 flex gap-3 items-start transition-all hover:border-zinc-300 dark:hover:border-zinc-700">
                      {/* Avatar */}
                      <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 shadow-xs font-bold text-xs uppercase text-zinc-600 dark:text-zinc-300 select-none">
                        {rev.avatar ? (
                          <img src={rev.avatar} alt={rev.user} className="w-full h-full object-cover" />
                        ) : (
                          rev.user ? rev.user.charAt(0) : 'C'
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap justify-between items-center gap-1 text-[10px]">
                          <span className="font-bold text-zinc-950 dark:text-white">{rev.user}</span>
                          <span className="text-zinc-500 font-mono">
                            {rev.date ? (rev.date.includes('T') ? rev.date.split('T')[0] : rev.date) : ''}
                          </span>
                        </div>

                        {/* Star display */}
                        {rev.rating && (
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= rev.rating
                                    ? 'text-amber-400 fill-amber-400'
                                    : 'text-zinc-300 dark:text-zinc-700 fill-zinc-300 dark:fill-zinc-700'
                                }`}
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                              </svg>
                            ))}
                            <span className="ml-1 text-[9px] font-bold text-zinc-500">{Number(rev.rating).toFixed(1)}</span>
                          </div>
                        )}

                        <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">{rev.comment}</p>
                      </div>
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
          <div className="lg:col-span-4 lg:sticky lg:top-[92px] space-y-6">
            <div className="border border-zinc-200 dark:border-zinc-800 p-6 rounded bg-zinc-50 dark:bg-[#121214] space-y-5">
              <div className="space-y-1">
                <span className="text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Pricing</span>
                <span className="text-xl font-extrabold text-zinc-950 dark:text-white block">{format(product.price)}</span>
              </div>

              {isPurchased ? (
                <div className="space-y-3">
                  <div className="bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 text-emerald-600 dark:text-emerald-405 p-3 rounded flex flex-col items-center justify-center gap-1 text-center">
                    <span className="text-[9px] uppercase font-black tracking-widest text-emerald-600 dark:text-emerald-400">License Acquired</span>
                    <span className="text-[10px] font-bold text-zinc-700 dark:text-zinc-300">You already purchased this product.</span>
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

                  <Link
                    href={`/user/products/${product.id}`}
                    className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-1.5 text-xs"
                  >
                    <span>View Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    onClick={handleCustomizationRequest}
                    className="w-full py-2 bg-transparent border border-zinc-300 dark:border-zinc-700 hover:border-zinc-500 text-zinc-700 dark:text-zinc-300 rounded font-semibold transition-colors cursor-pointer text-center text-xs"
                  >
                    Request Customization
                  </button>
                </div>
              ) : (
                <>
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
                </>
              )}

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

      {/* Stripe/bKash Payment Checkout overlay */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 w-full max-w-sm rounded-xl overflow-hidden shadow-2xl relative font-sans animate-scaleIn">
            <button 
              onClick={() => setShowCheckout(false)} 
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer"
            >
              ✕
            </button>

            <div className="bg-zinc-50 dark:bg-zinc-950 py-3.5 px-6 border-b border-zinc-200 dark:border-zinc-850 flex justify-between items-center">
              <span className="font-extrabold text-[10px] text-zinc-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-zinc-400" /> Secure Checkout
              </span>
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wide">License Order</span>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-5 text-xs">
              {errorMessage && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 p-3 rounded text-[10px] font-semibold">
                  {errorMessage}
                </div>
              )}

              {/* Currency & Payment Gateway Selectors */}
              <div className="space-y-3">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Select Currency</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleCurrencyChange('BDT')}
                      className={`py-1.5 px-3 rounded-lg font-bold border transition-all text-center cursor-pointer text-[10px] ${
                        selectedCurrency === 'BDT'
                          ? 'bg-zinc-950 dark:bg-white text-white dark:text-black border-transparent'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      🇧🇩 BDT (৳)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCurrencyChange('USD')}
                      className={`py-1.5 px-3 rounded-lg font-bold border transition-all text-center cursor-pointer text-[10px] ${
                        selectedCurrency === 'USD'
                          ? 'bg-zinc-950 dark:bg-white text-white dark:text-black border-transparent'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      🇺🇸 USD ($)
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">Payment Method</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleGatewayChange('bkash')}
                      disabled={selectedCurrency === 'USD'}
                      className={`py-1.5 px-3 rounded-lg font-bold border transition-all text-center cursor-pointer text-[10px] flex items-center justify-center gap-1.5 ${
                        selectedGateway === 'bkash'
                          ? 'bg-[#e2136e] text-white border-transparent'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white disabled:opacity-40 disabled:cursor-not-allowed'
                      }`}
                    >
                      <span>bKash</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleGatewayChange('stripe')}
                      className={`py-1.5 px-3 rounded-lg font-bold border transition-all text-center cursor-pointer text-[10px] flex items-center justify-center gap-1.5 ${
                        selectedGateway === 'stripe'
                          ? 'bg-[#635bff] text-white border-transparent'
                          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
                      }`}
                    >
                      <span>Stripe</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Order Invoice Breakdown */}
              <div className="border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-lg space-y-2">
                <div className="text-center pb-2 border-b border-zinc-200/60 dark:border-zinc-900/60">
                  <span className="text-zinc-500 text-[9px] block uppercase tracking-wider">Item Selected</span>
                  <span className="font-bold text-zinc-950 dark:text-white text-xs block truncate mt-0.5">{product.name}</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>Base Price</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{basePrice.toLocaleString()} {currencySymbol}</span>
                </div>
                <div className="flex justify-between text-[10px] text-zinc-500">
                  <span>VAT (5%)</span>
                  <span className="font-semibold text-zinc-900 dark:text-white">{vatAmount.toLocaleString()} {currencySymbol}</span>
                </div>
                <div className="flex justify-between text-xs pt-1.5 border-t border-zinc-200/60 dark:border-zinc-900/60 font-bold">
                  <span className="text-zinc-900 dark:text-white">Total Amount</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{totalAmount.toLocaleString()} {currencySymbol}</span>
                </div>
              </div>

              {/* Gateway decoration */}
              <div className="relative h-20 bg-gradient-to-br from-violet-600/10 to-indigo-600/10 dark:from-violet-600/5 dark:to-indigo-600/5 border border-zinc-200/50 dark:border-zinc-850 rounded-lg flex items-center justify-center overflow-hidden transition-all duration-300">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                {selectedGateway === 'stripe' ? (
                  <div className="flex items-center gap-3 z-10">
                    <div className="w-10 h-6 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded flex flex-col justify-between p-1 shadow-md border border-zinc-800 dark:border-zinc-200">
                      <span className="text-[4px] font-bold tracking-widest font-mono">STRIPE</span>
                      <span className="text-[5px] text-right font-mono mt-1">••••</span>
                    </div>
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-white text-[10px] block">Pay Securely with Card</span>
                      <span className="text-zinc-400 text-[8px] block">Visa, Mastercard, American Express</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 z-10">
                    <div className="w-10 h-6 bg-[#e2136e] text-white rounded flex items-center justify-center font-bold text-[8px] tracking-wide shadow-md border border-[#d12053]">
                      bKash
                    </div>
                    <div>
                      <span className="font-bold text-zinc-900 dark:text-white text-[10px] block">Pay Securely with bKash</span>
                      <span className="text-zinc-400 text-[8px] block">Instant mobile wallet authorization</span>
                    </div>
                  </div>
                )}
              </div>

              {isProcessing ? (
                <button
                  disabled
                  className="w-full py-2.5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-lg font-bold flex items-center justify-center gap-2 text-[10px] uppercase tracking-wider opacity-60"
                >
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400 border-t-white animate-spin"></span>
                  {selectedGateway === 'stripe' ? 'Redirecting to Stripe...' : 'Initializing bKash Wallet...'}
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

      {/* Simulated bKash checkout overlay */}
      {showBkashModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-[4px] animate-fadeIn">
          <div className="bg-[#e2136e] w-full max-w-[370px] rounded-2xl overflow-hidden shadow-2xl relative font-sans flex flex-col items-center text-white border border-[#d12053]">
            
            {/* Header with bKash Logo */}
            <div className="w-full bg-[#d12053] py-4 px-6 flex justify-between items-center border-b border-[#e2136e]/20">
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-wider text-sm">bKash</span>
                <span className="text-[10px] bg-white text-[#e2136e] font-extrabold px-1.5 py-0.5 rounded">Checkout</span>
              </div>
              <button 
                onClick={() => {
                  setShowBkashModal(false);
                  setBkashStep(1);
                  setBkashWallet('');
                  setBkashOTP('');
                  setBkashPIN('');
                }} 
                className="text-white hover:opacity-80 font-bold text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Merchant Details Block */}
            <div className="w-full bg-white text-zinc-900 px-6 py-4 flex justify-between items-center text-xs border-b border-zinc-100 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#e2136e]/10 flex items-center justify-center font-bold text-[#e2136e] text-[10px]">
                  AP
                </div>
                <div>
                  <p className="font-bold text-zinc-950 text-[11px]">Apex Software Shop</p>
                  <p className="text-zinc-500 text-[9px] font-mono">Invoice: {bkashInvoiceId.substring(0, 8)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">Amount</p>
                <p className="font-extrabold text-[#e2136e] text-xs">৳ {bkashAmount.toLocaleString()}</p>
              </div>
            </div>

            {/* Main Checkout Form Area */}
            <div className="w-full p-6 flex-1 flex flex-col justify-between min-h-[220px]">
              {bkashStep === 1 && (
                <div className="space-y-4">
                  <div className="text-center space-y-1.5">
                    <p className="text-xs font-semibold">Your bKash Account Number</p>
                    <p className="text-[10px] text-white/80">Enter your 11-digit mobile number</p>
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400 font-bold text-xs">+88</span>
                    <input
                      type="text"
                      maxLength={11}
                      placeholder="017XXXXXXXX"
                      value={bkashWallet}
                      onChange={(e) => setBkashWallet(e.target.value.replace(/\D/g, ''))}
                      className="w-full pl-12 pr-4 py-2.5 bg-white text-zinc-950 font-bold rounded-lg text-xs tracking-widest text-center shadow-inner focus:outline-none focus:ring-2 focus:ring-[#d12053]"
                    />
                  </div>
                  <div className="text-[9px] text-center text-white/70 leading-normal">
                    By clicking Proceed, you agree to the terms and conditions of bKash checkout.
                  </div>
                </div>
              )}

              {bkashStep === 2 && (
                <div className="space-y-4">
                  <div className="text-center space-y-1.5">
                    <p className="text-xs font-semibold">Verification Code (OTP)</p>
                    <p className="text-[10px] text-white/80">Enter the 6-digit code sent to +88 {bkashWallet}</p>
                    <span className="inline-block text-[9px] bg-white/20 px-2 py-0.5 rounded font-mono font-bold">Helper Test Code: 123456</span>
                  </div>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="123456"
                    value={bkashOTP}
                    onChange={(e) => setBkashOTP(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-2.5 bg-white text-zinc-950 font-bold rounded-lg text-xs tracking-widest text-center shadow-inner focus:outline-none focus:ring-2 focus:ring-[#d12053]"
                  />
                </div>
              )}

              {bkashStep === 3 && (
                <div className="space-y-4">
                  <div className="text-center space-y-1.5">
                    <p className="text-xs font-semibold">Enter Account PIN</p>
                    <p className="text-[10px] text-white/80">Enter your 5-digit secret bKash PIN</p>
                  </div>
                  <input
                    type="password"
                    maxLength={5}
                    placeholder="•••••"
                    value={bkashPIN}
                    onChange={(e) => setBkashPIN(e.target.value.replace(/\D/g, ''))}
                    className="w-full py-2.5 bg-white text-zinc-950 font-bold rounded-lg text-xs tracking-widest text-center shadow-inner focus:outline-none focus:ring-2 focus:ring-[#d12053]"
                  />
                </div>
              )}

              {bkashStep === 4 && (
                <div className="flex flex-col items-center justify-center py-6 space-y-4 flex-1">
                  <div className="w-10 h-10 rounded-full border-4 border-white/20 border-t-white animate-spin"></div>
                  <div className="text-center">
                    <p className="text-xs font-bold uppercase tracking-wider">Processing payment...</p>
                    <p className="text-[9px] text-white/80 mt-1">Completing secure handshake with bKash API</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {bkashStep !== 4 && (
                <div className="grid grid-cols-2 gap-3 pt-6 border-t border-white/10 mt-6">
                  <button
                    onClick={() => {
                      if (bkashStep === 1) {
                        setShowBkashModal(false);
                      } else {
                        setBkashStep((prev) => (prev - 1) as any);
                      }
                    }}
                    className="py-2 bg-white/10 hover:bg-white/20 rounded-lg text-[10px] font-bold uppercase tracking-wider cursor-pointer text-center"
                  >
                    {bkashStep === 1 ? 'Close' : 'Back'}
                  </button>
                  <button
                    onClick={async () => {
                      if (bkashStep === 1) {
                        if (bkashWallet.length < 11) {
                          alert('Please enter a valid 11-digit bKash account number.');
                          return;
                        }
                        setBkashStep(2);
                      } else if (bkashStep === 2) {
                        if (bkashOTP !== '123456') {
                          alert('Please enter the helper OTP code: 123456');
                          return;
                        }
                        setBkashStep(3);
                      } else if (bkashStep === 3) {
                        if (bkashPIN.length < 5) {
                          alert('Please enter your 5-digit PIN.');
                          return;
                        }
                        
                        setBkashStep(4);
                        
                        // Call confirm-payment API on server to mark invoice as Paid!
                        try {
                          const token = localStorage.getItem('apex_user_token');
                          const response = await fetch(`${API_BASE_URL}/api/invoices/${bkashInvoiceId}/confirm-payment`, {
                            method: 'POST',
                            headers: {
                              'Authorization': `Bearer ${token}`
                            }
                          });
                          
                          if (response.ok) {
                            setTimeout(() => {
                              router.push(`/invoices/success?invoice_id=${bkashInvoiceId}&method=bkash`);
                            }, 2000);
                          } else {
                            throw new Error('Failed to verify payment with backend');
                          }
                        } catch (err) {
                          console.error(err);
                          alert('Payment verification failed. Please try again.');
                          setBkashStep(3);
                        }
                      }
                    }}
                    className="py-2 bg-[#d12053] hover:bg-[#b01642] border border-white/20 rounded-lg text-[10px] font-extrabold uppercase tracking-wider cursor-pointer text-center"
                  >
                    Proceed
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Brand Bar */}
            <div className="w-full bg-[#d12053] py-2.5 text-center text-[9px] text-white/60 font-mono tracking-tight border-t border-white/5">
              Secure mobile gateway • Dial *247#
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          initialMode="signin"
          isModal={true}
          redirectUrl={authRedirectUrl}
        />
      )}

      {showPreOrderModal && (
        <PreOrderModal
          isOpen={showPreOrderModal}
          onClose={() => setShowPreOrderModal(false)}
          productName={product.name}
          productPrice={product.price}
        />
      )}

      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-[#09090b] py-8 text-center text-xs text-zinc-500">
        <p>© 2026 Hosen Shop. All rights reserved.</p>
      </footer>
    </div>
  );
}
