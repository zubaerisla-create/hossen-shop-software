'use client';

import React, { useEffect, useState } from 'react';
import { CustomDeal, ChatMessage } from '../../types';
import { getDeals, saveDeals, getChats, saveChats } from '../../utils/storage';
import { useRouter } from 'next/navigation';
import { UploadCloud } from 'lucide-react';
import { showSuccessAlert, showErrorAlert, showSuccessToast, showErrorToast } from '../../utils/alert';

export default function UserDealsPage() {
  const [deals, setDeals] = useState<CustomDeal[]>([]);
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [showRequestForm, setShowRequestForm] = useState(false);
  const router = useRouter();

  // Custom Project Form fields
  const [dealTitle, setDealTitle] = useState('');
  const [dealDesc, setDealDesc] = useState('');
  const [dealType, setDealType] = useState('Web Application');
  const [dealBudget, setDealBudget] = useState(50000);
  const [dealDeadline, setDealDeadline] = useState('2026-08-30');
  const [dealTech, setDealTech] = useState('');
  const [dealPriority, setDealPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');

  useEffect(() => {
    setDeals(getDeals());
    setChatMessages(getChats());

    // Check for imported estimates
    const imported = localStorage.getItem('apex_imported_estimate');
    if (imported) {
      const data = JSON.parse(imported);
      setDealTitle(data.title);
      setDealDesc(data.desc);
      setDealBudget(data.budget);
      setDealTech(data.tech);
      localStorage.removeItem('apex_imported_estimate');
      setShowRequestForm(true);
      triggerToast('AI estimation imported successfully! Complete the form.');
    }
  }, []);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-user-toast', { detail: text });
    window.dispatchEvent(event);
  };

  const handleSubmitDeal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!dealTitle || !dealDesc) return;

    if (dealDesc.length < 10) {
      showErrorToast('Description must be at least 10 characters.');
      return;
    }

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      showErrorToast('Authentication required. Please log in.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/deals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: dealTitle,
          description: dealDesc,
          projectType: dealType,
          budget: dealBudget,
          deadline: dealDeadline,
          technology: dealTech,
          priority: dealPriority
        })
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to submit requirements.');
      }

      const createdDeal = resData.data.deal;

      // Update local state with the deal generated from the database
      const updatedDeals = [...deals, createdDeal];
      saveDeals(updatedDeals);
      setDeals(updatedDeals);

      // Reset inputs
      setDealTitle('');
      setDealDesc('');
      setDealTech('');
      setShowRequestForm(false);

      showSuccessAlert('Requirements Submitted!', 'Your project requirements have been successfully filed. Our engineers will review it and issue a proposal/quotation shortly.');
      router.push(`/user/deals/${createdDeal.id}`);
    } catch (err: any) {
      console.error(err);
      showErrorAlert('Submission Failed', err.message || 'Failed to submit requirements.');
    }
  };

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      <div className="flex flex-col flex-1">
        <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white uppercase tracking-tight">Custom Project Requests</h2>
            <p className="text-zinc-500 text-[10px]">Track customized developments, sign contracts electronically, and manage milestones.</p>
          </div>

          <button
            onClick={() => {
              setShowRequestForm(!showRequestForm);
              if (showRequestForm) {
                setDealTitle('');
                setDealDesc('');
                setDealTech('');
              }
            }}
            className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2 rounded font-bold transition-all text-[11px] cursor-pointer"
          >
            {showRequestForm ? '← Back to Projects List' : 'Start a New Custom Project'}
          </button>
        </div>

        <div className="p-6 md:p-8 space-y-6 flex-1">
          {showRequestForm ? (
            <div className="bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 p-6 rounded space-y-4 w-full">
              <div className="border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <h3 className="text-sm font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Start A Custom Project</h3>
                <p className="text-zinc-500 text-[10px]">Fill the form to get a detailed quotation from our engineers.</p>
              </div>

              <form onSubmit={handleSubmitDeal} className="space-y-4">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Project Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. E-Commerce Backend System" 
                    value={dealTitle} 
                    onChange={(e) => setDealTitle(e.target.value)} 
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none" 
                  />
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Scope of Requirements</label>
                  <textarea 
                    rows={6} 
                    required 
                    placeholder="Detailed specifications list..." 
                    value={dealDesc} 
                    onChange={(e) => setDealDesc(e.target.value)} 
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded p-3 text-xs resize-none focus:outline-none" 
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Platform Type</label>
                    <select 
                      value={dealType} 
                      onChange={(e) => setDealType(e.target.value)} 
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none font-sans"
                    >
                      <option>Web Application</option>
                      <option>Full Website</option>
                      <option>Mobile App</option>
                      <option>SaaS Project</option>
                      <option>UI/UX Design</option>
                      <option>AI automation node</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Target Budget (BDT)</label>
                    <input 
                      type="number" 
                      required 
                      value={dealBudget} 
                      onChange={(e) => setDealBudget(Number(e.target.value))} 
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Technologies tags (comma separated)</label>
                  <input 
                    type="text" 
                    placeholder="React, Node.js, Postgres" 
                    value={dealTech} 
                    onChange={(e) => setDealTech(e.target.value)} 
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none" 
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={() => {
                      setShowRequestForm(false);
                      setDealTitle('');
                      setDealDesc('');
                      setDealTech('');
                    }} 
                    className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded font-bold hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors text-xs cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold transition-colors cursor-pointer text-xs"
                  >
                    Submit Requirements
                  </button>
                </div>
              </form>
            </div>
          ) : (
            deals.length === 0 ? (
              <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded p-12 text-center space-y-4">
                <p className="text-zinc-500 text-xs">No custom projects requested yet.</p>
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2 rounded font-bold text-xs cursor-pointer"
                >
                  Request Custom Proposal
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-900 text-zinc-500 dark:text-zinc-400 uppercase font-bold text-[9px] tracking-wider">
                      <th className="p-4">Project ID</th>
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
                          <div className="flex items-center gap-2">
                            {d.unreadPortal && (
                              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0 animate-duration-1000" title="New notification from Admin" />
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
                              ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-450'
                              : d.priority === 'High'
                              ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-450'
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
                              ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-450'
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
                            onClick={() => router.push(`/user/deals/${d.id}`)}
                            className="bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-3 py-1.5 rounded font-bold text-[10px] transition-colors cursor-pointer"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
