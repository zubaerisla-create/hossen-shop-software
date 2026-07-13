'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, CustomDeal, ChatMessage, Invoice, SupportTicket, Milestone } from '@/app/types';
import {
  LayoutDashboard, ShoppingCart, FolderKanban, ShieldCheck,
  Receipt, Wrench, ArrowRight, Settings, Plus, Trash2,
  ExternalLink, Send, Paperclip, Video, FileText
} from 'lucide-react';
import GanttView from './GanttView';

interface AdminPanelProps {
  deals: CustomDeal[];
  products: Product[];
  invoices: Invoice[];
  tickets: SupportTicket[];
  chatMessages: Record<string, ChatMessage[]>;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onUpdateDealStatus: (dealId: string, status: CustomDeal['status']) => void;
  onSendQuotation: (dealId: string, quote: { totalCost: number; developmentTime: string; milestones: Milestone[]; terms: string[]; supportPeriod: string; maintenanceOffer: string }) => void;
  onAssignDeveloper: (dealId: string, developer: string) => void;
  onUpdateProgress: (dealId: string, progress: number) => void;
  onAdvanceMilestoneStage: (dealId: string, milestoneId: string, nextStatus: Milestone['status']) => void;
  onDeliverProject: (dealId: string, files: any[], creds: any) => void;
  onSendChatMessage: (dealId: string, content: string, sender: 'customer' | 'admin', file?: any, link?: string) => void;
  onTicketReply: (ticketId: string, content: string) => void;
  onAddProduct: (product: Omit<Product, 'id' | 'salesCount' | 'rating' | 'reviews' | 'faqs'>) => void;
  onDeleteProduct: (id: string) => void;
  onToastNotification: (text: string) => void;
}

export default function AdminPanel({
  deals,
  products,
  invoices,
  tickets,
  chatMessages,
  activeTab,
  setActiveTab,
  onUpdateDealStatus,
  onSendQuotation,
  onAssignDeveloper,
  onUpdateProgress,
  onAdvanceMilestoneStage,
  onDeliverProject,
  onSendChatMessage,
  onTicketReply,
  onAddProduct,
  onDeleteProduct,
  onToastNotification
}: AdminPanelProps) {
  const router = useRouter();
  const [selectedDealId, setSelectedDealId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Add Product Form State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(5000);
  const [newProdCategory, setNewProdCategory] = useState<'Website Template' | 'Full Website' | 'SaaS' | 'Mobile App' | 'UI/UX' | 'AI Project'>('SaaS');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdTech, setNewProdTech] = useState('');
  const [newProdFeatures, setNewProdFeatures] = useState('');
  const [newProdReq, setNewProdReq] = useState('');

  // Design Quotation Form State
  const [quoteCost, setQuoteCost] = useState(60000);
  const [quoteTime, setQuoteTime] = useState('30 Days');
  const [quoteSupport, setQuoteSupport] = useState('6 Months Support');
  const [quoteMaintenance, setQuoteMaintenance] = useState('5,000 BDT/month');
  
  // Custom Milestones input
  const [m1Cost, setM1Cost] = useState(18000); // 30%
  const [m2Cost, setM2Cost] = useState(21050); // 35%
  const [m3Cost, setM3Cost] = useState(15000); // 25%
  const [m4Cost, setM4Cost] = useState(6000);  // 10%

  // Project Delivery fields
  const [githubUrl, setGithubUrl] = useState('');
  const [cpanelUrl, setCpanelUrl] = useState('');
  const [dbCreds, setDbCreds] = useState('');
  
  // Developers Assigned
  const [devName, setDevName] = useState('');
  const [progressVal, setProgressVal] = useState(10);

  // Set initial selections
  useEffect(() => {
    if (deals.length > 0 && !selectedDealId) {
      setSelectedDealId(deals[0].id);
    }
  }, [deals, selectedDealId]);

  const selectedDeal = deals.find(d => d.id === selectedDealId);
  const selectedTicket = tickets.find(t => t.id === selectedTicketId);

  const handleUpdateStatus = (status: CustomDeal['status']) => {
    if (!selectedDealId) return;
    onUpdateDealStatus(selectedDealId, status);
    onToastNotification(`Project status updated to ${status}.`);
  };

  const handleSendQuotationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealId || !selectedDeal) return;

    const total = m1Cost + m2Cost + m3Cost + m4Cost;
    if (total !== quoteCost) {
      alert(`Milestone cost total (${total.toLocaleString()} BDT) must equal the total quote cost (${quoteCost.toLocaleString()} BDT).`);
      return;
    }

    const milestones: Milestone[] = [
      {
        id: 'm1',
        title: 'Phase 1: Planning, Wireframing & Design Proposal (30%)',
        description: 'Provide Figma interface blueprints and requirements analysis documents for review.',
        cost: m1Cost,
        percentage: 30,
        status: 'Pending',
        paymentStatus: 'Unpaid',
        dueDate: '10 Days from kickoff'
      },
      {
        id: 'm2',
        title: 'Phase 2: Core Frontend Development & Assembly (35%)',
        description: 'Build complete UI features, dashboard grids, pages and responsive layouts.',
        cost: m2Cost,
        percentage: 35,
        status: 'Pending',
        paymentStatus: 'Unpaid',
        dueDate: '20 Days from kickoff'
      },
      {
        id: 'm3',
        title: 'Phase 3: Database setup & Backend API Integrations (25%)',
        description: 'Implement postgres tables, WebRTC signaling nodes, and gateway webhooks.',
        cost: m3Cost,
        percentage: 25,
        status: 'Pending',
        paymentStatus: 'Unpaid',
        dueDate: '25 Days from kickoff'
      },
      {
        id: 'm4',
        title: 'Phase 4: Bug fixing, Security Audit & Final Delivery (10%)',
        description: 'Provide system optimization, load audits, domain hosting and final code delivery.',
        cost: m4Cost,
        percentage: 10,
        status: 'Pending',
        paymentStatus: 'Unpaid',
        dueDate: '30 Days from kickoff'
      }
    ];

    onSendQuotation(selectedDealId, {
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
    });

    onToastNotification('Quotation proposal dispatched! Switch to Customer Mode to sign contract and pay advance.');
  };

  const handleAssignDevSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealId || !devName) return;
    onAssignDeveloper(selectedDealId, devName);
    onToastNotification(`Assigned Developer: ${devName}`);
  };

  const handleUpdateProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealId) return;
    onUpdateProgress(selectedDealId, progressVal);
    onToastNotification(`Progress level adjusted to ${progressVal}%`);
  };

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedDealId) return;
    onSendChatMessage(selectedDealId, chatInput, 'admin');
    setChatInput('');
  };

  const handleTicketReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedTicketId) return;
    onTicketReply(selectedTicketId, chatInput);
    setChatInput('');
    onToastNotification('Reply sent to customer ticket.');
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdDesc) return;

    onAddProduct({
      name: newProdName,
      price: newProdPrice,
      category: newProdCategory,
      description: newProdDesc,
      technologies: newProdTech.split(',').map(t => t.trim()),
      features: newProdFeatures.split('\n').map(f => f.trim()),
      requirements: newProdReq.split('\n').map(r => r.trim()),
      demoUrl: 'https://demo.agency.com',
      images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80'],
      version: '1.0.0',
      changelog: [{ version: '1.0.0', date: '2026-07-05', changes: ['Initial code release'] }],
      license: 'Commercial License'
    });

    setNewProdName('');
    setNewProdDesc('');
    setNewProdTech('');
    setNewProdFeatures('');
    setNewProdReq('');
    setShowAddProductModal(false);
    onToastNotification('Ready-made product added successfully.');
  };

  const handleDeliverProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDealId) return;

    const files = [
      { name: `${selectedDeal?.title.replace(/\s+/g, '_')}_Final_Build.zip`, size: '24.2 MB', url: '#', type: 'zip' }
    ];
    const credentials = {
      github: githubUrl || 'https://github.com/client-repo/project',
      cPanel: cpanelUrl || 'https://server.client.com:2083',
      database: dbCreds || 'Postgres connection active'
    };

    onDeliverProject(selectedDealId, files, credentials);
    onToastNotification('Final deliverables saved and vaults configured! Customer will see download tabs.');
  };

  const triggerMeetingLink = () => {
    if (!selectedDealId) return;
    onSendChatMessage(selectedDealId, 'Join Jitsi Meeting room to finalize details.', 'admin', undefined, 'https://meet.jit.si/custom-project-consultation');
    onToastNotification('Meeting link generated in client discussion.');
  };

  const triggerMockUpload = () => {
    if (!selectedDealId) return;
    const attachment = { name: 'PRD_Document_v2.pdf', size: '890 KB', url: '#', type: 'pdf' };
    onSendChatMessage(selectedDealId, 'Attached updated requirement PRD document.', 'admin', attachment);
    onToastNotification('Attached file to client chat.');
  };

  return (
    <div className="flex flex-col md:flex-row flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded overflow-hidden shadow-sm min-h-[75vh] transition-colors">
      
      {/* Sidebar navigation */}
      <aside className="w-full md:w-64 bg-zinc-50 dark:bg-zinc-900/60 border-r border-zinc-200 dark:border-zinc-900 p-4 space-y-6 flex flex-col justify-between transition-colors">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2.5 px-2 hover:opacity-85 transition-opacity cursor-pointer">
            <div className="bg-zinc-950 dark:bg-white px-2 py-0.5 rounded text-white dark:text-black font-extrabold text-[10px]">
              ADMIN
            </div>
            <div>
              <span className="font-extrabold text-sm text-zinc-950 dark:text-white block">Agency Admin</span>
              <span className="text-[10px] text-zinc-500 font-medium">Control Dashboard</span>
            </div>
          </Link>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', label: 'Agency Analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
              { id: 'products', label: 'Ready Products', icon: <ShoppingCart className="w-4 h-4" /> },
              { id: 'deals', label: 'Custom Deals', icon: <FolderKanban className="w-4 h-4" /> },
              { id: 'support', label: 'Resolve Tickets', icon: <Wrench className="w-4 h-4" /> },
              { id: 'payments', label: 'bKash Invoices', icon: <Receipt className="w-4 h-4" /> }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-zinc-200 dark:bg-zinc-900 text-zinc-950 dark:text-white border border-zinc-300 dark:border-zinc-800'
                    : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
                <ArrowRight className="w-3 h-3 opacity-60" />
              </button>
            ))}
          </nav>
        </div>

        <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-3 rounded flex items-center justify-between text-xs text-zinc-500">
          <span>Version 3.4.0</span>
          <Settings className="w-4 h-4 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-all" />
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[80vh] bg-white dark:bg-zinc-950 flex flex-col justify-between transition-colors">
        
        {/* Dashboard Analytics */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn text-xs">
            <div>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Executive Summary</h2>
              <p className="text-zinc-500 text-[10px]">Real-time statistics covering ready product sales, custom design contracts, and payouts.</p>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
                <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Total Sales Revenue</span>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">
                  {invoices.filter(i => i.status === 'Paid').reduce((acc, i) => acc + i.total, 0).toLocaleString()} BDT
                </span>
                <span className="text-[10px] text-zinc-500">bKash + Card settlements</span>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
                <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Custom Projects Active</span>
                <span className="text-2xl font-bold text-zinc-950 dark:text-white block">
                  {deals.filter(d => d.status === 'In Development' || d.status === 'Testing' || d.status === 'Client Review').length}
                </span>
                <span className="text-[10px] text-zinc-500">Milestones under execution</span>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
                <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Marketplace Products</span>
                <span className="text-2xl font-bold text-zinc-950 dark:text-white block">{products.length}</span>
                <span className="text-[10px] text-zinc-950 dark:text-white font-bold hover:underline cursor-pointer" onClick={() => setActiveTab('products')}>Manage catalogs</span>
              </div>

              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
                <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Unresolved Tickets</span>
                <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 block">
                  {tickets.filter(t => t.status !== 'Resolved').length}
                </span>
                <span className="text-[10px] text-zinc-950 dark:text-white font-bold hover:underline cursor-pointer" onClick={() => setActiveTab('support')}>Requires replies</span>
              </div>
            </div>

            {/* Quick guide for Testing Flow */}
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded p-5 space-y-4">
              <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider block">
                Custom Project Execution Guide:
              </span>
              <ul className="space-y-3 text-zinc-600 dark:text-zinc-400 leading-relaxed pl-4 list-disc">
                <li>Under <strong className="text-zinc-950 dark:text-white">Custom Deals</strong> tab, select any new proposal deal (status: Discussion).</li>
                <li>Write answers in the <strong className="text-zinc-950 dark:text-white">Negotiation Chat</strong>. You can generate meeting links and attach documents.</li>
                <li>Open the <strong className="text-zinc-950 dark:text-white">Send Quotation</strong> form. Split the target cost (BDT) into 4 milestones (must sum up to the total price!). Submit.</li>
                <li>Switch to <strong className="text-zinc-950 dark:text-white">Customer Mode</strong> at the top to sign the agreement and pay advance.</li>
                <li>Switch back to <strong className="text-zinc-950 dark:text-white">Admin Mode</strong>. Assign a developer, adjust percentage bars, and mark milestones as "Awaiting Approval" to request client review/payment.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Ready Products manager */}
        {activeTab === 'products' && (
          <div className="space-y-6 animate-fadeIn text-xs">
            <div className="flex justify-between items-center pb-4 border-b border-zinc-200 dark:border-zinc-900">
              <div>
                <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Marketplace Catalog</h2>
                <p className="text-zinc-500 text-[10px]">Add new templates, configure pricing, and delete obsolete listings.</p>
              </div>

              <button
                onClick={() => setShowAddProductModal(true)}
                className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2 rounded font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>

            <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold tracking-wider text-[10px] bg-zinc-50 dark:bg-zinc-900/60">
                    <th className="p-4">Product Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price (BDT)</th>
                    <th className="p-4">Sold</th>
                    <th className="p-4">Tech tags</th>
                    <th className="p-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod) => (
                    <tr key={prod.id} className="border-b border-zinc-200 dark:border-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300">
                      <td className="p-4 font-bold text-zinc-950 dark:text-white">{prod.name}</td>
                      <td className="p-4">{prod.category}</td>
                      <td className="p-4 font-mono font-bold text-zinc-950 dark:text-white">{prod.price.toLocaleString()}</td>
                      <td className="p-4 font-semibold text-zinc-500">{prod.salesCount} units</td>
                      <td className="p-4 max-w-[200px] truncate">{prod.technologies.join(', ')}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => onDeleteProduct(prod.id)}
                          className="text-rose-600 dark:text-rose-455 hover:underline p-1 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Custom Deals Manager */}
        {activeTab === 'deals' && (
          <div className="space-y-6 animate-fadeIn text-xs">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-900">
              <div>
                <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Custom Project Control Room</h2>
                <p className="text-zinc-500 text-[10px]">Negotiate contracts, send cost breakdowns, assign engineering talent, and track development workflow.</p>
              </div>

              {/* Deals switcher */}
              {deals.length > 0 && (
                <div className="flex gap-1.5 flex-wrap">
                  {deals.map(d => (
                    <button
                      key={d.id}
                      onClick={() => setSelectedDealId(d.id)}
                      className={`px-3 py-1.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                        selectedDealId === d.id
                          ? 'bg-zinc-950 dark:bg-white text-white dark:text-black border-zinc-950'
                          : 'bg-zinc-100 dark:bg-zinc-950 text-zinc-600 dark:text-zinc-500 border-zinc-200 dark:border-zinc-900 hover:text-zinc-950 dark:hover:text-white'
                      }`}
                    >
                      {d.title.slice(0, 15)}... ({d.status})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedDeal ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Column: Deal State Actions & Management forms */}
                <div className="lg:col-span-7 space-y-6">
                  
                  {/* Status Controller card */}
                  <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-zinc-950 dark:text-white">Proposal workflow status control</span>
                      <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
                        {selectedDeal.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Review Request', status: 'Reviewing' as const },
                        { label: 'Negotiate / Discuss', status: 'Discussion' as const },
                        { label: 'Reject Proposal', status: 'Rejected' as const }
                      ].map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleUpdateStatus(action.status)}
                          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1.5 rounded font-semibold cursor-pointer transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Send Quotation Form (Step 5) */}
                  {selectedDeal.status === 'Discussion' && (
                    <form onSubmit={handleSendQuotationSubmit} className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded space-y-4">
                      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
                        <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Milestone Quotation Proposal</h3>
                        <p className="text-zinc-500 text-[10px]">Formulate prices, delivery weeks, and milestone payments.</p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 text-[10px] uppercase font-bold mb-1">Total Project Cost (BDT)</label>
                          <input
                            type="number"
                            required
                            value={quoteCost}
                            onChange={(e) => setQuoteCost(Number(e.target.value))}
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 text-[10px] uppercase font-bold mb-1">Development Time</label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. 30 Days"
                            value={quoteTime}
                            onChange={(e) => setQuoteTime(e.target.value)}
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none"
                          />
                        </div>

                        <div className="col-span-1 md:col-span-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded p-4 space-y-3">
                          <span className="font-bold text-zinc-950 dark:text-white block text-[10px] uppercase tracking-wider">Milestones (Sum: {quoteCost.toLocaleString()} BDT)</span>
                          
                          <div className="grid grid-cols-2 gap-3 text-[10px]">
                            <div>
                              <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Phase 1: Design/Specs (30%)</label>
                              <input type="number" required value={m1Cost} onChange={(e) => setM1Cost(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-2" />
                            </div>
                            <div>
                              <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Phase 2: Frontend build (35%)</label>
                              <input type="number" required value={m2Cost} onChange={(e) => setM2Cost(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-2" />
                            </div>
                            <div>
                              <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Phase 3: Backend API (25%)</label>
                              <input type="number" required value={m3Cost} onChange={(e) => setM3Cost(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-2" />
                            </div>
                            <div>
                              <label className="block text-zinc-600 dark:text-zinc-400 mb-1">Phase 4: QA & Delivery (10%)</label>
                              <input type="number" required value={m4Cost} onChange={(e) => setM4Cost(Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-2" />
                            </div>
                          </div>
                        </div>

                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 text-[10px] uppercase font-bold mb-1">Warranty Period</label>
                          <input type="text" required value={quoteSupport} onChange={(e) => setQuoteSupport(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs" />
                        </div>
                        <div>
                          <label className="block text-zinc-600 dark:text-zinc-400 text-[10px] uppercase font-bold mb-1">Maintenance Subscription</label>
                          <input type="text" required value={quoteMaintenance} onChange={(e) => setQuoteMaintenance(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs" />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Send Quotation to Client</span>
                      </button>
                    </form>
                  )}

                  {/* Dev resource allocation & Task progress dashboard (Step 7) */}
                  {selectedDeal.contractSigned && selectedDeal.status !== 'Delivered' && (
                    <div className="space-y-6">
                      
                      <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4">
                        <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider block">Talent Allocation & Timeline</span>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Assign Dev */}
                          <form onSubmit={handleAssignDevSubmit} className="space-y-3">
                            <div>
                              <label className="block text-zinc-600 dark:text-zinc-400 text-[10px] uppercase font-bold mb-1">Assign Developer Name</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="e.g. Sabbir Ahmed"
                                  value={devName}
                                  onChange={(e) => setDevName(e.target.value)}
                                  className="flex-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs"
                                />
                                <button type="submit" className="bg-zinc-950 dark:bg-white text-white dark:text-black px-3 rounded text-xs font-bold transition-colors">Assign</button>
                              </div>
                            </div>
                          </form>

                          {/* Adjust progress percentage */}
                          <form onSubmit={handleUpdateProgressSubmit} className="space-y-3">
                            <div>
                              <label className="block text-zinc-600 dark:text-zinc-400 text-[10px] uppercase font-bold mb-1">Adjust Progress ({selectedDeal.overallProgress}%)</label>
                              <div className="flex gap-2">
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={progressVal}
                                  onChange={(e) => setProgressVal(Number(e.target.value))}
                                  className="flex-1 accent-zinc-950 dark:accent-white"
                                />
                                <button type="submit" className="bg-zinc-950 dark:bg-white text-white dark:text-black px-3 py-1 rounded text-xs font-bold transition-colors">Set</button>
                              </div>
                            </div>
                          </form>
                        </div>
                      </div>

                      {/* Milestone State Advancer */}
                      {selectedDeal.quotation && (
                        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4">
                          <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider block">Milestone Advancer</span>
                          
                          <div className="space-y-2.5">
                            {selectedDeal.quotation.milestones.map((mil) => {
                              const isAwaiting = mil.status === 'Awaiting Approval';
                              const isApproved = mil.status === 'Approved';
                              
                              return (
                                <div key={mil.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-4 rounded flex items-center justify-between">
                                  <div>
                                    <span className="font-bold text-zinc-950 dark:text-white block">{mil.title}</span>
                                    <span className="text-[10px] text-zinc-500">Status: <strong className="text-zinc-900 dark:text-zinc-300 uppercase">{mil.status}</strong></span>
                                  </div>

                                  {!isApproved && !isAwaiting && (
                                    <button
                                      onClick={() => onAdvanceMilestoneStage(selectedDeal.id, mil.id, 'Awaiting Approval')}
                                      className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-3 py-1.5 rounded font-bold text-[10px] cursor-pointer transition-colors"
                                    >
                                      Submit to Client
                                    </button>
                                  )}

                                  {isAwaiting && (
                                    <span className="text-[10px] text-amber-600 font-bold uppercase animate-pulse">Pending payout...</span>
                                  )}

                                  {isApproved && (
                                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase">Slightly Settled</span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Delivery and credentials repository form */}
                      {selectedDeal.status !== 'Completed' && (
                        <form onSubmit={handleDeliverProjectSubmit} className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded space-y-4">
                          <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
                            <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Deliver Final Code & Credentials</h3>
                            <p className="text-zinc-500 text-[10px]">Populate git repository, server paths, and download links for the client.</p>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <label className="block text-zinc-600 dark:text-zinc-400 text-[10px] uppercase font-bold mb-1">GitHub repository url</label>
                              <input type="text" placeholder="https://github.com/..." value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs" />
                            </div>
                            <div>
                              <label className="block text-zinc-600 dark:text-zinc-400 text-[10px] uppercase font-bold mb-1">cPanel staging server domain</label>
                              <input type="text" placeholder="https://staging.agency.com:2083" value={cpanelUrl} onChange={(e) => setCpanelUrl(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs" />
                            </div>
                            <div>
                              <label className="block text-zinc-600 dark:text-zinc-400 text-[10px] uppercase font-bold mb-1">Database strings</label>
                              <input type="text" placeholder="PostgreSQL connection string" value={dbCreds} onChange={(e) => setDbCreds(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs" />
                            </div>
                          </div>

                          <button type="submit" className="w-full py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold cursor-pointer transition-colors text-xs">
                            Deliver Build & Save
                          </button>
                        </form>
                      )}

                    </div>
                  )}
                </div>

                {/* Right Column: Discussions Chat stream */}
                <div className="lg:col-span-5 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded p-5 flex flex-col justify-between h-[650px]">
                  <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-zinc-950 dark:text-white block">Negotiation channel</span>
                      <span className="text-[10px] text-zinc-500">Discuss pricing with Client</span>
                    </div>

                    <div className="flex gap-1.5">
                      <button onClick={triggerMeetingLink} className="p-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-800 text-zinc-900 dark:text-zinc-300 rounded flex items-center gap-1 cursor-pointer">
                        <Video className="w-3.5 h-3.5" /> Meeting
                      </button>
                      <button onClick={triggerMockUpload} className="p-1.5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-800 text-zinc-900 dark:text-zinc-300 rounded flex items-center gap-1 cursor-pointer">
                        <Paperclip className="w-3.5 h-3.5" /> PDF
                      </button>
                    </div>
                  </div>

                  {/* Chat logs */}
                  <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
                    {chatMessages[selectedDeal.id]?.map((msg) => {
                      const isClient = msg.sender === 'customer';
                      return (
                        <div key={msg.id} className={`flex ${isClient ? 'justify-start' : 'justify-end'}`}>
                          <div className={`max-w-xs rounded p-4 space-y-2 border text-[11px] leading-relaxed ${
                            isClient
                              ? 'bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 text-zinc-800 dark:text-zinc-300 rounded-tl-none'
                              : 'bg-zinc-950 dark:bg-white border-zinc-900 dark:border-zinc-100 text-white dark:text-black rounded-tr-none'
                          }`}>
                            <div className="flex justify-between items-center text-[8px] text-zinc-500 border-b border-zinc-200 dark:border-zinc-800 pb-1 mb-1">
                              <span className="font-bold uppercase">{isClient ? (selectedDeal?.customer?.name || 'Client') : 'You (Admin)'}</span>
                              <span>{msg.timestamp}</span>
                            </div>
                            <p className="whitespace-pre-wrap">{msg.content}</p>

                            {msg.file && (
                              <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-2 flex items-center justify-between gap-3 mt-1.5 text-[9px]">
                                <div className="flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-zinc-500" />
                                  <span className="text-zinc-900 dark:text-white truncate max-w-[100px] block">{msg.file.name}</span>
                                </div>
                                <a href="#" className="text-zinc-950 dark:text-white font-bold hover:underline">Download</a>
                              </div>
                            )}

                            {msg.meetingLink && (
                              <div className="bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-2 rounded mt-1.5 flex justify-between items-center text-[9px]">
                                <span className="text-zinc-700 dark:text-zinc-300">Live Video Room active</span>
                                <a href={msg.meetingLink} target="_blank" rel="noreferrer" className="bg-zinc-950 dark:bg-white text-white dark:text-black px-2 py-1 rounded font-semibold">Join</a>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                    <button type="submit" className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 rounded flex items-center justify-center cursor-pointer transition-colors">
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>

              </div>
            ) : (
              <div className="bg-zinc-50 dark:bg-zinc-900/25 border border-zinc-200 dark:border-zinc-800 rounded py-12 text-center text-zinc-500">
                No custom deals found. Open Customer Portal and submit requirement form!
              </div>
            )}
          </div>
        )}

        {/* Support Tickets list */}
        {activeTab === 'support' && (
          <div className="space-y-6 animate-fadeIn text-xs">
            <div>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Technical Support</h2>
              <p className="text-zinc-500 text-[10px]">Resolve client query tickets, offer code fixes and close settled tickets.</p>
            </div>

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
                      <button
                        onClick={() => onToastNotification(`Ticket ${selectedTicket.id} closed.`)}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded text-[10px] font-bold cursor-pointer hover:border-zinc-400 transition-colors"
                      >
                        Close Ticket
                      </button>
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
        )}

        {/* Payments ledger log */}
        {activeTab === 'payments' && (
          <div className="space-y-6 animate-fadeIn text-xs">
            <div>
              <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Incoming Ledger</h2>
              <p className="text-zinc-500 text-[10px]">Log records of incoming payments generated by marketplace code purchases and agency milestones.</p>
            </div>

            {invoices.length > 0 ? (
              <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold tracking-wider text-[10px] bg-zinc-50 dark:bg-zinc-900/60">
                      <th className="p-4">Invoice ID</th>
                      <th className="p-4">Description</th>
                      <th className="p-4">Paid Date</th>
                      <th className="p-4">Base (BDT)</th>
                      <th className="p-4">VAT (5%)</th>
                      <th className="p-4">Total Settled</th>
                      <th className="p-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.id} className="border-b border-zinc-200 dark:border-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300">
                        <td className="p-4 font-mono font-bold text-zinc-950 dark:text-white">{inv.invoiceNumber}</td>
                        <td className="p-4 truncate max-w-[200px]">{inv.title}</td>
                        <td className="p-4">{inv.date}</td>
                        <td className="p-4">{inv.amount.toLocaleString()} BDT</td>
                        <td className="p-4 text-zinc-500">{inv.tax.toLocaleString()} BDT</td>
                        <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{inv.total.toLocaleString()} BDT</td>
                        <td className="p-4 text-center">
                          <button
                            onClick={() => router.push(`/invoices/${inv.id}`)}
                            className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors"
                          >
                            Print Voucher
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-zinc-500 text-center py-6">No payment transactions recorded.</p>
            )}
          </div>
        )}

      </main>

      {/* Add Product Modal Overlay */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded overflow-hidden shadow-2xl p-6 space-y-4 text-zinc-950 dark:text-white">
            <h3 className="text-base font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Add New Product</h3>
            
            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Product Title</label>
                <input type="text" required placeholder="e.g. EcoShop nextjs template" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Category</label>
                  <select value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value as any)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 focus:outline-none">
                    <option>Website Template</option>
                    <option>Full Website</option>
                    <option>SaaS</option>
                    <option>Mobile App</option>
                    <option>UI/UX</option>
                    <option>AI Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Price (BDT)</label>
                  <input type="number" required value={newProdPrice} onChange={(e) => setNewProdPrice(Number(e.target.value))} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Technology Tags (comma separated)</label>
                <input type="text" placeholder="Next.js, Tailwind, React" value={newProdTech} onChange={(e) => setNewProdTech(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 focus:outline-none" />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Description</label>
                <textarea rows={2} required placeholder="Product summary..." value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-3 resize-none focus:outline-none" />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Key Features (one per line)</label>
                <textarea rows={2} required placeholder="Prebuilt Auth&#10;Stripe integrations..." value={newProdFeatures} onChange={(e) => setNewProdFeatures(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-3 resize-none focus:outline-none" />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">System Requirements (one per line)</label>
                <textarea rows={2} required placeholder="NodeJS 18+&#10;Postgres Database..." value={newProdReq} onChange={(e) => setNewProdReq(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-3 resize-none focus:outline-none" />
              </div>

              <div className="flex gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-900">
                <button type="button" onClick={() => setShowAddProductModal(false)} className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded font-bold cursor-pointer transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold cursor-pointer transition-colors">Save Catalog</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
