'use client';

import React, { useEffect, useState } from 'react';
import { SupportTicket } from '../../types';
import { getTickets, addTicket } from '../../utils/storage';

export default function PortalSupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Ticket Form fields
  const [tktSubject, setTktSubject] = useState('');
  const [tktDesc, setTktDesc] = useState('');
  const [tktCategory, setTktCategory] = useState<'Technical' | 'Billing' | 'Customization' | 'Other'>('Technical');
  const [tktPriority, setTktPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [tktReply, setTktReply] = useState('');

  useEffect(() => {
    const tkts = getTickets();
    setTickets(tkts);
    if (tkts.length > 0) {
      setSelectedTicketId(tkts[0].id);
    }
  }, []);

  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-portal-toast', { detail: text });
    window.dispatchEvent(event);
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tktSubject || !tktDesc) return;

    const newTicket: SupportTicket = {
      id: `tkt-${Math.floor(Math.random() * 900) + 100}`,
      subject: tktSubject,
      description: tktDesc,
      category: tktCategory,
      priority: tktPriority,
      status: 'Open',
      createdAt: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      messages: [{ sender: 'customer', content: tktDesc, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
    };

    const updatedTickets = [newTicket, ...tickets];
    // Write back to storage
    const TICKETS_KEY = 'apex_tickets';
    localStorage.setItem(TICKETS_KEY, JSON.stringify(updatedTickets));
    setTickets(updatedTickets);
    setSelectedTicketId(newTicket.id);

    setTktSubject('');
    setTktDesc('');
    triggerToast('Support ticket created! Switch to Admin Mode to send support replies.');
  };

  const handleTicketReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tktReply.trim() || !selectedTicketId) return;

    const updatedTickets = tickets.map(t => {
      if (t.id === selectedTicketId) {
        return {
          ...t,
          status: 'Open' as const,
          messages: [...t.messages, { sender: 'customer' as const, content: tktReply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
        };
      }
      return t;
    });

    const TICKETS_KEY = 'apex_tickets';
    localStorage.setItem(TICKETS_KEY, JSON.stringify(updatedTickets));
    setTickets(updatedTickets);
    setTktReply('');
    triggerToast('Reply sent to support agent.');
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
          <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4">
            {selectedTicket ? (
              <div className="space-y-4">
                <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
                  <span className="font-bold text-zinc-955 dark:text-white block text-sm">{selectedTicket.subject}</span>
                  <span className="text-[10px] text-zinc-500">Category: {selectedTicket.category} | Priority: {selectedTicket.priority}</span>
                </div>

                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-3 rounded max-h-48 overflow-y-auto space-y-2">
                  {selectedTicket.messages.map((m, idx) => (
                    <div key={idx} className={`p-2 rounded text-[10px] ${m.sender === 'customer' ? 'bg-zinc-950 dark:bg-zinc-800 text-white dark:text-zinc-200' : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300'}`}>
                      <span className="block text-[8px] font-bold uppercase text-zinc-500">{m.sender === 'customer' ? 'You' : 'Agent Response'}</span>
                      <p>{m.content}</p>
                    </div>
                  ))}
                </div>

                {selectedTicket.status !== 'Resolved' && (
                  <form onSubmit={handleTicketReplySubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type follow-up message..."
                      value={tktReply}
                      onChange={(e) => setTktReply(e.target.value)}
                      className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-955 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                    />
                    <button type="submit" className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 rounded font-bold cursor-pointer transition-colors">Send</button>
                  </form>
                )}
              </div>
            ) : (
              <p className="text-zinc-500 text-center py-6">Select a ticket from the left log panel to view discussions.</p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
