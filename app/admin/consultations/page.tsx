'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Calendar, 
  Search, 
  Filter, 
  Eye, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  PhoneCall, 
  User, 
  Mail, 
  Phone, 
  Building2, 
  FileText, 
  RefreshCw,
  X,
  Save,
  MessageSquare
} from 'lucide-react';
import { API_BASE_URL } from '@/app/utils/api';

interface ConsultationItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companyName?: string | null;
  serviceType: string;
  budget?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  message: string;
  status: 'PENDING' | 'CONTACTED' | 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
  internalNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminConsultationsPage() {
  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination & Filtering
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Selected item modal
  const [selectedItem, setSelectedItem] = useState<ConsultationItem | null>(null);
  const [internalNotesText, setInternalNotesText] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  // Delete confirmation modal
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('apex_user_token');
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        search,
        status: statusFilter
      });

      const response = await fetch(`${API_BASE_URL}/api/consultations?${queryParams.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to fetch consultation bookings');
      }

      setConsultations(resData.data.consultations || []);
      setTotalPages(resData.data.pagination.totalPages || 1);
      setTotalCount(resData.data.pagination.total || 0);
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingStatusId(id);
    try {
      const token = localStorage.getItem('apex_user_token');
      const response = await fetch(`${API_BASE_URL}/api/consultations/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update status');

      // Refresh list
      setConsultations(prev => prev.map(item => item.id === id ? { ...item, status: newStatus as any } : item));
      if (selectedItem && selectedItem.id === id) {
        setSelectedItem(prev => prev ? { ...prev, status: newStatus as any } : null);
      }

      window.dispatchEvent(new CustomEvent('apex-admin-toast', { detail: `Status updated to ${newStatus}` }));
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleSaveNotes = async () => {
    if (!selectedItem) return;
    setSavingNotes(true);
    try {
      const token = localStorage.getItem('apex_user_token');
      const response = await fetch(`${API_BASE_URL}/api/consultations/${selectedItem.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ internalNotes: internalNotesText })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to save notes');

      setConsultations(prev => prev.map(item => item.id === selectedItem.id ? { ...item, internalNotes: internalNotesText } : item));
      setSelectedItem(prev => prev ? { ...prev, internalNotes: internalNotesText } : null);

      window.dispatchEvent(new CustomEvent('apex-admin-toast', { detail: 'Internal notes saved successfully' }));
    } catch (err: any) {
      alert(err.message || 'Failed to save notes');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem('apex_user_token');
      const response = await fetch(`${API_BASE_URL}/api/consultations/${deleteTargetId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete request');

      setConsultations(prev => prev.filter(item => item.id !== deleteTargetId));
      if (selectedItem?.id === deleteTargetId) {
        setSelectedItem(null);
      }
      setDeleteTargetId(null);

      window.dispatchEvent(new CustomEvent('apex-admin-toast', { detail: 'Consultation request deleted' }));
    } catch (err: any) {
      alert(err.message || 'Failed to delete request');
    } finally {
      setDeleting(false);
    }
  };

  const openDetailModal = (item: ConsultationItem) => {
    setSelectedItem(item);
    setInternalNotesText(item.internalNotes || '');
  };

  // Quick stats calculation
  const pendingCount = consultations.filter(c => c.status === 'PENDING').length;
  const contactedCount = consultations.filter(c => c.status === 'CONTACTED' || c.status === 'SCHEDULED').length;
  const completedCount = consultations.filter(c => c.status === 'COMPLETED').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold border border-amber-500/20">
            <Clock className="w-3 h-3" />
            <span>Pending</span>
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[11px] font-bold border border-blue-500/20">
            <PhoneCall className="w-3 h-3" />
            <span>Contacted</span>
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[11px] font-bold border border-purple-500/20">
            <Calendar className="w-3 h-3" />
            <span>Scheduled</span>
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3" />
            <span>Completed</span>
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 text-[11px] font-bold border border-rose-500/20">
            <XCircle className="w-3 h-3" />
            <span>Cancelled</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full p-4 sm:p-8 space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Calendar className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-zinc-950 dark:text-white tracking-tight">
              Free Consultation Management
            </h1>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Review, schedule and respond to client discovery call requests in real-time.
          </p>
        </div>

        <button
          onClick={() => fetchConsultations()}
          className="self-start sm:self-auto px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 text-xs font-semibold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors flex items-center gap-2 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Total Bookings</p>
          <p className="text-2xl font-extrabold text-zinc-950 dark:text-white">{totalCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-amber-500">Pending Review</p>
          <p className="text-2xl font-extrabold text-amber-500">{pendingCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-purple-500">Contacted / Scheduled</p>
          <p className="text-2xl font-extrabold text-purple-500">{contactedCount}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-500">Completed Sessions</p>
          <p className="text-2xl font-extrabold text-emerald-500">{completedCount}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, email, phone, or service..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/30"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-xs font-bold text-zinc-600 dark:text-zinc-400">Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONTACTED">Contacted</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Consultations Table */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-zinc-400">Loading consultation requests...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-500 text-xs font-semibold">
            {error}
          </div>
        ) : consultations.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <MessageSquare className="w-8 h-8 text-zinc-400 mx-auto opacity-50" />
            <p className="text-sm font-extrabold text-zinc-800 dark:text-zinc-200">No consultation requests found</p>
            <p className="text-xs text-zinc-400">Try adjusting your search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                  <th className="py-3.5 px-4">Client Info</th>
                  <th className="py-3.5 px-4">Service Type</th>
                  <th className="py-3.5 px-4">Budget Range</th>
                  <th className="py-3.5 px-4">Preferred Slot</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Date Submitted</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 text-xs">
                {consultations.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-850/40 transition-colors">
                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <p className="font-extrabold text-zinc-950 dark:text-white">{item.fullName}</p>
                        <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">{item.email}</p>
                        <p className="text-zinc-400 text-[11px] font-mono">{item.phone}</p>
                        {item.companyName && (
                          <span className="inline-block text-[10px] text-purple-600 dark:text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded mt-0.5">
                            {item.companyName}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-bold text-zinc-900 dark:text-zinc-100">
                      {item.serviceType}
                    </td>
                    <td className="py-4 px-4 font-semibold text-emerald-600 dark:text-emerald-400">
                      {item.budget || '—'}
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-0.5 text-[11px]">
                        <p className="font-bold text-zinc-800 dark:text-zinc-200">{item.preferredDate || 'Flexible'}</p>
                        <p className="text-zinc-400">{item.preferredTime || 'Anytime'}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <select
                        disabled={updatingStatusId === item.id}
                        value={item.status}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-xs font-bold text-zinc-900 dark:text-white cursor-pointer outline-none focus:ring-2 focus:ring-purple-500/40"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="CONTACTED">CONTACTED</option>
                        <option value="SCHEDULED">SCHEDULED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-zinc-500 dark:text-zinc-400 text-[11px] font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openDetailModal(item)}
                          className="p-2 rounded-lg text-purple-600 dark:text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer"
                          title="View Full Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetId(item.id)}
                          className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Request"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs">
            <span className="text-zinc-500 font-medium">Page {page} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 font-bold"
              >
                Previous
              </button>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 disabled:opacity-40 font-bold"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl animate-fadeIn">
            
            <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest font-mono">
                  CONSULTATION REQUEST
                </span>
                <h2 className="text-xl font-extrabold text-zinc-950 dark:text-white">
                  {selectedItem.fullName}
                </h2>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Status bar */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/60 dark:border-zinc-800/60">
              <div>
                <p className="text-[11px] text-zinc-400 font-bold">Current Status</p>
                {getStatusBadge(selectedItem.status)}
              </div>
              <div>
                <p className="text-[11px] text-zinc-400 font-bold text-right">Date Submitted</p>
                <p className="text-xs font-mono font-bold text-zinc-800 dark:text-zinc-200">
                  {new Date(selectedItem.createdAt).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 space-y-1">
                <p className="text-zinc-400 font-bold flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-purple-500" /> Email Address
                </p>
                <a href={`mailto:${selectedItem.email}`} className="font-bold text-purple-600 dark:text-purple-400 hover:underline block">
                  {selectedItem.email}
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 space-y-1">
                <p className="text-zinc-400 font-bold flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-emerald-500" /> Phone / WhatsApp
                </p>
                <a href={`https://wa.me/${selectedItem.phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="font-bold text-zinc-900 dark:text-white hover:underline block">
                  {selectedItem.phone}
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 space-y-1">
                <p className="text-zinc-400 font-bold flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" /> Company Name
                </p>
                <p className="font-bold text-zinc-900 dark:text-white">
                  {selectedItem.companyName || 'N/A (Individual)'}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 space-y-1">
                <p className="text-zinc-400 font-bold flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-amber-500" /> Service Requested
                </p>
                <p className="font-bold text-zinc-900 dark:text-white">
                  {selectedItem.serviceType}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 space-y-1">
                <p className="text-zinc-400 font-bold flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" /> Preferred Meeting Slot
                </p>
                <p className="font-bold text-zinc-900 dark:text-white">
                  {selectedItem.preferredDate || 'Flexible'} ({selectedItem.preferredTime})
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-50/60 dark:bg-zinc-950/60 border border-zinc-100 dark:border-zinc-800 space-y-1">
                <p className="text-zinc-400 font-bold flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-500" /> Estimated Budget Range
                </p>
                <p className="font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedItem.budget || 'Undecided'}
                </p>
              </div>
            </div>

            {/* Client Requirements Message */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Client Project Overview / Requirements:
              </label>
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
                {selectedItem.message}
              </div>
            </div>

            {/* Admin Internal Notes */}
            <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300 flex items-center justify-between">
                <span>Admin Internal Notes (Private):</span>
                {savingNotes && <span className="text-[11px] text-purple-500 font-semibold animate-pulse">Saving...</span>}
              </label>
              <textarea
                rows={3}
                value={internalNotesText}
                onChange={(e) => setInternalNotesText(e.target.value)}
                placeholder="Add private notes about client call, assigned engineer, Google Meet link, etc..."
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500/40"
              />
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Notes</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-2xl animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-extrabold text-zinc-950 dark:text-white">Delete Request?</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Are you sure you want to delete this consultation request? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteTargetId(null)}
                className="w-1/2 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="w-1/2 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
