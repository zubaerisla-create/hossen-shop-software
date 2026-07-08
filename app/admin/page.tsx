'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Product, CustomDeal, Invoice, SupportTicket } from '../types';
import { getProducts, getDeals, getInvoices, getTickets } from '../utils/storage';
import { CheckCircle2, Users, Globe, DownloadCloud, Award } from 'lucide-react';

export default function AdminDashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [deals, setDeals] = useState<CustomDeal[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  useEffect(() => {
    setProducts(getProducts());
    setDeals(getDeals());
    setInvoices(getInvoices());
    setTickets(getTickets());
  }, []);

  const totalRevenue = invoices
    .filter(i => i.status === 'Paid')
    .reduce((acc, i) => acc + i.total, 0);

  const activeProjectsCount = deals.filter(
    d => d.status === 'In Development' || d.status === 'Testing' || d.status === 'Client Review'
  ).length;

  const unresolvedTicketsCount = tickets.filter(t => t.status !== 'Resolved').length;

  const stats = [
    { value: '180+', label: 'Projects Completed', icon: <CheckCircle2 className="w-4 h-4 text-zinc-700 dark:text-zinc-400" /> },
    { value: '2,500+', label: 'Happy Clients', icon: <Users className="w-4 h-4 text-zinc-700 dark:text-zinc-400" /> },
    { value: '15+', label: 'Countries Served', icon: <Globe className="w-4 h-4 text-zinc-700 dark:text-zinc-400" /> },
    { value: '12K+', label: 'Products Downloaded', icon: <DownloadCloud className="w-4 h-4 text-zinc-700 dark:text-zinc-400" /> },
    { value: '5+', label: 'Years Experience', icon: <Award className="w-4 h-4 text-zinc-700 dark:text-zinc-400" /> }
  ];

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900">
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Executive Summary</h2>
        <p className="text-zinc-500 text-[10px]">Real-time statistics covering ready product sales, custom design contracts, and payouts.</p>
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1">

      {/* Metrics cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Unresolved Tickets</span>
          <span className="text-2xl font-bold text-rose-600 dark:text-rose-455 block">
            {unresolvedTicketsCount}
          </span>
          <Link href="/admin/support" className="text-[10px] text-zinc-950 dark:text-white font-bold hover:underline block">Requires replies</Link>
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
    </div>
  );
}
