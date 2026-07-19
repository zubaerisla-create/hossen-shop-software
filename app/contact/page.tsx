'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Mail, Phone, MapPin, Clock, Send, MessageSquare, ShieldCheck, Sparkles } from 'lucide-react';
import { showSuccessToast, showErrorToast } from '@/app/utils/alert';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !subject || !message) {
      showErrorToast('Please fill out all fields before submitting.');
      return;
    }

    setLoading(true);

    // Simulate submission delay
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      showSuccessToast('Your inquiry has been successfully transmitted!');
      setName('');
      setEmail('');
      setSubject('');
      setMessage('');
    }, 1200);
  };

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-[#070708] text-zinc-900 dark:text-zinc-100 font-sans min-h-screen transition-colors">
      <Header />

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-12 space-y-16">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-955 dark:hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Hero Section */}
        <div className="space-y-4 border-b border-zinc-200 dark:border-zinc-900 pb-10">
          <span className="text-[10px] font-bold text-[#6A2D3D] dark:text-[#fca5a5] uppercase tracking-widest block flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" />
            Get In Touch
          </span>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight text-zinc-955 dark:text-white leading-[1.1]">
            Contact Support & <br />
            Business Inquiry
          </h1>
          <p className="text-zinc-550 dark:text-zinc-400 text-xs md:text-sm max-w-xl leading-relaxed font-semibold">
            Have questions about a template purchase, license customizations, or starting a new custom deal? Contact our engineering team for instant support.
          </p>
        </div>

        {/* Info Grid & Form */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Info cards (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <h3 className="text-xl font-bold uppercase tracking-tight text-zinc-950 dark:text-white">
              Office Channels
            </h3>
            
            <div className="space-y-4">
              <div className="p-6 border border-zinc-200/60 dark:border-zinc-900 rounded-2xl bg-zinc-50/20 dark:bg-zinc-900/10 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#6A2D3D]/10 dark:bg-[#6A2D3D]/20 flex items-center justify-center text-[#6A2D3D] dark:text-[#fca5a5] flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Email Address</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">support@hosenshop.com</p>
                  <p className="text-[11px] text-zinc-505 font-semibold">Average response under 2 hours</p>
                </div>
              </div>

              <div className="p-6 border border-zinc-200/60 dark:border-zinc-900 rounded-2xl bg-zinc-50/20 dark:bg-zinc-900/10 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Phone Hotline</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">+880 1712-345678</p>
                  <p className="text-[11px] text-zinc-505 font-semibold">Active Mon - Sat, 9 AM - 6 PM</p>
                </div>
              </div>

              <div className="p-6 border border-zinc-200/60 dark:border-zinc-900 rounded-2xl bg-zinc-50/20 dark:bg-zinc-900/10 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 flex-shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Corporate Address</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Hosen Software Tower, Level 8</p>
                  <p className="text-[11px] text-zinc-550 dark:text-zinc-400 font-semibold">Banani, Dhaka-1213, Bangladesh</p>
                </div>
              </div>

              <div className="p-6 border border-zinc-200/60 dark:border-zinc-900 rounded-2xl bg-zinc-50/20 dark:bg-zinc-900/10 flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Operational Hours</p>
                  <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">24/7 Digital Delivery Support</p>
                  <p className="text-[11px] text-zinc-550 dark:text-zinc-400 font-semibold">Office visiting visits require schedules</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form (Right) */}
          <div className="lg:col-span-7 border border-zinc-250 dark:border-zinc-850 bg-zinc-50/10 dark:bg-zinc-900/5 p-8 rounded-3xl space-y-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold uppercase tracking-tight text-zinc-950 dark:text-white">
                Transmit Message
              </h3>
              <p className="text-xs text-zinc-400 font-semibold">
                Submit the form below and an engineer will connect with you via email.
              </p>
            </div>

            {submitted ? (
              <div className="p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-2xl text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 mx-auto">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-extrabold text-zinc-900 dark:text-white uppercase text-sm">Message Received</h4>
                <p className="text-xs text-zinc-550 dark:text-zinc-400 leading-relaxed font-semibold">
                  Thank you! Your message has been safely logged in our CRM. We will follow up shortly at the email address provided.
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="text-xs text-[#6A2D3D] dark:text-[#fca5a5] font-bold underline cursor-pointer"
                >
                  Submit another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Full Name</label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Email Address</label>
                    <input
                      type="email"
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Inquiry Subject</label>
                  <input
                    type="text"
                    placeholder="Custom SaaS project, billing issue..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Detailed Message</label>
                  <textarea
                    rows={5}
                    placeholder="Type details of your request here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-zinc-50/50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-extrabold py-3 rounded-lg text-xs uppercase tracking-wide flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Transmitting...' : 'Send Message'}
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
