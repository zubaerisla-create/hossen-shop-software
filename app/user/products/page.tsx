'use client';

import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { getProducts, getPurchasedProducts } from '../../utils/storage';
import { Download, ExternalLink, ArrowRight, Search, Shield, FileCode, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function PurchasedTemplatesPage() {
  const [purchasedProducts, setPurchasedProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const allProducts = getProducts();
    const purchasedIds = getPurchasedProducts();
    const owned = allProducts.filter(p => purchasedIds.includes(p.id));
    setPurchasedProducts(owned);
  }, []);

  const filteredProducts = purchasedProducts.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full bg-white dark:bg-zinc-950 transition-colors">
      
      {/* Title Header */}
      <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 transition-colors">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight font-sans">Purchased Templates</h2>
          <p className="text-zinc-500 text-[10px]">Access code archives, licenses, documentation, and credentials for your acquired products.</p>
        </div>

        {/* Search filter */}
        {purchasedProducts.length > 0 && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter by template name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            />
          </div>
        )}
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1">
        
        {filteredProducts.length > 0 ? (
          <div className="border border-zinc-205 dark:border-zinc-900 rounded-lg overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-900 text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                  <th className="p-4 w-12 text-center">Preview</th>
                  <th className="p-4">Template Name</th>
                  <th className="p-4">License Type</th>
                  <th className="p-4">Paid (BDT)</th>
                  <th className="p-4">Version</th>
                  <th className="p-4">Support Period</th>
                  <th className="p-4 text-center">Workspace</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => (
                  <tr 
                    key={prod.id} 
                    className="border-b border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    {/* Thumbnail */}
                    <td className="p-4 text-center">
                      <div className="w-10 h-6 rounded bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-zinc-200 dark:border-zinc-800 shrink-0 mx-auto">
                        <img 
                          src={prod.images[0] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80'} 
                          alt={prod.name} 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </td>

                    {/* Name & Category */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="font-bold text-zinc-950 dark:text-white block hover:text-zinc-800 dark:hover:text-zinc-200">
                          {prod.name}
                        </span>
                        <span className="inline-block bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 px-1 py-0.2 rounded text-[8px] font-mono font-semibold uppercase">
                          {prod.category}
                        </span>
                      </div>
                    </td>

                    {/* License */}
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Shield className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span className="truncate max-w-[150px] block" title={prod.license}>{prod.license}</span>
                      </div>
                    </td>

                    {/* Price Paid */}
                    <td className="p-4 font-bold text-zinc-950 dark:text-white font-mono">
                      {prod.price.toLocaleString()} BDT
                    </td>

                    {/* Version */}
                    <td className="p-4 font-mono text-[10px] text-zinc-550 dark:text-zinc-400">
                      v{prod.version}
                    </td>

                    {/* Support validity */}
                    <td className="p-4">
                      <div className="space-y-0.5">
                        <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-450 border border-emerald-250 dark:border-emerald-900 text-[8px] px-1.5 py-0.5 rounded font-bold uppercase block w-fit">
                          6 Months Active
                        </span>
                        <span className="text-[9px] text-zinc-450 font-medium block">Expires: 2027-01-01</span>
                      </div>
                    </td>

                    {/* Link workspace */}
                    <td className="p-4 text-center">
                      <Link 
                        href={`/user/products/${prod.id}`}
                        className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded inline-flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm text-[10px]"
                      >
                        Workspace <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-zinc-200 dark:border-zinc-900 rounded-lg p-10 bg-zinc-50 dark:bg-zinc-900/10 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <FileCode className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-zinc-950 dark:text-white text-sm">No Purchased Templates</h3>
              <p className="text-zinc-500 max-w-sm mx-auto leading-relaxed">
                You haven't bought any ready-made codebases yet. Pay the listed price on any template in our store to gain instant workspace access.
              </p>
            </div>
            <Link 
              href="/products" 
              className="px-4 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded inline-block cursor-pointer transition-colors"
            >
              Browse Products
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
