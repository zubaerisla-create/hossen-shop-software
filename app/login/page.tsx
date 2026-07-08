'use client';

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import AuthModal from '../components/AuthModal';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col justify-center items-center px-4 py-12 transition-colors relative overflow-hidden font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-100 dark:bg-zinc-950/20 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-100 dark:bg-zinc-950/20 blur-[100px] pointer-events-none" />

      {/* Back to Home Link */}
      <Link 
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer group z-10"
      >
        <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" />
        Back to Home
      </Link>

      <div className="w-full max-w-[840px] animate-fade-in-up">
        <AuthModal 
          isOpen={true} 
          onClose={() => {}} 
          initialMode="signin" 
          isModal={false} 
        />
      </div>
    </div>
  );
}
