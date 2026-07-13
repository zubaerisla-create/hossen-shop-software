'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, ChatMessage } from '../../../types';
import { getProducts, getPurchasedProducts } from '../../../utils/storage';
import { io } from 'socket.io-client';
import {
import { API_BASE_URL, SOCKET_URL } from '@/app/utils/api';
  ArrowLeft,
  Download,
  ExternalLink,
  Check,
  Terminal,
  Lock,
  Key,
  Calendar,
  HelpCircle,
  Shield,
  Wrench,
  FileCode,
  Info,
  Clock,
  Briefcase,
  MessageSquare,
  Paperclip,
  Send
} from 'lucide-react';

export default function PurchasedProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'downloads' | 'docs' | 'support' | 'chat'>('overview');
  const [copiedKey, setCopiedKey] = useState(false);

  // Chat State
  const [supportDealId, setSupportDealId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [userProfile, setUserProfile] = useState<{ name: string; avatar: string | null }>({ name: 'You', avatar: null });

  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Mock license key and login credentials
  const mockLicenseKey = `APX-LIC-${params.id?.toString().toUpperCase()}-${Math.floor(Math.random() * 90000) + 10000}`;
  const mockDbUser = `usr_${params.id?.toString().toLowerCase()}_db`;
  const mockDbPassword = `Pass_${Math.floor(Math.random() * 9000) + 1000}_Secure!`;

  // Scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (activeTab === 'chat') {
      scrollToBottom();
    }
  }, [chatMessages, activeTab]);

  // Handle Socket connection for support chat
  useEffect(() => {
    if (!supportDealId) return;

    const socket = io(SOCKET_URL);
    socketRef.current = socket;
    socket.emit('join_deal', supportDealId);

    socket.on('new_deal_message', (msg: ChatMessage) => {
      setChatMessages(prev => {
        if (prev.some(m => m.id === msg.id)) return prev;
        const filtered = prev.filter(m => !(m.id.startsWith('optimistic-') && m.content === msg.content));
        return [...filtered, msg];
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [supportDealId]);

  useEffect(() => {
    const allProducts = getProducts();
    const purchasedIds = getPurchasedProducts();

    // Check if the user actually owns this product
    if (!purchasedIds.includes(params.id as string)) {
      // If it exists in products but not purchased, or doesn't exist, we can redirect or show warning
    }

    const found = allProducts.find(p => p.id === params.id);
    if (found) {
      setProduct(found);
    }
  }, [params.id]);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-user-toast', { detail: text });
    window.dispatchEvent(event);
  };

  const copyLicenseKey = () => {
    navigator.clipboard.writeText(mockLicenseKey);
    setCopiedKey(true);
    triggerToast('License key copied to clipboard.');
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleCustomDealRequest = () => {
    if (!product) return;
    const estimateData = {
      title: `Extended Maintenance for ${product.name}`,
      desc: `I want to upgrade support for ${product.name}. I am requesting lifetime support / custom modifications: `,
      budget: 15000,
      tech: product.technologies.join(', ')
    };
    localStorage.setItem('apex_imported_estimate', JSON.stringify(estimateData));
    router.push('/user/deals');
  };

  const initializeChat = async () => {
    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      triggerToast('Authentication required to open chat.');
      return;
    }
    setLoadingChat(true);
    try {
      const meRes = await fetch(`${API_BASE_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!meRes.ok) throw new Error('Failed to get user profile');
      const meData = await meRes.json();
      const meUser = meData.data?.user;
      const customerId = meUser?.id;
      if (!customerId) throw new Error('Customer ID not found');

      // Save user profile for avatar display
      setUserProfile({
        name: meUser?.name || 'You',
        avatar: meUser?.avatar || meUser?.profileImage || null
      });

      const dealRes = await fetch(`${API_BASE_URL}/api/deals/support/${customerId}/${params.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!dealRes.ok) throw new Error('Failed to get or create support deal');
      const dealData = await dealRes.json();
      const deal = dealData.data?.deal;
      if (!deal) throw new Error('Support deal not found');

      setSupportDealId(deal.id);

      const msgsRes = await fetch(`${API_BASE_URL}/api/deals/${deal.id}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (msgsRes.ok) {
        const msgsData = await msgsRes.json();
        if (msgsData.data?.messages) {
          setChatMessages(msgsData.data.messages);
        }
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to initialize deployment support chat.');
    } finally {
      setLoadingChat(false);
    }
  };

  const handleOpenDeploymentChat = async () => {
    setActiveTab('chat');
    await initializeChat();
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = chatInput.trim();
    if (!content || !supportDealId) return;

    const token = localStorage.getItem('apex_user_token');
    if (!token) return;

    const tempId = `optimistic-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender: 'customer',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      createdAt: new Date().toISOString()
    } as any;

    setChatMessages(prev => [...prev, optimisticMsg]);
    setChatInput('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/deals/${supportDealId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      console.error(err);
      triggerToast('Failed to send message.');
      setChatMessages(prev => prev.filter(m => m.id !== tempId));
      setChatInput(content);
    }
  };

  const triggerMockUpload = async () => {
    if (!supportDealId) return;
    const token = localStorage.getItem('apex_user_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/deals/${supportDealId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: 'Shared server configuration env file.' }),
      });

      if (!response.ok) throw new Error('Failed');
      triggerToast('Attached server config.');
    } catch (err) {
      console.error(err);
      triggerToast('Failed to attach config.');
    }
  };

  if (!product) {
    return (
      <div className="flex flex-col flex-1 bg-white dark:bg-zinc-950 text-zinc-500 justify-center items-center h-screen">
        <p className="text-xs">Loading purchased product workspace...</p>
      </div>
    );
  }

  // Calculate order details dates (simulated purchase: July 1, 2026 / support active 6 months)
  const purchaseDate = '2026-07-01';
  const supportExpiryDate = '2027-01-01';

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full bg-white dark:bg-zinc-950 transition-colors">

      {/* Header breadcrumb */}
      <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900 flex justify-between items-center transition-colors">
        <div className="space-y-1">
          <button
            onClick={() => router.push('/user')}
            className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer font-bold mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white uppercase tracking-tight">{product.name}</h2>
            <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-250 dark:border-emerald-900 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase animate-pulse">
              Active Support
            </span>
          </div>
        </div>

        {product.demoUrl && (
          <a
            href={product.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:from-violet-500 hover:via-indigo-500 hover:to-blue-500 text-white px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-0.5 active:translate-y-0 text-[10px]"
          >
            <span>Visit Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1 w-full">

        {/* Workspace Overview & Main Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Navigation Tabs & Tab Panels */}
          <div className="lg:col-span-8 space-y-6">

            {/* Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800 flex gap-6 text-xs font-semibold text-zinc-500 overflow-x-auto">
              {[
                { id: 'overview', label: 'Product Overview', icon: <Info className="w-3.5 h-3.5" /> },
                { id: 'downloads', label: 'Downloads & Credentials', icon: <FileCode className="w-3.5 h-3.5" /> },
                { id: 'docs', label: 'Setup Guide', icon: <Terminal className="w-3.5 h-3.5" /> },
                { id: 'support', label: 'Support & Maintenance', icon: <HelpCircle className="w-3.5 h-3.5" /> },
                { id: 'chat', label: 'Deployment Chat', icon: <MessageSquare className="w-3.5 h-3.5" /> }
              ].map(t => (
                <button
                  key={t.id}
                  onClick={async () => {
                    setActiveTab(t.id as any);
                    if (t.id === 'chat') {
                      await initializeChat();
                    }
                  }}
                  className={`pb-2.5 flex items-center gap-1.5 transition-colors cursor-pointer border-b-2 -mb-[2px] shrink-0 ${activeTab === t.id
                      ? 'text-zinc-950 dark:text-white border-zinc-950 dark:border-white font-bold'
                      : 'border-transparent hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                >
                  {t.icon}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Panel Content */}
            <div className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 p-6 rounded-lg space-y-6">

              {/* TAB 1: PRODUCT OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">About This Template</span>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed text-[11px]">
                      {product.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-2">
                    <div className="space-y-2.5">
                      <span className="font-bold text-zinc-900 dark:text-white block uppercase tracking-wider text-[9px] border-b border-zinc-200 dark:border-zinc-800 pb-1">Included Functional Features</span>
                      <ul className="space-y-2 text-zinc-650 dark:text-zinc-400">
                        {product.features.map((f, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-2.5">
                      <span className="font-bold text-zinc-900 dark:text-white block uppercase tracking-wider text-[9px] border-b border-zinc-200 dark:border-zinc-800 pb-1">System Dependencies</span>
                      <ul className="space-y-2 font-mono text-[10px] text-zinc-650 dark:text-zinc-400">
                        {product.requirements.map((r, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Terminal className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                            <span>{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Image gallery */}
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Template Gallery Screenshots</span>
                    <div className="grid grid-cols-3 gap-3">
                      {product.images.map((img, idx) => (
                        <div key={idx} className="aspect-video rounded overflow-hidden bg-zinc-150 border border-zinc-200 dark:border-zinc-850">
                          <img src={img} alt={`${product.name} screenshot`} className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: DOWNLOADS & CREDENTIALS */}
              {activeTab === 'downloads' && (
                <div className="space-y-6 animate-fadeIn">

                  {/* Download actions */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-850 p-5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-950 dark:text-white text-xs">Full Codebase Source (.zip)</h4>
                      <p className="text-zinc-500 text-[10px]">Version {product.version} package release. Contains server backend &amp; frontend clients.</p>
                    </div>
                    {product.zipUrl ? (
                      <a
                        href={product.zipUrl}
                        download
                        onClick={() => triggerToast(`Starting download for ${product.name} source code zip...`)}
                        className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded flex items-center gap-2 cursor-pointer transition-colors shrink-0"
                      >
                        <Download className="w-4 h-4" /> Download ZIP Archive
                      </a>
                    ) : (
                      <button
                        onClick={() => triggerToast(`Downloading source code archive for ${product.name} v${product.version} (18.4 MB)...`)}
                        className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded flex items-center gap-2 cursor-pointer transition-colors shrink-0"
                      >
                        <Download className="w-4 h-4" /> Download Archive
                      </button>
                    )}
                  </div>

                  {/* GitHub Repository access */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-850 p-5 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <h4 className="font-bold text-zinc-950 dark:text-white text-xs">GitHub Repository Access</h4>
                      <p className="text-zinc-500 text-[10px]">Access to the GitHub codebase repository for version control, issue tracking, and branch cloning.</p>
                    </div>
                    {product.githubUrl ? (
                      <a
                        href={product.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded flex items-center gap-2 cursor-pointer transition-colors shrink-0"
                      >
                        Open GitHub Repository <ExternalLink className="w-4 h-4" />
                      </a>
                    ) : (
                      <button
                        onClick={() => triggerToast(`Repository access requested for ${product.name}. A representative will invite you within 24 hours.`)}
                        className="px-4 py-2 bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded cursor-pointer transition-colors shrink-0"
                      >
                        Request GitHub Access
                      </button>
                    )}
                  </div>

                  {/* License block */}
                  <div className="space-y-2">
                    <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">Active License Key</span>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 px-3 py-2 rounded font-mono text-zinc-950 dark:text-white flex items-center justify-between">
                        <span>{mockLicenseKey}</span>
                        <span className="text-[9px] uppercase font-bold text-zinc-400">{product.license}</span>
                      </div>
                      <button
                        onClick={copyLicenseKey}
                        className="px-3 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-850 dark:text-zinc-200 rounded font-bold transition-colors cursor-pointer"
                      >
                        {copiedKey ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* Dev Credentials if applicable */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-zinc-500" />
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">Client Default Database &amp; Admin Credentials</span>
                    </div>

                    <div className="border border-zinc-200 dark:border-zinc-850 rounded-lg overflow-hidden">
                      <table className="w-full text-left border-collapse text-[11px]">
                        <thead>
                          <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-850 text-zinc-500 uppercase font-bold text-[9px] tracking-wider">
                            <th className="p-3">Service Node</th>
                            <th className="p-3">Default Account / URL</th>
                            <th className="p-3">Security Secret / Token</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b border-zinc-200 dark:border-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300">
                            <td className="p-3 font-semibold text-zinc-950 dark:text-white">Admin Dashboard URL</td>
                            <td className="p-3">
                              <a href={`${product.demoUrl || '#'}/admin`} target="_blank" rel="noreferrer" className="text-zinc-950 dark:text-white hover:underline font-bold flex items-center gap-1">
                                /admin panel <ExternalLink className="w-3 h-3" />
                              </a>
                            </td>
                            <td className="p-3 font-mono text-zinc-400">Click preview to access</td>
                          </tr>
                          <tr className="border-b border-zinc-200 dark:border-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300">
                            <td className="p-3 font-semibold text-zinc-950 dark:text-white">Superuser Credentials</td>
                            <td className="p-3 font-mono">admin@agency-client.com</td>
                            <td className="p-3 font-mono flex items-center gap-1.5">
                              <span>Hossen ShopDemo2026!</span>
                            </td>
                          </tr>
                          <tr className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300">
                            <td className="p-3 font-semibold text-zinc-950 dark:text-white">PostgreSQL Seed Credentials</td>
                            <td className="p-3 font-mono">{mockDbUser}</td>
                            <td className="p-3 font-mono">{mockDbPassword}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/25 border border-zinc-200 dark:border-zinc-850 p-3 rounded flex items-center gap-2 text-zinc-500 leading-normal">
                      <Key className="w-4 h-4 shrink-0 text-zinc-400" />
                      <span>Note: These are mock local environment credentials seeded automatically for your project database setup. You are strongly advised to change them in production environment files.</span>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 3: SETUP GUIDE */}
              {activeTab === 'docs' && (
                <div className="space-y-6 animate-fadeIn text-[11px] leading-relaxed text-zinc-650 dark:text-zinc-400">

                  {/* Documentation link */}
                  {product.documentationUrl && (
                    <div className="bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-850 p-4 rounded-lg flex justify-between items-center">
                      <div className="space-y-0.5">
                        <span className="font-bold text-zinc-950 dark:text-white block">Full Documentation Web Guides</span>
                        <p className="text-zinc-500 text-[10px]">Detailed steps on deployment, APIs, styling overrides, and components.</p>
                      </div>
                      <a
                        href={product.documentationUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-1.8 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-bold rounded flex items-center gap-1 transition-colors"
                      >
                        Browse Docs <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {/* Inline Installation Guide */}
                  <div className="space-y-4">
                    <span className="text-[10px] uppercase font-bold text-zinc-900 dark:text-white block tracking-wider border-b border-zinc-200 dark:border-zinc-800 pb-1.5">Standard Installation Instructions</span>

                    <div className="space-y-3">
                      <div>
                        <strong className="text-zinc-950 dark:text-white block">Step 1: Extract and Initialize</strong>
                        <p>Extract the downloaded codebase zip into your development directory and run the package installer:</p>
                        <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-2.5 rounded font-mono text-[10px] text-zinc-800 dark:text-zinc-350 mt-1">
                          cd {product.name.split(' ')[0].toLowerCase()}-codebase<br />
                          npm install
                        </pre>
                      </div>

                      <div>
                        <strong className="text-zinc-950 dark:text-white block">Step 2: Configure Environment Variables</strong>
                        <p>Create a `.env` file in the root folder using the template below:</p>
                        <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-2.5 rounded font-mono text-[10px] text-zinc-800 dark:text-zinc-350 mt-1">
                          DATABASE_URL=&quot;postgresql://{mockDbUser}:{mockDbPassword}@localhost:5432/apex_db?schema=public&quot;<br />
                          NEXTAUTH_SECRET=&quot;{mockDbPassword}&quot;<br />
                          NEXTAUTH_URL=&quot;http://localhost:3000&quot;
                        </pre>
                      </div>

                      <div>
                        <strong className="text-zinc-950 dark:text-white block">Step 3: Setup database schema &amp; start dev server</strong>
                        <p>Perform migrations to setup database schema and start the dev compiler server:</p>
                        <pre className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-2.5 rounded font-mono text-[10px] text-zinc-800 dark:text-zinc-350 mt-1">
                          npx prisma db push<br />
                          npm run dev
                        </pre>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 4: SUPPORT & MAINTENANCE */}
              {activeTab === 'support' && (
                <div className="space-y-6 animate-fadeIn">

                  {/* Validity Info */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-900 p-5 rounded-lg space-y-4">
                    <div className="flex justify-between items-start border-b border-zinc-200 dark:border-zinc-800 pb-3">
                      <div>
                        <h4 className="font-bold text-zinc-950 dark:text-white text-xs">6 Months Support &amp; Maintenance Timeline</h4>
                        <p className="text-zinc-500 text-[10px] mt-0.5">Every ready product license includes free warranty support covering version updates and bug patches.</p>
                      </div>
                      <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-350 border border-emerald-250 dark:border-emerald-900 px-2 py-0.5 rounded font-mono font-bold text-[9px] uppercase">
                        Support Active
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                      <div className="space-y-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-3 rounded">
                        <span className="text-zinc-400 text-[8px] uppercase font-bold tracking-wider">Purchase Date</span>
                        <span className="font-mono font-bold text-zinc-950 dark:text-white block">{purchaseDate}</span>
                      </div>
                      <div className="space-y-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-3 rounded">
                        <span className="text-zinc-400 text-[8px] uppercase font-bold tracking-wider">Service Period</span>
                        <span className="font-bold text-zinc-950 dark:text-white block">6 Months Included</span>
                      </div>
                      <div className="space-y-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-3 rounded">
                        <span className="text-zinc-400 text-[8px] uppercase font-bold tracking-wider">Validity Expiry</span>
                        <span className="font-mono font-bold text-zinc-950 dark:text-white block">{supportExpiryDate}</span>
                      </div>
                    </div>

                    <p className="text-zinc-500 text-[11px] leading-relaxed pt-1">
                      During this 6-month period, you can open support tickets for technical setup queries or version bugs directly from the <Link href="/user/support" className="text-zinc-900 dark:text-white font-bold underline">Support Ticket panel</Link>. We guarantee code-level assistance for any issue relating to the default codebase.
                    </p>
                  </div>

                  {/* Custom deal card for lifetime support */}
                  <div className="border border-zinc-200 dark:border-zinc-800/80 p-5 rounded-lg bg-zinc-50 dark:bg-zinc-900/30 space-y-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Wrench className="w-4 h-4 text-zinc-500" />
                        <h4 className="font-bold text-zinc-950 dark:text-white text-xs">Request Lifetime Support or Additional Customizations</h4>
                      </div>
                      <p className="text-zinc-550 dark:text-zinc-450 text-[11px] leading-relaxed">
                        Need permanent code support beyond 6 months? Or do you require specialized developers to add new features, customize UI templates, or build supplementary mobile app variants?
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 pt-2 border-t border-zinc-200 dark:border-zinc-900/60">
                      <div className="text-[10px] text-zinc-500 font-medium">
                        <span>Initiate a custom contract workspace with pricing calculated individually.</span>
                      </div>
                      <button
                        onClick={handleCustomDealRequest}
                        className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded flex items-center gap-1.5 transition-colors cursor-pointer text-center shrink-0"
                      >
                        <Briefcase className="w-3.5 h-3.5" /> Request Custom Deal
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 5: DEPLOYMENT CHAT */}
              {activeTab === 'chat' && (
                <div className="animate-fadeIn flex flex-col" style={{ height: '600px' }}>
                  {/* Chat Header */}
                  <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4">
                    <h4 className="font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider text-[10px]">Dedicated Deployment Workspace Chat</h4>
                    <p className="text-zinc-500 text-[9px] mt-0.5">Discuss installation, domains, staging pipelines, and going live with our team.</p>
                  </div>

                  {loadingChat ? (
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center space-y-2">
                        <div className="w-6 h-6 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-950 dark:border-t-white rounded-full animate-spin mx-auto"></div>
                        <p className="text-[10px] text-zinc-500 font-bold animate-pulse">Initializing chat workspace...</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Messages scroll area — takes all available space */}
                      <div className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
                        {chatMessages.length === 0 ? (
                          <div className="h-full flex items-center justify-center">
                            <div className="text-center py-12">
                              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-3">
                                <MessageSquare className="w-5 h-5 text-zinc-400" />
                              </div>
                              <p className="text-zinc-400 font-medium text-[10px]">No messages yet.</p>
                              <p className="text-zinc-400 text-[9px] mt-0.5">Send a message to start collaboration with our team.</p>
                            </div>
                          </div>
                        ) : (
                          chatMessages.map((msg) => {
                            const isYou = msg.sender === 'customer';
                            const timeStr = msg.timestamp ||
                              (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
                            const initials = isYou
                              ? (userProfile.name || 'Y').charAt(0).toUpperCase()
                              : 'A';
                            return (
                              <div
                                key={msg.id}
                                className={`flex items-end gap-2.5 ${ isYou ? 'flex-row-reverse' : 'flex-row' }`}
                              >
                                {/* Avatar — profile image or coloured initial */}
                                <div className="shrink-0">
                                  {isYou && userProfile.avatar ? (
                                    <img
                                      src={userProfile.avatar}
                                      alt={userProfile.name}
                                      className="w-7 h-7 rounded-full object-cover ring-2 ring-zinc-200 dark:ring-zinc-700"
                                    />
                                  ) : (
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] uppercase select-none ${
                                      isYou
                                        ? 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950'
                                        : 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                                    }`}>
                                      {initials}
                                    </div>
                                  )}
                                </div>

                                {/* Bubble + sender + timestamp on same row below */}
                                <div className={`flex flex-col gap-1 max-w-[70%] ${ isYou ? 'items-end' : 'items-start' }`}>
                                  {/* Sender name + time — same line */}
                                  <div className={`flex items-center gap-1.5 ${ isYou ? 'flex-row-reverse' : 'flex-row' }`}>
                                    <span className="text-[9px] font-semibold text-zinc-600 dark:text-zinc-400">
                                      {isYou ? userProfile.name : 'Support Team'}
                                    </span>
                                    {timeStr && (
                                      <span className="text-[8px] text-zinc-400 font-mono">{timeStr}</span>
                                    )}
                                  </div>
                                  {/* Message bubble */}
                                  <div className={`px-3.5 py-2.5 text-[11px] leading-relaxed whitespace-pre-wrap break-words ${
                                    isYou
                                      ? 'bg-zinc-900 dark:bg-zinc-800 text-white rounded-2xl rounded-tr-sm'
                                      : 'bg-zinc-100 dark:bg-zinc-800/70 text-zinc-800 dark:text-zinc-100 rounded-2xl rounded-tl-sm'
                                  }`}>
                                    {msg.content}
                                  </div>
                                </div>
                              </div>
                            );
                          })
                        )}
                        <div ref={messagesEndRef} />
                      </div>

                      {/* Compose — pinned to bottom */}
                      <form
                        onSubmit={handleSendChat}
                        className="shrink-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm"
                      >
                        <textarea
                          rows={2}
                          placeholder="Write a message to our deployment engineers..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendChat(e as any);
                            }
                          }}
                          className="w-full bg-transparent border-0 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600 p-3 text-[11px] focus:ring-0 focus:outline-none resize-none"
                        />
                        <div className="flex justify-between items-center px-3 py-2 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-900/60">
                          <button
                            type="button"
                            onClick={triggerMockUpload}
                            className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-[9px] font-semibold transition-colors cursor-pointer px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                          >
                            <Paperclip className="w-3.5 h-3.5" /> Attach Config
                          </button>
                          <button
                            type="submit"
                            disabled={!chatInput.trim()}
                            className="bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-[9px] uppercase tracking-wide cursor-pointer transition-all"
                          >
                            Send <Send className="w-3 h-3" />
                          </button>
                        </div>
                      </form>
                    </>
                  )}
                </div>
              )}

            </div>

          </div>

          {/* Right Column: Order Details & Quick Actions */}
          <div className="lg:col-span-4 space-y-6">

            {/* Prominent Support for Deployment & Going Live Section */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-600 text-white p-5 rounded-lg shadow-lg space-y-4 relative overflow-hidden group">
              <div className="absolute -right-8 -top-8 w-24 h-24 bg-white/10 rounded-full blur-xl group-hover:scale-125 transition-transform duration-500"></div>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                </span>
                <h3 className="font-extrabold text-[9px] uppercase tracking-wider text-emerald-100">Deployment Assistant</h3>
              </div>
              
              <div className="space-y-1.5">
                <h4 className="text-xs font-black leading-tight">Support for Deployment &amp; Going Live</h4>
                <p className="text-[10px] text-emerald-50/90 leading-relaxed">
                  Need help launching this website template? Open our dedicated workspace chat to get direct deployment, hosting, database, and setup assistance from our team.
                </p>
              </div>

              <button
                onClick={handleOpenDeploymentChat}
                className="w-full py-2.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-md font-bold transition-all duration-300 shadow-sm cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 text-[10px] uppercase tracking-wider block text-center"
              >
                Open Deployment Chat
              </button>
            </div>

            {/* Order info widget */}
            <div className="border border-zinc-200 dark:border-zinc-900 p-5 rounded-lg bg-zinc-50 dark:bg-[#121214] space-y-4">
              <div className="border-b border-zinc-200 dark:border-zinc-850 pb-3">
                <span className="text-[9px] uppercase font-bold text-zinc-400 tracking-wider">Purchase &amp; Billing</span>
                <span className="text-sm font-bold text-zinc-950 dark:text-white block mt-1">Order Details</span>
              </div>

              <div className="space-y-2 text-[11px] leading-normal text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>Product Class:</span>
                  <span className="font-bold text-zinc-950 dark:text-white">{product.category}</span>
                </div>
                <div className="flex justify-between">
                  <span>Price Paid:</span>
                  <span className="font-bold text-zinc-950 dark:text-white">{product.price.toLocaleString()} BDT</span>
                </div>
                <div className="flex justify-between">
                  <span>Billing Gateway:</span>
                  <span className="font-semibold text-pink-700">bKash wallet</span>
                </div>
                <div className="flex justify-between">
                  <span>Tax (5% included):</span>
                  <span className="font-semibold">{Math.round(product.price * 0.05).toLocaleString()} BDT</span>
                </div>
                <div className="flex justify-between border-t border-zinc-200 dark:border-zinc-800/80 pt-2 font-bold text-zinc-950 dark:text-white text-xs">
                  <span>Total charged:</span>
                  <span>{Math.round(product.price * 1.05).toLocaleString()} BDT</span>
                </div>
              </div>
            </div>

            {/* Support validity reminder widget */}
            <div className="border border-zinc-200 dark:border-zinc-900 p-5 rounded-lg bg-zinc-50 dark:bg-[#121214] space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                <span className="font-bold text-zinc-950 dark:text-white">Service Period Notice</span>
              </div>
              <p className="text-[11px] leading-relaxed text-zinc-550 dark:text-zinc-400">
                Your standard 6-month free support period expires on <strong className="text-zinc-950 dark:text-white">{supportExpiryDate}</strong>.
              </p>
              <button
                onClick={handleCustomDealRequest}
                className="w-full py-2 bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-350 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded font-semibold transition-colors cursor-pointer text-center"
              >
                Apply for Lifetime Support
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
