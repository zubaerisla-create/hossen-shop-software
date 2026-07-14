'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Download, Laptop, Receipt, Ticket, Settings, ArrowRight, ArrowLeft, LogOut } from 'lucide-react';
import { initializeStorage, syncWithBackend, clearUserSession } from '../utils/storage';
import { API_BASE_URL } from '../utils/api';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [toastText, setToastText] = useState<string | null>(null);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [userName, setUserName] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    initializeStorage();

    const verifyCustomer = async () => {
      const token = localStorage.getItem('apex_user_token');
      const role = localStorage.getItem('apex_user_role');

      if (!token) {
        localStorage.setItem('auth_redirect_intent', pathname);
        setIsAuthenticated(false);
        router.push('/?auth=required');
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const resData = await response.json();
        if (response.ok && resData.data?.user) {
          localStorage.setItem('apex_user_role', 'customer');
          const storedName = localStorage.getItem('apex_user_name');
          setUserName(storedName || resData.data.user.name || 'Client');
          const storedAvatar = localStorage.getItem('apex_user_avatar');
          setUserAvatar(storedAvatar || resData.data.user.avatar || null);
          setIsAuthenticated(true);
          await syncWithBackend();
        } else {
          localStorage.removeItem('apex_user_token');
          localStorage.removeItem('apex_user_role');
          localStorage.removeItem('apex_user_name');
          localStorage.removeItem('apex_user_avatar');
          localStorage.removeItem('apex_user_email');
          window.dispatchEvent(new Event('auth-change'));
          localStorage.setItem('auth_redirect_intent', pathname);
          setIsAuthenticated(false);
          router.push('/?auth=required');
        }
      } catch (err) {
        // Fallback to local storage if offline to preserve developer experience
        const storedName = localStorage.getItem('apex_user_name');
        if (storedName) setUserName(storedName);
        const storedAvatar = localStorage.getItem('apex_user_avatar');
        if (storedAvatar) setUserAvatar(storedAvatar);
        setIsAuthenticated(true);
        syncWithBackend().catch(() => {});
      }
    };

    verifyCustomer();

    // Toast event subscriber
    const handleToast = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setToastText(detail);
      setTimeout(() => setToastText(null), 4000);
    };

    const handleProfileUpdate = () => {
      const storedName = localStorage.getItem('apex_user_name');
      if (storedName) {
        setUserName(storedName);
      }
      const storedAvatar = localStorage.getItem('apex_user_avatar');
      setUserAvatar(storedAvatar || null);
    };

    window.addEventListener('apex-user-toast', handleToast);
    window.addEventListener('apex-user-profile-update', handleProfileUpdate);
    return () => {
      window.removeEventListener('apex-user-toast', handleToast);
      window.removeEventListener('apex-user-profile-update', handleProfileUpdate);
    };
  }, [pathname, router]);

  const navItems = [
    { href: '/user', label: 'Overview Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: '/user/products', label: 'Purchased Templates', icon: <Download className="w-4 h-4" /> },
    { href: '/user/deals', label: 'Custom Projects', icon: <Laptop className="w-4 h-4" /> },
    { href: '/user/invoices', label: 'PDF Invoices', icon: <Receipt className="w-4 h-4" /> },
    { href: '/user/support', label: 'Support Tickets', icon: <Ticket className="w-4 h-4" /> },
    { href: '/user/settings', label: 'Account Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  const activeItem = navItems.find((item) => {
    if (item.href === '/user') return pathname === '/user';
    return pathname.startsWith(item.href);
  }) || navItems[0];

  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-[#09090b]">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-4 border-zinc-950 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-zinc-500 animate-pulse">Verifying workspace access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-150 font-sans overflow-hidden transition-colors">
      
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0 bg-white dark:bg-zinc-950 transition-colors">
          
          {/* Mobile Dropdown Navigation */}
          <div className="md:hidden bg-zinc-50/90 dark:bg-zinc-955/85 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-900 p-4 flex flex-col gap-2 relative">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-2.5 hover:opacity-85 transition-opacity cursor-pointer">
                {userAvatar ? (
                  <div className="w-7 h-7 rounded-full overflow-hidden border border-zinc-200 dark:border-zinc-800 ring-2 ring-emerald-500/25 flex-shrink-0">
                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-emerald-650 to-teal-500 text-white font-extrabold text-[9px] px-2 py-0.5 rounded shadow-sm tracking-wider uppercase flex-shrink-0">
                    USER
                  </div>
                )}
                <div>
                  <span className="font-extrabold text-xs text-zinc-950 dark:text-white block">Client Workspace</span>
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
                  <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl py-1 z-25 text-xs font-semibold">
                    {navItems.map((item) => {
                      const isActive = item.href === '/user' ? pathname === '/user' : pathname.startsWith(item.href);
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileNavOpen(false)}
                          className={`w-full flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-left transition-colors cursor-pointer ${
                            isActive
                              ? 'text-zinc-955 dark:text-white bg-zinc-100 dark:bg-zinc-900 font-bold'
                              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
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
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-left text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
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
          <aside className="hidden md:flex w-64 bg-zinc-50/80 dark:bg-zinc-955/70 backdrop-blur-xl border-r border-zinc-200/80 dark:border-zinc-900/80 p-4 space-y-6 flex-col justify-between transition-all duration-300">
            <div className="space-y-5">
              <Link href="/" className="flex items-center gap-3 px-2 py-1 hover:opacity-90 transition-opacity cursor-pointer group">
                {userAvatar ? (
                  <div className="w-8 h-8 rounded-full overflow-hidden border border-zinc-200/60 dark:border-zinc-800/80 ring-2 ring-emerald-500/25 flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                    <img src={userAvatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-extrabold text-[10px] w-8 h-8 rounded-full flex items-center justify-center shadow-md flex-shrink-0 transition-transform duration-300 group-hover:scale-105">
                    {(userName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="overflow-hidden">
                  <span className="font-extrabold text-sm text-zinc-955 dark:text-white block truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-455 transition-colors">Client Workspace</span>
                  <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-semibold truncate block">{userName}</span>
                </div>
              </Link>

              <nav className="space-y-1.5 pr-1 max-h-[calc(100vh-270px)] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-200 dark:scrollbar-thumb-zinc-850">
                {navItems.map((item) => {
                  const isActive = item.href === '/user' ? pathname === '/user' : pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] font-semibold tracking-wide transition-all duration-250 cursor-pointer group ${
                        isActive
                          ? 'bg-white dark:bg-zinc-900/90 text-zinc-950 dark:text-white border border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_4px_12px_-2px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] font-bold border-l-4 border-l-emerald-600 dark:border-l-emerald-500 transform translate-x-1'
                          : 'text-zinc-500 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white hover:bg-zinc-100/80 dark:hover:bg-zinc-900/50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={`transition-transform duration-300 ${isActive ? 'scale-110 text-emerald-600 dark:text-emerald-400' : 'text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-950 dark:group-hover:text-white'}`}>
                          {item.icon}
                        </span>
                        <span className="truncate">{item.label}</span>
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="space-y-3 pt-3 border-t border-zinc-200/60 dark:border-zinc-900/60">
              <Link
                href="/"
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-[13px] font-semibold text-zinc-500 hover:text-zinc-955 dark:hover:text-white hover:bg-zinc-100/60 dark:hover:bg-zinc-900/30 transition-all cursor-pointer group"
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
                <Link href="/user/settings">
                  <Settings className="w-3.5 h-3.5 hover:text-zinc-955 dark:hover:text-white cursor-pointer transition-all hover:rotate-45" />
                </Link>
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
          <span className="font-bold text-zinc-600 dark:text-zinc-450">Workspace:</span>
          <span>{toastText}</span>
        </div>
      )}
    </div>
  );
}
