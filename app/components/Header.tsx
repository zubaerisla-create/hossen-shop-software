'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { initializeStorage } from '../utils/storage';
import { Sun, Moon, Menu, X, User, LogOut, LayoutDashboard } from 'lucide-react';
import AuthModal from './AuthModal';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<'visitor' | 'customer' | 'admin'>('visitor');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    initializeStorage();
    setShowDropdown(false);
    
    // Sync auth status on load, pathname changes, or custom auth events
    const handleAuthChange = () => {
      const storedRole = localStorage.getItem('apex_user_role') as any;
      setRole(storedRole || 'visitor');
    };

    handleAuthChange();

    window.addEventListener('auth-change', handleAuthChange);

    // Theme Init (Default to light mode, check storage)
    const storedTheme = localStorage.getItem('apex_theme') as 'light' | 'dark';
    if (storedTheme) {
      setTheme(storedTheme);
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      document.documentElement.classList.remove('dark');
    }

    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [pathname]);

  const handleSignOut = () => {
    localStorage.removeItem('apex_user_role');
    localStorage.removeItem('apex_user_email');
    setRole('visitor');
    setIsMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'));
    }
    router.push('/');
  };

  const handleProfileClick = () => {
    setIsMobileMenuOpen(false);
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/portal');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('apex_theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleNavClick = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    router.push('/');
    setTimeout(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  return (
    <>
      {/* Sticky top navigation wrapper */}
      <header className="sticky top-0 z-50 w-full bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 md:px-6 py-3.5">
          
          {/* Logo */}
          <div onClick={() => router.push('/')} className="flex items-center gap-3 cursor-pointer select-none">
            <span className="font-bold text-xs tracking-widest text-zinc-900 dark:text-white uppercase border border-zinc-300 dark:border-zinc-700 px-2 py-0.5 rounded">
              HOSSEN
            </span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400 font-medium tracking-tight">Software-Shop</span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs text-zinc-600 dark:text-zinc-400 font-medium">
            <button onClick={() => handleNavClick('services')} className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer">Services</button>
            <button onClick={() => handleNavClick('products')} className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer">Templates</button>
            <button onClick={() => handleNavClick('portfolio')} className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer">Portfolio</button>
            <button onClick={() => router.push('/estimator')} className={`hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer ${pathname === '/estimator' ? 'text-zinc-950 dark:text-white font-bold' : ''}`}>AI Estimator</button>
          </nav>

          {/* Control items: Switchers & Actions */}
          <div className="flex items-center gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? <Moon className="w-3.5 h-3.5" /> : <Sun className="w-3.5 h-3.5" />}
            </button>

            {/* Auth Buttons */}
            {role === 'visitor' ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setAuthModalMode('signin'); setShowAuthModal(true); }}
                  className="hidden sm:inline-block text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthModalMode('signup'); setShowAuthModal(true); }}
                  className="hidden sm:inline-block px-3.5 py-1.5 bg-[#6A2D3D] hover:bg-[#582432] text-white rounded text-[10px] font-bold transition-all hover:shadow-md cursor-pointer"
                >
                  Join
                </button>
              </div>
            ) : (
              <div className="hidden sm:block relative">
                {/* Avatar Button */}
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center justify-center w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors focus:outline-none cursor-pointer"
                  title="Profile Menu"
                >
                  <User className="w-4 h-4" />
                </button>

                {/* Dropdown Menu */}
                {showDropdown && (
                  <>
                    {/* Backdrop to close dropdown on click outside */}
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowDropdown(false)}
                    />
                    
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded shadow-xl py-1 z-25 animate-fadeIn text-[11px]">
                      <div className="px-3.5 py-2 border-b border-zinc-100 dark:border-zinc-800/60">
                        <p className="font-bold text-zinc-800 dark:text-zinc-300 truncate">
                          {localStorage.getItem('apex_user_email') || 'user@example.com'}
                        </p>
                        <p className="text-[9px] text-zinc-500 capitalize mt-0.5">
                          {role === 'admin' ? 'Agency Admin' : 'Client Workspace'}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          router.push(role === 'admin' ? '/admin' : '/portal');
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white font-semibold flex items-center gap-2 cursor-pointer"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5" />
                        <span>{role === 'admin' ? 'Admin Dashboard' : 'Client Workspace'}</span>
                      </button>

                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          handleSignOut();
                        }}
                        className="w-full text-left px-3.5 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-900/60 cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
          
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#09090b] px-4 py-4 space-y-4 animate-slideDown">
            <div className="flex flex-col gap-3 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
              <button onClick={() => handleNavClick('services')} className="text-left py-1 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer">Services</button>
              <button onClick={() => handleNavClick('products')} className="text-left py-1 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer">Templates</button>
              <button onClick={() => handleNavClick('portfolio')} className="text-left py-1 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer">Portfolio</button>
              <button onClick={() => { setIsMobileMenuOpen(false); router.push('/estimator'); }} className="text-left py-1 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer">AI Estimator</button>
            </div>

            {/* Mobile Auth Actions */}
            <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-3">
              {role === 'visitor' ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); setAuthModalMode('signin'); setShowAuthModal(true); }}
                    className="w-full py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-[11px] font-semibold transition-colors cursor-pointer text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); setAuthModalMode('signup'); setShowAuthModal(true); }}
                    className="w-full py-2.5 bg-[#6A2D3D] hover:bg-[#582432] text-white rounded text-[11px] font-bold transition-colors cursor-pointer text-center"
                  >
                    Join
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleProfileClick}
                    className="w-full py-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black rounded text-[11px] font-bold transition-colors cursor-pointer text-center"
                  >
                    Profile Workspace
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded text-[11px] font-semibold transition-colors cursor-pointer text-center"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Unified Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
        isModal={true}
      />
    </>
  );
}
