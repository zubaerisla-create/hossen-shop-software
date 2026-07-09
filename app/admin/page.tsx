'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product, CustomDeal, Invoice, SupportTicket } from '../types';
import { getProducts, getDeals, getInvoices, getTickets, getPurchasedProducts } from '../utils/storage';
import { CheckCircle2, Users, Globe, DownloadCloud, Award, Edit, Save, X } from 'lucide-react';

const STATS_KEY = 'apex_agency_stats';

interface AgencyStat {
  value: string;
  label: string;
  iconKey: string;
}

const defaultStats: AgencyStat[] = [
  { value: '180+', label: 'Projects Completed', iconKey: 'check' },
  { value: '2,500+', label: 'Happy Clients', iconKey: 'users' },
  { value: '15+', label: 'Countries Served', iconKey: 'globe' },
  { value: '12K+', label: 'Products Downloaded', iconKey: 'download' },
  { value: '5+', label: 'Years Experience', iconKey: 'award' }
];

function getStatIcon(key: string) {
  const cls = "w-4 h-4 text-zinc-700 dark:text-zinc-400";
  switch (key) {
    case 'check': return <CheckCircle2 className={cls} />;
    case 'users': return <Users className={cls} />;
    case 'globe': return <Globe className={cls} />;
    case 'download': return <DownloadCloud className={cls} />;
    case 'award': return <Award className={cls} />;
    default: return <CheckCircle2 className={cls} />;
  }
}

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<CustomDeal[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [purchasedCount, setPurchasedCount] = useState(0);

  // Editable agency stats
  const [agencyStats, setAgencyStats] = useState<AgencyStat[]>(defaultStats);
  const [editingStats, setEditingStats] = useState(false);
  const [editBuffer, setEditBuffer] = useState<AgencyStat[]>(defaultStats);

  useEffect(() => {
    setProducts(getProducts());
    setDeals(getDeals());
    setInvoices(getInvoices());
    setTickets(getTickets());
    setPurchasedCount(getPurchasedProducts().length);

    // Load saved stats
    const savedStats = localStorage.getItem(STATS_KEY);
    if (savedStats) {
      try {
        const parsed = JSON.parse(savedStats) as AgencyStat[];
        setAgencyStats(parsed);
        setEditBuffer(parsed);
      } catch { /* use defaults */ }
    }
  }, []);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-admin-toast', { detail: text });
    window.dispatchEvent(event);
  };

  const handleSaveStats = () => {
    setAgencyStats(editBuffer);
    localStorage.setItem(STATS_KEY, JSON.stringify(editBuffer));
    setEditingStats(false);
    triggerToast('Agency showcase statistics updated.');
  };

  const handleCancelEditStats = () => {
    setEditBuffer(agencyStats);
    setEditingStats(false);
  };

  const updateStatField = (index: number, field: 'value' | 'label', val: string) => {
    setEditBuffer(prev => prev.map((s, i) => i === index ? { ...s, [field]: val } : s));
  };

  const totalRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((acc, i) => acc + i.total, 0);

  const activeProjectsCount = deals.filter(
    d => d.status === 'In Development' || d.status === 'Testing' || d.status === 'Client Review'
  ).length;

  const unresolvedTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900">
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Executive Summary</h2>
        <p className="text-zinc-500 text-[10px]">Real-time statistics covering ready product sales, custom design contracts, and payouts.</p>
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1">

      {/* Live Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
          <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Total Sales Revenue</span>
          <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">
            {totalRevenue.toLocaleString()} BDT
          </span>
          <span className="text-[10px] text-zinc-500">bKash + Card settlements</span>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
          <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Custom Projects Active</span>
          <span className="text-2xl font-bold text-zinc-950 dark:text-white block">
            {activeProjectsCount}
          </span>
          <span className="text-[10px] text-zinc-500">Milestones under execution</span>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
          <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Marketplace Products</span>
          <span className="text-2xl font-bold text-zinc-950 dark:text-white block">{products.length}</span>
          <Link href="/admin/products" className="text-[10px] text-zinc-950 dark:text-white font-bold hover:underline block">Manage catalogs</Link>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
          <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Licenses Sold</span>
          <span className="text-2xl font-bold text-zinc-950 dark:text-white block">{purchasedCount}</span>
          <Link href="/admin/orders" className="text-[10px] text-zinc-950 dark:text-white font-bold hover:underline block">View client orders</Link>
        </div>

        <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
          <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Unresolved Tickets</span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 block">
            {unresolvedTicketsCount}
          </span>
          <Link href="/admin/support" className="text-[10px] text-zinc-950 dark:text-white font-bold hover:underline block">Requires replies</Link>
        </div>
      </div>

      {/* Editable Agency Showcase Stats */}
      <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded p-5 space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-xs font-bold text-zinc-950 dark:text-white uppercase tracking-wider block">
            Agency Showcase Statistics
          </span>
          {!editingStats ? (
            <button
              onClick={() => { setEditBuffer([...agencyStats]); setEditingStats(true); }}
              className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 rounded text-[10px] font-bold cursor-pointer transition-colors"
            >
              <Edit className="w-3 h-3" /> Edit Values
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleSaveStats}
                className="flex items-center gap-1 px-2.5 py-1 bg-zinc-950 dark:bg-white text-white dark:text-black rounded text-[10px] font-bold cursor-pointer transition-colors hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                <Save className="w-3 h-3" /> Save
              </button>
              <button
                onClick={handleCancelEditStats}
                className="flex items-center gap-1 px-2.5 py-1 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded text-[10px] font-bold cursor-pointer transition-colors"
              >
                <X className="w-3 h-3" /> Cancel
              </button>
            </div>
          )}
        </div>
        <p className="text-[10px] text-zinc-500 -mt-2">These values are displayed on the public landing page. Edit them to keep your agency profile up-to-date.</p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(editingStats ? editBuffer : agencyStats).map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 p-4 rounded space-y-2 text-center">
              <div className="flex justify-center">{getStatIcon(stat.iconKey)}</div>
              {editingStats ? (
                <>
                  <input
                    type="text"
                    value={editBuffer[idx].value}
                    onChange={(e) => updateStatField(idx, 'value', e.target.value)}
                    className="w-full text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-2 py-1 text-sm font-bold focus:outline-none focus:border-zinc-400"
                  />
                  <input
                    type="text"
                    value={editBuffer[idx].label}
                    onChange={(e) => updateStatField(idx, 'label', e.target.value)}
                    className="w-full text-center bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-500 rounded px-2 py-0.5 text-[10px] focus:outline-none focus:border-zinc-400"
                  />
                </>
              ) : (
                <>
                  <span className="text-lg font-extrabold text-zinc-950 dark:text-white block">{stat.value}</span>
                  <span className="text-[10px] text-zinc-500 block">{stat.label}</span>
                </>
              )}
            </div>
          ))}
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
          <li>Switch back to <strong className="text-zinc-950 dark:text-white">Admin Mode</strong>. Assign a developer, adjust percentage bars, and mark milestones as &quot;Awaiting Approval&quot; to request client review/payment.</li>
        </ul>
      </div>
      </div>
    </div>
  );
}
