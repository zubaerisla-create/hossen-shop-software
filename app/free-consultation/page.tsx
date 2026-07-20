'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  Code2, 
  Zap, 
  Layers, 
  Smartphone, 
  Cpu, 
  Layout, 
  Building2, 
  User, 
  Mail, 
  Phone, 
  HelpCircle,
  ArrowRight,
  MessageSquareCheck
} from 'lucide-react';
import { API_BASE_URL } from '@/app/utils/api';

const SERVICE_OPTIONS = [
  { id: 'web', title: 'Full Web Development', icon: Code2, desc: 'Next.js, React, Node.js custom web apps & platforms' },
  { id: 'mobile', title: 'Mobile App Development', icon: Smartphone, desc: 'Cross-platform iOS & Android native apps' },
  { id: 'saas', title: 'SaaS Product Engineering', icon: Layers, desc: 'Scalable multi-tenant cloud software solutions' },
  { id: 'ai', title: 'AI & Automation Integration', icon: Cpu, desc: 'LLM agents, OpenAI, RAG & workflow automation' },
  { id: 'uiux', title: 'UI/UX Design & Prototyping', icon: Layout, desc: 'Figma prototypes, design systems & brand identity' },
  { id: 'enterprise', title: 'Enterprise & ERP Systems', icon: Building2, desc: 'Custom enterprise management & legacy migration' },
];

const BUDGET_RANGES = [
  '$1,000 - $3,000',
  '$3,000 - $5,000',
  '$5,000 - $10,000',
  '$10,000+',
  'Undecided / Flexible'
];

const TIME_SLOTS = [
  'Morning (10:00 AM - 12:00 PM)',
  'Afternoon (02:00 PM - 05:00 PM)',
  'Evening (06:00 PM - 09:00 PM)'
];

export default function FreeConsultationPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    serviceType: 'Full Web Development',
    budget: '$3,000 - $5,000',
    preferredDate: '',
    preferredTime: 'Afternoon (02:00 PM - 05:00 PM)',
    message: ''
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [bookingRef, setBookingRef] = useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/consultations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to submit consultation request');
      }

      setSubmitted(true);
      if (data.data?.consultation?.id) {
        setBookingRef(data.data.consultation.id.slice(0, 8).toUpperCase());
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Something went wrong. Please try again or contact us directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 min-h-screen transition-colors">
      <Header />
      <main className="flex-1 w-full">
        {/* Decorative ambient background blur */}
        <div className="relative overflow-hidden pt-12 pb-16 md:py-20 px-4 sm:px-6 lg:px-8">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-purple-500/10 via-rose-500/5 to-transparent blur-3xl pointer-events-none" />
          
          <div className="max-w-5xl mx-auto relative z-10">
            
            {/* Header Section */}
            <div className="text-center space-y-4 mb-12">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-purple-500" />
                <span>1-on-1 Senior Tech Consultation</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white max-w-3xl mx-auto leading-tight">
                Turn Your Software Vision Into a <span className="bg-gradient-to-r from-purple-600 via-rose-600 to-amber-500 bg-clip-text text-transparent">Production-Ready Reality</span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
                Book a complimentary 30-minute discovery call with our principal engineers. We’ll analyze your project scope, recommend optimal architecture, and give you an exact execution roadmap.
              </p>

              {/* Feature highlights badge grid */}
              <div className="pt-4 flex flex-wrap justify-center items-center gap-6 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/60 px-3.5 py-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>100% Free & No Obligation</span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/60 px-3.5 py-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-purple-500" />
                  <span>Strict NDA & Privacy Guaranteed</span>
                </div>
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900/60 px-3.5 py-2 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Custom Architecture & Budget Estimate</span>
                </div>
              </div>
            </div>

            {/* Submitted Success View */}
            {submitted ? (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 sm:p-12 shadow-2xl text-center max-w-2xl mx-auto space-y-6 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto shadow-inner">
                  <MessageSquareCheck className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 font-mono">
                    REF ID: #{bookingRef || 'CONFIRMED'}
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-950 dark:text-white">
                    Consultation Booked Successfully!
                  </h2>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
                    Thank you, <strong className="text-zinc-900 dark:text-white">{formData.fullName}</strong>. We have received your consultation booking details. Our engineering lead will review your requirements and reach out via email (<span className="text-purple-600 dark:text-purple-400">{formData.email}</span>) or phone to confirm your meeting slot.
                  </p>
                </div>

                {/* Summary box */}
                <div className="bg-zinc-50 dark:bg-zinc-950/80 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-5 text-left text-xs space-y-3 font-mono">
                  <div className="flex justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-2">
                    <span className="text-zinc-500">Service Category:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">{formData.serviceType}</span>
                  </div>
                  <div className="flex justify-between border-b border-zinc-200/60 dark:border-zinc-800/60 pb-2">
                    <span className="text-zinc-500">Preferred Date & Time:</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">
                      {formData.preferredDate || 'Flexible'} ({formData.preferredTime})
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Estimated Budget:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{formData.budget}</span>
                  </div>
                </div>

                <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/products"
                    className="px-6 py-3 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold text-xs hover:opacity-90 transition-all flex items-center justify-center gap-2"
                  >
                    <span>Explore Software Templates</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-6 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 font-semibold text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                  >
                    Book Another Session
                  </button>
                </div>
              </div>
            ) : (
              /* Main Form Card */
              <div className="bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl shadow-xl overflow-hidden backdrop-blur-xl">
                <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
                  
                  {errorMsg && (
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                      <HelpCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  {/* Section 1: Contact Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">1</span>
                      <h3 className="text-base font-extrabold text-zinc-950 dark:text-white">Your Contact Details</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-zinc-400" />
                          Full Name <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="fullName"
                          required
                          value={formData.fullName}
                          onChange={handleChange}
                          placeholder="e.g. Abdullah Al Hosen"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-zinc-400" />
                          Work / Business Email <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="e.g. abdullah@company.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-zinc-400" />
                          Phone / WhatsApp Number <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="e.g. +880 1560-047265"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                          Company / Organization Name
                        </label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleChange}
                          placeholder="e.g. Hosen Tech Ltd. (Optional)"
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Service Interest Selection */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">2</span>
                      <h3 className="text-base font-extrabold text-zinc-950 dark:text-white">Select Required Service</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {SERVICE_OPTIONS.map((svc) => {
                        const IconComp = svc.icon;
                        const isSelected = formData.serviceType === svc.title;
                        return (
                          <div
                            key={svc.id}
                            onClick={() => setFormData((prev) => ({ ...prev, serviceType: svc.title }))}
                            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 text-left flex flex-col justify-between space-y-2 ${
                              isSelected
                                ? 'border-purple-600 bg-purple-500/5 dark:bg-purple-950/20 ring-2 ring-purple-500/30'
                                : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-950/40 hover:border-zinc-300 dark:hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className={`p-2 rounded-xl ${isSelected ? 'bg-purple-600 text-white' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
                                <IconComp className="w-4 h-4" />
                              </div>
                              {isSelected && <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-zinc-950 dark:text-white">{svc.title}</h4>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-tight mt-0.5">{svc.desc}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Section 3: Budget & Meeting Schedule */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">3</span>
                      <h3 className="text-base font-extrabold text-zinc-950 dark:text-white">Budget & Scheduling Preferences</h3>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">Target Budget Range</label>
                        <select
                          name="budget"
                          value={formData.budget}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all cursor-pointer"
                        >
                          {BUDGET_RANGES.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                          Preferred Date
                        </label>
                        <input
                          type="date"
                          name="preferredDate"
                          value={formData.preferredDate}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all cursor-pointer"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-zinc-400" />
                          Preferred Time Window
                        </label>
                        <select
                          name="preferredTime"
                          value={formData.preferredTime}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all cursor-pointer"
                        >
                          {TIME_SLOTS.map((slot) => (
                            <option key={slot} value={slot}>{slot}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Project Details / Message */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">4</span>
                      <h3 className="text-base font-extrabold text-zinc-950 dark:text-white">Project Outline & Requirements</h3>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        Tell us about your project or core goals <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        name="message"
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Share a short overview of what you are building, target user base, key features, or any reference websites..."
                        className="w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 outline-none transition-all resize-y"
                      />
                    </div>
                  </div>

                  {/* Submit Action */}
                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="text-xs text-zinc-500 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>Your information is encrypted & will never be shared with third parties.</span>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-650 hover:from-purple-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-xl shadow-purple-600/20 hover:shadow-purple-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Submitting Request...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>Confirm & Book Free Consultation</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
