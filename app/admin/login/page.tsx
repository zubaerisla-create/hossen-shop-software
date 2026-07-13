'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // If already logged in as admin, redirect to admin dashboard immediately
  useEffect(() => {
    const token = localStorage.getItem('apex_user_token');
    const role = localStorage.getItem('apex_user_role');
    if (token && role === 'admin') {
      router.push('/admin');
    }
  }, [router]);

  const triggerAuthChangeEvent = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Authentication failed');
      }

      const user = resData.data.user;
      const role = user.role.toLowerCase();

      if (role !== 'admin') {
        throw new Error('Access denied. Admin privileges are required.');
      }

      // Save user session
      localStorage.setItem('apex_user_token', resData.token);
      localStorage.setItem('apex_user_role', 'admin');
      localStorage.setItem('apex_user_email', user.email);
      localStorage.setItem('apex_user_name', user.name);
      localStorage.setItem('apex_user_avatar', user.avatar || '');

      setSuccess('Access granted! Entering administrative dashboard...');
      triggerAuthChangeEvent();

      setTimeout(() => {
        router.push('/admin');
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Login failed. Please verify your admin credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center px-4 py-12 transition-colors relative overflow-hidden font-sans">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-rose-500/5 dark:bg-rose-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-zinc-500/5 dark:bg-zinc-500/5 blur-[120px] pointer-events-none" />

      {/* Exit to Home Link */}
      <Link 
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer group z-10"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
        Back to public website
      </Link>

      <div className="w-full max-w-md space-y-8 relative z-10">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="bg-zinc-950 dark:bg-white text-white dark:text-black p-3 rounded-2xl shadow-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-extrabold tracking-tight uppercase">Admin Terminal</h1>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Hossen Software Shop Internal Staff</p>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Authorized Login</h2>
            <p className="text-zinc-500 text-[10px]">Please enter your administrative credentials below.</p>
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 text-rose-600 dark:text-rose-455 p-3 rounded text-[11px] font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 text-emerald-650 dark:text-emerald-450 p-3 rounded text-[11px] font-semibold">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Staff Email</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@hossenshop.com"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Security Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 mt-6"
            >
              {loading ? 'Verifying access...' : 'Authenticate'}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>

        <div className="text-center text-[9px] text-zinc-400 dark:text-zinc-650">
          <p>This is a restricted access administration terminal.</p>
          <p>Unauthorised connection attempts are strictly prohibited and logged.</p>
        </div>
      </div>
    </div>
  );
}
