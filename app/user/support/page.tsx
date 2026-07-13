'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send } from 'lucide-react';
import { SupportTicket } from '../../types';
import { showSuccessAlert, showErrorAlert, showSuccessToast, showErrorToast } from '../../utils/alert';
import { API_BASE_URL, SOCKET_URL } from '@/app/utils/api';

export default function UserSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Ticket Form fields
  const [tktSubject, setTktSubject] = useState('');
  const [tktDesc, setTktDesc] = useState('');
  const [tktCategory, setTktCategory] = useState<'Technical' | 'Billing' | 'Customization' | 'Other'>('Technical');
  const [tktPriority, setTktPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [tktReply, setTktReply] = useState('');
  const [userAvatar, setUserAvatar] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  // Fetch tickets from database
  const fetchTickets = async () => {
    const token = localStorage.getItem('apex_user_token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets?t=${Date.now()}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      const resData = await response.json();
      if (response.ok && resData.data?.tickets) {
        setTickets(resData.data.tickets);
        if (resData.data.tickets.length > 0 && !selectedTicketId) {
          setSelectedTicketId(resData.data.tickets[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    }
  };

  useEffect(() => {
    fetchTickets();
    if (typeof window !== 'undefined') {
      setUserAvatar(localStorage.getItem('apex_user_avatar'));
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 50);
  }, [selectedTicket?.messages]);

  // WebSocket real-time updates for selected ticket
  useEffect(() => {
    if (!selectedTicketId) return;

    // Polling fallback
    const pollInterval = setInterval(() => {
      fetchTickets();
    }, 4000);

    const socket = io(SOCKET_URL);
    socket.emit('join_ticket', selectedTicketId);

    socket.on('new_ticket_message', (updatedTicket: any) => {
      setTickets(prev => prev.map(t => {
        if (t.id === updatedTicket.id) {
          return updatedTicket;
        }
        return t;
      }));
    });

    return () => {
      socket.disconnect();
      clearInterval(pollInterval);
    };
  }, [selectedTicketId]);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-user-toast', { detail: text });
    window.dispatchEvent(event);
  };

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tktSubject || !tktDesc) return;

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      showErrorToast('Authentication error.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: tktSubject,
          description: tktDesc,
          category: tktCategory,
          priority: tktPriority
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to create support ticket');
      }

      showSuccessAlert('Ticket Created!', 'Your support ticket has been filed successfully. A support representative will respond shortly.');
      setTktSubject('');
      setTktDesc('');
      
      // Refresh tickets list
      fetchTickets();
    } catch (err: any) {
      console.error(err);
      showErrorAlert('Error Creating Ticket', err?.message || 'Failed to open ticket.');
    }
  };

  const handleTicketReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tktReply.trim() || !selectedTicketId) return;

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      showErrorToast('Authentication error.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets/${selectedTicketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: tktReply })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to send reply');
      }

      setTktReply('');
      fetchTickets();
    } catch (err: any) {
      console.error(err);
      showErrorToast(err?.message || 'Failed to send reply.');
    }
  };

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900">
        <h2 className="text-xl font-bold text-zinc-955 dark:text-white uppercase tracking-tight">Customer Support</h2>
        <p className="text-zinc-500 text-[10px]">Open support tickets for billing enquiries, source code installations, or customization quotation requests.</p>
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel: Create Ticket & History */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Create ticket form */}
            <form onSubmit={handleCreateTicket} className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded space-y-4">
              <span className="text-xs font-bold text-zinc-955 dark:text-white uppercase tracking-wider block">Open Support Ticket</span>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Ticket Subject</label>
                  <input type="text" required placeholder="e.g. Next.js database config issue" value={tktSubject} onChange={(e) => setTktSubject(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-955 dark:text-white rounded px-3 py-2 text-xs focus:outline-none" />
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Query Description</label>
                  <textarea rows={3} required placeholder="Detailed message explaining the issue..." value={tktDesc} onChange={(e) => setTktDesc(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-955 dark:text-white rounded p-3 text-xs resize-none focus:outline-none" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Category</label>
                    <select value={tktCategory} onChange={(e) => setTktCategory(e.target.value as any)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-955 dark:text-white rounded px-3 py-2 text-xs focus:outline-none">
                      <option>Technical</option>
                      <option>Billing</option>
                      <option>Customization</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Priority</label>
                    <select value={tktPriority} onChange={(e) => setTktPriority(e.target.value as any)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-955 dark:text-white rounded px-3 py-2 text-xs focus:outline-none">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
              </div>

              <button type="submit" className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold cursor-pointer transition-colors text-xs">
                File Ticket
              </button>
            </form>

            {/* Tickets History List */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
              <span className="font-bold text-zinc-955 dark:text-white uppercase tracking-wider block">Ticket Logs</span>
              {tickets.length > 0 ? (
                <div className="space-y-2">
                  {tickets.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTicketId(t.id)}
                      className={`p-3 rounded border cursor-pointer transition-colors ${
                        selectedTicketId === t.id
                          ? 'bg-white dark:bg-zinc-950 border-zinc-400 dark:border-zinc-800'
                          : 'bg-white/40 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-900 hover:border-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-zinc-955 dark:text-white">{t.subject}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          t.status === 'Open' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'
                        }`}>{t.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-center py-4">No support tickets filed.</p>
              )}
            </div>
          </div>

          {/* Right panel: Active ticket reply messages */}
          <div className="lg:col-span-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl shadow-md flex flex-col justify-between h-[520px] overflow-hidden">
            {selectedTicket ? (
              <div className="flex flex-col h-full justify-between">
                {/* Header */}
                <div className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-900 px-5 py-4">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-zinc-955 dark:text-white text-xs block truncate">{selectedTicket.subject}</span>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase shrink-0 ${
                      selectedTicket.status === 'Open' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-550'
                    }`}>{selectedTicket.status}</span>
                  </div>
                  <span className="text-[9px] text-zinc-400 font-mono block">Category: {selectedTicket.category} | Priority: {selectedTicket.priority}</span>
                </div>

                {/* Chat message logs */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4 pr-3 scrollbar-thin bg-white dark:bg-zinc-955/20">
                  {selectedTicket.messages.map((m, idx) => {
                    const isYou = m.sender === 'customer';
                    return (
                      <div key={idx} className={`flex gap-2.5 items-start ${isYou ? 'flex-row-reverse' : 'flex-row'}`}>
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
                            S
                          </div>
                        )}

                        <div className={`flex flex-col max-w-[75%] ${isYou ? 'items-end' : 'items-start'}`}>
                          {/* Message Bubble (starts on same horizontal line as avatar) */}
                          <div className={`rounded-2xl px-4 py-2.5 text-[11px] leading-relaxed shadow-sm border transition-all ${
                            isYou
                              ? 'bg-zinc-900 border-zinc-800 text-white dark:bg-white dark:text-zinc-905 dark:border-zinc-200 rounded-tr-none'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-800 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-zinc-805 rounded-tl-none'
                          }`}>
                            <p className="whitespace-pre-wrap font-sans">{m.content}</p>
                          </div>

                          {/* Meta Info Below Bubble */}
                          <span className="text-[8px] text-zinc-400 font-mono mt-1 px-1">
                            {isYou ? 'You' : 'Support Specialist'} • {m.timestamp}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Compose Form */}
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-900">
                  {selectedTicket.status !== 'Resolved' ? (
                    <form onSubmit={handleTicketReplySubmit} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden focus-within:border-zinc-450 dark:focus-within:border-zinc-700 transition-colors flex flex-col">
                      <textarea
                        rows={2}
                        placeholder="Type solution update or query detail..."
                        value={tktReply}
                        onChange={(e) => setTktReply(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleTicketReplySubmit(e as any);
                          }
                        }}
                        className="w-full bg-transparent border-0 text-zinc-900 dark:text-white placeholder-zinc-400 p-3 text-xs focus:ring-0 focus:outline-none resize-none"
                      />
                      
                      {/* Action bar */}
                      <div className="bg-zinc-50/50 dark:bg-zinc-900/30 px-3 py-2 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
                        <button 
                          type="submit" 
                          className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-1.5 rounded-md font-bold flex items-center gap-1 text-[9px] uppercase tracking-wide cursor-pointer transition-colors shadow-xs"
                        >
                          Send Reply <Send className="w-3 h-3" />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="text-center py-2 text-zinc-400 text-[10px]">
                      🔒 This ticket has been resolved. You can open a new support ticket if you have any questions.
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-2 p-6">
                <span className="text-xl">🎟️</span>
                <p className="text-[10px] text-center">Select a support ticket from the log history to review discussions.</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
