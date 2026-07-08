'use client';

import React, { useEffect, useState } from 'react';
import { SupportTicket } from '../../types';
import { getTickets, replyToTicket } from '../../utils/storage';

export default function AdminSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  useEffect(() => {
    const tkts = getTickets();
    setTickets(tkts);
    if (tkts.length > 0) {
      setSelectedTicketId(tkts[0].id);
    }
  }, []);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-admin-toast', { detail: text });
    window.dispatchEvent(event);
  };

  const handleTicketReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedTicketId) return;

    const reply = {
      sender: 'admin' as const,
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    replyToTicket(selectedTicketId, reply);
    setTickets(getTickets());
    setChatInput('');
    triggerToast('Reply sent to customer ticket.');
  };

  const closeTicket = (ticketId: string) => {
    const updated = tickets.map(t => t.id === ticketId ? { ...t, status: 'Resolved' as const } : t);
    // Write back to storage
    const TICKETS_KEY = 'apex_tickets';
    localStorage.setItem(TICKETS_KEY, JSON.stringify(updated));
    setTickets(updated);
    triggerToast(`Ticket ${ticketId} closed.`);
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
        <div className="lg:col-span-7 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4">
          {selectedTicket ? (
            <div className="space-y-4">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
                <div>
                  <span className="font-bold text-zinc-950 dark:text-white text-sm block">{selectedTicket.subject}</span>
                  <span className="text-[10px] text-zinc-500">Category: {selectedTicket.category} | Priority: {selectedTicket.priority}</span>
                </div>
                {selectedTicket.status !== 'Resolved' && (
                  <button
                    onClick={() => closeTicket(selectedTicket.id)}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded text-[10px] font-bold cursor-pointer hover:border-zinc-400 transition-colors"
                  >
                    Close Ticket
                  </button>
                )}
              </div>

              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-3 rounded max-h-48 overflow-y-auto space-y-2">
                {selectedTicket.messages.map((m, idx) => (
                  <div key={idx} className={`p-2 rounded text-[10px] ${m.sender === 'admin' ? 'bg-zinc-950 dark:bg-zinc-800 text-white dark:text-zinc-200' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}>
                    <span className="block text-[8px] font-bold uppercase text-zinc-500">{m.sender === 'admin' ? 'You (Support Rep)' : 'Client'}</span>
                    <p>{m.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleTicketReplySubmit} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type solution or connection answers..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                />
                <button type="submit" className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 rounded font-bold cursor-pointer transition-colors">Send</button>
              </form>
            </div>
          ) : (
            <p className="text-zinc-500 text-center py-6">Select a ticket from the left panel to reply.</p>
          )}
        </div>

      </div>
      </div>
    </div>
  );
}
