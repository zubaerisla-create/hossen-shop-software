'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CustomDeal, ChatMessage, Milestone } from '../../../types';
import { getDeals, saveDeals, getChats, saveChats } from '../../../utils/storage';
import {
  Video, Paperclip, Send, FileText
} from 'lucide-react';

export default function AdminDealDetailWorkspace() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;

  const [deals, setDeals] = useState<CustomDeal[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [chatInput, setChatInput] = useState('');

  // Design Quotation Form State
  const [quoteTime, setQuoteTime] = useState('30 Days');
  const [quoteSupport, setQuoteSupport] = useState('6 Months Support');
  const [quoteMaintenance, setQuoteMaintenance] = useState('5,000 BDT/month');
  
  // Dynamic Milestones Builder State
  const [tempMilestones, setTempMilestones] = useState<Array<{
    title: string;
    description: string;
    cost: number;
    dueDate: string;
  }>>([
    { title: 'Phase 1: Planning, Wireframing & Design Proposal', description: 'Provide Figma interface blueprints and requirements analysis documents.', cost: 18000, dueDate: '10 Days' },
    { title: 'Phase 2: Core Frontend Development & Assembly', description: 'Build complete UI features, dashboard grids, pages and responsive layouts.', cost: 21000, dueDate: '20 Days' },
    { title: 'Phase 3: Database setup & Backend API Integrations', description: 'Implement database tables, api nodes, and secure webhooks.', cost: 15000, dueDate: '25 Days' },
    { title: 'Phase 4: Bug fixing, Security Audit & Final Delivery', description: 'Provide system optimization, load audits, domain hosting and final code delivery.', cost: 6000, dueDate: '30 Days' }
  ]);

  const quoteCost = tempMilestones.reduce((sum, m) => sum + m.cost, 0);

  // Project Delivery fields
  const [githubUrl, setGithubUrl] = useState('');
  const [cpanelUrl, setCpanelUrl] = useState('');
  const [dbCreds, setDbCreds] = useState('');
  
  // Developers Assigned
  const [devName, setDevName] = useState('');
  const [progressVal, setProgressVal] = useState(10);

  useEffect(() => {
    const loadedDeals = getDeals();
    setDeals(loadedDeals);
    setChatMessages(getChats());

    // Mark as read when admin opens it
    const updated = loadedDeals.map(d => d.id === dealId ? { ...d, unreadAdmin: false } : d);
    saveDeals(updated);
    setDeals(updated);
  }, [dealId]);

  const selectedDeal = deals.find(d => d.id === dealId);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-admin-toast', { detail: text });
    window.dispatchEvent(event);
  };

  if (!selectedDeal) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-zinc-500 font-bold">Deal workspace not found.</p>
        <button
          onClick={() => router.push('/admin/deals')}
          className="bg-zinc-950 text-white dark:bg-white dark:text-black px-4 py-2 rounded font-bold text-xs"
        >
          Back to Deals Dashboard
        </button>
      </div>
    );
  }

  const handleReviewRequest = () => {
    const updated = deals.map(d => d.id === dealId ? { ...d, status: 'Reviewing' as const, unreadPortal: true } : d);
    saveDeals(updated);
    setDeals(updated);

    // Send chat notice
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: `Hello! Our team has received your custom project request and has moved it to "Reviewing" state. We are analyzing the specifications to prepare a custom solution roadmap.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), message]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    triggerToast('Project moved to Reviewing. Notification sent.');
  };

  const handleStartDiscussion = () => {
    const updated = deals.map(d => d.id === dealId ? { ...d, status: 'Discussion' as const, unreadPortal: true } : d);
    saveDeals(updated);
    setDeals(updated);

    // Send chat notice
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: `Let's negotiate and discuss details! We have initiated a project workspace discussion. We will prepare milestone estimations and propose a quotation shortly. Please feel free to share any supplementary assets here.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), message]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    triggerToast('Negotiation discussion started. Notification sent.');
  };

  const handleRejectProposal = () => {
    const reason = prompt('Please enter the reason for declining this custom proposal:', 'Budget constraints / requirement mismatch');
    if (reason === null) return; // cancelled

    const updated = deals.map(d => d.id === dealId ? { ...d, status: 'Rejected' as const, unreadPortal: true } : d);
    saveDeals(updated);
    setDeals(updated);

    // Send chat notice
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: `Custom project request has been declined. Reason for rejection: ${reason || 'Not specified'}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), message]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    triggerToast('Project request declined.');
  };

  const handleSendQuotationSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (tempMilestones.length === 0) {
      alert('Please add at least one milestone.');
      return;
    }

    const hasEmptyField = tempMilestones.some(m => !m.title.trim() || m.cost <= 0);
    if (hasEmptyField) {
      alert('Please ensure all milestones have a title and a valid cost greater than 0.');
      return;
    }

    const milestones: Milestone[] = tempMilestones.map((m, idx) => ({
      id: `m${idx + 1}`,
      title: m.title,
      description: m.description,
      cost: m.cost,
      percentage: quoteCost > 0 ? Math.round((m.cost / quoteCost) * 100) : 0,
      status: 'Pending',
      paymentStatus: 'Unpaid',
      dueDate: m.dueDate
    }));

    const quote = {
      totalCost: quoteCost,
      developmentTime: quoteTime,
      supportPeriod: quoteSupport,
      maintenanceOffer: quoteMaintenance,
      milestones,
      terms: [
        'Payment milestones must be completed to unlock next stages of source files.',
        'Warranty includes fixing crashes or bugs for 6 months after deployment.',
        'Hosting servers must be paid directly by Client.'
      ]
    };

    const updatedDeals = deals.map(d => d.id === dealId ? {
      ...d,
      quotation: quote,
      status: 'Quotation Sent' as const,
      unreadPortal: true
    } : d);

    saveDeals(updatedDeals);
    setDeals(updatedDeals);

    // Send chat notice
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: `A formal proposal estimation has been generated with ${milestones.length} milestones. Total cost: ${quote.totalCost.toLocaleString()} BDT, Timeline: ${quote.developmentTime}. Please review the Online Contract and E-Sign to kickoff development.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), message]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    triggerToast('Quotation sent to Client.');
  };

  const handleDeliverProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedDeals = deals.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          status: 'Delivered' as const,
          unreadPortal: true,
          credentials: {
            github: githubUrl || 'https://github.com/',
            cPanel: cpanelUrl || 'https://cpanel.domain.com',
            database: dbCreds || 'Database configuration finalized.'
          }
        };
      }
      return d;
    });

    saveDeals(updatedDeals);
    setDeals(updatedDeals);

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: `🎉 Project final builds have been successfully published and credentials delivered! GitHub repository: ${githubUrl || 'Staging vault active'}, Hosting: ${cpanelUrl || 'Server synced'}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), message]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    triggerToast('Project final deployment credentials handed over!');
  };

  const handleAssignDevSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!devName.trim()) return;

    const updatedDeals = deals.map(d => d.id === dealId ? { ...d, developer: devName, unreadPortal: true } : d);
    saveDeals(updatedDeals);
    setDeals(updatedDeals);

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: `Engineer Assigned: ${devName} has been scheduled for technical resource deployment.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), message]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    setDevName('');
    triggerToast(`Resource scheduled: ${devName}`);
  };

  const handleUpdateProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedDeals = deals.map(d => d.id === dealId ? { ...d, overallProgress: progressVal, unreadPortal: true } : d);
    saveDeals(updatedDeals);
    setDeals(updatedDeals);

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: `Project timeline milestone updated. Current construction status is: ${progressVal}% complete.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), message]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    triggerToast(`Progress updated to ${progressVal}%`);
  };

  const handleAdvanceMilestoneStage = (milestoneId: string, nextStage: 'Pending' | 'Awaiting Approval' | 'Approved') => {
    const updatedDeals = deals.map(d => {
      if (d.id === dealId && d.quotation) {
        const milestones = d.quotation.milestones.map(m =>
          m.id === milestoneId ? { ...m, status: nextStage } : m
        );
        return {
          ...d,
          unreadPortal: true,
          quotation: {
            ...d.quotation,
            milestones
          }
        };
      }
      return d;
    });

    saveDeals(updatedDeals);
    setDeals(updatedDeals);

    const targetMil = selectedDeal.quotation?.milestones.find(m => m.id === milestoneId);
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: `Phase deliverables for "${targetMil?.title}" submitted to client checklist for approval. Payment pending.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), message]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    triggerToast(`Phase Deliverables status advanced: ${nextStage}`);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), newMsg]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);
    setChatInput('');

    // Trigger client side unread flag
    const updatedDeals = deals.map(d => d.id === dealId ? { ...d, unreadPortal: true } : d);
    saveDeals(updatedDeals);
    setDeals(updatedDeals);
  };

  const triggerMockUpload = () => {
    const attachment = { name: 'Admin_Specs_v2.pdf', size: '2.4 MB', url: '#', type: 'pdf' };
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: 'Shared supplementary requirements breakdown spec sheet.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      file: attachment
    };
    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), newMsg]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    const updatedDeals = deals.map(d => d.id === dealId ? { ...d, unreadPortal: true } : d);
    saveDeals(updatedDeals);
    setDeals(updatedDeals);

    triggerToast('Document uploaded to Client Chat.');
  };

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      <div className="flex flex-col flex-1">
        {/* Sticky detail header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-955 z-20 px-6 py-4 border-b border-zinc-200 dark:border-zinc-900 space-y-2">
          <button
            onClick={() => router.push('/admin/deals')}
            className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400 hover:text-zinc-955 dark:hover:text-white font-bold cursor-pointer transition-colors text-[10px] uppercase tracking-wider"
          >
            ← Back to Control Room List
          </button>
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">{selectedDeal.title} Control Workspace</h2>
            <p className="text-zinc-500 text-[10px] font-mono">
              Project ID: <span className="text-zinc-900 dark:text-white font-bold">{selectedDeal.id}</span> | Type: <span className="text-zinc-900 dark:text-white font-bold">{selectedDeal.projectType}</span> | Priority: <span className="text-zinc-900 dark:text-white font-bold">{selectedDeal.priority}</span>
            </p>
          </div>
        </div>

        <div className="p-6 md:p-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full">
            
            {/* Left Column */}
            <div className="lg:col-span-7 lg:max-h-[calc(100vh-210px)] lg:overflow-y-auto pr-2 space-y-6">
              
              {/* Status Controller card */}
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-zinc-900 dark:text-white">Proposal workflow status control</span>
                  <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
                    {selectedDeal.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleReviewRequest}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-700 dark:text-zinc-350 px-3 py-1.5 rounded font-semibold cursor-pointer transition-colors"
                  >
                    Review Request
                  </button>
                  <button
                    onClick={handleStartDiscussion}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-700 dark:text-zinc-350 px-3 py-1.5 rounded font-semibold cursor-pointer transition-colors"
                  >
                    Negotiate / Discuss
                  </button>
                  <button
                    onClick={handleRejectProposal}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-700 dark:text-zinc-350 px-3 py-1.5 rounded font-semibold cursor-pointer transition-colors"
                  >
                    Reject Proposal
                  </button>
                </div>
              </div>

              {/* Quotation Proposal card / Form */}
              {selectedDeal.status === 'Discussion' && !selectedDeal.quotation && (
                <form onSubmit={handleSendQuotationSubmit} className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded space-y-4">
                  <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2 flex justify-between items-center">
                    <div>
                      <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Milestone Quotation Proposal</h3>
                      <p className="text-zinc-500 text-[10px]">Formulate prices, delivery weeks, and milestone payments.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Time estimation</label>
                      <input
                        type="text"
                        value={quoteTime}
                        onChange={(e) => setQuoteTime(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Warranty period</label>
                      <input
                        type="text"
                        value={quoteSupport}
                        onChange={(e) => setQuoteSupport(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-955 dark:text-white rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Maintenance offers</label>
                      <input
                        type="text"
                        value={quoteMaintenance}
                        onChange={(e) => setQuoteMaintenance(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-955 dark:text-white rounded px-2.5 py-1.5 text-xs focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase font-bold text-zinc-500">Proposed Milestones Checklist</span>
                      <button
                        type="button"
                        onClick={() => {
                          setTempMilestones([...tempMilestones, { title: '', description: '', cost: 0, dueDate: '30 Days' }]);
                        }}
                        className="bg-zinc-950 dark:bg-white text-white dark:text-black font-extrabold text-[9px] px-2 py-1 rounded"
                      >
                        + Add Milestone
                      </button>
                    </div>

                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {tempMilestones.map((m, idx) => (
                        <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-3 rounded space-y-2 relative">
                          <button
                            type="button"
                            onClick={() => {
                              setTempMilestones(tempMilestones.filter((_, i) => i !== idx));
                            }}
                            className="absolute top-2 right-2 text-rose-500 font-bold text-[10px]"
                          >
                            Remove
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[8px] uppercase font-bold text-zinc-400">Milestone Title</label>
                              <input
                                type="text"
                                required
                                value={m.title}
                                placeholder="Phase title..."
                                onChange={(e) => {
                                  const updated = [...tempMilestones];
                                  updated[idx].title = e.target.value;
                                  setTempMilestones(updated);
                                }}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-2.5 py-1.5 text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase font-bold text-zinc-400">Scope Description</label>
                              <input
                                type="text"
                                required
                                value={m.description}
                                placeholder="What is delivered..."
                                onChange={(e) => {
                                  const updated = [...tempMilestones];
                                  updated[idx].description = e.target.value;
                                  setTempMilestones(updated);
                                }}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-2.5 py-1.5 text-xs focus:outline-none"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[8px] uppercase font-bold text-zinc-400">Phase cost (BDT)</label>
                              <input
                                type="number"
                                required
                                value={m.cost || ''}
                                placeholder="e.g., 10000"
                                onChange={(e) => {
                                  const updated = [...tempMilestones];
                                  updated[idx].cost = Number(e.target.value);
                                  setTempMilestones(updated);
                                }}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-2.5 py-1.5 text-xs focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[8px] uppercase font-bold text-zinc-400">Timeline / Due Date</label>
                              <input
                                type="text"
                                required
                                value={m.dueDate}
                                placeholder="e.g. 10 Days"
                                onChange={(e) => {
                                  const updated = [...tempMilestones];
                                  updated[idx].dueDate = e.target.value;
                                  setTempMilestones(updated);
                                }}
                                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-955 dark:text-white rounded px-2.5 py-1.5 text-xs focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white font-bold">
                      <span>Total Quotation Cost:</span>
                      <span className="text-sm text-emerald-500 font-mono">{quoteCost.toLocaleString()} BDT</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Send Quotation & Milestone Proposal</span>
                  </button>
                </form>
              )}

              {/* Active Quotation / Milestones Tracker */}
              {selectedDeal.quotation && (
                <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4">
                  <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white">Active Milestone Payments & Delivery Tracker</h4>
                      <p className="text-zinc-500 text-[10px]">Track payments and submit finished deliverables.</p>
                    </div>
                    <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-200 dark:border-emerald-500/20 px-2 py-0.5 rounded text-[8px] font-bold uppercase">Proposal Active</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white dark:bg-zinc-950 p-3 border border-zinc-200 dark:border-zinc-900 rounded">
                      <span className="text-zinc-500 font-bold uppercase text-[8px] block">Duration Offer</span>
                      <span className="text-lg font-bold text-zinc-900 dark:text-white">{selectedDeal.quotation.developmentTime}</span>
                    </div>
                    <div className="bg-white dark:bg-zinc-950 p-3 border border-zinc-200 dark:border-zinc-900 rounded">
                      <span className="text-zinc-500 font-bold uppercase text-[8px] block">Project Quote Value</span>
                      <span className="text-lg font-bold text-zinc-900 dark:text-white">{selectedDeal.quotation.totalCost.toLocaleString()} BDT</span>
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    {selectedDeal.quotation.milestones.map((m) => {
                      const isAwaiting = m.status === 'Awaiting Approval';
                      const isApproved = m.status === 'Approved';

                      return (
                        <div key={m.id} className="bg-white dark:bg-zinc-950 p-3 border border-zinc-200 dark:border-zinc-900 rounded flex justify-between items-center">
                          <div className="space-y-1 max-w-[70%]">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-900 dark:text-white block">{m.title}</span>
                              <span className="text-[9px] bg-zinc-100 dark:bg-zinc-900 text-zinc-500 px-1 rounded font-mono font-bold">{m.cost.toLocaleString()} BDT</span>
                            </div>
                            <p className="text-[10px] text-zinc-500">{m.description}</p>
                            <div className="text-[9px] flex gap-3 text-zinc-400 font-mono">
                              <span>Due: {m.dueDate}</span>
                              <span>|</span>
                              <span className={m.paymentStatus === 'Paid' ? 'text-emerald-500 font-bold' : 'text-amber-550 font-bold'}>
                                Payment: {m.paymentStatus}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5 items-end">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                              m.status === 'Approved'
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border border-emerald-250 dark:border-emerald-500/20'
                                : m.status === 'Awaiting Approval'
                                ? 'bg-amber-550 dark:bg-amber-500/10 text-amber-600 dark:text-amber-455 border border-amber-250 dark:border-amber-550/20 animate-pulse'
                                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-550 dark:text-zinc-400'
                            }`}>
                              {m.status}
                            </span>
                            
                            {!isApproved && !isAwaiting && (
                              <button
                                onClick={() => handleAdvanceMilestoneStage(m.id, 'Awaiting Approval')}
                                className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-2 py-1 rounded text-[9px] font-bold cursor-pointer transition-colors"
                              >
                                Submit Phase
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Team assignments card */}
              {selectedDeal.contractSigned && (
                <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4">
                  <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3">
                    <h4 className="font-bold text-zinc-900 dark:text-white">Assigned Developers & Talent Scheduling</h4>
                    <p className="text-zinc-500 text-[10px]">Manage tech resource scheduling and project developers.</p>
                  </div>

                  <form onSubmit={handleAssignDevSubmit} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Sabbir Ahmed (Senior Full-stack Dev)"
                      value={devName}
                      onChange={(e) => setDevName(e.target.value)}
                      className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded px-3 py-2 text-zinc-900 dark:text-white focus:outline-none"
                    />
                    <button type="submit" className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 rounded font-bold cursor-pointer transition-colors">
                      Assign Dev
                    </button>
                  </form>

                  {selectedDeal.developer && (
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded p-3 flex justify-between items-center">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-zinc-450 block font-mono">Assigned Resource</span>
                        <span className="font-bold text-zinc-900 dark:text-white">{selectedDeal.developer}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[8px] font-bold uppercase bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">Scheduled</span>
                    </div>
                  )}
                </div>
              )}

              {/* Adjust overall progress card */}
              {selectedDeal.contractSigned && (
                <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white">Adjust Overall Progress</h4>
                    <p className="text-zinc-500 text-[10px]">Explicitly update the project progress bar visible to the customer.</p>
                  </div>
                  <form onSubmit={handleUpdateProgressSubmit} className="flex items-center gap-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={progressVal}
                      onChange={(e) => setProgressVal(Number(e.target.value))}
                      className="flex-1 accent-zinc-900 cursor-pointer"
                    />
                    <span className="font-bold text-zinc-900 dark:text-white font-mono w-8">{progressVal}%</span>
                    <button type="submit" className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-3 py-1.5 rounded font-bold cursor-pointer transition-colors">
                      Update
                    </button>
                  </form>
                </div>
              )}

              {/* Final Delivery & Vault Configuration */}
              {selectedDeal.contractSigned && (
                <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4">
                  <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white">Final delivery & client credentials vaults</h4>
                      <p className="text-zinc-500 text-[10px]">Configure staging credentials and upload final deployment archives.</p>
                    </div>
                    {selectedDeal.status === 'Delivered' && (
                      <span className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 px-2 py-0.5 rounded text-[8px] font-bold uppercase">Files Handed Over</span>
                    )}
                  </div>

                  <form onSubmit={handleDeliverProjectSubmit} className="space-y-3">
                    <div>
                      <label className="block text-zinc-550 font-bold mb-1 uppercase text-[9px]">GitHub Repository Link</label>
                      <input
                        type="text"
                        placeholder="https://github.com/client-repo/..."
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-zinc-900 dark:text-white focus:outline-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-zinc-550 font-bold mb-1 uppercase text-[9px]">cPanel / Hosting Server URL</label>
                        <input
                          type="text"
                          placeholder="https://server.domain.com:2083"
                          value={cpanelUrl}
                          onChange={(e) => setCpanelUrl(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-zinc-550 font-bold mb-1 uppercase text-[9px]">Database Credentials / Notes</label>
                        <input
                          type="text"
                          placeholder="PostgreSQL staging credentials active"
                          value={dbCreds}
                          onChange={(e) => setDbCreds(e.target.value)}
                          className="w-full bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 rounded p-2 text-zinc-900 dark:text-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black py-2 rounded font-bold cursor-pointer transition-colors"
                    >
                      Publish Final Build & Deliver Credentials
                    </button>
                  </form>
                </div>
              )}
            </div>

            {/* Right Column: Chat interface */}
            <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded p-4 flex flex-col h-[calc(100vh-210px)] shrink-0">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 mb-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white">Client Conversation</h4>
                    <p className="text-zinc-500 text-[10px] uppercase font-mono">Workspace ID: {selectedDeal.id}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={triggerMockUpload}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-700 dark:text-zinc-350 p-1.5 rounded cursor-pointer transition-colors"
                    title="Upload specs to client chat"
                  >
                    <Paperclip className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Chat message logs */}
              <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 scrollbar-thin">
                {(!chatMessages[dealId] || chatMessages[dealId].length === 0) ? (
                  <div className="text-center text-zinc-400 py-8">No messages recorded in this custom channel.</div>
                ) : (
                  chatMessages[dealId].map((msg) => {
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div key={msg.id} className={`flex gap-2.5 items-start ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Fiverr-style Avatar */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold tracking-tight uppercase shadow-sm ${
                          isAdmin 
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' 
                            : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}>
                          {isAdmin ? 'A' : 'C'}
                        </div>

                        <div className="flex-1 space-y-1 max-w-[80%]">
                          {/* Message Bubble wrapper */}
                          <div className={`rounded-xl p-3 text-[11px] leading-relaxed shadow-sm border ${
                            isAdmin
                              ? 'bg-zinc-900 text-white border-zinc-800 dark:bg-white dark:text-zinc-950 dark:border-zinc-200 rounded-tr-none'
                              : 'bg-white border-zinc-200 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-900 rounded-tl-none'
                          }`}>
                            <div className="flex justify-between items-center gap-4 text-[8px] font-mono text-zinc-450 dark:text-zinc-500 border-b border-zinc-200/20 dark:border-zinc-800/50 pb-1 mb-1.5">
                              <span className="font-extrabold uppercase">{isAdmin ? 'You (Admin)' : 'Client'}</span>
                              <span>{msg.timestamp}</span>
                            </div>

                            <p className="whitespace-pre-wrap">{msg.content}</p>

                            {msg.file && (
                              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2 flex items-center justify-between gap-3 mt-2 text-[9px]">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <FileText className="w-3.5 h-3.5 text-zinc-550 shrink-0" />
                                  <span className="text-zinc-900 dark:text-white truncate max-w-[120px] block font-bold">{msg.file.name}</span>
                                </div>
                                <a href="#" onClick={(e) => e.preventDefault()} className="text-zinc-900 dark:text-white font-bold hover:underline shrink-0">Download</a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat input */}
              <form onSubmit={handleSendChat} className="flex gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                <input
                  type="text"
                  placeholder="Type reply message to Client..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 focus:outline-none"
                />
                <button type="submit" className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 rounded flex items-center justify-center cursor-pointer transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
