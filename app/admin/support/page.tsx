'use client';

import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Send } from 'lucide-react';
import { SupportTicket } from '../../types';
import { API_BASE_URL, SOCKET_URL } from '@/app/utils/api';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setTimeout(scrollToBottom, 50);
  }, [selectedTicket?.messages]);

  // Fetch tickets from database
  const fetchTickets = async () => {
    const token = localStorage.getItem('apex_user_token');
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
  }, []);

  // WebSocket real-time updates for selected ticket
  useEffect(() => {
    if (!selectedTicketId) return;

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
    };
  }, [selectedTicketId]);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-admin-toast', { detail: text });
    window.dispatchEvent(event);
  };

  const handleTicketReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedTicketId) return;

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      triggerToast('Authentication error.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets/${selectedTicketId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: chatInput })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to send reply');
      }

      setChatInput('');
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || 'Failed to send reply.');
    }
  };

  const closeTicket = async (ticketId: string) => {
    const token = localStorage.getItem('apex_user_token');
    if (!token) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Resolved' })
      });

      if (!response.ok) {
        throw new Error('Failed to resolve ticket');
      }

      triggerToast(`Ticket ${ticketId} resolved.`);
      fetchTickets();
    } catch (err) {
      console.error(err);
      triggerToast('Failed to resolve ticket.');
    }
  };

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900">
        <h2 className="text-xl font-bold text-zinc-955 dark:text-white uppercase tracking-tight">Technical Support</h2>
        <p className="text-zinc-500 text-[10px]">Resolve client query tickets, offer code fixes and close settled tickets.</p>
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1">

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Tickets list */}
        <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4">
          <span className="font-bold text-zinc-950 dark:text-white uppercase tracking-wider block">Query Tickets</span>
          
          <div className="space-y-3.5">
            {tickets.map((tkt) => (
              <div
                key={tkt.id}
                onClick={() => setSelectedTicketId(tkt.id)}
                className={`border rounded p-4 cursor-pointer transition-colors ${
                  selectedTicketId === tkt.id
                    ? 'bg-white dark:bg-zinc-950 border-zinc-400 dark:border-zinc-700'
                    : 'bg-white/40 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-900 hover:border-zinc-800'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-zinc-950 dark:text-white">{tkt.subject}</span>
                  <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                    tkt.status === 'Open' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                  }`}>
                    {tkt.status}
                  </span>
                </div>
                <p className="text-zinc-500 line-clamp-1">{tkt.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Chat replying stream */}
        <div className="lg:col-span-7 bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-900 rounded-xl shadow-md flex flex-col justify-between h-[520px] overflow-hidden">
          {selectedTicket ? (
            <div className="flex flex-col h-full justify-between">
              {/* Header */}
              <div className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-900 px-5 py-4 flex justify-between items-center">
                <div>
                  <span className="font-bold text-zinc-955 dark:text-white text-xs block truncate">{selectedTicket.subject}</span>
                  <span className="text-[9px] text-zinc-400 font-mono block">Category: {selectedTicket.category} | Priority: {selectedTicket.priority}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase shrink-0 ${
                    selectedTicket.status === 'Open' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-550'
                  }`}>{selectedTicket.status}</span>
                  {selectedTicket.status !== 'Resolved' && (
                    <button
                      onClick={() => closeTicket(selectedTicket.id)}
                      className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-700 dark:text-zinc-300 px-2.5 py-1 rounded text-[9px] font-bold cursor-pointer transition-colors"
                    >
                      Close Ticket
                    </button>
                  )}
                </div>
              </div>

              {/* Chat message logs */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 pr-3 scrollbar-thin bg-white dark:bg-zinc-955/20">
                {selectedTicket.messages.map((m, idx) => {
                  const isAdmin = m.sender === 'admin';
                  const clientAvatar = (selectedTicket as any).customer?.avatar;
                  return (
                    <div key={idx} className={`flex gap-2.5 items-start ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                      {/* Avatar */}
                      {isAdmin ? (
                        <div className="w-8 h-8 rounded-full bg-zinc-955 text-white dark:bg-white dark:text-zinc-955 flex items-center justify-center shrink-0 text-[10px] font-extrabold uppercase border border-zinc-800 dark:border-zinc-200 shadow-xs">
                          S
                        </div>
                      ) : (
                        clientAvatar ? (
                          <img src={clientAvatar} className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-200 dark:border-zinc-800 shadow-sm" alt="Client" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center justify-center shrink-0 text-[10px] font-extrabold uppercase border border-emerald-100 dark:border-emerald-900 shadow-xs">
                            C
                          </div>
                        )
                      )}

                      <div className={`flex flex-col max-w-[75%] ${isAdmin ? 'items-end' : 'items-start'}`}>
                        {/* Message Bubble (starts on same horizontal line as avatar) */}
                        <div className={`rounded-2xl px-4 py-2.5 text-[11px] leading-relaxed shadow-sm border transition-all ${
                          isAdmin
                            ? 'bg-zinc-900 border-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:border-zinc-250 rounded-tr-none'
                            : 'bg-zinc-50 border-zinc-200 text-zinc-808 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-zinc-805 rounded-tl-none'
                        }`}>
                          <p className="whitespace-pre-wrap font-sans">{m.content}</p>
                        </div>

                        {/* Meta Info Below Bubble */}
                        <span className="text-[8px] text-zinc-400 font-mono mt-1 px-1">
                          {isAdmin ? 'You (Support Specialist)' : ((selectedTicket as any).customer?.name || 'Client')} • {m.timestamp}
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
                      placeholder="Type response, troubleshooting suggestions or solutions..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
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
                        Send Solution <Send className="w-3 h-3" />
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center py-2 text-zinc-400 text-[10px]">
                    🔒 This ticket is resolved & closed.
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-zinc-400 space-y-2 p-6">
              <span className="text-xl">🎟️</span>
              <p className="text-[10px] text-center">Select a query ticket from the list to respond.</p>
            </div>
          )}
        </div>

      </div>
      </div>
    </div>
  );
}
