'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, Calendar, Trash2, Edit, Eye, Filter, ChevronLeft, ChevronRight, X, User, Mail, Phone, DollarSign, Building, MapPin, Globe, MessageSquare, Clipboard } from 'lucide-react';
import { API_BASE_URL } from '@/app/utils/api';
import Swal from 'sweetalert2';

interface PreOrder {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companyName: string | null;
  productName: string | null;
  budget: number;
  address: string;
  country: string;
  message: string | null;
  status: 'PENDING' | 'CONTACTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  internalNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminPreOrdersPage() {
  const router = useRouter();
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Detail / Edit modal
  const [selectedRequest, setSelectedRequest] = useState<PreOrder | null>(null);
  const [editStatus, setEditStatus] = useState<'PENDING' | 'CONTACTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'>('PENDING');
  const [editNotes, setEditNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchPreOrders = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const url = new URL(`${API_BASE_URL}/api/pre-orders`);
      url.searchParams.append('page', page.toString());
      url.searchParams.append('limit', limit.toString());
      if (searchQuery) url.searchParams.append('search', searchQuery);
      if (statusFilter) url.searchParams.append('status', statusFilter);

      const res = await fetch(url.toString(), {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setPreOrders(data.data?.preOrders || []);
        const pagination = data.data?.pagination || {};
        setTotalPages(pagination.totalPages || 1);
        setTotalItems(pagination.total || 0);
      }
    } catch (err) {
      console.error('Failed to fetch pre-orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page, limit, searchQuery, statusFilter, router]);

  useEffect(() => {
    fetchPreOrders();
  }, [fetchPreOrders]);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-admin-toast', { detail: text });
    window.dispatchEvent(event);
  };

  const handleOpenDetail = (request: PreOrder) => {
    setSelectedRequest(request);
    setEditStatus(request.status);
    setEditNotes(request.internalNotes || '');
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setIsUpdating(true);
    const token = localStorage.getItem('apex_user_token');
    
    try {
      const res = await fetch(`${API_BASE_URL}/api/pre-orders/${selectedRequest.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          status: editStatus,
          internalNotes: editNotes
        })
      });

      if (res.ok) {
        triggerToast('Request details updated successfully.');
        setSelectedRequest(null);
        fetchPreOrders();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to update request');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while updating the request');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async (id: string) => {
    const token = localStorage.getItem('apex_user_token');
    
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This pre-order request will be permanently deleted from the database.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#71717a',
      confirmButtonText: 'Yes, delete it!'
    });

    if (!result.isConfirmed) return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/pre-orders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        triggerToast('Request deleted successfully.');
        if (selectedRequest?.id === id) {
          setSelectedRequest(null);
        }
        fetchPreOrders();
      } else {
        alert('Failed to delete pre-order request.');
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred while deleting the request.');
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-amber-100 text-amber-800 border-amber-250 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900';
      case 'CONTACTED':
        return 'bg-blue-100 text-blue-800 border-blue-250 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800 border-purple-250 dark:bg-purple-950/40 dark:text-purple-400 dark:border-purple-900';
      case 'COMPLETED':
        return 'bg-emerald-105 text-emerald-800 border-emerald-250 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900';
      case 'CANCELLED':
        return 'bg-rose-100 text-rose-800 border-rose-250 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900';
      default:
        return 'bg-zinc-100 text-zinc-800 border-zinc-250 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700';
    }
  };

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      
      {/* Header */}
      <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Pre-Order Requests</h2>
          <p className="text-zinc-500 text-[10px]">Track licensing requests, lead statuses, custom software purchases, and customer notes.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="pl-3 pr-8 py-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors cursor-pointer appearance-none"
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="CONTACTED">Contacted</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <Filter className="absolute right-2.5 top-2.5 w-3 h-3 text-zinc-400 pointer-events-none" />
          </div>

          {/* Search Query */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-400" />
            <input
              type="text"
              placeholder="Search pre-orders..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-2 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1">
        
        {/* Table & Content */}
        {loading ? (
          <div className="p-12 text-center text-zinc-500 font-bold animate-pulse">
            Fetching preorder requests...
          </div>
        ) : preOrders.length > 0 ? (
          <div className="space-y-4">
            <div className="border border-zinc-200 dark:border-zinc-900 rounded-lg overflow-hidden bg-white dark:bg-zinc-950 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs whitespace-nowrap">
                  <thead>
                    <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-900 text-zinc-500 font-bold uppercase text-[9px] tracking-wider">
                      <th className="p-4">Request ID</th>
                      <th className="p-4">Product/License</th>
                      <th className="p-4">Customer Name</th>
                      <th className="p-4">Contact Info</th>
                      <th className="p-4">Budget</th>
                      <th className="p-4">Country</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Created Date</th>
                      <th className="p-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preOrders.map((request) => (
                      <tr 
                        key={request.id} 
                        className="border-b border-zinc-200 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300 transition-colors"
                      >
                        <td className="p-4 font-mono font-bold text-zinc-450">{request.id.substring(0, 8).toUpperCase()}</td>
                        <td className="p-4">
                          <span className="font-bold text-zinc-955 dark:text-white block max-w-[180px] truncate">
                            {request.productName || 'Custom Request'}
                          </span>
                        </td>
                        <td className="p-4 font-semibold text-zinc-950 dark:text-white">{request.fullName}</td>
                        <td className="p-4">
                          <div className="space-y-0.5 font-medium">
                            <span className="text-zinc-800 dark:text-zinc-300 block">{request.email}</span>
                            <span className="text-[10px] text-zinc-500 block">{request.phone}</span>
                          </div>
                        </td>
                        <td className="p-4 font-bold text-zinc-955 dark:text-white font-mono">
                          ${request.budget.toLocaleString()}
                        </td>
                        <td className="p-4">{request.country}</td>
                        <td className="p-4">
                          <span className={`border text-[8px] px-2 py-0.5 rounded font-extrabold uppercase ${getStatusBadgeClass(request.status)}`}>
                            {request.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 text-zinc-500 font-medium">
                            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            <span>{new Date(request.createdAt).toISOString().split('T')[0]}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handleOpenDetail(request)}
                              className="bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-750 dark:text-zinc-300 p-1.5 rounded cursor-pointer transition-all flex items-center gap-1 font-bold text-[10px]"
                              title="View & Edit Status"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </button>
                            <button
                              onClick={() => handleDelete(request.id)}
                              className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-455 border border-rose-200/50 dark:border-rose-900/50 p-1.5 rounded cursor-pointer transition-colors"
                              title="Delete Request"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-zinc-200 dark:border-zinc-900 pt-4 text-zinc-500 font-bold">
                <div>
                  Showing page {page} of {totalPages} ({totalItems} total requests)
                </div>
                <div className="flex items-center gap-1">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-2 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    className="p-2 border border-zinc-200 dark:border-zinc-800 rounded hover:bg-zinc-50 dark:hover:bg-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="border border-zinc-200 dark:border-zinc-900 rounded-lg p-12 bg-zinc-50 dark:bg-zinc-900/10 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mx-auto text-zinc-400">
              <Package className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-zinc-950 dark:text-white text-sm">No Pre-Orders Yet</h3>
              <p className="text-zinc-500 max-w-sm mx-auto leading-relaxed">
                No buy-license or pre-order requests have been submitted. Submissions will display here once users fill out the pre-order modal.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Details & Status Edit Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl relative font-sans animate-scaleIn my-8">
            
            <button
              onClick={() => setSelectedRequest(null)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer z-10 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div className="bg-zinc-50 dark:bg-zinc-950/80 p-6 border-b border-zinc-200 dark:border-zinc-850 rounded-t-2xl flex items-center gap-3">
              <div className="bg-purple-100 dark:bg-purple-950/40 p-2.5 rounded-lg text-purple-650 dark:text-purple-400">
                <Clipboard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-zinc-950 dark:text-white tracking-tight">Pre-Order Details</h3>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">Request ID: {selectedRequest.id}</p>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdate} className="p-6 space-y-6">
              
              {/* Request Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-zinc-50 dark:bg-zinc-950/60 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900">
                
                <div className="space-y-1">
                  <span className="text-zinc-450 dark:text-zinc-550 block font-bold text-[9px] uppercase tracking-wider">Product/License</span>
                  <span className="font-bold text-zinc-950 dark:text-white flex items-center gap-1.5">
                    <Package className="w-3.5 h-3.5 text-zinc-400" />
                    {selectedRequest.productName || 'Custom Request'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-450 dark:text-zinc-550 block font-bold text-[9px] uppercase tracking-wider">Proposed Budget</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {selectedRequest.budget.toLocaleString()} USD
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-450 dark:text-zinc-550 block font-bold text-[9px] uppercase tracking-wider">Customer Name</span>
                  <span className="font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-zinc-400" />
                    {selectedRequest.fullName}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-450 dark:text-zinc-550 block font-bold text-[9px] uppercase tracking-wider">Company</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-300 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-zinc-400" />
                    {selectedRequest.companyName || '—'}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-450 dark:text-zinc-550 block font-bold text-[9px] uppercase tracking-wider">Email Address</span>
                  <span className="font-semibold text-zinc-850 dark:text-zinc-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-zinc-400" />
                    <a href={`mailto:${selectedRequest.email}`} className="hover:underline text-purple-650 dark:text-purple-400">{selectedRequest.email}</a>
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-450 dark:text-zinc-550 block font-bold text-[9px] uppercase tracking-wider">Phone Number</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    {selectedRequest.phone}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-450 dark:text-zinc-550 block font-bold text-[9px] uppercase tracking-wider">Country</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-300 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-zinc-400" />
                    {selectedRequest.country}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-zinc-450 dark:text-zinc-550 block font-bold text-[9px] uppercase tracking-wider">Submission Date</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    {new Date(selectedRequest.createdAt).toLocaleString()}
                  </span>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <span className="text-zinc-450 dark:text-zinc-550 block font-bold text-[9px] uppercase tracking-wider">Billing/Deployment Address</span>
                  <span className="font-semibold text-zinc-800 dark:text-zinc-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                    {selectedRequest.address}
                  </span>
                </div>

                {selectedRequest.message && (
                  <div className="space-y-1.5 md:col-span-2 pt-2 border-t border-zinc-200/50 dark:border-zinc-900/50">
                    <span className="text-zinc-450 dark:text-zinc-550 block font-bold text-[9px] uppercase tracking-wider flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                      Client Message
                    </span>
                    <p className="bg-white dark:bg-zinc-950 p-3 rounded-lg border border-zinc-150 dark:border-zinc-900 text-zinc-700 dark:text-zinc-350 leading-relaxed font-medium font-sans whitespace-pre-wrap">
                      {selectedRequest.message}
                    </p>
                  </div>
                )}

              </div>

              {/* Status Update Fields */}
              <div className="space-y-4 pt-2">
                <h4 className="font-bold text-zinc-950 dark:text-white uppercase tracking-wider text-[10px]">Processing Actions</h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5 md:col-span-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Request Status</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value as any)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded-lg p-2.5 text-xs font-bold focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 cursor-pointer"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="CONTACTED">Contacted</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="COMPLETED">Completed</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Internal Notes</label>
                    <textarea
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Add private staff comments or follow-up milestones here..."
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-700 rounded-lg p-2.5 text-xs font-semibold focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 min-h-[60px] resize-y"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={() => handleDelete(selectedRequest.id)}
                  className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-200/40 dark:border-rose-900/40 font-bold rounded-lg uppercase tracking-wider text-[10px] cursor-pointer transition-colors"
                >
                  Delete Request
                </button>
                
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    disabled={isUpdating}
                    className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-lg uppercase tracking-wider text-[10px] cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-6 py-2.5 bg-purple-650 hover:bg-purple-700 dark:bg-purple-650 dark:hover:bg-purple-600 text-white font-extrabold rounded-lg uppercase tracking-wider text-[10px] cursor-pointer shadow-md transition-all hover:scale-[1.01] active:scale-100 disabled:opacity-50"
                  >
                    {isUpdating ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
