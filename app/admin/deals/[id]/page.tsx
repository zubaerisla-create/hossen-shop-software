'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CustomDeal, ChatMessage, Milestone } from '../../../types';
import { getDeals, saveDeals, getChats, saveChats } from '../../../utils/storage';
import {
  Paperclip, Send, FileText, AlertTriangle, ArrowRight, RefreshCw, Info, CheckCircle2, XCircle
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
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectInput, setShowRejectInput] = useState(false);

  // Milestone management states
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [isAddingMilestone, setIsAddingMilestone] = useState(false);
  
  // Add new milestone state
  const [newMilTitle, setNewMilTitle] = useState('');
  const [newMilDesc, setNewMilDesc] = useState('');
  const [newMilCost, setNewMilCost] = useState(0);
  const [newMilDueDate, setNewMilDueDate] = useState('');
  
  // Edit milestone state
  const [editMilTitle, setEditMilTitle] = useState('');
  const [editMilDesc, setEditMilDesc] = useState('');
  const [editMilCost, setEditMilCost] = useState(0);
  const [editMilDueDate, setEditMilDueDate] = useState('');
  const [editMilProgress, setEditMilProgress] = useState(0);
  const [editMilStatus, setEditMilStatus] = useState<'Pending' | 'In Progress' | 'Awaiting Approval' | 'Approved'>('Pending');
  const [editMilPayStatus, setEditMilPayStatus] = useState<'Unpaid' | 'Paid'>('Unpaid');
  const [editDeliverables, setEditDeliverables] = useState<any[]>([]);
  
  // New deliverable builder state
  const [deliverableNameInput, setDeliverableNameInput] = useState('');
  const [deliverableUrlInput, setDeliverableUrlInput] = useState('');

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

  const handleRejectProposal = (reason: string) => {
    if (!reason.trim()) return;

    const updated = deals.map(d => d.id === dealId ? { ...d, status: 'Rejected' as const, unreadPortal: true } : d);
    saveDeals(updated);
    setDeals(updated);

    // Send chat notice
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: `Custom project request has been declined. Reason for rejection: ${reason}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), message]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    setShowRejectInput(false);
    setRejectReason('');
    triggerToast('Project request declined.');
  };

  const handleRestoreProposal = () => {
    const updated = deals.map(d => d.id === dealId ? { ...d, status: 'Discussion' as const, unreadPortal: true } : d);
    saveDeals(updated);
    setDeals(updated);

    // Send chat notice
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: `Project negotiation has been re-opened. Let's resume the proposal discussion.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), message]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    triggerToast('Project proposal restored.');
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

  const handleStartEditMilestone = (mil: any) => {
    setEditingMilestoneId(mil.id);
    setEditMilTitle(mil.title);
    setEditMilDesc(mil.description);
    setEditMilCost(mil.cost);
    setEditMilDueDate(mil.dueDate);
    setEditMilProgress(mil.progress || 0);
    setEditMilStatus(mil.status || 'Pending');
    setEditMilPayStatus(mil.paymentStatus || 'Unpaid');
    setEditDeliverables(mil.deliverables || []);
    setDeliverableNameInput('');
    setDeliverableUrlInput('');
  };

  const handleSaveEditMilestone = () => {
    if (!editMilTitle.trim()) {
      alert('Milestone title cannot be empty.');
      return;
    }

    const updatedDeals = deals.map(d => {
      if (d.id === dealId && d.quotation) {
        const milestones = d.quotation.milestones.map(m => {
          if (m.id === editingMilestoneId) {
            return {
              ...m,
              title: editMilTitle,
              description: editMilDesc,
              cost: editMilCost,
              dueDate: editMilDueDate,
              progress: editMilProgress,
              status: editMilStatus,
              paymentStatus: editMilPayStatus,
              deliverables: editDeliverables
            };
          }
          return m;
        });

        const newTotalCost = milestones.reduce((sum, m) => sum + m.cost, 0);
        const calcProgress = milestones.length > 0 
          ? Math.round((milestones.reduce((acc, m) => acc + (m.progress || 0), 0)) / milestones.length)
          : 0;

        return {
          ...d,
          overallProgress: calcProgress,
          unreadPortal: true,
          quotation: {
            ...d.quotation,
            totalCost: newTotalCost,
            milestones: milestones.map(m => ({
              ...m,
              percentage: newTotalCost > 0 ? Math.round((m.cost / newTotalCost) * 100) : 0
            }))
          }
        };
      }
      return d;
    });

    saveDeals(updatedDeals);
    setDeals(updatedDeals);
    setEditingMilestoneId(null);

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: `⚙️ Project Phase "${editMilTitle}" has been updated. Progress: ${editMilProgress}%, Status: ${editMilStatus}, Deliverables: ${editDeliverables.length} files.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), message]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    triggerToast(`Phase "${editMilTitle}" successfully updated.`);
  };

  const handleDeleteMilestone = (milestoneId: string) => {
    if (!confirm('Are you sure you want to delete this project phase? This action cannot be undone.')) return;

    const updatedDeals = deals.map(d => {
      if (d.id === dealId && d.quotation) {
        const milestones = d.quotation.milestones.filter(m => m.id !== milestoneId);
        const newTotalCost = milestones.reduce((sum, m) => sum + m.cost, 0);
        const calcProgress = milestones.length > 0 
          ? Math.round((milestones.reduce((acc, m) => acc + (m.progress || 0), 0)) / milestones.length)
          : 0;

        return {
          ...d,
          overallProgress: calcProgress,
          unreadPortal: true,
          quotation: {
            ...d.quotation,
            totalCost: newTotalCost,
            milestones: milestones.map((m, idx) => ({
              ...m,
              percentage: newTotalCost > 0 ? Math.round((m.cost / newTotalCost) * 100) : 0
            }))
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
      content: `🗑️ A project phase milestone has been removed from the schedule by the Admin team.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), message]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    triggerToast('Project phase successfully deleted.');
  };

  const handleAddNewMilestone = () => {
    if (!newMilTitle.trim()) {
      alert('Milestone title cannot be empty.');
      return;
    }

    const newMil = {
      id: `m-${Date.now()}`,
      title: newMilTitle,
      description: newMilDesc,
      cost: newMilCost,
      percentage: 0,
      status: 'Pending' as const,
      paymentStatus: 'Unpaid' as const,
      dueDate: newMilDueDate || 'TBD',
      progress: 0,
      deliverables: []
    };

    const updatedDeals = deals.map(d => {
      if (d.id === dealId) {
        const milestones = d.quotation 
          ? [...d.quotation.milestones, newMil]
          : [newMil];
        
        const newTotalCost = milestones.reduce((sum, m) => sum + m.cost, 0);
        const calcProgress = Math.round((milestones.reduce((acc, m) => acc + (m.progress || 0), 0)) / milestones.length);

        return {
          ...d,
          overallProgress: calcProgress,
          unreadPortal: true,
          quotation: {
            totalCost: newTotalCost,
            developmentTime: d.quotation?.developmentTime || '30 Days',
            supportPeriod: d.quotation?.supportPeriod || '6 Months Support',
            maintenanceOffer: d.quotation?.maintenanceOffer || '5,000 BDT/month',
            terms: d.quotation?.terms || ['Payment milestones must be completed to unlock next stages of source files.'],
            milestones: milestones.map(m => ({
              ...m,
              percentage: newTotalCost > 0 ? Math.round((m.cost / newTotalCost) * 100) : 0
            }))
          }
        };
      }
      return d;
    });

    saveDeals(updatedDeals);
    setDeals(updatedDeals);

    setNewMilTitle('');
    setNewMilDesc('');
    setNewMilCost(0);
    setNewMilDueDate('');
    setIsAddingMilestone(false);

    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'admin',
      content: `➕ New project phase added: "${newMilTitle}" costing BDT ${newMilCost.toLocaleString()}, target delivery: ${newMilDueDate || 'TBD'}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    const updatedChats = {
      ...chatMessages,
      [dealId]: [...(chatMessages[dealId] || []), message]
    };
    saveChats(updatedChats);
    setChatMessages(updatedChats);

    triggerToast(`New phase "${newMilTitle}" successfully added.`);
  };

  const handleAddDeliverable = () => {
    if (!deliverableNameInput.trim()) return;
    const newDeliverable = {
      name: deliverableNameInput.trim(),
      url: deliverableUrlInput.trim() || '#',
      size: 'Secured Resource',
      type: deliverableNameInput.includes('.') ? deliverableNameInput.split('.').pop() || 'file' : 'link'
    };
    setEditDeliverables([...editDeliverables, newDeliverable]);
    setDeliverableNameInput('');
    setDeliverableUrlInput('');
  };

  const handleDeleteDeliverable = (idxToDelete: number) => {
    setEditDeliverables(editDeliverables.filter((_, idx) => idx !== idxToDelete));
  };

  const handleGenerateMockDeliverable = () => {
    const randomNames = [
      'Staging_Build_v1.0.zip',
      'System_Architecture_Blueprint.pdf',
      'Figma_UI_Wireframes_Complete.fig',
      'Admin_Dashboard_Staging_URL.link',
      'Backend_API_Documentation.md'
    ];
    const chosen = randomNames[Math.floor(Math.random() * randomNames.length)];
    const mock = {
      name: chosen,
      url: chosen.endsWith('.link') ? 'https://staging.agencyplatform.com' : '#',
      size: `${(Math.random() * 15 + 1).toFixed(1)} MB`,
      type: chosen.split('.').pop() || 'file'
    };
    setEditDeliverables([...editDeliverables, mock]);
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

        <div className="p-6 md:p-8 flex-1 space-y-6">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full">
            
            {/* Left Column */}
            <div className="lg:col-span-7 lg:max-h-[calc(100vh-210px)] lg:overflow-y-auto pr-2 space-y-6">
              
              {/* Status Controller card */}
              <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4">
                <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-800 pb-2">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">Workflow Action Console</h4>
                    <p className="text-[10px] text-zinc-500">Respond to client request state transitions and proposals</p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-extrabold uppercase border ${
                    selectedDeal.status === 'Rejected'
                      ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                      : selectedDeal.status === 'Quotation Sent'
                      ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-500/20'
                      : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800'
                  }`}>
                    Status: {selectedDeal.status}
                  </span>
                </div>

                {/* Contextual Explanations & Action Triggers */}
                {selectedDeal.status === 'New' && (
                  <div className="space-y-3">
                    <p className="text-zinc-650 dark:text-zinc-400 text-[10px] leading-relaxed">
                      A new custom project inquiry has been received. Review the requirements on top, start negotiation with the client, or decline the proposal if outside the engineering scope.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleReviewRequest}
                        className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-3.5 py-1.5 rounded font-bold cursor-pointer transition-colors text-[10px]"
                      >
                        Accept for Technical Review
                      </button>
                      <button
                        onClick={() => setShowRejectInput(true)}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded font-bold cursor-pointer transition-colors text-[10px]"
                      >
                        Decline Proposal
                      </button>
                    </div>
                  </div>
                )}

                {selectedDeal.status === 'Reviewing' && (
                  <div className="space-y-3">
                    <p className="text-zinc-650 dark:text-zinc-400 text-[10px] leading-relaxed">
                      Technical feasibility is being evaluated. Once verified, move the deal to active negotiation to discuss target costings or formulate design proposals.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleStartDiscussion}
                        className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-3.5 py-1.5 rounded font-bold cursor-pointer transition-colors text-[10px]"
                      >
                        Initiate Client Discussion & Chat
                      </button>
                      <button
                        onClick={() => setShowRejectInput(true)}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded font-bold cursor-pointer transition-colors text-[10px]"
                      >
                        Decline Proposal
                      </button>
                    </div>
                  </div>
                )}

                {selectedDeal.status === 'Discussion' && (
                  <div className="space-y-3">
                    <p className="text-zinc-650 dark:text-zinc-400 text-[10px] leading-relaxed">
                      Negotiation channel is open. Use the chat dashboard on the right to align specs, then complete the <strong>Milestone Quotation form</strong> below to send the final quotation.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRejectInput(true)}
                        className="bg-white dark:bg-zinc-950 border border-rose-250 dark:border-rose-900/50 hover:border-rose-400 text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded font-bold cursor-pointer transition-colors text-[10px]"
                      >
                        Decline Project Proposal
                      </button>
                    </div>
                  </div>
                )}

                {selectedDeal.status === 'Quotation Sent' && (
                  <div className="space-y-3">
                    <div className="bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-900 p-3 rounded text-[10px] text-purple-700 dark:text-purple-400 flex items-start gap-2">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Quotation Submitted!</span>
                        Awaiting client verification, contract e-signing, and advanced deposit payment to activate milestones.
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleStartDiscussion}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-zinc-700 dark:text-zinc-300 px-3.5 py-1.5 rounded font-bold cursor-pointer transition-colors text-[10px]"
                      >
                        Revoke & Revise Milestone Estimation
                      </button>
                      <button
                        onClick={() => setShowRejectInput(true)}
                        className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 text-rose-600 dark:text-rose-400 px-3.5 py-1.5 rounded font-bold cursor-pointer transition-colors text-[10px]"
                      >
                        Decline Project Proposal
                      </button>
                    </div>
                  </div>
                )}

                {['Accepted', 'In Development', 'Testing', 'Client Review', 'Revision', 'Completed', 'Delivered'].includes(selectedDeal.status) && (
                  <div className="space-y-3">
                    <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 p-3 rounded text-[10px] text-emerald-700 dark:text-emerald-400 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Contract Signed & Active</span>
                        Development resources assigned. Track milestones and deploy updates below.
                      </div>
                    </div>
                  </div>
                )}

                {selectedDeal.status === 'Rejected' && (
                  <div className="space-y-3">
                    <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 p-3 rounded text-[10px] text-rose-700 dark:text-rose-400 flex items-start gap-2">
                      <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block">Proposal Declined</span>
                        This deal is flagged as rejected. If specifications change, you can restore active discussion.
                      </div>
                    </div>
                    <button
                      onClick={handleRestoreProposal}
                      className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-3.5 py-1.5 rounded font-bold cursor-pointer transition-colors text-[10px] flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Restore & Re-open Discussion
                    </button>
                  </div>
                )}

                {/* Inline Rejection Drawer Card */}
                {showRejectInput && (
                  <div className="bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 rounded space-y-3 animate-fadeIn">
                    <div className="flex justify-between items-center">
                      <label className="block text-[10px] uppercase font-bold text-zinc-500">Decline Reason Specification</label>
                      <button 
                        onClick={() => { setShowRejectInput(false); setRejectReason(''); }}
                        className="text-zinc-400 hover:text-zinc-650"
                      >
                        ✕
                      </button>
                    </div>
                    <textarea
                      rows={3}
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Specify decline details (e.g., out of tech scope, resource scheduling limits, budget mismatch)..."
                      className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded p-2 text-xs focus:outline-none focus:border-zinc-400 resize-none text-zinc-900 dark:text-white"
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => { setShowRejectInput(false); setRejectReason(''); }}
                        className="px-3 py-1 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded font-bold hover:bg-zinc-100 text-[10px] text-zinc-700 dark:text-zinc-300"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRejectProposal(rejectReason)}
                        disabled={!rejectReason.trim()}
                        className="px-3.5 py-1 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded font-bold text-[10px]"
                      >
                        Decline Proposal
                      </button>
                    </div>
                  </div>
                )}
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
                <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-5">
                  <div className="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-xs">Active Project Phases & Milestones</h4>
                      <p className="text-zinc-500 text-[10px]">Add, edit, or delete project milestones and upload deliverables.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsAddingMilestone(true)}
                      className="bg-zinc-950 dark:bg-white text-white dark:text-black font-extrabold text-[9px] px-2.5 py-1.5 rounded flex items-center gap-1 uppercase transition-colors"
                    >
                      + Add New Phase
                    </button>
                  </div>

                  {/* Add New Phase form */}
                  {isAddingMilestone && (
                    <div className="bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-900 rounded space-y-4 animate-fadeIn">
                      <span className="text-[10px] uppercase font-bold text-zinc-500 block">Add New Project Phase</span>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-1">Phase Title</label>
                          <input
                            type="text"
                            value={newMilTitle}
                            onChange={(e) => setNewMilTitle(e.target.value)}
                            placeholder="e.g. Phase 5: Testing & QA Audit"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-1">Scope Description</label>
                          <input
                            type="text"
                            value={newMilDesc}
                            onChange={(e) => setNewMilDesc(e.target.value)}
                            placeholder="e.g. Conduct load testing and final bug resolutions."
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-1">Target Delivery Time</label>
                          <input
                            type="text"
                            value={newMilDueDate}
                            onChange={(e) => setNewMilDueDate(e.target.value)}
                            placeholder="e.g. 15 Days"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-1">Cost (BDT)</label>
                          <input
                            type="number"
                            value={newMilCost || ''}
                            onChange={(e) => setNewMilCost(Number(e.target.value))}
                            placeholder="e.g. 15000"
                            className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 text-xs text-zinc-900 dark:text-white focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2 justify-end pt-2">
                        <button
                          type="button"
                          onClick={() => { setIsAddingMilestone(false); setNewMilTitle(''); }}
                          className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 rounded font-bold text-[10px]"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleAddNewMilestone}
                          className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold text-[10px]"
                        >
                          Save New Phase
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Milestones list */}
                  <div className="space-y-3">
                    {selectedDeal.quotation.milestones.map((m) => {
                      const isEditing = editingMilestoneId === m.id;
                      const isAwaiting = m.status === 'Awaiting Approval';
                      const isApproved = m.status === 'Approved';

                      if (isEditing) {
                        return (
                          <div key={m.id} className="bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-900 rounded space-y-4 animate-fadeIn">
                            <div className="flex justify-between items-center border-b border-zinc-200 dark:border-zinc-900 pb-2">
                              <span className="text-[10px] uppercase font-bold text-zinc-500">Edit Phase: {m.title}</span>
                              <span className="text-[9px] font-mono text-zinc-400">ID: {m.id}</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div>
                                <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-1">Phase Title</label>
                                <input
                                  type="text"
                                  value={editMilTitle}
                                  onChange={(e) => setEditMilTitle(e.target.value)}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 text-xs text-zinc-950 dark:text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-1">Scope Description</label>
                                <input
                                  type="text"
                                  value={editMilDesc}
                                  onChange={(e) => setEditMilDesc(e.target.value)}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 text-xs text-zinc-950 dark:text-white focus:outline-none"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div>
                                <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-1">Delivery Time</label>
                                <input
                                  type="text"
                                  value={editMilDueDate}
                                  onChange={(e) => setEditMilDueDate(e.target.value)}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 text-xs text-zinc-950 dark:text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-1">Cost (BDT)</label>
                                <input
                                  type="number"
                                  value={editMilCost}
                                  onChange={(e) => setEditMilCost(Number(e.target.value))}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded px-2.5 py-1.5 text-xs text-zinc-955 dark:text-white focus:outline-none"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-1">Progress ({editMilProgress}%)</label>
                                <input
                                  type="range"
                                  min="0"
                                  max="100"
                                  value={editMilProgress}
                                  onChange={(e) => setEditMilProgress(Number(e.target.value))}
                                  className="w-full accent-zinc-950 dark:accent-white h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer mt-2"
                                />
                              </div>
                              <div>
                                <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-1">Status</label>
                                <select
                                  value={editMilStatus}
                                  onChange={(e) => setEditMilStatus(e.target.value as any)}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded px-2 py-1 text-xs text-zinc-955 dark:text-white focus:outline-none"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Awaiting Approval">Awaiting Approval</option>
                                  <option value="Approved">Approved</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                              <div>
                                <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-1">Payment Status</label>
                                <select
                                  value={editMilPayStatus}
                                  onChange={(e) => setEditMilPayStatus(e.target.value as any)}
                                  className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-850 rounded px-2 py-1 text-xs text-zinc-955 dark:text-white focus:outline-none"
                                >
                                  <option value="Unpaid">Unpaid</option>
                                  <option value="Paid">Paid</option>
                                </select>
                              </div>
                            </div>

                            {/* Deliverables / Document submission */}
                            <div className="bg-zinc-50 dark:bg-zinc-900 p-3.5 rounded border border-zinc-200 dark:border-zinc-850 space-y-3">
                              <span className="text-[9px] uppercase font-bold text-zinc-500 block">Phase Document & Deliverables Vault</span>
                              
                              {editDeliverables.length === 0 ? (
                                <p className="text-[10px] text-zinc-550">No documents or builds uploaded for this phase.</p>
                              ) : (
                                <div className="space-y-1.5 max-h-[150px] overflow-y-auto pr-1">
                                  {editDeliverables.map((del, dIdx) => (
                                    <div key={dIdx} className="bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-900 p-2 rounded flex justify-between items-center text-[10px]">
                                      <div className="flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-zinc-500" />
                                        <span className="font-bold text-zinc-950 dark:text-white">{del.name}</span>
                                        <span className="text-[8px] text-zinc-400">({del.size})</span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteDeliverable(dIdx)}
                                        className="text-rose-500 hover:text-rose-600 font-bold"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Add deliverable item */}
                              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 space-y-2">
                                <span className="text-[8px] uppercase font-bold text-zinc-400 block">Submit Deliverables Asset Link</span>
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="File Name (e.g. Staging_Build.zip)"
                                    value={deliverableNameInput}
                                    onChange={(e) => setDeliverableNameInput(e.target.value)}
                                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded px-2 py-1 text-[10px] text-zinc-900 dark:text-white focus:outline-none"
                                  />
                                  <input
                                    type="text"
                                    placeholder="File URL / Resource URL (e.g. https://drive.google.com/xyz)"
                                    value={deliverableUrlInput}
                                    onChange={(e) => setDeliverableUrlInput(e.target.value)}
                                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded px-2 py-1 text-[10px] text-zinc-900 dark:text-white focus:outline-none"
                                  />
                                </div>
                                <div className="flex gap-2 justify-between items-center">
                                  <button
                                    type="button"
                                    onClick={handleGenerateMockDeliverable}
                                    className="text-[9px] text-zinc-600 dark:text-zinc-400 hover:underline"
                                  >
                                    ⚡ Generate Staging Mock File
                                  </button>
                                  <button
                                    type="button"
                                    onClick={handleAddDeliverable}
                                    className="bg-zinc-950 dark:bg-white text-white dark:text-black text-[9px] font-bold px-2 py-1 rounded"
                                  >
                                    + Add Deliverable Link
                                  </button>
                                </div>
                              </div>
                            </div>

                            <div className="flex gap-2 justify-end pt-2 border-t border-zinc-200 dark:border-zinc-900">
                              <button
                                type="button"
                                onClick={() => setEditingMilestoneId(null)}
                                className="px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-350 rounded font-bold text-[10px]"
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                onClick={handleSaveEditMilestone}
                                className="px-3.5 py-1.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold text-[10px]"
                              >
                                Save Phase Changes
                              </button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div key={m.id} className="bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-900 rounded space-y-3 relative group">
                          {/* Hover action menu for admin */}
                          <div className="absolute top-3 right-3 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleStartEditMilestone(m)}
                              className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-[9px] px-2 py-1 rounded"
                            >
                              Edit Phase
                            </button>
                            <button
                              onClick={() => handleDeleteMilestone(m.id)}
                              className="bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-[9px] px-2 py-1 rounded"
                            >
                              Delete Phase
                            </button>
                          </div>

                          <div className="space-y-1 pr-16">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-extrabold text-zinc-950 dark:text-white text-xs block">{m.title}</span>
                              <span className="text-[9px] bg-zinc-100 dark:bg-zinc-900 text-zinc-600 px-1 rounded font-mono font-bold">{m.cost.toLocaleString()} BDT</span>
                            </div>
                            <p className="text-[10px] text-zinc-500 font-sans leading-normal">{m.description}</p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                            {/* Phase progress meter */}
                            <div className="space-y-1">
                              <div className="flex justify-between items-center text-[9px] font-mono text-zinc-400">
                                <span>Phase construction progress</span>
                                <span className="font-bold text-zinc-700 dark:text-zinc-300">{m.progress || 0}%</span>
                              </div>
                              <div className="w-full bg-zinc-100 dark:bg-zinc-900 h-1.5 rounded overflow-hidden">
                                <div 
                                  className="bg-zinc-950 dark:bg-white h-full transition-all duration-300"
                                  style={{ width: `${m.progress || 0}%` }}
                                />
                              </div>
                            </div>

                            {/* Timeline and delivery */}
                            <div className="text-[9px] flex items-center gap-4 text-zinc-400 font-mono">
                              <span>Delivery time: <strong className="text-zinc-700 dark:text-zinc-300">{m.dueDate}</strong></span>
                              <span>|</span>
                              <span className={m.paymentStatus === 'Paid' ? 'text-emerald-500 font-bold' : 'text-amber-550 font-bold'}>
                                Payment: {m.paymentStatus}
                              </span>
                            </div>
                          </div>

                          {/* Submitted deliverables preview list */}
                          {m.deliverables && m.deliverables.length > 0 && (
                            <div className="bg-zinc-50 dark:bg-zinc-900/50 p-2.5 rounded border border-zinc-200/50 dark:border-zinc-850 mt-1 space-y-1">
                              <span className="text-[8px] uppercase font-bold text-zinc-450 block">Submitted Deliverable Assets:</span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                {m.deliverables.map((del, dIdx) => (
                                  <div key={dIdx} className="flex items-center justify-between text-[9px] bg-white dark:bg-zinc-950 border border-zinc-200/40 p-1.5 rounded">
                                    <span className="truncate max-w-[150px] text-zinc-650 dark:text-zinc-350">{del.name}</span>
                                    <a 
                                      href={del.url} 
                                      target="_blank" 
                                      rel="noreferrer" 
                                      className="text-zinc-950 dark:text-white font-bold hover:underline shrink-0 text-[8px] uppercase"
                                    >
                                      Open Link
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="flex gap-2 justify-between items-center pt-2 border-t border-zinc-200/50 dark:border-zinc-900/50">
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase border ${
                              m.status === 'Approved'
                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450 border-emerald-250 dark:border-emerald-500/20'
                                : m.status === 'Awaiting Approval'
                                ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-455 border border-amber-200 dark:border-amber-550/20'
                                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                            }`}>
                              Status: {m.status}
                            </span>
                            
                            {!isApproved && !isAwaiting && (
                              <button
                                onClick={() => handleAdvanceMilestoneStage(m.id, 'Awaiting Approval')}
                                className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-2 py-1 rounded text-[9px] font-bold cursor-pointer transition-colors"
                              >
                                Submit Staging Build
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
            <div className="lg:col-span-5 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl shadow-md flex flex-col justify-between h-[calc(100vh-210px)] shrink-0 overflow-hidden">
              {/* Header */}
              <div className="bg-zinc-50/50 dark:bg-zinc-900/40 border-b border-zinc-200 dark:border-zinc-900 px-5 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2.5">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <div>
                    <h4 className="font-bold text-zinc-900 dark:text-white text-xs">Client Conversation Room</h4>
                    <p className="text-zinc-400 text-[9px] font-mono tracking-tight">Status: Active Negotiation</p>
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
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div key={msg.id} className={`flex gap-3 items-start ${isAdmin ? 'flex-row-reverse' : 'flex-row'}`}>
                        {/* Premium Avatar */}
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[10px] font-extrabold tracking-tight uppercase shadow-sm border transition-all ${
                          isAdmin 
                            ? 'bg-zinc-900 border-zinc-800 text-white dark:bg-white dark:border-zinc-200 dark:text-zinc-900' 
                            : 'bg-zinc-100 border-zinc-200 text-zinc-700 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-300'
                        }`}>
                          {isAdmin ? 'A' : 'C'}
                        </div>

                        <div className={`space-y-1 max-w-[78%] flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}>
                          {/* Sender Info */}
                          <div className="flex items-center gap-1.5 px-1">
                            <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide">
                              {isAdmin ? 'You (Admin)' : 'Client Portal'}
                            </span>
                            <span className="text-[8px] text-zinc-400 font-mono">• {msg.timestamp}</span>
                          </div>

                          {/* Message Bubble */}
                          <div className={`rounded-2xl px-4 py-3 text-[11px] leading-relaxed shadow-sm border transition-all ${
                            isAdmin
                              ? 'bg-zinc-900 border-zinc-800 text-white dark:bg-white dark:text-zinc-900 dark:border-zinc-200 rounded-tr-none'
                              : 'bg-zinc-50 border-zinc-200 text-zinc-805 dark:bg-zinc-900/60 dark:text-zinc-200 dark:border-zinc-805 rounded-tl-none'
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
                                  href="#" 
                                  onClick={(e) => {
                                    e.preventDefault();
                                    triggerToast(`Downloading ${msg.file?.name}...`);
                                  }} 
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
              </div>

              {/* Modern Compose Box Input Panel */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200 dark:border-zinc-900">
                <form onSubmit={handleSendChat} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-sm overflow-hidden focus-within:border-zinc-450 dark:focus-within:border-zinc-700 transition-colors flex flex-col">
                  <textarea
                    rows={2}
                    placeholder="Write a message or upload specification update..."
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
                      onClick={triggerMockUpload}
                      className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white rounded hover:bg-zinc-100 dark:hover:bg-zinc-800/80 cursor-pointer transition-colors flex items-center gap-1.5 text-[9px] font-bold"
                      title="Attach specs file"
                    >
                      <Paperclip className="w-3.5 h-3.5" /> Attach Specs
                    </button>
                    
                    <button 
                      type="submit" 
                      className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-3.5 py-1.5 rounded-md font-bold flex items-center gap-1 text-[9px] uppercase tracking-wide cursor-pointer transition-colors shadow-xs"
                    >
                      Send Message <Send className="w-3 h-3" />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
