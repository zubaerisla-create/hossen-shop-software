'use client';

import React, { useState } from 'react';
import { Product } from '../types';
import { X, ExternalLink, BookOpen, Shield, Download, Check, Star, RefreshCw, Smartphone, CreditCard, Gift, AlertCircle, ShoppingBag } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  isLoggedIn: boolean;
  onBuySuccess: (productId: string, price: number, name: string) => void;
  onRequestCustomization: (product: Product) => void;
  onOpenLogin: () => void;
}

export default function ProductDetailModal({
  product,
  onClose,
  isLoggedIn,
  onBuySuccess,
  onRequestCustomization,
  onOpenLogin
}: ProductDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'docs' | 'changelog' | 'reviews' | 'faq'>('details');
  const [checkoutStep, setCheckoutStep] = useState<'none' | 'method' | 'paying' | 'success'>('none');
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'card'>('bkash');
  const [phoneNum, setPhoneNum] = useState('');
  const [pin, setPin] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  const applyCoupon = () => {
    if (couponCode.toUpperCase() === 'FIRST10' || couponCode.toUpperCase() === 'AGENCY') {
      setAppliedDiscount(Math.round(product.price * 0.1));
    }
  };

  const handlePurchase = () => {
    if (!isLoggedIn) {
      onOpenLogin();
      return;
    }
    setCheckoutStep('method');
  };

  const submitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('paying');
    setTimeout(() => {
      setCheckoutStep('success');
      onBuySuccess(product.id, product.price - appliedDiscount, product.name);
    }, 2500);
  };

  const finalPrice = product.price - appliedDiscount;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]">
        {/* Left Side: Product Image & Overview */}
        <div className="w-full md:w-5/12 bg-zinc-900 border-r border-zinc-800 p-6 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="flex justify-between items-start mb-4">
              <span className="bg-violet-500/10 border border-violet-500/20 text-violet-300 px-3 py-1 rounded-full text-xs font-semibold">
                {product.category}
              </span>
              <button onClick={onClose} className="md:hidden p-1 text-zinc-400 hover:text-white bg-zinc-800 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight mb-2">{product.name}</h2>
            
            <div className="flex items-center gap-2 mb-4">
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-4 h-4 fill-current ${i < Math.round(product.rating) ? 'text-amber-400' : 'text-zinc-600'}`} />
                ))}
              </div>
              <span className="text-zinc-400 text-xs font-medium">({product.reviews.length} reviews)</span>
              <span className="text-zinc-500 text-xs">•</span>
              <span className="text-zinc-400 text-xs">{product.salesCount} sold</span>
            </div>

            <div className="space-y-4">
              <img src={product.images[0]} alt={product.name} className="w-full h-44 object-cover rounded-xl border border-zinc-800" />
              
              <p className="text-zinc-400 text-xs leading-relaxed">{product.description}</p>

              <div>
                <span className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">Technologies Used</span>
                <div className="flex flex-wrap gap-1.5">
                  {product.technologies.map((tech, i) => (
                    <span key={i} className="bg-zinc-950 border border-zinc-800 text-zinc-300 text-[10px] px-2 py-0.5 rounded font-mono">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t border-zinc-800 pt-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <span className="block text-xs text-zinc-500 font-medium">One-time payment</span>
                <span className="text-2xl font-black text-white">{product.price.toLocaleString()} BDT</span>
              </div>
              <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                <Shield className="w-3 h-3 text-emerald-400" /> Secure checkout
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handlePurchase}
                className="flex-1 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Buy Product</span>
              </button>
              <button
                onClick={() => onRequestCustomization(product)}
                className="flex-1 py-3 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-medium transition-all"
              >
                Request Customization
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Details & Checkout Drawer */}
        <div className="w-full md:w-7/12 p-6 flex flex-col justify-between overflow-y-auto bg-zinc-950 relative">
          <button onClick={onClose} className="hidden md:flex absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-full transition-all">
            <X className="w-4 h-4" />
          </button>

          {checkoutStep === 'none' && (
            <div className="flex flex-col h-full">
              {/* Tab Selector */}
              <div className="flex gap-2 border-b border-zinc-900 pb-2 mb-4">
                {(['details', 'docs', 'changelog', 'reviews', 'faq'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === tab
                        ? 'bg-zinc-900 text-white border border-zinc-800'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Contents */}
              <div className="flex-1 overflow-y-auto pr-1 text-xs space-y-4">
                {activeTab === 'details' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-zinc-200 font-bold text-sm mb-2">Key Features</h4>
                      <ul className="space-y-2">
                        {product.features.map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-zinc-400 leading-normal">
                            <span className="text-violet-400 mt-0.5">✓</span>
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-zinc-900 pt-3">
                      <h4 className="text-zinc-200 font-bold text-sm mb-2">System Requirements</h4>
                      <ul className="space-y-2">
                        {product.requirements.map((req, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-zinc-400 leading-normal">
                            <span className="text-zinc-500 mt-0.5">•</span>
                            <span>{req}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="border-t border-zinc-900 pt-3">
                      <h4 className="text-zinc-200 font-bold text-sm mb-2">License Terms</h4>
                      <p className="text-zinc-400 leading-relaxed bg-zinc-900 border border-zinc-800 rounded-lg p-3">
                        {product.license}
                      </p>
                    </div>
                  </div>
                )}

                {activeTab === 'docs' && (
                  <div className="space-y-4">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-bold mb-1">Online Documentation</h4>
                        <p className="text-zinc-400 text-[10px]">Read full setup steps, API schema, database configuration.</p>
                      </div>
                      <a
                        href={product.documentationUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1"
                      >
                        <BookOpen className="w-3.5 h-3.5" /> Open Docs
                      </a>
                    </div>

                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-white font-bold mb-1">Live Sandbox Demo</h4>
                        <p className="text-zinc-400 text-[10px]">Test admin panel, forms and check responsive designs live.</p>
                      </div>
                      <a
                        href={product.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="bg-zinc-950 border border-zinc-800 text-zinc-300 hover:text-white px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View Demo
                      </a>
                    </div>
                  </div>
                )}

                {activeTab === 'changelog' && (
                  <div className="space-y-4">
                    {product.changelog.map((log, i) => (
                      <div key={i} className="border-l-2 border-violet-500/30 pl-4 space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-white font-bold">v{log.version}</span>
                          <span className="text-zinc-500 text-[10px]">{log.date}</span>
                        </div>
                        <ul className="space-y-1 text-zinc-400 mt-1">
                          {log.changes.map((change, idx) => (
                            <li key={idx} className="list-disc list-inside">{change}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-4">
                    {product.reviews.map((rev, idx) => (
                      <div key={idx} className="bg-zinc-900/50 border border-zinc-900 rounded-xl p-4 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-white font-bold">{rev.user}</span>
                          <div className="flex text-amber-400">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 fill-current ${i < rev.rating ? 'text-amber-400' : 'text-zinc-700'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-zinc-400 italic leading-relaxed">"{rev.comment}"</p>
                        <span className="block text-zinc-500 text-[10px] text-right">{rev.date}</span>
                      </div>
                    ))}
                  </div>
                )}

                {activeTab === 'faq' && (
                  <div className="space-y-3">
                    {product.faqs.length > 0 ? (
                      product.faqs.map((faq, idx) => (
                        <div key={idx} className="space-y-1 bg-zinc-900/30 border border-zinc-900 p-3 rounded-lg">
                          <span className="block text-white font-semibold">Q: {faq.q}</span>
                          <p className="text-zinc-400 leading-normal">A: {faq.a}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-zinc-500 text-center py-4">No FAQ entries available. Ask in Support!</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Checkout Steps */}
          {checkoutStep === 'method' && (
            <div className="flex flex-col h-full justify-between animate-fadeIn text-xs">
              <div>
                <h3 className="text-base font-bold text-white mb-4">Complete Payment</h3>
                
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 mb-4">
                  <div className="flex justify-between text-zinc-400 mb-1">
                    <span>Product Cost</span>
                    <span>{product.price.toLocaleString()} BDT</span>
                  </div>
                  {appliedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-400 mb-1">
                      <span>Discount</span>
                      <span>-{appliedDiscount.toLocaleString()} BDT</span>
                    </div>
                  )}
                  <div className="flex justify-between text-white font-bold text-sm border-t border-zinc-800 pt-2 mt-2">
                    <span>Total Amount</span>
                    <span>{finalPrice.toLocaleString()} BDT</span>
                  </div>
                </div>

                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setPaymentMethod('bkash')}
                    className={`flex-1 py-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'bkash'
                        ? 'border-pink-500 bg-pink-500/10 text-white'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-pink-500" />
                    <span className="font-semibold">bKash / Mobile Wallet</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`flex-1 py-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      paymentMethod === 'card'
                        ? 'border-violet-500 bg-violet-500/10 text-white'
                        : 'border-zinc-800 bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-violet-400" />
                    <span className="font-semibold">Credit/Debit Card</span>
                  </button>
                </div>

                <form onSubmit={submitPayment} className="space-y-4">
                  {paymentMethod === 'bkash' ? (
                    <div className="bg-pink-650/5 border border-pink-900/30 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-pink-500 font-bold mb-1">
                        <Smartphone className="w-4 h-4" />
                        <span>bKash Payment Gateway</span>
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">bKash Wallet Number</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g., 017XXXXXXXX"
                          value={phoneNum}
                          onChange={(e) => setPhoneNum(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-pink-500 placeholder:text-zinc-700"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">PIN Number</label>
                        <input
                          type="password"
                          required
                          placeholder="XXXX"
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-pink-500 placeholder:text-zinc-700"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl space-y-3">
                      <div className="flex items-center gap-2 text-violet-400 font-bold mb-1">
                        <CreditCard className="w-4 h-4" />
                        <span>Card Checkout</span>
                      </div>
                      <div>
                        <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Card Number</label>
                        <input
                          type="text"
                          required
                          placeholder="XXXX XXXX XXXX XXXX"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500 placeholder:text-zinc-700"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">Expiry Date</label>
                          <input
                            type="text"
                            required
                            placeholder="MM/YY"
                            value={cardExpiry}
                            onChange={(e) => setCardExpiry(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500 placeholder:text-zinc-700"
                          />
                        </div>
                        <div>
                          <label className="block text-zinc-400 text-[10px] uppercase font-bold mb-1">CVV</label>
                          <input
                            type="password"
                            required
                            placeholder="XXX"
                            value={cardCvv}
                            onChange={(e) => setCardCvv(e.target.value)}
                            className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-violet-500 placeholder:text-zinc-700"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Coupon Code Input */}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Coupon Code (e.g. FIRST10)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 bg-zinc-950 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-zinc-700 placeholder:text-zinc-700 uppercase"
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white px-3 rounded-lg text-xs font-semibold cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-lg transition-all mt-4"
                  >
                    <span>Proceed & Pay {finalPrice.toLocaleString()} BDT</span>
                  </button>
                </form>
              </div>

              <button
                onClick={() => setCheckoutStep('none')}
                className="mt-6 text-zinc-500 hover:text-zinc-300 text-center block w-full py-1 text-[11px]"
              >
                Go back to product details
              </button>
            </div>
          )}

          {checkoutStep === 'paying' && (
            <div className="flex flex-col items-center justify-center h-full py-12 animate-pulse">
              <RefreshCw className="w-12 h-12 text-pink-500 animate-spin mb-4" />
              <p className="text-white font-bold text-sm mb-1">Contacting Payment Gateway API...</p>
              <p className="text-zinc-500 text-[11px]">Please do not close this window or press back button.</p>
            </div>
          )}

          {checkoutStep === 'success' && (
            <div className="flex flex-col items-center justify-center text-center h-full py-8 space-y-4 animate-fadeIn">
              <div className="bg-emerald-500/10 p-3 rounded-full border border-emerald-500/30 text-emerald-400">
                <Check className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Payment Successful!</h3>
                <p className="text-zinc-400 text-xs">Thank you for your purchase. Your license and files are ready.</p>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 w-full space-y-2 text-left text-[11px]">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Transaction ID</span>
                  <span className="text-white font-mono uppercase">tx-bk-{Math.floor(Math.random() * 9000000) + 1000000}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">License Type</span>
                  <span className="text-emerald-400 font-semibold">{product.license.split('(')[0]}</span>
                </div>
                <div className="flex justify-between border-t border-zinc-800 pt-2 mt-2">
                  <span className="text-zinc-400">Paid amount</span>
                  <span className="text-white font-bold">{finalPrice.toLocaleString()} BDT</span>
                </div>
              </div>

              <div className="w-full space-y-2">
                <button
                  onClick={() => {
                    setCheckoutStep('none');
                    onClose();
                  }}
                  className="w-full py-3 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  <Download className="w-4 h-4" /> Download Files Now
                </button>
                <p className="text-zinc-500 text-[10px]">A PDF Invoice has been generated and saved under your Profile tab.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
