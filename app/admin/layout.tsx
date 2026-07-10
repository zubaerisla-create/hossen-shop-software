'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, FolderKanban, Wrench, Receipt, Settings, ArrowRight, ArrowLeft, LogOut, Package } from 'lucide-react';
import { initializeStorage, syncWithBackend } from '../utils/storage';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [toastText, setToastText] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

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
        const response = await fetch('http://localhost:5000/api/auth/me', {
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
    { href: '/admin/orders', label: 'Client Orders', icon: <Package className="w-4 h-4" /> },
    { href: '/admin/deals', label: 'Custom Deals', icon: <FolderKanban className="w-4 h-4" /> },
    { href: '/admin/support', label: 'Resolve Tickets', icon: <Wrench className="w-4 h-4" /> },
    { href: '/admin/payments', label: 'bKash Invoices', icon: <Receipt className="w-4 h-4" /> }
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
          <div className="md:hidden bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-900 p-4 flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2 hover:opacity-85 transition-opacity cursor-pointer">
                <div className="bg-zinc-950 dark:bg-white px-2 py-0.5 rounded text-white dark:text-black font-extrabold text-[9px]">
                  ADMIN
                </div>
                <div>
                  <span className="font-extrabold text-xs text-zinc-950 dark:text-white block">Agency Admin</span>
                </div>
              </Link>
              <span className="text-[9px] text-zinc-500 font-medium">v3.4.0</span>
            </div>

            <div className="relative mt-1">
              <button
                onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
                className="w-full flex items-center justify-between px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-bold text-zinc-900 dark:text-white transition-colors cursor-pointer"
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
                  <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded shadow-xl py-1 z-25 text-xs font-semibold">
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
                        localStorage.removeItem('apex_user_role');
                        localStorage.removeItem('apex_user_token');
                        localStorage.removeItem('apex_user_email');
                        localStorage.removeItem('apex_user_name');
                        localStorage.removeItem('apex_user_avatar');
                        window.dispatchEvent(new Event('auth-change'));
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
          <aside className="hidden md:flex w-64 bg-zinc-50 dark:bg-zinc-900/60 border-r border-zinc-200 dark:border-zinc-900 p-4 space-y-6 flex-col justify-between transition-colors">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-2.5 px-2 hover:opacity-85 transition-opacity cursor-pointer">
                <div className="bg-zinc-950 dark:bg-white px-2 py-0.5 rounded text-white dark:text-black font-extrabold text-[10px]">
                  ADMIN
                </div>
                <div>
                  <span className="font-extrabold text-sm text-zinc-950 dark:text-white block">Agency Admin</span>
                  <span className="text-[10px] text-zinc-500 font-medium">Control Dashboard</span>
                </div>
              </Link>

              <nav className="space-y-1">
                {navItems.map((item) => {
                  const isActive = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                        isActive
                          ? 'bg-zinc-200 dark:bg-zinc-900 text-zinc-950 dark:text-white border border-zinc-300 dark:border-zinc-800'
                          : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        {item.icon}
                        <span>{item.label}</span>
                      </div>
                      <ArrowRight className="w-3 h-3 opacity-60" />
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-2">
              <Link
                href="/"
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Exit to Home</span>
              </Link>
              
              <button
                onClick={() => {
                  localStorage.removeItem('apex_user_role');
                  localStorage.removeItem('apex_user_token');
                  localStorage.removeItem('apex_user_email');
                  localStorage.removeItem('apex_user_name');
                  localStorage.removeItem('apex_user_avatar');
                  window.dispatchEvent(new Event('auth-change'));
                  router.push('/');
                }}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/10 transition-colors cursor-pointer text-left"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>

              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded flex items-center justify-between text-xs text-zinc-500">
                <span>Version 3.4.0</span>
                <Settings className="w-4 h-4 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-all" />
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
