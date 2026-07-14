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
          <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded overflow-x-auto">
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
                    <td className="p-4 font-bold text-emerald-655 dark:text-emerald-400">{format(inv.total)}</td>
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
        ) : (
          <p className="text-zinc-500 text-center py-6">No transaction receipts found.</p>
        )}
      </div>
    </div>
  );
}
