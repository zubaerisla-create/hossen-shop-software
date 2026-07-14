'use client';

import React, { useEffect, useState } from 'react';
import { Invoice } from '../../types';
import { getInvoices } from '../../utils/storage';
import { useRouter } from 'next/navigation';
import { useCurrency } from '../../utils/currency';

export default function PortalInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { format } = useCurrency();

  useEffect(() => {
    setInvoices(getInvoices());
  }, []);

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900">
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Voucher Invoices</h2>
        <p className="text-zinc-500 text-[10px]">Print receipts and transaction ledger records generated from your credit or bKash settlements.</p>
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1">
        {invoices.length > 0 ? (
          <div className="space-y-4">
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold tracking-wider text-[10px] bg-zinc-50 dark:bg-zinc-900/60">
                    <th className="p-4">Invoice ID</th>
                    <th className="p-4">Item description</th>
                    <th className="p-4">Settlement Date</th>
                    <th className="p-4">Base price</th>
                    <th className="p-4">VAT (5%)</th>
                    <th className="p-4">Total Settled</th>
                    <th className="p-4 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="border-b border-zinc-200 dark:border-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300">
                      <td className="p-4 font-mono font-bold text-zinc-950 dark:text-white">{inv.invoiceNumber}</td>
                      <td className="p-4 truncate max-w-[200px]">{inv.title}</td>
                      <td className="p-4">{inv.date}</td>
                      <td className="p-4">{format(inv.amount)}</td>
                      <td className="p-4 text-zinc-500">{format(inv.tax)}</td>
                      <td className="p-4 font-bold text-emerald-600 dark:text-emerald-400">{format(inv.total)}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => router.push(`/invoices/${inv.id}`)}
                          className="bg-white dark:bg-zinc-955 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 px-3 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors"
                        >
                          View Voucher
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="md:hidden space-y-4">
              {invoices.map((inv) => (
                <div 
                  key={inv.id} 
                  className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="font-mono text-[9px] font-bold text-zinc-400 block">{inv.invoiceNumber}</span>
                      <span className="font-bold text-zinc-950 dark:text-white text-xs block mt-0.5">{inv.title}</span>
                      <span className="text-[10px] text-zinc-500 block">{inv.date}</span>
                    </div>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-xs">{format(inv.total)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] border-t border-zinc-200/50 dark:border-zinc-800/50 pt-2.5 text-zinc-600 dark:text-zinc-400">
                    <div>
                      <span className="text-zinc-400 dark:text-zinc-500 uppercase text-[7px] font-bold block">Base Price</span>
                      <span>{format(inv.amount)}</span>
                    </div>
                    <div>
                      <span className="text-zinc-400 dark:text-zinc-500 uppercase text-[7px] font-bold block">VAT (5%)</span>
                      <span>{format(inv.tax)}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-200/50 dark:border-zinc-800/50">
                    <button
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                      className="w-full text-center py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-bold rounded text-[10px] transition-colors cursor-pointer"
                    >
                      View Voucher Voucher →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-zinc-500 text-center py-6">No transaction receipts found.</p>
        )}
      </div>
    </div>
  );
}
