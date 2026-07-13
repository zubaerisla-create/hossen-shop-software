'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Product, ChatMessage, CustomDeal } from '../../../../../types';
import { getProducts } from '../../../../../utils/storage';
import { io } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from '@/app/utils/api';
import {
  ArrowLeft,
  ExternalLink,
  Lock,
  User,
  FileCode,
  Paperclip,
  Send
} from 'lucide-react';

export default function AdminOrderWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const { customerId, productId } = params;

  const [product, setProduct] = useState<Product | null>(null);
  const [deal, setDeal] = useState<CustomDeal | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [customerName, setCustomerName] = useState('John Doe');
  const [customerEmail, setCustomerEmail] = useState('john.doe@example.com');

  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const supportDealId = `ts-${customerId}-${productId}`;

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-admin-toast', { detail: text });
    window.dispatchEvent(event);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  useEffect(() => {
    const initWorkspace = async () => {
      const allProducts = getProducts();
      const foundProduct = allProducts.find(p => p.id === productId);
      if (foundProduct) {
        setProduct(foundProduct);
      }

      const token = localStorage.getItem('apex_user_token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        // 1. Fetch/Create support deal
        const dealRes = await fetch(`${API_BASE_URL}/api/deals/support/${customerId}/${productId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (dealRes.ok) {
          const dealData = await dealRes.json();
          const foundDeal = dealData.data?.deal;
          setDeal(foundDeal);

          // Find customer details from invoices or use default
          const invRes = await fetch(`${API_BASE_URL}/api/invoices`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (invRes.ok) {
            const invData = await invRes.json();
            const relevantInvoice = (invData.data?.invoices || []).find(
              (inv: any) => inv.customerId === customerId && inv.productId === productId
            );
            if (relevantInvoice?.customer) {
              setCustomerName(relevantInvoice.customer.name);
              setCustomerEmail(relevantInvoice.customer.email);
            }
          }
        }

        // 2. Fetch messages
        const msgsRes = await fetch(`${API_BASE_URL}/api/deals/${supportDealId}/messages`, {
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
        triggerToast('Error loading support workspace details.');
      } finally {
        setLoading(false);
      }
    };

    initWorkspace();

    // Fetch messages periodically
    const fetchPollMessages = async () => {
      const token = localStorage.getItem('apex_user_token');
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/deals/${supportDealId}/messages?t=${Date.now()}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        });
        if (response.ok) {
          const resData = await response.json();
          if (resData.data?.messages) {
            setChatMessages(resData.data.messages);
          }
        }
      } catch (err) {
        console.error("Error polling support messages:", err);
      }
    };

    const pollInterval = setInterval(fetchPollMessages, 4000);

    // Socket.io connection
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
      clearInterval(pollInterval);
    };
  }, [customerId, productId]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = chatInput.trim();
    if (!content) return;

    const token = localStorage.getItem('apex_user_token');
    if (!token) return;

    const tempId = `optimistic-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender: 'admin',
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !supportDealId) return;

    const token = localStorage.getItem('apex_user_token');
    if (!token) return;

    setUploadingFile(true);
    triggerToast(`Uploading ${file.name}...`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('content', `Shared file attachment: ${file.name}`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/deals/${supportDealId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to upload file');
      }

      triggerToast('File uploaded successfully.');

      // Refresh messages list
      const msgsResponse = await fetch(`${API_BASE_URL}/api/deals/${supportDealId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await msgsResponse.json();
      if (msgsResponse.ok && resData.data?.messages) {
        setChatMessages(resData.data.messages);
      }
    } catch (err: any) {
      console.error(err);
      triggerToast(err.message || 'Failed to upload file.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col flex-1 bg-white dark:bg-zinc-950 text-zinc-500 justify-center items-center h-screen">
        <p className="text-xs font-bold animate-pulse">Loading admin support workspace...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-zinc-500 font-bold">Product template details not found.</p>
        <button
          onClick={() => router.push('/admin/orders')}
          className="bg-zinc-950 text-white dark:bg-white dark:text-black px-4 py-2 rounded font-bold text-xs"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full bg-white dark:bg-zinc-950 transition-colors">
      
      {/* Header breadcrumb */}
      <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900 flex justify-between items-center transition-colors">
        <div className="space-y-1">
          <button
            onClick={() => router.push('/admin/orders')}
            className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer font-bold mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Orders
          </button>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Support: {product.name}</h2>
            <span className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-250 dark:border-emerald-900 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase">
              Deployment Support Workspace
            </span>
          </div>
        </div>

        {product.demoUrl && (
          <a
            href={product.demoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-900 dark:text-white px-3.5 py-2 rounded-lg font-bold flex items-center gap-1.5 cursor-pointer transition-all text-[10px]"
          >
            <span>Visit Live Site</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Support Chat */}
          <div className="lg:col-span-8">
            <div className="bg-white dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 p-6 rounded-lg flex flex-col" style={{ height: '600px' }}>

              {/* Chat Header */}
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-4 shrink-0">
                <h4 className="font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider text-[10px]">Client Deployment Workspace Chat</h4>
                <p className="text-zinc-500 text-[9px] mt-0.5">Assisting customer with deployment, environment variables, domains, and production readiness.</p>
              </div>

              {/* Chat Messages — scrollable, fills available space */}
              <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-3">
                {chatMessages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center py-12">
                      <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-3">
                        <Send className="w-4 h-4 text-zinc-400" />
                      </div>
                      <p className="text-zinc-400 font-medium text-[10px]">No messages yet.</p>
                      <p className="text-zinc-400 text-[9px] mt-0.5">Send a greeting to start assisting the client.</p>
                    </div>
                  </div>
                ) : (
                  chatMessages.map((msg) => {
                    const isYou = msg.sender === 'admin';
                    const timeStr = msg.timestamp ||
                      (msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '');
                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-2.5 ${ isYou ? 'flex-row-reverse' : 'flex-row' }`}
                      >
                        {/* Avatar */}
                        <div className={`w-7 h-7 rounded-full shrink-0 flex items-center justify-center font-bold text-[10px] uppercase select-none ${
                          isYou
                            ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                            : 'bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950'
                        }`}>
                          {isYou ? 'A' : (customerName.charAt(0).toUpperCase() || 'C')}
                        </div>

                        {/* Bubble + sender row + time on same line */}
                        <div className={`flex flex-col gap-1 max-w-[70%] ${ isYou ? 'items-end' : 'items-start' }`}>
                          <div className={`flex items-center gap-1.5 ${ isYou ? 'flex-row-reverse' : 'flex-row' }`}>
                            <span className="text-[9px] font-semibold text-zinc-600 dark:text-zinc-400">
                              {isYou ? 'Admin (You)' : customerName}
                            </span>
                            {timeStr && (
                              <span className="text-[8px] text-zinc-400 font-mono">{timeStr}</span>
                            )}
                          </div>
                          <div className={`px-3.5 py-2.5 text-[11px] leading-relaxed whitespace-pre-wrap break-words ${
                            isYou
                              ? 'bg-gradient-to-br from-emerald-600 to-teal-600 text-white rounded-2xl rounded-tr-sm'
                              : 'bg-zinc-100 dark:bg-zinc-800/70 text-zinc-800 dark:text-zinc-100 rounded-2xl rounded-tl-sm'
                          }`}>
                            <div>{msg.content}</div>
                            {msg.file && (
                              <div className="bg-white/90 dark:bg-zinc-955/80 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2.5 flex items-center justify-between gap-3 mt-2 text-[9px] shadow-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-emerald-600 dark:text-emerald-500 font-bold shrink-0">📎</span>
                                  <div className="truncate text-left">
                                    <span className="text-zinc-900 dark:text-white truncate block font-bold leading-tight">{msg.file.name}</span>
                                    <span className="text-zinc-400 text-[8px] block font-mono">{msg.file.size || 'Secured Spec'}</span>
                                  </div>
                                </div>
                                <a 
                                  href={msg.file.url} 
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-zinc-900 dark:text-white font-extrabold hover:underline shrink-0 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded text-[8px]"
                                >
                                  Download
                                </a>
                              </div>
                            )}
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
                  placeholder="Write a message to the client..."
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
                    disabled={uploadingFile}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 text-[9px] font-semibold transition-colors cursor-pointer px-2 py-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800"
                  >
                    <Paperclip className="w-3.5 h-3.5" /> {uploadingFile ? 'Uploading...' : 'Send File'}
                  </button>
                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed px-4 py-1.5 rounded-lg font-bold flex items-center gap-1.5 text-[9px] uppercase tracking-wide cursor-pointer transition-all"
                  >
                    Reply <Send className="w-3 h-3" />
                  </button>
                </div>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </form>

            </div>
          </div>

          {/* Right Column: Customer Details & Purchase Information */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Client Card */}
            <div className="border border-zinc-200 dark:border-zinc-900 p-5 rounded-lg bg-zinc-50 dark:bg-[#121214] space-y-4">
              <div className="border-b border-zinc-200 dark:border-zinc-850 pb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-400" />
                <span className="font-bold text-zinc-950 dark:text-white text-xs">Customer Profile</span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-[9px] uppercase font-bold text-zinc-400 block">Name</span>
                  <span className="font-bold text-zinc-900 dark:text-white text-[11px]">{customerName}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-zinc-400 block">Email Address</span>
                  <span className="font-semibold text-zinc-700 dark:text-zinc-300 text-[11px]">{customerEmail}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-zinc-400 block">Client ID</span>
                  <span className="font-mono text-zinc-450 block text-[10px]">{customerId}</span>
                </div>
              </div>
            </div>

            {/* Template Info Card */}
            <div className="border border-zinc-200 dark:border-zinc-900 p-5 rounded-lg bg-zinc-50 dark:bg-[#121214] space-y-4">
              <div className="border-b border-zinc-200 dark:border-zinc-850 pb-3 flex items-center gap-2">
                <FileCode className="w-4 h-4 text-zinc-400" />
                <span className="font-bold text-zinc-950 dark:text-white text-xs">Template Specifications</span>
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-[9px] uppercase font-bold text-zinc-400 block">Category</span>
                  <span className="font-bold text-zinc-900 dark:text-white text-[11px]">{product.category}</span>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-zinc-400 block">Technologies</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {product.technologies.map((tech, idx) => (
                      <span key={idx} className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-1.5 py-0.5 rounded text-[8px] font-mono">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[9px] uppercase font-bold text-zinc-400 block">License Class</span>
                  <span className="font-bold text-zinc-900 dark:text-white text-[11px]">{product.license}</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
