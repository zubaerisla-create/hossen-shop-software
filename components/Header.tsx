'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { initializeStorage, clearUserSession } from '@/app/utils/storage';
import { Sun, Moon, Menu, X, User, LogOut, LayoutDashboard, Zap, ChevronDown, ChevronRight, Layers, Handshake } from 'lucide-react';
import AuthModal from './AuthModal';
import { servicesData } from '@/app/data/services';
import { ServiceIcon } from '@/app/utils/icons';
import { useCurrency, CURRENCIES } from '@/app/utils/currency';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [role, setRole] = useState<'visitor' | 'customer' | 'admin'>('visitor');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');
  const [authRedirectUrl, setAuthRedirectUrl] = useState<string | undefined>(undefined);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { currencyCode, currencyConfig, setCurrency } = useCurrency();
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showServicesMenu, setShowServicesMenu] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const servicesRef = useRef<HTMLDivElement>(null);
  const servicesTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setScrollY(y);
      setScrolled(y > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    initializeStorage();
    setShowDropdown(false);

    const handleAuthChange = () => {
      const storedRole = localStorage.getItem('apex_user_role') as any;
      setRole(storedRole || 'visitor');
      setAvatar(localStorage.getItem('apex_user_avatar'));
      setEmail(localStorage.getItem('apex_user_email'));
    };

    handleAuthChange();
    window.addEventListener('auth-change', handleAuthChange);

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

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('auth') === 'required') {
        setAuthModalMode('signin');
        setShowAuthModal(true);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, '', newUrl);
      }
    }

    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, [pathname]);

  const handleSignOut = () => {
    clearUserSession();
    setRole('visitor');
    setAvatar(null);
    setEmail(null);
    setIsMobileMenuOpen(false);
    router.push('/');
  };

  const handleProfileClick = () => {
    setIsMobileMenuOpen(false);
    if (role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/user');
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

  const otherNavLinks = [
    { 
      label: 'Templates', 
      action: () => { setIsMobileMenuOpen(false); router.push('/products'); },
      path: '/products',
      highlight: 'purple'
    },
    { label: 'Blogs', action: () => { setIsMobileMenuOpen(false); router.push('/blogs'); }, path: '/blogs' },
    { label: 'Feedback', action: () => { setIsMobileMenuOpen(false); router.push('/reviews'); }, path: '/reviews' },
    { label: 'AI Estimator', action: () => { setIsMobileMenuOpen(false); router.push('/estimator'); }, path: '/estimator' },
    { 
      label: 'Custom Deals', 
      action: () => {
        setIsMobileMenuOpen(false);
        if (role !== 'visitor') {
          router.push('/user/deals');
        } else {
          setAuthRedirectUrl('/user/deals');
          setAuthModalMode('signin');
          setShowAuthModal(true);
        }
      }, 
      path: '/user/deals',
      highlight: 'rose'
    }
  ];

  const handleServicesEnter = () => {
    if (servicesTimeoutRef.current) clearTimeout(servicesTimeoutRef.current);
    setShowServicesMenu(true);
  };
  const handleServicesLeave = () => {
    servicesTimeoutRef.current = setTimeout(() => setShowServicesMenu(false), 120);
  };

  return (
    <>
      <style>{`
        @keyframes navSlideDown {
          from { opacity: 0; transform: translateY(-12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes mobileMenuIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes dropdownIn {
          from { opacity: 0; transform: translateY(8px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.4); }
        }
        .nav-animate { animation: navSlideDown 0.4s cubic-bezier(0.16,1,0.3,1) both; }
        .mobile-menu-animate { animation: mobileMenuIn 0.3s cubic-bezier(0.16,1,0.3,1) both; }
        .dropdown-animate { animation: dropdownIn 0.2s cubic-bezier(0.16,1,0.3,1) both; }
        .pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }

        .nav-link-pill {
          position: relative;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: #52525b;
          transition: color 0.2s, background 0.2s;
          cursor: pointer;
          background: transparent;
          border: none;
          outline: none;
        }
        .dark .nav-link-pill { color: #a1a1aa; }
        .nav-link-pill:hover {
          color: #09090b;
          background: rgba(113,113,122,0.08);
        }
        .dark .nav-link-pill:hover {
          color: #f4f4f5;
          background: rgba(255,255,255,0.06);
        }
        .nav-link-pill.active {
          color: #09090b;
          background: rgba(113,113,122,0.12);
          font-weight: 600;
        }
        .dark .nav-link-pill.active {
          color: #f4f4f5;
          background: rgba(255,255,255,0.1);
        }
        .nav-link-pill.active::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%);
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #6A2D3D;
        }

        @keyframes rotateBorder {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes textGlowPurple {
          0%, 100% {
            text-shadow: 0 0 2px rgba(79, 70, 229, 0.2);
            color: #4f46e5 !important;
          }
          50% {
            text-shadow: 0 0 8px rgba(79, 70, 229, 0.6), 0 0 14px rgba(129, 140, 248, 0.4);
            color: #6366f1 !important;
          }
        }
        @keyframes textGlowPurpleDark {
          0%, 100% {
            text-shadow: 0 0 2px rgba(165, 180, 252, 0.2);
            color: #a5b4fc !important;
          }
          50% {
            text-shadow: 0 0 8px rgba(165, 180, 252, 0.6), 0 0 14px rgba(199, 210, 254, 0.4);
            color: #c7d2fe !important;
          }
        }
        @keyframes textGlowRose {
          0%, 100% {
            text-shadow: 0 0 2px rgba(190, 18, 60, 0.2);
            color: #be123c !important;
          }
          50% {
            text-shadow: 0 0 8px rgba(190, 18, 60, 0.6), 0 0 14px rgba(244, 63, 94, 0.4);
            color: #e11d48 !important;
          }
        }
        @keyframes textGlowRoseDark {
          0%, 100% {
            text-shadow: 0 0 2px rgba(252, 165, 165, 0.2);
            color: #fca5a5 !important;
          }
          50% {
            text-shadow: 0 0 8px rgba(252, 165, 165, 0.6), 0 0 14px rgba(254, 205, 211, 0.4);
            color: #ffe4e6 !important;
          }
        }

        .nav-link-highlighted-purple {
          position: relative;
          z-index: 1;
          overflow: hidden;
          border: none !important;
          background: transparent !important;
          padding: 6px 14px !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          animation: textGlowPurple 3s ease-in-out infinite;
        }
        .dark .nav-link-highlighted-purple {
          animation: textGlowPurpleDark 3s ease-in-out infinite;
        }
        .nav-link-highlighted-purple::before {
          content: '';
          position: absolute;
          top: -150%;
          left: -150%;
          width: 400%;
          height: 400%;
          background: conic-gradient(
            from 0deg,
            transparent 30%,
            #4f46e5 50%,
            transparent 70%
          );
          animation: rotateBorder 3s linear infinite;
          z-index: -2;
        }
        .dark .nav-link-highlighted-purple::before {
          background: conic-gradient(
            from 0deg,
            transparent 30%,
            #a5b4fc 50%,
            transparent 70%
          );
        }
        .nav-link-highlighted-purple::after {
          content: '';
          position: absolute;
          inset: 1.5px;
          background: rgba(255, 255, 255, 0.94);
          border-radius: 999px;
          z-index: -1;
          transition: background 0.3s;
        }
        .dark .nav-link-highlighted-purple::after {
          background: rgba(9, 9, 11, 0.94);
        }

        .nav-link-highlighted-rose {
          position: relative;
          z-index: 1;
          overflow: hidden;
          border: none !important;
          background: transparent !important;
          padding: 6px 14px !important;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          animation: textGlowRose 3s ease-in-out infinite;
        }
        .dark .nav-link-highlighted-rose {
          animation: textGlowRoseDark 3s ease-in-out infinite;
        }
        .nav-link-highlighted-rose::before {
          content: '';
          position: absolute;
          top: -150%;
          left: -150%;
          width: 400%;
          height: 400%;
          background: conic-gradient(
            from 0deg,
            transparent 30%,
            #be123c 50%,
            transparent 70%
          );
          animation: rotateBorder 3s linear infinite;
          z-index: -2;
        }
        .dark .nav-link-highlighted-rose::before {
          background: conic-gradient(
            from 0deg,
            transparent 30%,
            #fca5a5 50%,
            transparent 70%
          );
        }
        .nav-link-highlighted-rose::after {
          content: '';
          position: absolute;
          inset: 1.5px;
          background: rgba(255, 255, 255, 0.94);
          border-radius: 999px;
          z-index: -1;
          transition: background 0.3s;
        }
        .dark .nav-link-highlighted-rose::after {
          background: rgba(9, 9, 11, 0.94);
        }

        .mobile-nav-highlighted-purple {
          color: #4f46e5 !important;
          font-weight: 700 !important;
          background: rgba(79, 70, 229, 0.05) !important;
          border-left: 4px solid #4f46e5 !important;
        }
        .dark .mobile-nav-highlighted-purple {
          color: #a5b4fc !important;
          background: rgba(165, 180, 252, 0.08) !important;
          border-left-color: #818cf8 !important;
        }
        
        .mobile-nav-highlighted-rose {
          color: #be123c !important;
          font-weight: 700 !important;
          background: rgba(190, 18, 60, 0.05) !important;
          border-left: 4px solid #be123c !important;
        }
        .dark .mobile-nav-highlighted-rose {
          color: #fca5a5 !important;
          background: rgba(252, 165, 165, 0.08) !important;
          border-left-color: #f43f5e !important;
        }

        .header-nav {
          background: rgba(255, 255, 255, 0);
          backdrop-filter: blur(0px) saturate(1);
          -webkit-backdrop-filter: blur(0px) saturate(1);
          border-bottom: 1px solid transparent;
          box-shadow: 0 4px 24px -4px rgba(0, 0, 0, 0);
          transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      backdrop-filter 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                      box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .dark .header-nav {
          background: rgba(9, 9, 11, 0);
        }
        .header-nav.scrolled {
          background: rgba(255, 255, 255, 0.8) !important;
          backdrop-filter: blur(16px) saturate(1.8) !important;
          -webkit-backdrop-filter: blur(16px) saturate(1.8) !important;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05) !important;
          box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.05) !important;
        }
        .dark .header-nav.scrolled {
          background: rgba(9, 9, 11, 0.8) !important;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
          box-shadow: 0 4px 20px -4px rgba(0, 0, 0, 0.3) !important;
        }

        /* Overlay state style definitions for transparent text */
        .header-nav.is-overlay .nav-link-pill {
          color: rgba(255, 255, 255, 0.8) !important;
        }
        .header-nav.is-overlay .nav-link-pill:hover {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }
        .header-nav.is-overlay .nav-link-pill.active {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.15) !important;
        }
        .header-nav.is-overlay .nav-link-pill.active::after {
          background: #ffffff !important;
        }
        .header-nav.is-overlay .logo-text {
          color: rgba(255, 255, 255, 0.8) !important;
        }
        .header-nav.is-overlay .logo-dot {
          color: rgba(255, 255, 255, 0.4) !important;
        }
        .header-nav.is-overlay .theme-btn {
          color: rgba(255, 255, 255, 0.8) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        .header-nav.is-overlay .theme-btn:hover {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }
        .header-nav.is-overlay .signin-btn {
          color: rgba(255, 255, 255, 0.8) !important;
        }
        .header-nav.is-overlay .signin-btn:hover {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }
        .header-nav.is-overlay .mobile-hamburger {
          color: rgba(255, 255, 255, 0.8) !important;
          border-color: rgba(255, 255, 255, 0.2) !important;
        }
        .header-nav.is-overlay .mobile-hamburger:hover {
          color: #ffffff !important;
          background: rgba(255, 255, 255, 0.1) !important;
        }

        /* Overlay: highlighted nav items — use dark transparent inner bg so text stays visible over hero */
        .header-nav.is-overlay .nav-link-highlighted-purple::after,
        .header-nav.is-overlay .nav-link-highlighted-rose::after {
          background: rgba(0, 0, 0, 0.55) !important;
        }
        .header-nav.is-overlay .nav-link-highlighted-purple {
          animation: textGlowPurpleOverlay 3s ease-in-out infinite !important;
        }
        .header-nav.is-overlay .nav-link-highlighted-rose {
          animation: textGlowRoseOverlay 3s ease-in-out infinite !important;
        }
        @keyframes textGlowPurpleOverlay {
          0%, 100% {
            text-shadow: 0 0 4px rgba(165, 180, 252, 0.5);
            color: #c7d2fe !important;
          }
          50% {
            text-shadow: 0 0 12px rgba(165, 180, 252, 0.9), 0 0 20px rgba(199, 210, 254, 0.6);
            color: #e0e7ff !important;
          }
        }
        @keyframes textGlowRoseOverlay {
          0%, 100% {
            text-shadow: 0 0 4px rgba(252, 165, 165, 0.5);
            color: #fecaca !important;
          }
          50% {
            text-shadow: 0 0 12px rgba(252, 165, 165, 0.9), 0 0 20px rgba(254, 202, 202, 0.6);
            color: #ffe4e6 !important;
          }
        }

        .join-btn {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #6A2D3D 0%, #8B3A50 50%, #6A2D3D 100%);
          background-size: 200% 200%;
          transition: background-position 0.4s ease, box-shadow 0.3s ease, transform 0.2s ease;
        }
        .join-btn:hover {
          background-position: right center;
          box-shadow: 0 6px 20px -4px rgba(106,45,61,0.5);
          transform: translateY(-1px);
        }
        .join-btn:active { transform: translateY(0); }

        .avatar-btn {
          position: relative;
          width: 34px;
          height: 34px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #6A2D3D22, #6A2D3D11);
          border: 1.5px solid #6A2D3D44;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .avatar-btn:hover {
          border-color: #6A2D3D99;
          background: linear-gradient(135deg, #6A2D3D33, #6A2D3D22);
          box-shadow: 0 0 0 4px rgba(106,45,61,0.08);
        }

        .theme-btn {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .theme-btn:hover { transform: rotate(15deg); }

        .logo-badge {
          background: linear-gradient(135deg, #6A2D3D 0%, #8b3c4f 100%);
          color: white;
          font-size: 0.75rem;
          font-weight: 900;
          letter-spacing: 0.18em;
          padding: 4px 10px;
          border-radius: 6px;
          text-transform: uppercase;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 14px rgba(106, 45, 61, 0.3);
        }
        .logo-badge::after {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 60%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent);
          animation: shimmer 3s infinite;
        }
        .dark .logo-badge {
          background: linear-gradient(135deg, #be123c 0%, #fda4af 100%);
          color: #09090b;
          box-shadow: 0 0 14px rgba(244, 63, 94, 0.2);
        }
        @keyframes shimmer {
          0%   { left: -100%; }
          100% { left: 200%; }
        }

        .mobile-nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 14px;
          border-radius: 10px;
          font-size: 0.85rem;
          font-weight: 500;
          color: #52525b;
          cursor: pointer;
          transition: all 0.15s ease;
          background: transparent;
          border: none;
          width: 100%;
          text-align: left;
        }
        .dark .mobile-nav-item { color: #a1a1aa; }
        .mobile-nav-item:hover {
          color: #09090b;
          background: rgba(113,113,122,0.07);
        }
        .dark .mobile-nav-item:hover {
          color: #f4f4f5;
          background: rgba(255,255,255,0.05);
        }
        .mobile-nav-item.active {
          color: #6A2D3D;
          background: rgba(106,45,61,0.07);
          font-weight: 600;
        }

        .dropdown-card {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          width: 210px;
          background: white;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 14px;
          box-shadow: 0 20px 60px -10px rgba(0,0,0,0.15), 0 4px 16px -4px rgba(0,0,0,0.08);
          overflow: hidden;
          z-index: 100;
        }
        .dark .dropdown-card {
          background: #18181b;
          border-color: rgba(255,255,255,0.07);
          box-shadow: 0 20px 60px -10px rgba(0,0,0,0.5), 0 4px 16px -4px rgba(0,0,0,0.3);
        }

        /* Services mega dropdown */
        @keyframes servicesIn {
          from { opacity: 0; transform: translateY(10px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .services-mega {
          position: absolute;
          top: calc(100% + 8px);
          left: 50%;
          transform: translateX(-50%);
          width: 620px;
          background: white;
          border: 1px solid rgba(0,0,0,0.07);
          border-radius: 18px;
          box-shadow: 0 24px 64px -12px rgba(0,0,0,0.18), 0 4px 16px -4px rgba(0,0,0,0.08);
          padding: 16px;
          z-index: 200;
          animation: servicesIn 0.2s cubic-bezier(0.16,1,0.3,1) both;
        }
        .dark .services-mega {
          background: #18181b;
          border-color: rgba(255,255,255,0.07);
          box-shadow: 0 24px 64px -12px rgba(0,0,0,0.55), 0 4px 16px -4px rgba(0,0,0,0.3);
        }
        .svc-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          transition: background 0.15s ease;
          text-decoration: none;
        }
        .svc-item:hover { background: rgba(113,113,122,0.07); }
        .dark .svc-item:hover { background: rgba(255,255,255,0.05); }
        .svc-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: #f4f4f5;
          display: flex; align-items: center; justify-content: center;
          font-size: 16px;
          flex-shrink: 0;
          border: 1px solid #e4e4e7;
        }
        .dark .svc-icon { background: #27272a; border-color: #3f3f46; }
      `}</style>

      {/* Fixed navbar */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full nav-animate header-nav ${pathname === '/' && !scrolled ? 'is-overlay' : 'scrolled'}`}
      >
        <div className="max-w-[1440px] mx-auto flex items-center justify-between px-4 md:px-8 h-[60px]">

          {/* ─── Logo ─── */}
          <div
            onClick={() => router.push('/')}
            className="flex items-center gap-2.5 cursor-pointer select-none flex-shrink-0 group"
          >
            <span className="logo-badge transition-transform duration-300 group-hover:scale-105">HOSSEN</span>
            <span className="text-[13px] font-extrabold text-zinc-800 dark:text-zinc-100 logo-text tracking-tight hidden sm:block transition-all duration-300 group-hover:translate-x-0.5">
              Software<span className="text-[#6A2D3D] dark:text-[#fca5a5] logo-dot mx-0.5 transition-colors font-black">·</span><span className="text-[#6A2D3D] dark:text-[#fca5a5] font-black">Shop</span>
            </span>
          </div>

          {/* ─── Desktop Nav ─── */}
          <nav className="hidden md:flex items-center gap-1">

            {/* Services with mega dropdown */}
            <div
              ref={servicesRef}
              className="relative"
              onMouseEnter={handleServicesEnter}
              onMouseLeave={handleServicesLeave}
            >
              <button
                className={`nav-link-pill inline-flex items-center gap-1 ${pathname.startsWith('/services') ? 'active' : ''}`}
                onClick={() => setShowServicesMenu((v) => !v)}
              >
                Services
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showServicesMenu ? 'rotate-180' : ''}`} />
              </button>

              {showServicesMenu && (
                <div
                  className="services-mega"
                  onMouseEnter={handleServicesEnter}
                  onMouseLeave={handleServicesLeave}
                >
                  {/* Header */}
                  <div className="px-2 pb-3 mb-1 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Our Services</p>
                    <button
                      onClick={() => { setShowServicesMenu(false); handleNavClick('services'); }}
                      className="text-[10px] font-semibold text-[#6A2D3D] hover:underline"
                    >View all ↗</button>
                  </div>
                  {/* Grid */}
                  <div className="grid grid-cols-2 gap-0.5">
                    {servicesData.map((svc) => (
                      <a
                        key={svc.slug}
                        href={`/services/${svc.slug}`}
                        className="svc-item"
                        onClick={() => setShowServicesMenu(false)}
                      >
                        <span className="svc-icon">
                          <ServiceIcon name={svc.icon} className="w-4 h-4 text-zinc-700 dark:text-zinc-300" />
                        </span>
                        <div className="overflow-hidden">
                          <p className="text-[12px] font-semibold text-zinc-900 dark:text-zinc-100 leading-snug">{svc.title}</p>
                          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-relaxed mt-0.5 line-clamp-1">{svc.shortDesc}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Other nav links */}
            {otherNavLinks.map((link) => {
              const isHighlightPurple = link.highlight === 'purple';
              const isHighlightRose = link.highlight === 'rose';
              const highlightClass = isHighlightPurple 
                ? 'nav-link-highlighted-purple' 
                : isHighlightRose 
                ? 'nav-link-highlighted-rose' 
                : '';
              return (
                <button
                  key={link.label}
                  onClick={link.action}
                  className={`nav-link-pill ${'path' in link && link.path && pathname === link.path ? 'active' : ''} ${highlightClass}`}
                >
                  {link.label === 'AI Estimator' ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-amber-500" />
                      {link.label}
                    </span>
                  ) : link.label === 'Custom Deals' ? (
                    <span className="inline-flex items-center gap-1.5">
                      <Handshake className="w-3.5 h-3.5 text-inherit" />
                      {link.label}
                    </span>
                  ) : link.label}
                </button>
              );
            })}
          </nav>

          {/* ─── Right Controls ─── */}
          <div className="flex items-center gap-2">

            {/* Currency Selector */}
            <div 
              className="relative"
              onMouseLeave={() => setShowCurrencyDropdown(false)}
            >
              <button
                onClick={() => setShowCurrencyDropdown(!showCurrencyDropdown)}
                className="theme-btn text-[10px] font-extrabold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 px-2.5 flex items-center gap-1.5 select-none"
                title="Select Currency"
              >
                <span className="font-mono">{currencyConfig.symbol}</span>
                <span>{currencyCode}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${showCurrencyDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showCurrencyDropdown && (
                <div className="absolute right-0 mt-1.5 w-48 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl py-1 z-[150] animate-fadeIn">
                  {Object.values(CURRENCIES).map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr.code);
                        setShowCurrencyDropdown(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-[10px] font-bold flex items-center justify-between transition-colors ${
                        currencyCode === curr.code
                          ? 'bg-zinc-55 dark:bg-zinc-900 text-[#6A2D3D] dark:text-[#fca5a5]'
                          : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white'
                      }`}
                    >
                      <span>{curr.label}</span>
                      <span className="font-mono text-[9px] opacity-75">{curr.symbol}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="theme-btn text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60"
              title={theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            >
              {theme === 'light'
                ? <Moon className="w-3.5 h-3.5" />
                : <Sun className="w-3.5 h-3.5" />}
            </button>

            {/* Auth Area */}
            {role === 'visitor' ? (
              <div className="hidden sm:flex items-center gap-2">
                <button
                  onClick={() => { setAuthRedirectUrl(undefined); setAuthModalMode('signin'); setShowAuthModal(true); }}
                  className="signin-btn text-[12px] font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setAuthRedirectUrl(undefined); setAuthModalMode('signup'); setShowAuthModal(true); }}
                  className="join-btn text-white rounded-lg px-4 py-1.5 text-[12px] font-bold cursor-pointer"
                >
                  JOIN
                </button>
              </div>
            ) : (
              <div className="hidden sm:block relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="avatar-btn overflow-hidden p-0 flex items-center justify-center"
                  title="Account"
                >
                  {avatar ? (
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover rounded-full" />
                  ) : (
                    <User className="w-4 h-4 text-[#6A2D3D]" />
                  )}
                  <span
                    className="pulse-dot absolute top-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border-2 border-white dark:border-[#09090b]"
                    title="Online"
                  />
                </button>

                {showDropdown && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDropdown(false)}
                    />
                    <div className="dropdown-card dropdown-animate" style={{ zIndex: 50 }}>
                      {/* Header */}
                      <div className="px-4 pt-4 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2.5 mb-1">
                          {avatar ? (
                            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                              <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6A2D3D] to-[#8B3A50] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(email || 'U')[0].toUpperCase()}
                            </div>
                          )}
                          <div className="overflow-hidden">
                            <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">
                              {email || '—'}
                            </p>
                            <p className="text-[9px] text-zinc-400 font-medium capitalize mt-0.5">
                              {role === 'admin' ? '⚡ Agency Admin' : '👤 Client Workspace'}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="p-1.5">
                        <button
                          onClick={() => { setShowDropdown(false); router.push(role === 'admin' ? '/admin' : '/user'); }}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white text-[12px] font-semibold flex items-center gap-2.5 transition-colors cursor-pointer group"
                        >
                          <LayoutDashboard className="w-3.5 h-3.5 text-zinc-400 group-hover:text-[#6A2D3D] transition-colors" />
                          {role === 'admin' ? 'Admin Dashboard' : 'My Workspace'}
                        </button>
                      </div>

                      <div className="p-1.5 pt-0 border-t border-zinc-100 dark:border-zinc-800 mt-0.5">
                        <button
                          onClick={() => { setShowDropdown(false); handleSignOut(); }}
                          className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-500 dark:text-rose-400 text-[12px] font-semibold flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Mobile Menu Button — only on small screens */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="mobile-hamburger text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ─── Mobile Drawer ─── */}
        {isMobileMenuOpen && (
          <div className="md:hidden mobile-menu-animate border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur-xl px-3 py-3">
            {/* Nav links */}
            <div className="space-y-0.5 mb-3">

              {/* Services accordion */}
              <div>
                <button
                  onClick={() => setMobileServicesOpen((v) => !v)}
                  className={`mobile-nav-item w-full justify-between ${pathname.startsWith('/services') ? 'active' : ''}`}
                >
                  <span className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-zinc-500" /> Services
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 flex-shrink-0 ${mobileServicesOpen ? 'rotate-180' : ''}`} />
                </button>

                {mobileServicesOpen && (
                  <div className="ml-3 mt-0.5 space-y-0.5 border-l-2 border-zinc-100 dark:border-zinc-800 pl-3">
                    {servicesData.map((svc) => (
                      <a
                        key={svc.slug}
                        href={`/services/${svc.slug}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-2 py-2 px-2 rounded-lg text-[12px] font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                      >
                        <ServiceIcon name={svc.icon} className="w-4 h-4 text-zinc-500 flex-shrink-0" />
                        {svc.title}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Other links */}
              {otherNavLinks.map((link) => {
                const isHighlightPurple = link.highlight === 'purple';
                const isHighlightRose = link.highlight === 'rose';
                const highlightClass = isHighlightPurple 
                  ? 'mobile-nav-highlighted-purple' 
                  : isHighlightRose 
                  ? 'mobile-nav-highlighted-rose' 
                  : '';
                return (
                  <button
                    key={link.label}
                    onClick={link.action}
                    className={`mobile-nav-item ${'path' in link && link.path && pathname === link.path ? 'active' : ''} ${highlightClass}`}
                  >
                    {link.label === 'AI Estimator' && <Zap className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />}
                    {link.label === 'Custom Deals' && <Handshake className="w-3.5 h-3.5 text-inherit flex-shrink-0" />}
                    {link.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile Auth */}
            <div className="border-t border-zinc-100 dark:border-zinc-800 pt-3 space-y-2">
              {role === 'visitor' ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); setAuthRedirectUrl(undefined); setAuthModalMode('signin'); setShowAuthModal(true); }}
                    className="w-full py-2.5 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer text-center"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); setAuthRedirectUrl(undefined); setAuthModalMode('signup'); setShowAuthModal(true); }}
                    className="join-btn w-full py-2.5 text-white rounded-xl text-[12px] font-bold cursor-pointer text-center"
                  >
                    JOIN
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {/* User info */}
                  <div className="flex items-center gap-3 px-3 py-2 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                    {avatar ? (
                      <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0">
                        <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6A2D3D] to-[#8B3A50] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(email || 'U')[0].toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-[11px] font-bold text-zinc-800 dark:text-zinc-200 truncate">
                        {email || '—'}
                      </p>
                      <p className="text-[9px] text-zinc-400">{role === 'admin' ? 'Agency Admin' : 'Client'}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleProfileClick}
                    className="w-full py-2.5 bg-zinc-900 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-100 text-white dark:text-zinc-900 rounded-xl text-[12px] font-bold transition-colors cursor-pointer text-center flex items-center justify-center gap-2"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    {role === 'admin' ? 'Admin Dashboard' : 'My Workspace'}
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="w-full py-2.5 border border-rose-200 dark:border-rose-900/40 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl text-[12px] font-semibold transition-colors cursor-pointer text-center"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Spacer so content doesn't hide behind fixed navbar */}
      {pathname !== '/' && <div className="h-[60px]" />}

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
        isModal={true}
        redirectUrl={authRedirectUrl}
      />
    </>
  );
}
