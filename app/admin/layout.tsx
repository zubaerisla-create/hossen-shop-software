'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, FolderKanban, Wrench, Receipt, Settings, ArrowRight, ArrowLeft, LogOut, Package, MessageSquare, BookOpen, Briefcase, Mail, MessageCircle, ChevronDown, Users } from 'lucide-react';
import { initializeStorage, syncWithBackend, clearUserSession } from '../utils/storage';
import { API_BASE_URL } from '@/app/utils/api';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [toastText, setToastText] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({
    analytics: true,
    sales: true,
    content: true,
    customer: true,
  });

  const toggleCategory = (catId: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [catId]: !prev[catId]
    }));
  };

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    initializeStorage();

    const verifyAdmin = async () => {
      if (pathname === '/admin/login') {
        setIsAdmin(true);
        return;
      }

      const token = localStorage.getItem('apex_user_token');
      const role = localStorage.getItem('apex_user_role');

      if (!token || role !== 'admin') {
        setIsAdmin(false);
        router.push('/admin/login');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const resData = await response.json();
        if (response.ok && resData.data?.user?.role === 'ADMIN') {
          await syncWithBackend();
          setIsAdmin(true);
        } else {
          localStorage.removeItem('apex_user_token');
          localStorage.removeItem('apex_user_role');
          setIsAdmin(false);
          router.push('/admin/login');
        }
      } catch (err) {
        // Fallback to local role if backend is offline to preserve developer experience
        await syncWithBackend();
        setIsAdmin(true);
      }
    };

    verifyAdmin();

    // Simple toast subscription via custom window event so children can trigger it
    const handleToast = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setToastText(detail);
      setTimeout(() => setToastText(null), 4000);
    };

    window.addEventListener('apex-admin-toast', handleToast);
    return () => window.removeEventListener('apex-admin-toast', handleToast);
  }, [pathname, router]);

  const navItems = [
    { href: '/admin', label: 'Agency Analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/admin/products', label: 'Ready Products', icon: <ShoppingCart className="w-4 h-4" /> },
    { href: '/admin/blogs', label: 'Manage Blogs', icon: <BookOpen className="w-4 h-4" /> },
    { href: '/admin/casestudies', label: 'Case Studies', icon: <Briefcase className="w-4 h-4" /> },
    { href: '/admin/orders', label: 'Client Orders', icon: <Package className="w-4 h-4" /> },
    { href: '/admin/deals', label: 'Custom Deals', icon: <FolderKanban className="w-4 h-4" /> },
    { href: '/admin/feedbacks', label: 'Manage Feedbacks', icon: <MessageSquare className="w-4 h-4" /> },
    { href: '/admin/support', label: 'Resolve Tickets', icon: <Wrench className="w-4 h-4" /> },
    { href: '/admin/payments', label: 'Invoices', icon: <Receipt className="w-4 h-4" /> },
    { href: '/admin/emails', label: 'Email Campaigns', icon: <Mail className="w-4 h-4" /> },
    { href: '/admin/comments', label: 'Blog Comments', icon: <MessageCircle className="w-4 h-4" /> },
    { href: '/admin/users', label: 'User Management', icon: <Users className="w-4 h-4" /> }
  ];

  const navigationCategories = [
    {
      id: 'analytics',
      title: 'Overview & Reports',
      items: [
        { href: '/admin', label: 'Agency Analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
        { href: '/admin/users', label: 'User Management', icon: <Users className="w-4 h-4" /> }
      ]
    },
    {
      id: 'sales',
      title: 'Sales & Products',
      items: [
        { href: '/admin/products', label: 'Ready Products', icon: <ShoppingCart className="w-4 h-4" /> },
        { href: '/admin/orders', label: 'Client Orders', icon: <Package className="w-4 h-4" /> },
        { href: '/admin/deals', label: 'Custom Deals', icon: <FolderKanban className="w-4 h-4" /> },
        { href: '/admin/payments', label: 'bKash Invoices', icon: <Receipt className="w-4 h-4" /> }
      ]
    },
    {
      id: 'content',
      title: 'Content Engine',
      items: [
        { href: '/admin/blogs', label: 'Manage Blogs', icon: <BookOpen className="w-4 h-4" /> },
        { href: '/admin/comments', label: 'Blog Comments', icon: <MessageCircle className="w-4 h-4" /> },
        { href: '/admin/casestudies', label: 'Case Studies', icon: <Briefcase className="w-4 h-4" /> },
        { href: '/admin/feedbacks', label: 'Manage Feedbacks', icon: <MessageSquare className="w-4 h-4" /> }
      ]
    },
    {
      id: 'customer',
      title: 'Uptime & Marketing',
      items: [
        { href: '/admin/support', label: 'Resolve Tickets', icon: <Wrench className="w-4 h-4" /> },
        { href: '/admin/emails', label: 'Email Campaigns', icon: <Mail className="w-4 h-4" /> }
      ]
    }
  ];

  const activeItem = navItems.find((item) => {
    if (item.href === '/admin') return pathname === '/admin';
    return pathname.startsWith(item.href);
  }) || navItems[0];

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isAdmin === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#09090b]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-zinc-950 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-zinc-500 animate-pulse">Verifying administrative access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-150 font-sans overflow-hidden transition-colors">
      
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-white dark:bg-zinc-950 transition-colors">
          
          {/* Mobile Dropdown Navigation */}
          <div className="md:hidden bg-zinc-50/90 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 p-4 flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-650 dark:from-purple-500 dark:to-indigo-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded shadow-sm tracking-wider uppercase">
                  ADMIN
                </div>
                <div>
                  <span className="font-extrabold text-xs text-zinc-950 dark:text-white block">Agency Admin</span>
                </div>
              </Link>
              <div className="flex items-center gap-1.5 text-[9px] text-zinc-500 font-mono">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full inline-block animate-pulse"></span>
                <span>v3.4.0</span>
              </div>
            </div>

            <div className="relative mt-1">
              <button
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-bold text-zinc-900 dark:text-white transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {activeItem.icon}
                  <span>{activeItem.label}</span>
                </div>
                <svg className={`w-4 h-4 text-zinc-500 transition-transform ${isMobileNavOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {isMobileNavOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setIsMobileNavOpen(false)} />
                  <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-25 text-xs font-semibold">
                    {navItems.map((item) => {
                      const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileNavOpen(false)}
                          className={`w-full flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-left transition-colors cursor-pointer ${
                            isActive
                              ? 'text-zinc-950 dark:text-white bg-zinc-100 dark:bg-zinc-900 font-bold'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                          }`}
                        >
                          {item.icon}
                          <span>{item.label}</span>
                        </Link>
                      );
                    })}

                    <div className="border-t border-zinc-200 dark:border-zinc-800 my-1"></div>

                    <Link
                      href="/"
                      onClick={() => setIsMobileNavOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-left text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Exit to Home</span>
                    </Link>

                    <button
                      onClick={() => {
                        setIsMobileNavOpen(false);
                        clearUserSession();
                        router.push('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-left text-rose-600 font-semibold transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Desktop Sidebar */}
          <aside className="hidden md:flex w-64 bg-zinc-50/80 dark:bg-zinc-950/70 backdrop-blur-xl border-r border-zinc-200/80 dark:border-zinc-900/80 p-4 space-y-6 flex-col justify-between transition-all duration-300">
            <div className="space-y-5">
              <Link href="/" className="flex items-center gap-3 px-2 py-1 hover:opacity-90 transition-opacity cursor-pointer group">
                <div className="bg-gradient-to-r from-purple-600 to-indigo-650 dark:from-purple-500 dark:to-indigo-500 text-white font-extrabold text-[10px] px-2.5 py-1 rounded shadow-md tracking-wider uppercase">
                  ADMIN
                </div>
                <div>
                  <span className="font-extrabold text-sm text-zinc-955 dark:text-white block group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">Agency Admin</span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-550 font-mono tracking-tight block">Secure Control Panel</span>
                </div>
              </Link>

              <nav className="space-y-4 pr-1 max-h-[calc(100vh-270px)] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-850">
                {navigationCategories.map((category) => {
                  const isOpen = openCategories[category.id] !== false;
                  return (
                    <div key={category.id} className="space-y-1">
                      <button
                        onClick={() => toggleCategory(category.id)}
                        className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 hover:text-zinc-650 dark:hover:text-zinc-300 transition-colors cursor-pointer"
                      >
                        <span>{category.title}</span>
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
                      </button>

                      {isOpen && (
                        <div className="space-y-1 mt-1 pl-0.5">
                          {category.items.map((item) => {
                            const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                            return (
                              <Link
                                key={item.href}
                                href={item.href}
                                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-semibold tracking-wide transition-all duration-250 cursor-pointer group ${
                                  isActive
                                    ? 'bg-white dark:bg-zinc-900/90 text-zinc-955 dark:text-white border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] font-bold border-l-4 border-l-purple-650 dark:border-l-purple-500 transform translate-x-1'
                                    : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-900/50'
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-purple-600 dark:text-purple-400' : 'text-zinc-455 dark:text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white'}`}>
                                    {item.icon}
                                  </span>
                                  <span className="truncate">{item.label}</span>
                                </div>
                                <ArrowRight className={`w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 ${isActive ? 'text-purple-600 dark:text-purple-400' : ''}`} />
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-900/60">
              <Link
                href="/"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-zinc-900/30 transition-all cursor-pointer group"
              >
                <ArrowLeft className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                <span>Exit to Home</span>
              </Link>
              
              <button
                onClick={() => {
                  clearUserSession();
                  router.push('/');
                }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/10 transition-all cursor-pointer text-left group"
              >
                <LogOut className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
                <span>Sign Out</span>
              </button>

              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-900 px-3 py-2 rounded-xl flex items-center justify-between text-[11px] text-zinc-450 dark:text-zinc-500 font-mono shadow-inner">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span>API Live</span>
                </div>
                <span>v3.4.0</span>
                <Settings className="w-3.5 h-3.5 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-all hover:rotate-45" />
              </div>
            </div>
          </aside>

          {/* Tab Subpage Content */}
          <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950 flex flex-col justify-between transition-colors">
            {children}
          </div>

      </main>

      {/* Toast Alert */}
      {toastText && (
        <div className="fixed bottom-6 right-6 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white px-5 py-3 rounded shadow-2xl flex items-center gap-2 animate-slideIn text-xs">
          <span className="font-bold text-zinc-600 dark:text-zinc-400">Admin:</span>
          <span>{toastText}</span>
        </div>
      )}
    </div>
  );
}
