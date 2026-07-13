'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import { FileText, Paperclip, Send } from 'lucide-react';
import { CustomDeal, ChatMessage, Milestone } from '../../../types';
import { getDeals, saveDeals, getChats, saveChats } from '../../../utils/storage';
import { showSuccessAlert, showErrorAlert, showSuccessToast, showErrorToast } from '../../../utils/alert';
import { API_BASE_URL, SOCKET_URL } from '@/app/utils/api';

export default function UserDealDetailWorkspace() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;

  const [deals, setDeals] = useState<CustomDeal[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [chatInput, setChatInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const [chatWidth, setChatWidth] = useState(420);
  const [isMobile, setIsMobile] = useState(false);
  const resizingRef = useRef(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    resizingRef.current = true;
    const startX = e.clientX;
    const startWidth = chatWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!resizingRef.current) return;
      const deltaX = moveEvent.clientX - startX;
      const newWidth = Math.max(280, Math.min(800, startWidth - deltaX));
      setChatWidth(newWidth);
    };

    const handleMouseUp = () => {
      resizingRef.current = false;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  // Payment Sim modal state
  const [payingMilestone, setPayingMilestone] = useState<{ milId: string; mil: any } | null>(null);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing'>('details');
  const [phoneNum, setPhoneNum] = useState('');
  const [pin, setPin] = useState('');
  const [viewingDeliverablesMilestone, setViewingDeliverablesMilestone] = useState<any | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setUserAvatar(localStorage.getItem('apex_user_avatar'));
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 50);
  }, [chatMessages[dealId]]);

  useEffect(() => {
    const initializeDeal = async () => {
      let loadedDeals = getDeals();
      let modified = false;

      // Ensure mock data for deal-101 contains deliverables for verification demo
      loadedDeals = loadedDeals.map(d => {
        if (d.id === 'deal-101' && d.quotation) {
          const hasM1Deliverables = d.quotation.milestones.some(m => m.id === 'm1' && m.deliverables && m.deliverables.length > 0);
          if (!hasM1Deliverables) {
            modified = true;
            return {
              ...d,
              quotation: {
                ...d.quotation,
                milestones: d.quotation.milestones.map(m => {
                  if (m.id === 'm1') {
                    return {
                      ...m,
                      progress: 100,
                      deliverables: [
                        { name: 'Figma_Branding_Prototypes.pdf', size: '4.8 MB', url: 'https://figma.com/file/mock-hospital-layout', type: 'pdf' },
                        { name: 'Wireframes_Specification_PRD.pdf', size: '1.5 MB', url: 'https://drive.google.com/mock-prd.pdf', type: 'pdf' }
                      ]
                    };
                  }
                  return m;
                })
              }
            };
          }
        }
        return d;
      });

      if (modified) {
        saveDeals(loadedDeals);
      }

      // If deal doesn't exist in local storage, query the backend
      // Always fetch latest deal details from database on page load
      const token = localStorage.getItem('apex_user_token');
      if (token) {
        try {
          const response = await fetch(`${API_BASE_URL}/api/deals/${dealId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const resData = await response.json();
          if (response.ok && resData.data?.deal) {
            const backendDeal = resData.data.deal;
            loadedDeals = loadedDeals.map(d => d.id === dealId ? backendDeal : d);
            if (!loadedDeals.some(d => d.id === dealId)) {
              loadedDeals.push(backendDeal);
            }
            saveDeals(loadedDeals);
          }
        } catch (err) {
          console.error('Failed to load deal from database:', err);
        }
      }

      setDeals(loadedDeals);
      setChatMessages(getChats());

      // Mark as read when client opens it
      const updated = loadedDeals.map(d => d.id === dealId ? { ...d, unreadPortal: false } : d);
      saveDeals(updated);
      setDeals(updated);
      setLoading(false);

      // Fetch messages from database
      const fetchMessages = async () => {
        const token = localStorage.getItem('apex_user_token');
        if (!token) return;
        try {
          const response = await fetch(`${API_BASE_URL}/api/deals/${dealId}/messages?t=${Date.now()}`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          const resData = await response.json();
          if (response.ok && resData.data?.messages) {
            setChatMessages(prev => ({
              ...prev,
              [dealId]: resData.data.messages
            }));
          }
        } catch (err) {
          console.error('Failed to load chat history:', err);
        }
      };

      // Fetch deal status and details from database
      const fetchDealDetails = async () => {
        const token = localStorage.getItem('apex_user_token');
        if (!token) return;
        try {
          const response = await fetch(`${API_BASE_URL}/api/deals/${dealId}?t=${Date.now()}`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache'
            }
          });
          const resData = await response.json();
          if (response.ok && resData.data?.deal) {
            const backendDeal = resData.data.deal;
            setDeals(prev => {
              const updated = prev.map(d => d.id === dealId ? backendDeal : d);
              if (!updated.some(d => d.id === dealId)) {
                updated.push(backendDeal);
              }
              saveDeals(updated);
              return updated;
            });
          }
        } catch (err) {
          console.error('Failed to poll deal details:', err);
        }
      };

      fetchMessages();
      fetchDealDetails();

      // Start periodic polling fallback (every 4 seconds) for Vercel/serverless environments
      const pollInterval = setInterval(() => {
        fetchMessages();
        fetchDealDetails();
      }, 4000);

      (window as any)._dealPollInterval = pollInterval;
    };

    initializeDeal();

    // WebSocket real-time connection
    const socket = io(SOCKET_URL);
    socket.emit('join_deal', dealId);

    socket.on('new_deal_message', (msg: ChatMessage) => {
      setChatMessages(prev => {
        const thread = prev[dealId] || [];
        if (thread.some(m => m.id === msg.id)) return prev;
        
        // Remove matching optimistic message to avoid duplicate display
        const filteredThread = thread.filter(m => {
          if (m.id.startsWith('optimistic-') && m.content === msg.content) {
            return false;
          }
          return true;
        });

        return {
          ...prev,
          [dealId]: [...filteredThread, msg]
        };
      });
    });

    socket.on('deal_updated', (updatedDeal: CustomDeal) => {
      setDeals(prev => {
        const updated = prev.map(d => d.id === updatedDeal.id ? updatedDeal : d);
        if (!updated.some(d => d.id === updatedDeal.id)) {
          updated.push(updatedDeal);
        }
        saveDeals(updated);
        return updated;
      });
    });

    return () => {
      socket.disconnect();
      if ((window as any)._dealPollInterval) {
        clearInterval((window as any)._dealPollInterval);
      }
    };
  }, [dealId]);

  const selectedDeal = deals.find(d => d.id === dealId);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-user-toast', { detail: text });
    window.dispatchEvent(event);
  };

  if (loading) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-zinc-500 font-bold animate-pulse">Loading project workspace...</p>
      </div>
    );
  }

  if (!selectedDeal) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-zinc-500 font-bold">Project workspace not found.</p>
        <button
          onClick={() => router.push('/user/deals')}
          className="bg-zinc-950 text-white dark:bg-white dark:text-black px-4 py-2 rounded font-bold text-xs"
        >
          Back to Projects List
        </button>
      </div>
    );
  }

  const handleSignContract = async () => {
    const token = localStorage.getItem('apex_user_token');
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/api/deals/${dealId}/sign`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ clientSignature: 'Client Signed' })
        });
      } catch (err) {
        console.error('Failed to sign contract on backend:', err);
      }
    }

    const updatedDeals = deals.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          contractSigned: true,
          status: 'In Development' as const,
          unreadAdmin: true
        };
      }
      return d;
    });
    saveDeals(updatedDeals);
    setDeals(updatedDeals);

    const signMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      content: `✍️ Client has E-Signed the development contract terms. Development phase initiated.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), signMsg]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    showSuccessAlert('Contract E-Signed!', 'The proposal contract has been e-signed successfully. Development Phase 1 is now officially active.');
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    const messageContent = chatInput.trim();
    if (!messageContent) return;

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      showErrorToast('Authentication error.');
      return;
    }

    const tempId = `optimistic-${Date.now()}`;
    const optimisticMsg: ChatMessage = {
      id: tempId,
      sender: 'customer',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update locally immediately and clear input
    setChatMessages(prev => {
      const thread = prev[dealId] || [];
      return {
        ...prev,
        [dealId]: [...thread, optimisticMsg]
      };
    });
    setChatInput('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/deals/${dealId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: messageContent }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      console.error(err);
      showErrorToast('Failed to send message.');
      // Rollback optimistic message and restore input
      setChatMessages(prev => {
        const thread = prev[dealId] || [];
        return {
          ...prev,
          [dealId]: thread.filter(m => m.id !== tempId)
        };
      });
      setChatInput(messageContent);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      showErrorToast('Authentication error.');
      return;
    }

    setUploadingFile(true);
    showSuccessToast(`Uploading ${file.name}...`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('content', `Shared file attachment: ${file.name}`);

    try {
      const response = await fetch(`${API_BASE_URL}/api/deals/${dealId}/messages`, {
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

      showSuccessToast('File uploaded successfully.');

      // Refresh messages list
      const msgsResponse = await fetch(`${API_BASE_URL}/api/deals/${dealId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await msgsResponse.json();
      if (msgsResponse.ok && resData.data?.messages) {
        setChatMessages(prev => ({
          ...prev,
          [dealId]: resData.data.messages
        }));
      }
    } catch (err: any) {
      console.error(err);
      showErrorToast(err.message || 'Failed to upload file.');
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const startMilestonePayment = (milId: string, mil: any) => {
    setPayingMilestone({ milId, mil });
    setPaymentStep('details');
    setPhoneNum('');
    setPin('');
  };

  const executeMilestonePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNum || pin.length < 4) return;

    setPaymentStep('processing');

    setTimeout(() => {
      if (!payingMilestone) return;

      const updatedDeals = deals.map(d => {
        if (d.id === dealId && d.quotation) {
          const milestones = d.quotation.milestones.map(m => {
            if (m.id === payingMilestone.milId) {
              return {
                ...m,
                paymentStatus: 'Paid' as const,
                status: 'Approved' as const
              };
            }
            return m;
          });
          return {
            ...d,
            unreadAdmin: true,
            quotation: {
              ...d.quotation,
              milestones
            }
          };
        }
        return d;
      });

      const token = localStorage.getItem('apex_user_token');
      if (token) {
        const updatedDeal = updatedDeals.find(d => d.id === dealId);
        if (updatedDeal && updatedDeal.quotation) {
          fetch(`${API_BASE_URL}/api/deals/${dealId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quotation: updatedDeal.quotation })
          }).catch(err => console.error('Failed to save milestone payment on backend:', err));
        }
      }

      saveDeals(updatedDeals);
      setDeals(updatedDeals);

      const payMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'customer',
        content: `💳 bKash Payment Successful: settled BDT ${payingMilestone.mil.cost.toLocaleString()} for "${payingMilestone.mil.title}". Receipt transaction ID: TXN${Math.floor(Math.random() * 900000) + 100000}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const updatedChats = {
        ...chatMessages,
        [dealId]: [...(chatMessages[dealId] || []), payMsg]
      };
      saveChats(updatedChats);
      setChatMessages(updatedChats);

      const paidCost = payingMilestone.mil.cost;
      setPayingMilestone(null);
      showSuccessAlert('Payment Successful!', `Milestone payment of BDT ${paidCost.toLocaleString()} has been successfully processed via bKash.`);
    }, 2500);
  };

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      <div className="flex flex-col flex-1">
        {/* Sticky detail header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-4 border-b border-zinc-200 dark:border-zinc-900 space-y-2">
          <button
            onClick={() => router.push('/user/deals')}
            className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white font-bold cursor-pointer transition-colors text-[10px] uppercase tracking-wider"
          >
            ← Back to Custom Projects List
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
            <div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{selectedDeal.title} Workspace</h2>
              <p className="text-zinc-500 text-[10px] font-mono">
                Project ID: <span className="text-zinc-900 dark:text-white font-bold">{selectedDeal.id}</span> | Type: <span className="text-zinc-900 dark:text-white font-bold">{selectedDeal.projectType}</span> | Priority: <span className="text-zinc-900 dark:text-white font-bold">{selectedDeal.priority}</span>
              </p>
            </div>
            
            {/* Status pill */}
            <span className="px-2.5 py-1 rounded text-[9px] font-extrabold uppercase bg-zinc-900 dark:bg-white text-white dark:text-black border border-zinc-800 dark:border-zinc-200">
              Status: {selectedDeal.status}
            </span>
          </div>
        </div>

        <div className="p-6 md:p-8 flex-1 space-y-6">


          <div className="flex flex-col lg:flex-row gap-8 items-start h-full relative">
            
            {/* Left Column: Details, files, contract */}
            <div className="flex-1 lg:max-h-[calc(100vh-210px)] lg:overflow-y-auto pr-2 space-y-6 w-full" style={{ minWidth: 200 }}>
              
              {/* Scope requirements overview */}
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
                <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider block">Requirements Scope & Tech Stack</span>
                <p className="text-zinc-700 dark:text-zinc-350 leading-relaxed font-sans text-xs whitespace-pre-wrap">{selectedDeal.description}</p>
                {selectedDeal.technology && (
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                    {selectedDeal.technology.split(',').map((tech, i) => (
                      <span key={i} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded text-[9px] font-mono">
                        {tech.trim()}
                      </span>
                    ))}
                  </div>
                )}
                </div>

              {/* Proposed contract agreement list */}
              {selectedDeal.quotation && (
                <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-5">
                  <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider block">Proposed Contract Agreement Details</span>
                      <p className="text-zinc-500 text-[10px]">Review terms, pricing, and sign proposal below.</p>
                    </div>

                    {selectedDeal.contractSigned ? (
                      <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider">
                        E-Signed & Active
                      </span>
                    ) : (
                      <span className="bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-250 dark:border-amber-500/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider animate-pulse">
                        Signature Needed
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-white dark:bg-zinc-950 p-2.5 border border-zinc-200 dark:border-zinc-900 rounded">
                      <span className="text-zinc-500 font-bold uppercase text-[7px] block">Development Time</span>
                      <span className="font-bold text-zinc-900 dark:text-white text-xs">{selectedDeal.quotation.developmentTime}</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-950 p-2.5 border border-zinc-200 dark:border-zinc-900 rounded">
                      <span className="text-zinc-500 font-bold uppercase text-[7px] block">Total Contract Cost</span>
                      <span className="font-bold text-zinc-900 dark:text-white text-xs">{selectedDeal.quotation.totalCost.toLocaleString()} BDT</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-950 p-2.5 border border-zinc-200 dark:border-zinc-900 rounded">
                      <span className="text-zinc-500 font-bold uppercase text-[7px] block">Post warranty support</span>
                      <span className="font-bold text-zinc-900 dark:text-white text-[10px] truncate block">{selectedDeal.quotation.supportPeriod}</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-950 p-2.5 border border-zinc-200 dark:border-zinc-900 rounded">
                      <span className="text-zinc-500 font-bold uppercase text-[7px] block">Maintenance Offer</span>
                      <span className="font-bold text-zinc-900 dark:text-white text-[10px] truncate block">{selectedDeal.quotation.maintenanceOffer}</span>
                    </div>
                  </div>

                  {/* Milestones dynamic list tracker */}
                  <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-zinc-450 block">Payment milestones roadmap checklist</span>
                    <div className="space-y-2">
                      {selectedDeal.quotation.milestones.map((m) => {
                        const isUnpaid = m.paymentStatus === 'Unpaid';
                        const isPending = m.status === 'Pending';
                        const isAwaiting = m.status === 'Awaiting Approval';
                        const isPaid = m.paymentStatus === 'Paid';

                        return (
                          <div key={m.id} className="bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-900 rounded flex flex-col gap-3">
                            <div className="flex justify-between items-start gap-3">
                              <div className="space-y-1 max-w-[70%]">
                                <div className="flex items-center gap-2">
                                  <span className="font-extrabold text-zinc-900 dark:text-white text-xs">{m.title}</span>
                                  <span className="text-[9px] bg-zinc-100 dark:bg-zinc-900 text-zinc-600 px-1.5 py-0.5 rounded font-mono font-bold">{m.cost.toLocaleString()} BDT</span>
                                </div>
                                <p className="text-[10px] text-zinc-500 leading-normal">{m.description}</p>
                                <div className="flex gap-4 text-[9px] font-mono text-zinc-400">
                                  <span>Due: {m.dueDate}</span>
                                  <span>|</span>
                                  <span className={isPaid ? 'text-emerald-500 font-bold' : 'text-amber-550 font-bold'}>
                                    Payment: {m.paymentStatus}
                                  </span>
                                </div>
                              </div>

                              <div className="flex flex-col gap-2 items-end shrink-0">
                                {isPaid ? (
                                  <span className="px-2 py-0.5 rounded text-[8px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 uppercase">
                                    Paid & Approved
                                  </span>
                                ) : (
                                  <>
                                    <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                                      isAwaiting 
                                        ? 'bg-amber-100 dark:bg-amber-500/10 text-amber-600 dark:text-amber-450 border border-amber-250 dark:border-amber-500/20'
                                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500'
                                    }`}>
                                      {m.status}
                                    </span>

                                    {selectedDeal.contractSigned && isUnpaid && (
                                      <button
                                        onClick={() => startMilestonePayment(m.id, m)}
                                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-2 py-1 rounded text-[9px] cursor-pointer shadow-sm transition-colors"
                                      >
                                        Pay BDT
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Payment / Completion conditional access section */}
                            {m.deliverables && m.deliverables.length > 0 ? (
                              <div className="space-y-2.5 animate-fadeIn">
                                {/* If paid, show progress at 100% or current progress */}
                                {isPaid && (
                                  <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-900/50">
                                    <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400">
                                      <span>Phase Construction Status</span>
                                      <span className="font-bold text-zinc-700 dark:text-zinc-300">{m.progress || 100}% Complete</span>
                                    </div>
                                    <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded overflow-hidden">
                                      <div 
                                        className="bg-emerald-500 h-full transition-all duration-300"
                                        style={{ width: `${m.progress || 100}%` }}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Deliverables Vault container */}
                                <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/10 border border-emerald-250/30 rounded space-y-2 text-[10px]">
                                  <div className="flex justify-between items-center">
                                    <span className="font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider text-[8px] flex items-center gap-1">
                                      <span>✓</span> Submitted Phase Deliverables & Files
                                    </span>
                                    <button
                                      onClick={() => setViewingDeliverablesMilestone(m)}
                                      className="text-[9px] text-zinc-950 dark:text-white font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-450 dark:hover:border-zinc-700 px-2 py-0.5 rounded shadow-sm transition-all cursor-pointer"
                                    >
                                      Expand Full Vault ↗
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {m.deliverables.map((del, dIdx) => (
                                      <div key={dIdx} className="bg-white dark:bg-zinc-950 p-2 border border-emerald-100 dark:border-zinc-900 rounded flex justify-between items-center gap-2">
                                        <div className="flex items-center gap-1.5 truncate pr-2">
                                          <FileText className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-500 shrink-0" />
                                          <span className="font-semibold text-zinc-950 dark:text-white truncate">{del.name}</span>
                                        </div>
                                        <a 
                                          href={del.url}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 font-extrabold px-2.5 py-0.5 rounded text-[8px] hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors uppercase shrink-0 font-sans"
                                        >
                                          Access
                                        </a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            ) : isPaid ? (
                              <div className="space-y-2.5">
                                {/* Progress updates */}
                                <div className="space-y-1 pt-2 border-t border-zinc-100 dark:border-zinc-900/50">
                                  <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400">
                                    <span>Phase Construction Status</span>
                                    <span className="font-bold text-zinc-700 dark:text-zinc-300">{m.progress || 0}% Complete</span>
                                  </div>
                                  <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded overflow-hidden">
                                    <div 
                                      className="bg-emerald-500 h-full transition-all duration-300"
                                      style={{ width: `${m.progress || 0}%` }}
                                    />
                                  </div>
                                </div>
                                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900/50 flex items-center gap-1.5 text-[9px] text-zinc-500">
                                  <span>🔨</span>
                                  <span>Phase is paid & in progress. Documents will be submitted here once completed.</span>
                                </div>
                              </div>
                            ) : (
                              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900/50 flex items-center gap-1.5 text-[9px] text-zinc-500">
                                <span>🔒</span>
                                <span>Phase progress tracking and deliverables vault will unlock once this payment is processed.</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>



                  {/* Signature button */}
                  {!selectedDeal.contractSigned && (
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-4 rounded text-center space-y-3">
                      <p className="text-zinc-550 text-[10px]">By signing below, you authorize the quotation roadmaps, terms of service and milestone payments.</p>
                      <button
                        onClick={handleSignContract}
                        className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-extrabold px-6 py-2 rounded text-xs cursor-pointer transition-colors"
                      >
                        ✍️ E-Sign Contract & Propose Kickoff
                      </button>
                    </div>
                  )}

                  {/* Delivered vault login credentials */}
                  {selectedDeal.status === 'Delivered' && selectedDeal.credentials && (
                    <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-emerald-500/20 p-5 rounded space-y-3">
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Production Credential Vault</span>
                      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-4 rounded space-y-2 font-mono text-[10px]">
                        <p><strong>Repository URL:</strong> <a href={selectedDeal.credentials.github} target="_blank" rel="noreferrer" className="text-zinc-950 dark:text-white underline">{selectedDeal.credentials.github}</a></p>
                        <p><strong>Staging Server:</strong> <a href={selectedDeal.credentials.cPanel} target="_blank" rel="noreferrer" className="text-zinc-950 dark:text-white underline">{selectedDeal.credentials.cPanel}</a></p>
                        <p><strong>DB Vault Info:</strong> {selectedDeal.credentials.database}</p>
                      </div>
                    </div>
                  )}

                </div>
              )}

            </div>

            {/* Resizer Handle */}
            <div 
              onMouseDown={handleMouseDown}
              className="hidden lg:block w-3 cursor-col-resize self-stretch relative z-10 group flex items-center justify-center"
              style={{ marginLeft: -22, marginRight: -22 }}
            >
              {/* Thin Vertical Line */}
              <div className="w-[1px] h-full bg-zinc-200 dark:bg-zinc-800 group-hover:bg-zinc-400 dark:group-hover:bg-zinc-600 transition-colors relative flex items-center justify-center">
                {/* Grip dots pill */}
                <div className="absolute flex flex-col gap-1 py-2 px-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-xs group-hover:shadow-sm group-hover:scale-105 transition-all">
                  <div className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  <div className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                  <div className="w-1 h-1 rounded-full bg-zinc-400 dark:bg-zinc-500" />
                </div>
              </div>
            </div>

            {/* Right Column: Chat messages discuss room */}
            <div 
              className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl shadow-md flex flex-col justify-between shrink-0 overflow-hidden"
              style={{
                width: isMobile ? '100%' : `${chatWidth}px`,
                minWidth: 280,
                maxWidth: 800,
                height: isMobile ? '600px' : 'calc(100vh - 210px)',
                position: isMobile ? 'relative' : 'sticky',
                top: isMobile ? 'auto' : '96px'
              }}
            >
              {/* Header */}
              <div className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-900 px-5 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white text-xs">Agency Conversation Room</h4>
                    <p className="text-zinc-400 text-[9px] font-mono tracking-tight">Status: Active Collaboration</p>
                  </div>
                </div>
              </div>

              {/* Chat message logs */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 pr-3 scrollbar-thin bg-white dark:bg-zinc-950/40">
                {(!chatMessages[dealId] || chatMessages[dealId].length === 0) ? (
                  <div className="text-center text-zinc-450 py-16 space-y-2">
                    <div className="text-lg">💬</div>
                    <div className="text-[10px]">No messages recorded in this custom channel.</div>
                  </div>
                ) : (
                  chatMessages[dealId].map((msg) => {
                    const isYou = msg.sender === 'customer';
                    return (
                      <div key={msg.id} className={`flex gap-2.5 items-start ${isYou ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Avatar */}
                        {isYou ? (
                          userAvatar ? (
                            <img src={userAvatar} className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-sm" alt="You" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 flex items-center justify-center shrink-0 text-[10px] font-extrabold uppercase border border-zinc-800 dark:border-zinc-200 shadow-xs">
                              U
                            </div>
                          )
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-extrabold uppercase border border-emerald-100 dark:border-emerald-900 shadow-xs">
                            A
                          </div>
                        )}

                        <div className={`flex flex-col max-w-[75%] ${isYou ? 'items-end' : 'items-start'}`}>
                          {/* Message Bubble (starts on same horizontal line as avatar) */}
                          <div className={`rounded-2xl px-4 py-2.5 text-[11px] leading-relaxed shadow-sm border transition-all ${
                            isYou
                              ? 'bg-zinc-900 border-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:border-zinc-200 rounded-tr-none'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-zinc-805 rounded-tl-none'
                          }`}>
                            <p className="whitespace-pre-wrap font-sans">{msg.content}</p>

                            {/* Premium File Card */}
                            {msg.file && (
                              <div className="bg-white/90 dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-850 rounded-lg p-2.5 flex items-center justify-between gap-3 mt-2 text-[9px] shadow-xs">
                                <div className="flex items-center gap-2 min-w-0">
                                  <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
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

                          {/* Meta Info Below Bubble */}
                          <span className="text-[8px] text-zinc-400 font-mono mt-1 px-1">
                            {isYou ? 'You' : 'Admin Agent'} • {msg.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Modern Compose Box Input Panel */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-900">
                <form onSubmit={handleSendChat} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden focus-within:border-zinc-450 dark:focus-within:border-zinc-700 transition-colors flex flex-col">
                  <textarea
                    rows={2}
                    placeholder="Write a message or ask a question to agency..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendChat(e as any);
                      }
                    }}
                    className="w-full bg-transparent border-0 text-zinc-900 dark:text-white placeholder-zinc-400 p-3 text-xs focus:ring-0 focus:outline-none resize-none"
                  />
                  
                  {/* Actions Toolbar */}
                  <div className="bg-zinc-50/50 dark:bg-zinc-900/30 px-3 py-2 border-t border-zinc-100 dark:border-zinc-900 flex justify-between items-center">
                    <button
                      type="button"
                      disabled={uploadingFile}
                      onClick={() => fileInputRef.current?.click()}
                      className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors flex items-center gap-1.5 text-[9px] font-bold"
                      title="Attach documents"
                    >
                      <Paperclip className="w-3.5 h-3.5" /> {uploadingFile ? 'Uploading...' : 'Attach Specs'}
                    </button>
                    
                    <button 
                      type="submit" 
                      className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-3.5 py-1.5 rounded-md font-bold flex items-center gap-1 text-[9px] uppercase tracking-wide cursor-pointer transition-colors shadow-xs"
                    >
                      Send Message <Send className="w-3 h-3" />
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

          </div>
        </div>
      </div>

      {/* bKash Payment Simulation Gateway Modal */}
      {payingMilestone && (
        <div className="fixed inset-0 z-55 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-rose-700 border border-rose-800 w-full max-w-sm rounded-lg overflow-hidden shadow-2xl p-6 text-white space-y-6">
            
            {/* bKash Header Logo */}
            <div className="flex justify-between items-center border-b border-rose-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="bg-white text-rose-700 rounded px-2.5 py-1 font-extrabold text-sm uppercase italic">
                  bKash
                </div>
                <span className="font-extrabold text-xs uppercase tracking-wider">Merchant Pay</span>
              </div>
              <button onClick={() => setPayingMilestone(null)} className="text-white/80 hover:text-white text-base">✕</button>
            </div>

            {paymentStep === 'details' ? (
              <form onSubmit={executeMilestonePayment} className="space-y-4 text-xs">
                <div className="bg-rose-800/40 p-4 rounded border border-rose-850 space-y-2">
                  <p className="font-bold text-center text-xs">Milestone Settlement Pay</p>
                  <p className="text-center font-mono text-sm font-extrabold text-amber-350">{payingMilestone.mil.cost.toLocaleString()} BDT</p>
                  <p className="text-[10px] text-white/60 text-center">VAT included (5%)</p>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-white/80 font-bold mb-1">Your bKash Account Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 017XXXXXXXX"
                      value={phoneNum}
                      onChange={(e) => setPhoneNum(e.target.value)}
                      className="w-full bg-rose-800 border border-rose-900 rounded p-2 text-white placeholder:text-white/40 focus:outline-none font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-white/80 font-bold mb-1">Enter 5-digit PIN</label>
                    <input
                      type="password"
                      maxLength={5}
                      required
                      placeholder="XXXXX"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full bg-rose-800 border border-rose-900 rounded p-2 text-white placeholder:text-white/40 focus:outline-none tracking-widest font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-rose-800">
                  <button type="button" onClick={() => setPayingMilestone(null)} className="flex-1 py-2 bg-rose-800 hover:bg-rose-900 text-white rounded font-bold cursor-pointer transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2 bg-white text-rose-700 hover:bg-rose-100 rounded font-bold cursor-pointer transition-colors">Confirm Pay</button>
                </div>
              </form>
            ) : (
              <div className="py-8 text-center space-y-4">
                <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="font-bold text-xs uppercase tracking-wider animate-pulse">Processing gateway payment...</p>
                <p className="text-[10px] text-white/60">Do not close window or refresh.</p>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Phase Deliverables & Document Vault Modal */}
      {viewingDeliverablesMilestone && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 w-full max-w-lg rounded-lg overflow-hidden shadow-2xl p-6 text-zinc-950 dark:text-white space-y-6 relative">
            <button 
              onClick={() => setViewingDeliverablesMilestone(null)} 
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 text-sm font-bold"
            >
              ✕
            </button>

            <div className="border-b border-zinc-200 dark:border-zinc-850 pb-4 space-y-1">
              <span className="bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-250 dark:border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider inline-block">
                ✓ Phase Completed
              </span>
              <h3 className="text-sm font-extrabold uppercase tracking-wide text-zinc-900 dark:text-white">
                {viewingDeliverablesMilestone.title}
              </h3>
              <p className="text-[10px] text-zinc-500 leading-normal">
                {viewingDeliverablesMilestone.description}
              </p>
            </div>

            <div className="space-y-3">
              <span className="text-[9px] uppercase font-bold text-zinc-450 block font-mono">
                Submitted Artifacts & Deliverable Documents:
              </span>

              {(!viewingDeliverablesMilestone.deliverables || viewingDeliverablesMilestone.deliverables.length === 0) ? (
                <div className="border border-dashed border-zinc-200 dark:border-zinc-850 rounded p-6 text-center text-[10px] text-zinc-500 bg-zinc-50 dark:bg-zinc-900/25">
                  No deliverables submitted by admin for this phase yet. Please check back shortly or ask in chat.
                </div>
              ) : (
                <div className="space-y-2">
                  {viewingDeliverablesMilestone.deliverables.map((del: any, dIdx: number) => (
                    <div 
                      key={dIdx} 
                      className="bg-zinc-50 dark:bg-zinc-900 p-3 border border-zinc-200 dark:border-zinc-800 rounded flex justify-between items-center gap-4 transition-all hover:border-zinc-350 dark:hover:border-zinc-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <FileText className="w-5 h-5 text-emerald-600 dark:text-emerald-500 shrink-0" />
                        <div className="truncate">
                          <span className="font-bold text-zinc-900 dark:text-white text-[11px] truncate block">
                            {del.name}
                          </span>
                          <span className="text-[9px] text-zinc-400 font-mono">
                            {del.size || 'Unknown Size'}
                          </span>
                        </div>
                      </div>
                      <a 
                        href={del.url} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="bg-zinc-950 dark:bg-white text-white dark:text-black font-extrabold text-[10px] px-3.5 py-1.5 rounded uppercase hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-colors shadow-sm shrink-0 font-sans"
                      >
                        Access Link
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-850 flex justify-between items-center text-[9px] text-zinc-500 font-mono">
              <span>Delivery Timeline: <strong>{viewingDeliverablesMilestone.dueDate}</strong></span>
              <span>Payment: <strong className="text-emerald-500 font-bold">{viewingDeliverablesMilestone.paymentStatus}</strong></span>
            </div>

            <div className="bg-emerald-50/50 dark:bg-emerald-950/5 p-3 border border-emerald-100 dark:border-zinc-900/50 rounded flex items-start gap-2 text-[10px] leading-relaxed text-zinc-650 dark:text-zinc-400">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold shrink-0">🛡️</span>
              <span>
                These files have been successfully compiled and submitted as proof of phase completion. Please review the artifacts and post any feedback in the conversation box.
              </span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
