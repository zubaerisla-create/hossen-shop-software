'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CustomDeal, ChatMessage } from '../../../types';
import { getDeals, saveDeals, getChats, saveChats } from '../../../utils/storage';
import GanttView from '../../../components/GanttView';
import {
  Paperclip, Send, FileText, UploadCloud
} from 'lucide-react';

export default function PortalDealDetailWorkspace() {
  const params = useParams();
  const router = useRouter();
  const dealId = params.id as string;

  const [deals, setDeals] = useState<CustomDeal[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [chatInput, setChatInput] = useState('');

  // Payment Sim modal state
  const [payingMilestone, setPayingMilestone] = useState<{ milId: string; mil: any } | null>(null);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing'>('details');
  const [phoneNum, setPhoneNum] = useState('');
  const [pin, setPin] = useState('');

  useEffect(() => {
    const loadedDeals = getDeals();
    setDeals(loadedDeals);
    setChatMessages(getChats());

    // Mark as read when client opens it
    const updated = loadedDeals.map(d => d.id === dealId ? { ...d, unreadPortal: false } : d);
    saveDeals(updated);
    setDeals(updated);
  }, [dealId]);

  const selectedDeal = deals.find(d => d.id === dealId);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-portal-toast', { detail: text });
    window.dispatchEvent(event);
  };

  if (!selectedDeal) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-zinc-500 font-bold">Project workspace not found.</p>
        <button
          onClick={() => router.push('/portal/deals')}
          className="bg-zinc-950 text-white dark:bg-white dark:text-black px-4 py-2 rounded font-bold text-xs"
        >
          Back to Projects List
        </button>
      </div>
    );
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const newFileObj = {
      name: file.name,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      url: '#',
      type: file.type || 'unknown'
    };

    const updatedDeals = deals.map(d => {
      if (d.id === dealId) {
        return {
          ...d,
          unreadAdmin: true,
          uploadedFiles: [...d.uploadedFiles, newFileObj]
        };
      }
      return d;
    });
    saveDeals(updatedDeals);
    setDeals(updatedDeals);

    // Send file into chat thread
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      content: `Uploaded requirements attachment asset: ${file.name}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      file: newFileObj
    };

    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), newMsg]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    triggerToast(`File ${file.name} successfully uploaded.`);
  };

  const handleSignContract = () => {
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

    triggerToast('Contract E-Signed! Phase 1 initiated.');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
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

    // Trigger admin unread flag
    const updatedDeals = deals.map(d => d.id === dealId ? { ...d, unreadAdmin: true } : d);
    saveDeals(updatedDeals);
    setDeals(updatedDeals);
  };

  const triggerMockUpload = () => {
    const attachment = { name: 'Specs_revision_v1.zip', size: '12 MB', url: '#', type: 'zip' };
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      content: 'Shared updated zip archive with revised specs.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      file: attachment
    };
    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), newMsg]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    const updatedDeals = deals.map(d => d.id === dealId ? { ...d, unreadAdmin: true } : d);
    saveDeals(updatedDeals);
    setDeals(updatedDeals);

    triggerToast('Uploaded Specs file.');
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

      setPayingMilestone(null);
      triggerToast(`Milestone payment of BDT ${payingMilestone.mil.cost.toLocaleString()} successfully processed via bKash.`);
    }, 2500);
  };

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      <div className="flex flex-col flex-1">
        {/* Sticky detail header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-4 border-b border-zinc-200 dark:border-zinc-900 space-y-2">
          <button
            onClick={() => router.push('/portal/deals')}
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

        <div className="p-6 md:p-8 flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full">
            
            {/* Left Column: Details, files, contract */}
            <div className="lg:col-span-7 lg:max-h-[calc(100vh-210px)] lg:overflow-y-auto pr-2 space-y-6">
              
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

              {/* Reference document vault */}
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <div>
                    <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider block">Project Specification Vault</span>
                    <p className="text-zinc-500 text-[10px]">Provide documents (PRDs, wireframes) to the engineering team.</p>
                  </div>
                </div>

                {selectedDeal.uploadedFiles.length === 0 ? (
                  /* Beautiful Empty State */
                  <div className="border border-dashed border-zinc-200 dark:border-zinc-800 rounded p-8 text-center space-y-4 bg-white/50 dark:bg-zinc-950/20">
                    <div className="mx-auto w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-450 dark:text-zinc-500">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="space-y-1.5 max-w-sm mx-auto">
                      <h4 className="font-bold text-zinc-900 dark:text-white text-xs">No project documents uploaded yet</h4>
                      <p className="text-zinc-500 text-[10px] leading-relaxed">
                        Provide your wireframes, software requirement documents (PRD), or design sheets. This helps our engineering team understand requirements and prepare quotations.
                      </p>
                    </div>
                    <div>
                      <label className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2 rounded font-bold text-[10px] transition-colors cursor-pointer">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Reference File</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.rar"
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  /* Files List */
                  <div className="space-y-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedDeal.uploadedFiles.map((file, idx) => (
                        <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded p-3 flex justify-between items-center gap-4">
                          <div className="flex items-center gap-2 min-w-0">
                            <FileText className="w-4 h-4 text-zinc-500 shrink-0" />
                            <div className="truncate">
                              <span className="font-bold text-zinc-950 dark:text-white truncate block">{file.name}</span>
                              <span className="text-[9px] text-zinc-400 font-mono">{file.size}</span>
                            </div>
                          </div>
                          <span className="text-[9px] font-mono text-zinc-400 shrink-0">Secured</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2">
                      <label className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2 rounded font-bold text-[10px] transition-colors cursor-pointer">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Upload Reference File</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={handleFileUpload}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.zip,.rar"
                        />
                      </label>
                    </div>
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
                          <div key={m.id} className="bg-white dark:bg-zinc-950 p-3.5 border border-zinc-200 dark:border-zinc-900 rounded flex justify-between items-center gap-3">
                            <div className="space-y-1 max-w-[70%]">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-zinc-900 dark:text-white">{m.title}</span>
                                <span className="text-[9px] bg-zinc-105 dark:bg-zinc-900 text-zinc-500 px-1 rounded font-mono font-bold">{m.cost.toLocaleString()} BDT</span>
                              </div>
                              <p className="text-[10px] text-zinc-500 font-sans">{m.description}</p>
                              <div className="flex gap-4 text-[9px] font-mono text-zinc-400">
                                <span>Due: {m.dueDate}</span>
                                <span>|</span>
                                <span className={isPaid ? 'text-emerald-500 font-bold' : 'text-amber-550 font-bold'}>
                                  Payment: {m.paymentStatus}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-2 items-end">
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
                        );
                      })}
                    </div>
                  </div>

                  {/* Gantt Chart schedule visualizer */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded">
                    <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider block mb-3">Project schedule gantt chart</span>
                    <GanttView 
                      milestones={selectedDeal.quotation?.milestones || []} 
                      currentMilestoneIndex={
                        selectedDeal.quotation?.milestones.findIndex(m => m.status === 'Pending' || m.status === 'Awaiting Approval' || m.status === 'In Progress') ?? 0
                      }
                    />
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

            {/* Right Column: Chat messages discuss room */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded p-5 flex flex-col justify-between lg:h-[calc(100vh-210px)] h-[600px] shrink-0">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white">Agency Conversation</h4>
                    <p className="text-zinc-500 text-[10px] uppercase font-mono">Workspace ID: {selectedDeal.id}</p>
                  </div>
                </div>
                <button onClick={triggerMockUpload} className="p-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-800 text-zinc-900 dark:text-zinc-300 rounded flex items-center gap-1 cursor-pointer">
                  <Paperclip className="w-3.5 h-3.5" /> Specs Attachment
                </button>
              </div>

              {/* Chat message logs */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
                {(!chatMessages[dealId] || chatMessages[dealId].length === 0) ? (
                  <div className="text-center text-zinc-400 py-8">No messages recorded in this custom channel.</div>
                ) : (
                  chatMessages[dealId].map((msg) => {
                    const isYou = msg.sender === 'customer';
                    return (
                      <div key={msg.id} className={`flex gap-2.5 items-start ${isYou ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Fiverr-style Avatar */}
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold tracking-tight uppercase shadow-sm ${
                          isYou 
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900' 
                            : 'bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
                        }`}>
                          {isYou ? 'C' : 'A'}
                        </div>

                        <div className="flex-1 space-y-1 max-w-[80%]">
                          {/* Message Bubble wrapper */}
                          <div className={`rounded-xl p-3 text-[11px] leading-relaxed shadow-sm border ${
                            isYou
                              ? 'bg-zinc-900 text-white border-zinc-800 dark:bg-white dark:text-zinc-900 dark:border-zinc-200 rounded-tr-none'
                              : 'bg-white border-zinc-200 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-900 rounded-tl-none'
                          }`}>
                            <div className="flex justify-between items-center gap-4 text-[8px] font-mono text-zinc-450 dark:text-zinc-500 border-b border-zinc-200/20 dark:border-zinc-800/50 pb-1 mb-1.5">
                              <span className="font-extrabold uppercase">{isYou ? 'You (Client)' : 'Admin'}</span>
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

              {/* Chat form */}
              <form onSubmit={handleSendChat} className="flex gap-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                <input
                  type="text"
                  placeholder="Type reply message to Agency..."
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

    </div>
  );
}
