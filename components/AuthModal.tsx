'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, User, X, Check, ArrowRight } from 'lucide-react';
import { auth, googleProvider, signInWithPopup } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode: 'signin' | 'signup';
  isModal?: boolean;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode,
  isModal = true
}: AuthModalProps) {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Sync mode with initialMode prop when modal is opened
  React.useEffect(() => {
    setMode(initialMode);
    setShowEmailForm(false);
    setError('');
    setSuccess('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  }, [initialMode, isOpen]);

  if (isModal && !isOpen) return null;

  const handleModeSwitch = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
    setShowEmailForm(false);
    setError('');
    setSuccess('');
  };

  const triggerAuthChangeEvent = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'));
    }
  };

  const handleSocialLogin = async (provider: string) => {
    if (provider !== 'Google') return;
    setLoading(true);
    setError('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;
      
      // Make backend API request to authenticate Google user
      const response = await fetch('http://localhost:5000/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: firebaseUser.email,
          name: firebaseUser.displayName || 'Google User',
          avatar: firebaseUser.photoURL || '',
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Backend Google authentication failed');
      }

      const user = resData.data.user;
      const role = user.role.toLowerCase(); // 'admin' or 'customer'

      // Save user session
      localStorage.setItem('apex_user_token', resData.token);
      localStorage.setItem('apex_user_role', role);
      localStorage.setItem('apex_user_email', user.email);
      localStorage.setItem('apex_user_name', user.name);
      localStorage.setItem('apex_user_avatar', user.avatar || '');

      triggerAuthChangeEvent();
      const searchParams = new URLSearchParams(window.location.search);
      const redirectUrl = searchParams.get('redirect');

      if (isModal) {
        onClose();
      }
      
      if (redirectUrl) {
        router.push(redirectUrl);
      } else if (!isModal) {
        router.push(role === 'admin' ? '/admin' : '/user/deals');
      }
    } catch (err: any) {
      console.error("Firebase Google Auth failed:", err);
      setError(err?.message || 'Firebase sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'signup') {
      if (!name || !email || !password || !confirmPassword) {
        setError('Please fill in all fields.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters.');
        return;
      }
    } else {
      if (!email || !password) {
        setError('Please fill in all fields.');
        return;
      }
    }

    setLoading(true);

    try {
      const url = mode === 'signup' 
        ? 'http://localhost:5000/api/auth/register' 
        : 'http://localhost:5000/api/auth/login';
      
      const body = mode === 'signup' 
        ? { name, email, password }
        : { email, password };

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Authentication failed');
      }

      const user = resData.data.user;
      const role = user.role.toLowerCase(); // 'admin' or 'customer'

      // Save user session
      localStorage.setItem('apex_user_token', resData.token);
      localStorage.setItem('apex_user_role', role);
      localStorage.setItem('apex_user_email', user.email);
      localStorage.setItem('apex_user_name', user.name);
      localStorage.setItem('apex_user_avatar', user.avatar || '');

      setSuccess(mode === 'signup' ? 'Account created successfully! Redirecting...' : 'Signed in successfully! Redirecting...');
      triggerAuthChangeEvent();

      setTimeout(() => {
        if (isModal) {
          onClose();
        }
        
        const searchParams = new URLSearchParams(window.location.search);
        const redirectUrl = searchParams.get('redirect');
        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (!isModal) {
          router.push(role === 'admin' ? '/admin' : '/user/deals');
        }
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const modalContent = (
    <div className={`relative w-full overflow-hidden bg-white dark:bg-zinc-950 md:grid md:grid-cols-12 ${isModal ? 'rounded-2xl shadow-2xl max-w-[840px] border border-zinc-200 dark:border-zinc-800' : 'rounded-2xl shadow-xl'}`}>

      {/* Close button - visible only in modal view */}
      {isModal && (
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-50 p-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Left panel - Success starts here */}
      <div className="hidden md:flex md:col-span-5 bg-[#6A2D3D] text-white flex-col justify-between p-8 relative min-h-[520px]">
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white/10 to-transparent pointer-events-none" />

        <div className="space-y-6 z-10">
          <h3 className="text-2xl font-bold leading-tight font-sans">
            Success starts here
          </h3>

          <ul className="space-y-4 text-xs font-medium">
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 bg-white/15 p-0.5 rounded-full">
                <Check className="w-3 h-3 text-white" />
              </span>
              <span>Over 700 categories</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 bg-white/15 p-0.5 rounded-full">
                <Check className="w-3 h-3 text-white" />
              </span>
              <span>Quality work done faster</span>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="mt-0.5 bg-white/15 p-0.5 rounded-full">
                <Check className="w-3 h-3 text-white" />
              </span>
              <span>Access to talent and businesses across the globe</span>
            </li>
          </ul>
        </div>

        {/* Worker Image at desk */}
        <div className="relative mt-auto w-full pt-4 z-10 flex justify-center">
          <img
            src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80"
            alt="Professional at work"
            className="w-full max-w-[200px] aspect-[4/3] object-cover rounded-lg border border-white/10 shadow-lg"
          />
        </div>
      </div>

      {/* Right panel - Form & Socials */}
      <div className="md:col-span-7 p-8 flex flex-col justify-between bg-white dark:bg-[#121214] min-h-[520px]">
        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-white">
              {mode === 'signup' ? 'Create a new account' : 'Sign in to your account'}
            </h2>
            <p className="text-xs text-zinc-500">
              {mode === 'signup' ? 'Already have an account? ' : 'Don\'t have an account? '}
              <button
                onClick={handleModeSwitch}
                className="font-bold text-[#6A2D3D] dark:text-[#a05a6e] hover:underline cursor-pointer"
              >
                {mode === 'signup' ? 'Sign in' : 'Join now'}
              </button>
            </p>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-650 dark:text-red-400 p-3 rounded text-[11px] font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-900 text-green-650 dark:text-green-400 p-3 rounded text-[11px] font-semibold">
              {success}
            </div>
          )}

          {/* Conditional View: Social Buttons or Email Form */}
          {!showEmailForm ? (
            <div className="space-y-3">
              {/* Google Button */}
              <button
                onClick={() => handleSocialLogin('Google')}
                className="w-full flex items-center justify-center gap-3 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 px-4 py-2.5 rounded-lg text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.85z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.85c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Toggle to Email Form */}
              <div className="text-center pt-3">
                <button
                  onClick={() => setShowEmailForm(true)}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-800 dark:hover:text-white underline cursor-pointer"
                >
                  Or {mode === 'signup' ? 'sign up' : 'sign in'} using email
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {mode === 'signup' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Full Name</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <User className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 rounded-md pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 rounded-md pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 rounded-md pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none transition-colors"
                    required
                  />
                </div>
              </div>

              {mode === 'signup' && (
                <div className="space-y-1.5 animate-fade-in">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">Confirm Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-600 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 rounded-md pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="w-1/3 py-2 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 rounded font-semibold text-xs transition-colors cursor-pointer"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-[#6A2D3D] hover:bg-[#582432] text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                >
                  {loading ? 'Processing...' : mode === 'signup' ? 'Register' : 'Login'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="text-[9px] text-zinc-400 dark:text-zinc-500 leading-relaxed pt-6 border-t border-zinc-100 dark:border-zinc-900/60 mt-4">
          <p className="text-center mb-1">Additional verification may be required at a later stage</p>
          <p className="text-left">
            By joining, you agree to the Hossen Shop <a href="#" className="underline font-bold hover:text-zinc-700">Terms of Service</a> and to occasionally receive emails from us. Please read our <a href="#" className="underline font-bold hover:text-zinc-700">Privacy Policy</a> to learn how we use your personal data.
          </p>
        </div>

      </div>

    </div>
  );

  if (!isModal) {
    return (
      <div className="w-full flex justify-center py-6">
        {modalContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      {modalContent}
    </div>
  );
}
