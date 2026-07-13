'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Product, CustomDeal, ChatMessage, Invoice, SupportTicket, Milestone } from '@/app/types';
import {
  LayoutDashboard, Download, Laptop, MessageSquare, Receipt,
  Ticket, ArrowRight, ShieldCheck, ChevronRight, CheckCircle2,
  AlertCircle, Terminal, Send, Paperclip, Video, ExternalLink
} from 'lucide-react';
import GanttView from './GanttView';

interface CustomerPortalProps {
  deals: CustomDeal[];
  purchasedProducts: Product[];
  invoices: Invoice[];
  tickets: SupportTicket[];
  chatMessages: Record<string, ChatMessage[]>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onSignContract: (dealId: string, name: string, sigImg: string) => void;
  onPayMilestone: (dealId: string, milestoneId: string, cost: number, title: string) => void;
  onSendChatMessage: (dealId: string, content: string, sender: 'customer' | 'admin', file?: any, link?: string) => void;
  onOpenTicket: (subject: string, desc: string, category: 'Technical' | 'Billing' | 'Customization' | 'Other', priority: 'Low' | 'Medium' | 'High') => void;
  onSubmitTicketReply: (ticketId: string, content: string) => void;
  onSubmitCustomDeal: (title: string, desc: string, type: string, budget: number, deadline: string, tech: string, priority: 'Low' | 'Medium' | 'High' | 'Urgent') => void;
  onToastNotification: (text: string) => void;
  onBuySuccess: (productId: string, price: number, name: string) => void;
  initialEstimatorData?: { title: string; desc: string; budget: number; tech: string } | null;
  clearEstimatorData: () => void;
}

export default function CustomerPortal({
  deals,
  purchasedProducts,
  invoices,
  tickets,
  chatMessages,
  activeTab,
  setActiveTab,
  onSignContract,
  onPayMilestone,
  onSendChatMessage,
  onOpenTicket,
  onSubmitTicketReply,
  onSubmitCustomDeal,
  onToastNotification,
  initialEstimatorData,
  clearEstimatorData
}: CustomerPortalProps) {
  const router = useRouter();
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Custom Project Form fields
  const [dealTitle, setDealTitle] = useState('');
  const [dealDesc, setDealDesc] = useState('');
  const [dealType, setDealType] = useState('Web Application');
  const [dealBudget, setDealBudget] = useState(50000);
  const [dealDeadline, setDealDeadline] = useState('2026-08-30');
  const [dealTech, setDealTech] = useState('');
  const [dealPriority, setDealPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');

  // Chat message field
  const [chatInput, setChatInput] = useState('');

  // Ticket Form fields
  const [tktSubject, setTktSubject] = useState('');
  const [tktDesc, setTktDesc] = useState('');
  const [tktCategory, setTktCategory] = useState<'Technical' | 'Billing' | 'Customization' | 'Other'>('Technical');
  const [tktPriority, setTktPriority] = useState<'Low' | 'Medium' | 'High'>('Medium');
  const [tktReply, setTktReply] = useState('');

  // bKash / Payment simulation state
  const [payingMilestone, setPayingMilestone] = useState<{ dealId: string; mil: Milestone } | null>(null);
  const [phoneNum, setPhoneNum] = useState('');
  const [pin, setPin] = useState('');
  const [paymentStep, setPaymentStep] = useState<'none' | 'details' | 'success'>('none');

  // Fill imported estimator data
  useEffect(() => {
    if (initialEstimatorData) {
      setDealTitle(initialEstimatorData.title);
      setDealDesc(initialEstimatorData.desc);
      setDealBudget(initialEstimatorData.budget);
      setDealTech(initialEstimatorData.tech);
      setActiveTab('custom-deals');
      clearEstimatorData();
      onToastNotification('AI estimation imported successfully! Complete the form.');
    }
  }, [initialEstimatorData]);

  // Set default deal selected
  useEffect(() => {
    if (deals.length > 0 && !selectedDealId) {
      setSelectedDealId(deals[0].id);
    }
  }, [deals, selectedDealId]);

  const selectedDeal = deals.find(d => d.id === selectedDealId);
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleSubmitDeal = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitCustomDeal(dealTitle, dealDesc, dealType, dealBudget, dealDeadline, dealTech, dealPriority);
    setDealTitle('');
    setDealDesc('');
    setDealTech('');
    onToastNotification('Requirements submitted! Switch to Admin mode to review and design a quotation.');
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedDealId) return;
    onSendChatMessage(selectedDealId, chatInput, 'customer');
    setChatInput('');
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tktSubject || !tktDesc) return;
    onOpenTicket(tktSubject, tktDesc, tktCategory, tktPriority);
    setTktSubject('');
    setTktDesc('');
    onToastNotification('Support ticket created. Support team will reply shortly.');
  };

  const handleTicketReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tktReply.trim() || !selectedTicketId) return;
    onSubmitTicketReply(selectedTicketId, tktReply);
    setTktReply('');
  };

  const startPayMilestone = (dealId: string, mil: Milestone) => {
    setPayingMilestone({ dealId, mil });
    setPaymentStep('details');
  };

  const executeMilestonePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingMilestone) return;

    setPaymentStep('success');
    setTimeout(() => {
      onPayMilestone(payingMilestone.dealId, payingMilestone.mil.id, payingMilestone.mil.cost, payingMilestone.mil.title);
      setPayingMilestone(null);
      setPaymentStep('none');
      onToastNotification(`Milestone payment of ${payingMilestone.mil.cost.toLocaleString()} BDT confirmed!`);
    }, 2000);
  };

  const triggerMockUpload = (type: 'pdf' | 'zip') => {
    if (!selectedDealId) return;
    const files = {
      pdf: { name: 'Ref_Specs_Customer.pdf', size: '1.4 MB', url: '#', type: 'pdf' },
      zip: { name: 'Design_Assets.zip', size: '8.2 MB', url: '#', type: 'zip' }
    };
    onSendChatMessage(selectedDealId, `Uploaded file attachment: ${files[type].name}`, 'customer', files[type]);
    onToastNotification('Mock file uploaded in chat stream.');
  };

  const triggerMockCall = () => {
    if (!selectedDealId) return;
    onSendChatMessage(selectedDealId, 'Meeting Link generated. Click join conference.', 'admin', undefined, 'https://meet.jit.si/custom-project-consultation');
    onToastNotification('Mock admin meeting link generated.');
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded overflow-hidden shadow-sm min-h-[75vh] transition-colors">

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-zinc-50 dark:bg-zinc-900/60 border-r border-zinc-200 dark:border-zinc-900 p-4 space-y-6 flex flex-col justify-between transition-colors">
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 px-2">
            <div className="bg-zinc-950 dark:bg-white px-2 py-0.5 rounded text-white dark:text-black font-extrabold text-[10px]">
              PORTAL
            </div>
            <div>
              <span className="font-extrabold text-sm text-zinc-950 dark:text-white block">Client Workspace</span>
              <span className="text-[10px] text-zinc-500 font-medium">{typeof window !== 'undefined' ? (localStorage.getItem('apex_user_name') || 'Client Portal') : 'Client Portal'}</span>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Overview Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'downloads', label: 'Ready Products', icon: <Download className="w-4 h-4" /> },
              { id: 'custom-deals', label: 'Custom Projects', icon: <Laptop className="w-4 h-4" /> },
              { id: 'chat', label: 'Discussion Chat', icon: <MessageSquare className="w-4 h-4" /> },
              { id: 'invoices', label: 'PDF Invoices', icon: <Receipt className="w-4 h-4" /> },
              { id: 'tickets', label: 'Support Tickets', icon: <Ticket className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-semibold tracking-wide transition-all cursor-pointer ${activeTab === tab.id
                    ? 'bg-zinc-200 dark:bg-zinc-900 text-zinc-950 dark:text-white border border-zinc-300 dark:border-zinc-800'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-2.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded">
          <span className="block text-[9px] text-zinc-500 font-bold uppercase tracking-wider mb-1">Contract Status</span>
          <div className="flex items-center gap-1.5 text-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-zinc-800 dark:text-zinc-300 font-semibold">Agreement Secured</span>
          </div>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[80vh] bg-white dark:bg-zinc-950 flex flex-col justify-between transition-colors">

        {/* Dashboard Overview */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn text-xs">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-900">
              <div>
                <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Client Portal</h2>
                <p className="text-zinc-500 text-[10px]">Instant summary of your digital assets and custom development contracts.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4">
                <span className="text-zinc-500 dark:text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Ready Products Owned</span>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-bold text-zinc-950 dark:text-white">{purchasedProducts.length}</span>
                  <button onClick={() => setActiveTab('downloads')} className="text-zinc-950 dark:text-white font-bold flex items-center gap-1 text-[10px]">
                    Download <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4">
                <span className="text-zinc-500 dark:text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Active Custom Projects</span>
                <div className="flex justify-between items-end">
                  <span className="text-3xl font-bold text-zinc-950 dark:text-white">{deals.length}</span>
                  <button onClick={() => setActiveTab('custom-deals')} className="text-zinc-950 dark:text-white font-bold flex items-center gap-1 text-[10px]">
                    Manage <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4">
                <span className="text-zinc-500 dark:text-zinc-500 text-[10px] uppercase font-bold tracking-wider">Paid Amount Value</span>
                <div className="flex justify-between items-end">
                  <span className="text-2xl font-bold text-zinc-950 dark:text-white">
                    {invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.total, 0).toLocaleString()} BDT
                  </span>
                  <button onClick={() => setActiveTab('invoices')} className="text-zinc-950 dark:text-white font-bold flex items-center gap-1 text-[10px]">
                    Invoices <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions / Guide */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded p-6 space-y-4">
              <h3 className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider">
                How to test this Custom Project flow:
              </h3>
              <ol className="space-y-3 text-zinc-600 dark:text-zinc-400 pl-4 list-decimal leading-relaxed">
                <li>Go to <strong className="text-zinc-900 dark:text-white">Custom Projects</strong> tab on the left.</li>
                <li>Submit a project requirement (or write a description in the AI Estimator at the bottom of the landing page, click "Use Estimate on Form", and press Submit).</li>
                <li>Switch to <strong className="text-zinc-900 dark:text-white">Admin Mode</strong> in the selector bar at the top of your screen to review and send a structured proposal.</li>
                <li>Switch back to <strong className="text-zinc-900 dark:text-white">Customer Mode</strong>, open Custom Projects to <strong className="text-zinc-900 dark:text-white">E-Sign the Contract</strong>.</li>
                <li>Pay the first milestone. Switch back to Admin to advance development stages!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Downloads ready products */}
        {activeTab === 'downloads' && (
          <div className="space-y-6 animate-fadeIn text-xs">
            <div>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Codebases</h2>
              <p className="text-zinc-500 text-[10px]">Instant links to download your code bases, documentation, and licenses.</p>
            </div>

            {purchasedProducts.length > 0 ? (
              <div className="space-y-4">
                {purchasedProducts.map((prod) => (
                  <div key={prod.id} className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-zinc-950 dark:text-white text-sm">{prod.name}</span>
                        <span className="bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded text-[9px] font-mono">v{prod.version}</span>
                      </div>
                      <p className="text-zinc-500 text-[11px]">{prod.license}</p>
                    </div>

                    <div className="flex gap-2">
                      {prod.documentationUrl && (
                        <a
                          href={prod.documentationUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-4 py-2 rounded font-bold text-xs flex items-center gap-1.5"
                        >
                          Documentation <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={() => onToastNotification(`Starting download for ${prod.name}_v${prod.version}.zip`)}
                        className="bg-zinc-950 dark:bg-white hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2 rounded font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" /> Download Source Code
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded py-12 text-center text-zinc-500">
                You have not purchased any ready-made products. Browse the landing page to purchase products!
              </div>
            )}
          </div>
        )}

        {/* Custom Project Dashboard */}
        {activeTab === 'custom-deals' && (
          <div className="space-y-6 animate-fadeIn text-xs">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-900">
              <div>
                <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Custom Projects</h2>
                <p className="text-zinc-500 text-[10px]">Detailed proposal reviews, milestone payouts, credentials and delivery logs.</p>
              </div>

              {/* Deal Switcher tabs */}
              {deals.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {deals.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDealId(d.id)}
                      className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${selectedDealId === d.id
                          ? 'bg-zinc-950 dark:bg-white text-white dark:text-black border-zinc-950'
                          : 'bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-500 border-zinc-200 dark:border-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-400'
                        }`}
                    >
                      {d.title.slice(0, 15)}...
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedDeal ? (
              <div className="space-y-6">

                {/* Status card */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded space-y-1">
                    <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Project ID</span>
                    <span className="text-zinc-950 dark:text-white font-mono block">{selectedDeal.id}</span>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded space-y-1">
                    <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Cost / Budget</span>
                    <span className="text-zinc-950 dark:text-white font-bold block">{selectedDeal.quotation ? `${selectedDeal.quotation.totalCost.toLocaleString()} BDT` : `${selectedDeal.budget.toLocaleString()} BDT (Budget)`}</span>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded space-y-1">
                    <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Current Status</span>
                    <span className="text-zinc-950 dark:text-white font-extrabold uppercase block">{selectedDeal.status}</span>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-4 rounded space-y-1">
                    <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Developer Assigned</span>
                    <span className="text-zinc-700 dark:text-zinc-300 font-medium block">{selectedDeal.developer || 'Awaiting Contract Sign'}</span>
                  </div>
                </div>

                {/* Progress check list (Steps) */}
                <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded p-5 space-y-4">
                  <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider block">Progress Steps</span>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
                    {[
                      { step: 'Requirement', done: true },
                      { step: 'Planning', done: selectedDeal.status !== 'New' && selectedDeal.status !== 'Reviewing' && selectedDeal.status !== 'Discussion' },
                      { step: 'Design', done: selectedDeal.status !== 'New' && selectedDeal.status !== 'Reviewing' && selectedDeal.status !== 'Discussion' && selectedDeal.status !== 'Quotation Sent' },
                      { step: 'Development', done: selectedDeal.status === 'Testing' || selectedDeal.status === 'Client Review' || selectedDeal.status === 'Revision' || selectedDeal.status === 'Completed' || selectedDeal.status === 'Delivered' },
                      { step: 'Testing', done: selectedDeal.status === 'Client Review' || selectedDeal.status === 'Completed' || selectedDeal.status === 'Delivered' },
                      { step: 'Delivery', done: selectedDeal.status === 'Completed' || selectedDeal.status === 'Delivered' }
                    ].map((st, i) => (
                      <div key={i} className={`flex items-center gap-2 p-2 rounded border ${st.done ? 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 text-zinc-400 dark:text-zinc-600'}`}>
                        <span className="font-semibold text-[10px]">{st.step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gantt Timeline if quotation is active */}
                {selectedDeal.quotation && (
                  <GanttView
                    milestones={selectedDeal.quotation.milestones}
                    currentMilestoneIndex={
                      selectedDeal.quotation.milestones.findIndex(m => m.status === 'Pending' || m.status === 'Awaiting Approval' || m.status === 'In Progress')
                    }
                  />
                )}

                {/* E-Signature & Agreement Contract if quote sent and unsigned */}
                {selectedDeal.status === 'Quotation Sent' && !selectedDeal.contractSigned && (
                  <div className="bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded p-6 text-center space-y-4">
                    <AlertCircle className="w-8 h-8 text-zinc-600 dark:text-zinc-400 mx-auto animate-bounce" />
                    <div>
                      <h3 className="text-sm font-bold text-zinc-950 dark:text-white">Quotation Proposal Received!</h3>
                      <p className="text-zinc-500 text-[10px] max-w-md mx-auto">The agency has reviewed your scope and formulated a pricing and milestone plan. You must review the contract and sign to launch project.</p>
                    </div>
                    <button
                      onClick={() => router.push(`/user/contracts/${selectedDeal.id}`)}
                      className="px-6 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold text-xs cursor-pointer transition-colors"
                    >
                      Review & Sign Agreement
                    </button>
                  </div>
                )}

                {/* Milestone Approval and Payment Actions */}
                {selectedDeal.quotation && selectedDeal.contractSigned && (
                  <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded p-5 space-y-4">
                    <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider block">Project Milestones</span>

                    <div className="space-y-2.5">
                      {selectedDeal.quotation.milestones.map((mil, idx) => {
                        const milestonesList = selectedDeal.quotation?.milestones || [];
                        return (
                          <div key={mil.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-4 rounded flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="space-y-1">
                              <span className="font-bold text-zinc-950 dark:text-white block">{mil.title}</span>
                              <p className="text-zinc-500 text-[10px]">{mil.description}</p>
                              <div className="flex gap-4 text-[10px] font-medium text-zinc-500">
                                <span>Due: {mil.dueDate}</span>
                                <span className="font-bold text-zinc-700 dark:text-zinc-400">{mil.cost.toLocaleString()} BDT ({mil.percentage}%)</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {/* Status Display */}
                              <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${mil.status === 'Approved'
                                  ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                                  : mil.status === 'Awaiting Approval'
                                    ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20'
                                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800'
                                }`}>
                                {mil.status}
                              </span>

                              {/* Action Button: Approve & Pay */}
                              {mil.status === 'Awaiting Approval' && mil.paymentStatus === 'Unpaid' && (
                                <button
                                  onClick={() => startPayMilestone(selectedDeal.id, mil)}
                                  className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-1.5 rounded font-bold text-xs cursor-pointer transition-colors"
                                >
                                  Pay Milestone
                                </button>
                              )}

                              {mil.status === 'Pending' && idx === milestonesList.findIndex(m => m.status === 'Pending') && !milestonesList.some(m => m.status === 'Awaiting Approval') && (
                                <span className="text-[10px] text-zinc-500 italic">Work in progress...</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Client Portal Credentials Vault */}
                {selectedDeal.contractSigned && selectedDeal.credentials && (
                  <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded p-5 space-y-4">
                    <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider block">Access Staging & Credentials</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-zinc-800 dark:text-zinc-300">
                      {selectedDeal.credentials.github && (
                        <a
                          href={selectedDeal.credentials.github}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-3 rounded hover:border-zinc-400 dark:hover:border-zinc-800 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <span className="block text-[9px] text-zinc-500 font-bold uppercase">Git Repository</span>
                            <span className="font-semibold text-xs text-zinc-950 dark:text-white truncate max-w-[150px] block">GitHub Link</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        </a>
                      )}

                      {selectedDeal.credentials.cPanel && (
                        <a
                          href="#"
                          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-3 rounded hover:border-zinc-400 dark:hover:border-zinc-800 transition-colors flex items-center justify-between"
                        >
                          <div>
                            <span className="block text-[9px] text-zinc-500 font-bold uppercase">Dev Server</span>
                            <span className="font-semibold text-xs text-zinc-950 dark:text-white truncate max-w-[150px] block">cPanel login</span>
                          </div>
                          <ExternalLink className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
                        </a>
                      )}

                      {selectedDeal.credentials.database && (
                        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-3 rounded flex items-center justify-between">
                          <div>
                            <span className="block text-[9px] text-zinc-500 font-bold uppercase">Database node</span>
                            <span className="font-semibold text-xs text-zinc-950 dark:text-white truncate max-w-[150px] block">Postgres Active</span>
                          </div>
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </div>
                      )}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              <div className="space-y-6">
                <div className="bg-zinc-50 dark:bg-zinc-900/25 border border-zinc-200 dark:border-zinc-800 rounded py-12 text-center text-zinc-500 space-y-4">
                  <Laptop className="w-8 h-8 text-zinc-400 mx-auto" />
                  <p>You do not have any custom projects submitted yet.</p>
                </div>

                {/* Submit Requirement Form */}
                <form onSubmit={handleSubmitDeal} className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded p-6 space-y-4">
                  <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Submit Project Requirements</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1.5">Project Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Real Estate Agency Portal"
                        value={dealTitle}
                        onChange={(e) => setDealTitle(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1.5">Project Type</label>
                      <select
                        value={dealType}
                        onChange={(e) => setDealType(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                      >
                        <option>Web Application</option>
                        <option>Mobile App</option>
                        <option>Full Website</option>
                        <option>SaaS Platform</option>
                        <option>AI Automation System</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1.5">Target Budget (BDT)</label>
                      <input
                        type="number"
                        required
                        value={dealBudget}
                        onChange={(e) => setDealBudget(Number(e.target.value))}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1.5">Target Deadline</label>
                      <input
                        type="date"
                        required
                        value={dealDeadline}
                        onChange={(e) => setDealDeadline(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1.5">Preferred Technologies</label>
                      <input
                        type="text"
                        placeholder="e.g. Next.js, Flutter, Prisma, bKash, PostgreSQL"
                        value={dealTech}
                        onChange={(e) => setDealTech(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                      />
                    </div>

                    <div className="col-span-1 md:col-span-2">
                      <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1.5">Description & Specific Features</label>
                      <textarea
                        rows={4}
                        required
                        placeholder="Provide details about features, reference websites, design inspirations..."
                        value={dealDesc}
                        onChange={(e) => setDealDesc(e.target.value)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-3 text-xs focus:outline-none resize-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Submit Request to Admin</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Discussion Chat Portal */}
        {activeTab === 'chat' && (
          <div className="flex-1 flex flex-col justify-between h-[65vh] animate-fadeIn text-xs">
            <div className="border-b border-zinc-200 dark:border-zinc-900 pb-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-zinc-950 dark:text-white">Customer-Admin Chat Portal</h2>
                <p className="text-zinc-500 text-[10px]">Negotiate budget, review mock wireframes, and launch video calls.</p>
              </div>

              {selectedDealId && (
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    onClick={triggerMockCall}
                    className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-300 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Video className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
                    <span>Video Call</span>
                  </button>
                  <button
                    onClick={() => triggerMockUpload('pdf')}
                    className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-300 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5" /> PDF
                  </button>
                  <button
                    onClick={() => triggerMockUpload('zip')}
                    className="p-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-900 dark:text-zinc-300 rounded flex items-center gap-1 cursor-pointer"
                  >
                    <Paperclip className="w-3.5 h-3.5" /> ZIP
                  </button>
                </div>
              )}
            </div>

            {/* Chat Stream */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-2 scrollbar-thin">
              {selectedDealId && chatMessages[selectedDealId] ? (
                chatMessages[selectedDealId].map((msg) => {
                  const isAdmin = msg.sender === 'admin';
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-md rounded p-4 space-y-2 border shadow-sm ${isAdmin
                          ? 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300 rounded-tl-none'
                          : 'bg-zinc-950 dark:bg-white border-zinc-900 dark:border-zinc-100 text-white dark:text-black rounded-tr-none'
                        }`}>
                        <div className="flex justify-between items-center text-[9px] text-zinc-500 border-b border-zinc-200 dark:border-zinc-800/40 pb-1">
                          <span className="font-bold uppercase tracking-wider">{isAdmin ? 'Hossen Shop Admin' : (typeof window !== 'undefined' ? (localStorage.getItem('apex_user_name') || 'You') : 'You')}</span>
                          <span>{msg.timestamp}</span>
                        </div>

                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>

                        {/* File Attachment */}
                        {msg.file && (
                          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 flex items-center justify-between gap-4 mt-2 rounded">
                            <div className="flex items-center gap-2">
                              <div className="text-[10px]">
                                <span className="block text-zinc-950 dark:text-white font-bold truncate max-w-[120px]">{msg.file.name}</span>
                                <span className="text-zinc-500">{msg.file.size}</span>
                              </div>
                            </div>
                            <button
                              onClick={() => onToastNotification(`Downloading attachment: ${msg.file?.name}`)}
                              className="text-[10px] font-bold text-zinc-950 dark:text-white hover:underline cursor-pointer"
                            >
                              Download
                            </button>
                          </div>
                        )}

                        {/* Meeting Link */}
                        {msg.meetingLink && (
                          <div className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 flex items-center justify-between gap-4 mt-2 text-[10px] rounded">
                            <div>
                              <span className="block text-zinc-900 dark:text-zinc-300 font-bold">Jitsi Video Meeting Room</span>
                              <span className="text-zinc-500">Live consultation active</span>
                            </div>
                            <a
                              href={msg.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-3 py-1.5 rounded font-bold"
                            >
                              Join Call
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-zinc-500 text-center py-12">
                  Select a Custom Project from Dashboard to view negotiation chat stream.
                </div>
              )}
            </div>

            {/* Input Bar */}
            {selectedDealId && (
              <form onSubmit={handleSendChat} className="flex gap-2 border-t border-zinc-200 dark:border-zinc-900 pt-3">
                <input
                  type="text"
                  placeholder="Type message to support team..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 rounded flex items-center justify-center cursor-pointer transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        )}

        {/* Invoice Receipt Panel */}
        {activeTab === 'invoices' && (
          <div className="space-y-6 animate-fadeIn text-xs">
            <div>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Payment Invoices</h2>
              <p className="text-zinc-500 text-[10px]">Tax statements and transaction vouchers ready for printing.</p>
            </div>

            {invoices.length > 0 ? (
              <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold tracking-wider text-[10px] bg-zinc-50 dark:bg-zinc-900/60">
                      <th className="p-4">Invoice ID</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Date Issued</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-zinc-200 dark:border-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300">
                        <td className="p-4 font-mono font-bold text-zinc-950 dark:text-white">{inv.invoiceNumber}</td>
                        <td className="p-4 truncate max-w-[200px]">{inv.title}</td>
                        <td className="p-4">{inv.date}</td>
                        <td className="p-4 font-semibold text-zinc-950 dark:text-white">{inv.total.toLocaleString()} BDT</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${inv.status === 'Paid' ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400'
                            }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => router.push(`/invoices/${inv.id}`)}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded text-[10px] font-bold cursor-pointer"
                          >
                            View & Print
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded py-12 text-center text-zinc-500">
                No invoices recorded. Make a purchase or custom milestone payment to generate invoices.
              </div>
            )}
          </div>
        )}

        {/* Support Tickets */}
        {activeTab === 'tickets' && (
          <div className="space-y-6 animate-fadeIn text-xs">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-900">
              <div>
                <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Support Tickets</h2>
                <p className="text-zinc-500 text-[10px]">Open support queries and direct technical help desks.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

              {/* Ticket list */}
              <div className="space-y-4 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded">
                <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider block">Active Tickets</span>

                {tickets.length > 0 ? (
                  <div className="space-y-3.5">
                    {tickets.map((tkt) => (
                      <div
                        key={tkt.id}
                        onClick={() => setSelectedTicketId(tkt.id)}
                        className={`border rounded p-4 cursor-pointer transition-colors ${selectedTicketId === tkt.id
                            ? 'bg-white dark:bg-zinc-950 border-zinc-400 dark:border-zinc-700'
                            : 'bg-white/40 dark:bg-zinc-950/40 border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-800'
                          }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-zinc-950 dark:text-white">{tkt.subject}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${tkt.status === 'Open'
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                              : tkt.status === 'In Progress'
                                ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                                : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500'
                            }`}>
                            {tkt.status}
                          </span>
                        </div>
                        <p className="text-zinc-500 text-[10px] line-clamp-1">{tkt.description}</p>
                        <span className="block text-zinc-400 dark:text-zinc-600 text-[9px] mt-2 text-right">{tkt.createdAt}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 text-center py-4">No tickets opened. Create one if you have issues.</p>
                )}

                {/* Ticket Reply Form */}
                {selectedTicket && (
                  <form onSubmit={handleTicketReply} className="border-t border-zinc-200 dark:border-zinc-900 pt-4 space-y-3">
                    <span className="font-bold text-zinc-950 dark:text-white block">Reply to: {selectedTicket.subject}</span>
                    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded p-3 max-h-32 overflow-y-auto space-y-2 mb-2">
                      {selectedTicket.messages.map((m, idx) => (
                        <div key={idx} className={`p-2 rounded text-[10px] ${m.sender === 'admin' ? 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300' : 'bg-zinc-950 dark:bg-zinc-800 text-white dark:text-zinc-200'}`}>
                          <span className="block text-[8px] font-bold uppercase text-zinc-500">{m.sender === 'admin' ? 'Support Rep' : 'You'}</span>
                          <p>{m.content}</p>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Reply message..."
                        value={tktReply}
                        onChange={(e) => setTktReply(e.target.value)}
                        className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                      />
                      <button type="submit" className="bg-zinc-950 dark:bg-white text-white dark:text-black px-4 rounded text-xs font-bold transition-colors cursor-pointer">Reply</button>
                    </div>
                  </form>
                )}
              </div>

              {/* Create Ticket Form */}
              <form onSubmit={handleCreateTicket} className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded space-y-4">
                <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider block">Open a New Support Ticket</span>

                <div className="space-y-3">
                  <div>
                    <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1.5">Subject</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Database connection credentials missing"
                      value={tktSubject}
                      onChange={(e) => setTktSubject(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1.5">Category</label>
                      <select
                        value={tktCategory}
                        onChange={(e) => setTktCategory(e.target.value as any)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                      >
                        <option>Technical</option>
                        <option>Billing</option>
                        <option>Customization</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1.5">Priority</label>
                      <select
                        value={tktPriority}
                        onChange={(e) => setTktPriority(e.target.value as any)}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                      >
                        <option>Low</option>
                        <option>Medium</option>
                        <option>High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-zinc-500 text-[10px] uppercase font-bold mb-1.5">Issue details</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Explain your technical difficulty in detail..."
                      value={tktDesc}
                      onChange={(e) => setTktDesc(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-3 text-xs focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold text-xs cursor-pointer transition-colors"
                >
                  Create Support Ticket
                </button>
              </form>

            </div>
          </div>
        )}
      </main>

      {/* bKash Payment Simulation Modal overlay */}
      {payingMilestone && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-pink-600 text-white w-full max-w-sm rounded-lg overflow-hidden shadow-2xl relative flex flex-col items-center">

            {/* Header logo */}
            <div className="w-full bg-pink-700 py-3.5 px-6 flex justify-between items-center border-b border-pink-850">
              <span className="font-extrabold tracking-wide uppercase text-xs">bKash Checkout</span>
              <button onClick={() => setPayingMilestone(null)} className="text-white hover:text-zinc-200">✕</button>
            </div>

            {paymentStep === 'details' && (
              <form onSubmit={executeMilestonePayment} className="p-6 space-y-4 w-full text-xs">
                <div className="bg-pink-650/40 p-4 rounded space-y-1 text-center">
                  <span className="text-[10px] text-pink-200 block uppercase font-bold tracking-wider">Milestone Payout</span>
                  <span className="font-bold text-white text-sm block">{payingMilestone.mil.title}</span>
                  <span className="text-xl font-black text-white block mt-1">{payingMilestone.mil.cost.toLocaleString()} BDT</span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-pink-100 text-[10px] uppercase font-bold mb-1">bKash Account Number</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 017XXXXXXXX"
                      value={phoneNum}
                      onChange={(e) => setPhoneNum(e.target.value)}
                      className="w-full bg-white text-zinc-900 border-none rounded px-4 py-2.5 text-xs focus:outline-none placeholder:text-zinc-400"
                    />
                  </div>
                  <div>
                    <label className="block text-pink-100 text-[10px] uppercase font-bold mb-1">PIN Code</label>
                    <input
                      type="password"
                      required
                      placeholder="XXXX"
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      className="w-full bg-white text-zinc-900 border-none rounded px-4 py-2.5 text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-pink-800 hover:bg-pink-900 text-white rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  Confirm Payment
                </button>
              </form>
            )}

            {paymentStep === 'success' && (
              <div className="p-8 text-center space-y-4 w-full flex flex-col items-center">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-4 border-pink-700 animate-pulse"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-t-white animate-spin"></div>
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Processing Transaction...</p>
                  <p className="text-[10px] text-pink-200">Verifying security token and credentials.</p>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
