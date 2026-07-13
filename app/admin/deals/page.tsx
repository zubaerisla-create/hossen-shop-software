'use client';

import React, { useEffect, useState } from 'react';
import { CustomDeal } from '../../types';
import { getDeals, saveDeals } from '../../utils/storage';
import { useRouter } from 'next/navigation';

export default function AdminDealsPage() {
  const [deals, setDeals] = useState<CustomDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchDeals = async () => {
      const token = localStorage.getItem('apex_user_token');
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/api/deals', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const resData = await response.json();
          if (response.ok && resData.data?.deals) {
            setDeals(resData.data.deals);
            saveDeals(resData.data.deals);
            setLoading(false);
            return;
          }
        } catch (err) {
          console.error('Failed to fetch deals from database:', err);
        }
      }
      setDeals(getDeals());
      setLoading(false);
    };

    fetchDeals();
  }, []);

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      <div className="flex flex-col flex-1">
        {/* Sticky Header */}
        <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Custom Deals Dashboard</h2>
            <p className="text-zinc-500 text-[10px]">Review client inquiries, submit proposals, assign developers, and deliver builds.</p>
          </div>
        </div>

        {/* Table view */}
        <div className="p-6 md:p-8 flex-1">
          {loading ? (
            <div className="bg-zinc-50 dark:bg-zinc-900/25 border border-zinc-200 dark:border-zinc-800 rounded py-12 text-center text-zinc-500 animate-pulse">
              Loading deals from database...
            </div>
          ) : deals.length === 0 ? (
            <div className="bg-zinc-50 dark:bg-zinc-900/25 border border-zinc-200 dark:border-zinc-800 rounded py-12 text-center text-zinc-500">
              No custom deals found. Open Customer Portal and submit requirement form!
            </div>
          ) : (
            <div className="overflow-x-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-900 text-zinc-500 dark:text-zinc-400 uppercase font-bold text-[9px] tracking-wider">
                    <th className="p-4">Project ID</th>
                    <th className="p-4">Client Name</th>
                    <th className="p-4">Title & Type</th>
                    <th className="p-4 text-right">Target Budget</th>
                    <th className="p-4">Deadline</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Progress</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900">
                  {deals.map(d => (
                    <tr key={d.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                      <td className="p-4 font-mono font-bold text-zinc-400">{d.id}</td>
                      <td className="p-4">
                        <span className="font-semibold text-zinc-950 dark:text-white block">{d.customer?.name || 'John Doe'}</span>
                        <span className="text-[10px] text-zinc-500 block">{d.customer?.email || 'john@example.com'}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {d.unreadAdmin && (
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0 animate-duration-1000" title="New activity from Client" />
                          )}
                          <div>
                            <span className="font-bold text-zinc-950 dark:text-white block">{d.title}</span>
                            <span className="text-[10px] text-zinc-500">{d.projectType}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right font-bold text-zinc-950 dark:text-white">
                        {d.budget.toLocaleString()} BDT
                      </td>
                      <td className="p-4 text-zinc-600 dark:text-zinc-400">{d.deadline}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          d.priority === 'Urgent'
                            ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-455'
                            : d.priority === 'High'
                            ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-455'
                            : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400'
                        }`}>
                          {d.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="w-24 space-y-1">
                          <div className="flex justify-between text-[8px] text-zinc-500 font-bold">
                            <span>{d.overallProgress}%</span>
                          </div>
                          <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded overflow-hidden">
                            <div className="h-full bg-zinc-900 dark:bg-white" style={{ width: `${d.overallProgress}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                          d.status === 'Completed' || d.status === 'Delivered'
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : d.status === 'Quotation Sent'
                            ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400'
                            : d.status === 'In Development'
                            ? 'bg-sky-50 dark:bg-sky-500/10 text-sky-600 dark:text-sky-400'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400'
                        }`}>
                          {d.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => router.push(`/admin/deals/${d.id}`)}
                          className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-3 py-1.5 rounded font-bold text-[10px] transition-colors cursor-pointer"
                        >
                          Control Workspace
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
