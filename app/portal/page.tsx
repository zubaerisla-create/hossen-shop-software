'use client';

import React, { useEffect, useState } from 'react';
import { Product, CustomDeal } from '../types';
import { getProducts, getPurchasedProducts, getDeals } from '../utils/storage';
import { Download, Laptop, AlertCircle, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PortalDashboardPage() {
  const [deals, setDeals] = useState<CustomDeal[]>([]);
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);

  useEffect(() => {
    const allProducts = getProducts();
    const purchasedIds = getPurchasedProducts();
    const owned = allProducts.filter(p => purchasedIds.includes(p.id));
    setPurchasedProducts(owned);
    setDeals(getDeals());
  }, []);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-portal-toast', { detail: text });
    window.dispatchEvent(event);
  };

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      
      <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900">
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Overview Dashboard</h2>
        <p className="text-zinc-500 text-[10px]">Track custom software builds progress, read documentation, and download purchased source codes.</p>
      </div>

      <div className="p-6 md:p-8 space-y-8 flex-1">

      {/* Metrics overview */}
      <div className="space-y-4">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
            <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Custom Projects Active</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white block">
              {deals.filter(d => d.status !== 'Delivered' && d.status !== 'Completed' && d.status !== 'Rejected').length}
            </span>
            <Link href="/portal/deals" className="text-[10px] text-zinc-950 dark:text-white font-bold hover:underline block">View active projects</Link>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
            <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Purchased Marketplace Items</span>
            <span className="text-2xl font-bold text-zinc-950 dark:text-white block">{purchasedProducts.length}</span>
            <span className="text-[10px] text-zinc-500">Ready templates license</span>
          </div>

          <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-3">
            <span className="text-zinc-500 text-[9px] uppercase font-bold tracking-wider">Signed Contracts</span>
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 block">
              {deals.filter(d => d.contractSigned).length}
            </span>
            <span className="text-[10px] text-zinc-500">Authorized e-signatures</span>
          </div>
        </div>
      </div>

      {/* Active Custom Projects Summary list */}
      <div className="space-y-4">
        <span className="font-bold text-zinc-950 dark:text-white uppercase tracking-wider block">Custom Engineering Timelines</span>
        {deals.length > 0 ? (
          <div className="space-y-3">
            {deals.map(d => (
              <div key={d.id} className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 p-4 rounded flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <span className="font-bold text-zinc-950 dark:text-white text-xs block">{d.title}</span>
                  <span className="text-[10px] text-zinc-500 block">Status: <strong className="text-zinc-950 dark:text-white uppercase">{d.status}</strong> | Developer: {d.developer || 'Awaiting assignment'}</span>
                </div>

                <div className="w-full md:w-48 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-zinc-500">
                    <span>Overall Progress</span>
                    <span className="font-bold text-zinc-900 dark:text-white">{d.overallProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded overflow-hidden">
                    <div className="h-full bg-zinc-950 dark:bg-white transition-all duration-500" style={{ width: `${d.overallProgress}%` }}></div>
                  </div>
                </div>

                <Link href="/portal/deals" className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded">
                  Workspace
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 p-4 rounded text-center text-zinc-500">
            No active custom projects. Start customized software contract negotiations below.
          </div>
        )}
      </div>

      {/* Ready products license list */}
      <div className="space-y-4">
        <span className="font-bold text-zinc-950 dark:text-white uppercase tracking-wider block">Your Ready-made Downloads</span>
        {purchasedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {purchasedProducts.map((prod) => (
              <div key={prod.id} className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-5 rounded space-y-4 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-1.5 py-0.5 rounded text-[8px] font-mono">{prod.category}</span>
                    <span className="text-[10px] text-zinc-500">Ver: {prod.version}</span>
                  </div>
                  <h3 className="font-bold text-zinc-950 dark:text-white text-xs">{prod.name}</h3>
                  <p className="text-zinc-500 dark:text-zinc-500 text-[11px] line-clamp-2 leading-relaxed">{prod.description}</p>
                </div>

                <div className="flex gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-900/60 text-[10px]">
                  <button
                    onClick={() => triggerToast(`Source code zip for ${prod.name} download initiated.`)}
                    className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" /> Download zip
                  </button>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      triggerToast(`Documentation opened for ${prod.name}`);
                    }}
                    className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded flex items-center justify-center transition-colors"
                  >
                    Docs
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-zinc-50 dark:bg-zinc-900/25 border border-zinc-200 dark:border-zinc-800 rounded p-6 text-center text-zinc-500">
            No ready template downloads purchased yet. Browse marketplace catalog to buy instant code.
          </div>
        )}
      </div>

      </div>
    </div>
  );
}
