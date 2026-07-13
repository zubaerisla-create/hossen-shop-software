'use client';

import React from 'react';
import { Invoice } from '@/app/types';
import { Download, Printer, ShieldCheck, X } from 'lucide-react';

interface InvoicePrintProps {
  invoice: Invoice;
  onClose: () => void;
}

export default function InvoicePrint({ invoice, onClose }: InvoicePrintProps) {
  const handlePrint = () => {
    window.print();
  };

  const clientName = invoice.customerName || (typeof window !== 'undefined' ? localStorage.getItem('apex_user_name') : null) || 'Client';
  const clientEmail = invoice.customerEmail || (typeof window !== 'undefined' ? localStorage.getItem('apex_user_email') : null) || '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm print:bg-white print:p-0">
      <div className="bg-white text-zinc-900 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl p-8 relative print:shadow-none print:rounded-none print:w-full print:max-w-none print:p-0">

        {/* Controls (hidden in print) */}
        <div className="absolute top-4 right-4 flex items-center gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <Printer className="w-4 h-4" /> Print Invoice
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 rounded-lg cursor-pointer transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Invoice Header */}
        <div className="flex justify-between items-start border-b border-zinc-200 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-violet-600 text-white p-1.5 rounded-lg font-black text-sm tracking-wider uppercase">
                AGENCY
              </div>
              <span className="font-extrabold text-lg text-zinc-900 tracking-tight">Hossen Shop</span>
            </div>
            <p className="text-[11px] text-zinc-500 leading-normal">
              Road 4, Sector 11, Uttara<br />
              Dhaka 1230, Bangladesh<br />
              billing@Hossen Shop.com | +880 1711 000000
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-black text-zinc-950 uppercase tracking-wide">INVOICE</h2>
            <span className="text-xs font-mono text-zinc-500">{invoice.invoiceNumber}</span>
            <div className="mt-2">
              <span className="text-[10px] text-zinc-400 block font-semibold uppercase">Date Issued</span>
              <span className="text-xs font-medium text-zinc-800">{invoice.date}</span>
            </div>
          </div>
        </div>

        {/* Bill To & Details */}
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <span className="block text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Billed To</span>
            <div className="text-xs leading-normal">
              <p className="font-bold text-zinc-800">{clientName}</p>
              <p className="text-zinc-500">
                {clientEmail && <>{clientEmail}<br /></>}
                Bangladesh
              </p>
            </div>
          </div>
          <div className="bg-zinc-50 border border-zinc-100 rounded-xl p-4 flex flex-col justify-between">
            <div className="flex justify-between items-center text-xs">
              <span className="text-zinc-500">Payment Status</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${invoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                {invoice.status}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs border-t border-zinc-100 pt-2 mt-2">
              <span className="text-zinc-500">Method</span>
              <span className="font-semibold text-zinc-700">bKash Mobile Wallet</span>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        <table className="w-full text-xs text-left mb-8 border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 text-zinc-500 uppercase font-semibold text-[10px] tracking-wider bg-zinc-50">
              <th className="py-2.5 px-3">Description</th>
              <th className="py-2.5 px-3 text-right">Unit Price</th>
              <th className="py-2.5 px-3 text-center">Qty</th>
              <th className="py-2.5 px-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-100">
              <td className="py-4 px-3">
                <span className="font-bold text-zinc-800 block">{invoice.title}</span>
                <span className="text-[10px] text-zinc-400">Includes lifetime updates and documentation support.</span>
              </td>
              <td className="py-4 px-3 text-right font-medium text-zinc-700">{invoice.amount.toLocaleString()} BDT</td>
              <td className="py-4 px-3 text-center text-zinc-600">1</td>
              <td className="py-4 px-3 text-right font-semibold text-zinc-800">{invoice.amount.toLocaleString()} BDT</td>
            </tr>
          </tbody>
        </table>

        {/* Totals Breakdown */}
        <div className="flex justify-end mb-8">
          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-zinc-500">
              <span>Subtotal</span>
              <span>{invoice.amount.toLocaleString()} BDT</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>Discount applied</span>
                <span>-{invoice.discount.toLocaleString()} BDT</span>
              </div>
            )}
            <div className="flex justify-between text-zinc-500 border-b border-zinc-100 pb-2">
              <span>Tax (5% VAT)</span>
              <span>{invoice.tax.toLocaleString()} BDT</span>
            </div>
            <div className="flex justify-between text-zinc-900 font-extrabold text-sm pt-1">
              <span>Total Paid</span>
              <span>{invoice.total.toLocaleString()} BDT</span>
            </div>
          </div>
        </div>

        {/* Footer Notes */}
        <div className="border-t border-zinc-200 pt-6 mt-8 flex justify-between items-center">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>This is a computer generated invoice. No signature required.</span>
          </div>
          <span className="text-xs font-bold text-violet-600 tracking-wider">THANK YOU FOR YOUR BUSINESS</span>
        </div>

      </div>
    </div>
  );
}
