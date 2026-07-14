'use client';

import React, { useState, useEffect } from 'react';
import { Users, Search, Edit2, Trash2, X, Check, Loader2, AlertCircle, Calendar, Shield, Mail, User } from 'lucide-react';
import { API_BASE_URL } from '@/app/utils/api';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'CUSTOMER';
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [editingUser, setEditingUser] = useState<UserItem | null>(null);
  const [viewingUser, setViewingUser] = useState<UserItem | null>(null);
  const [deletingUser, setDeletingUser] = useState<UserItem | null>(null);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<'ADMIN' | 'CUSTOMER'>('CUSTOMER');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const showToast = (message: string) => {
    window.dispatchEvent(new CustomEvent('apex-admin-toast', { detail: message }));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('apex_user_token');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data?.users) {
          setUsers(data.data.users);
        } else {
          setError('Failed to retrieve user list.');
        }
      } else {
        setError('Unauthorized or database fetch failed.');
      }
    } catch (err) {
      setError('Network error occurred while fetching users.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (user: UserItem) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
  };

  const handleCloseEdit = () => {
    setEditingUser(null);
    setEditName('');
    setEditEmail('');
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser || !editName.trim() || !editEmail.trim()) return;

    setIsUpdating(true);
    const token = localStorage.getItem('apex_user_token');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users/${editingUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: editName.trim(),
          email: editEmail.trim().toLowerCase(),
          role: editRole
        })
      });

      if (res.ok) {
        const result = await res.json();
        if (result.status === 'success') {
          showToast('User profile updated successfully.');
          fetchUsers();
          handleCloseEdit();
        } else {
          showToast(result.message || 'Failed to update user.');
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || 'Error occurred during update.');
      }
    } catch (err) {
      showToast('Network error while updating user.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setIsDeleting(true);
    const token = localStorage.getItem('apex_user_token');

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/users/${deletingUser.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        showToast('User account successfully deleted.');
        fetchUsers();
        setDeletingUser(null);
      } else {
        const errData = await res.json().catch(() => ({}));
        showToast(errData.message || 'Failed to delete user.');
      }
    } catch (err) {
      showToast('Network error while deleting user.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredUsers = users.filter((u) => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 p-6 md:p-10 w-full space-y-8">
      
      {/* Header and Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-850 pb-5">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-950 dark:text-white flex items-center gap-2.5">
            <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            User Management
          </h1>
          <p className="text-xs text-zinc-500 font-medium mt-1">
            Monitor, view profiles, edit access credentials, and manage roles of registered users.
          </p>
        </div>

        {/* User Search & Stats */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-450 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all w-60"
            />
          </div>
          <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] font-mono px-2.5 py-1.5 rounded-lg text-zinc-500">
            Total: {filteredUsers.length}
          </div>
        </div>
      </div>

      {/* Main Error Alert */}
      {error && (
        <div className="flex items-start gap-3 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 p-4 rounded-xl text-rose-600 text-xs font-semibold shadow-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div className="flex-1">
            <p>{error}</p>
            <button onClick={fetchUsers} className="mt-2 text-rose-700 dark:text-rose-400 underline hover:no-underline cursor-pointer">
              Retry fetching users
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white dark:bg-zinc-955 border border-zinc-200/80 dark:border-zinc-900/80 rounded-xl overflow-hidden shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_30px_-6px_rgba(0,0,0,0.3)]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-purple-600 dark:text-purple-400 animate-spin" />
            <p className="text-xs font-semibold text-zinc-500 animate-pulse">Syncing user database...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center space-y-2">
            <Users className="w-10 h-10 text-zinc-300 dark:text-zinc-700" />
            <p className="text-sm font-bold text-zinc-800 dark:text-zinc-250">No users found</p>
            <p className="text-xs text-zinc-500 max-w-sm">No users match your query or register to the database.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50/80 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-900 font-bold text-zinc-650 dark:text-zinc-400 uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Created At</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900 font-semibold text-zinc-900 dark:text-zinc-150">
                {filteredUsers.map((user) => {
                  const initial = user.name.charAt(0).toUpperCase();
                  const isAdmin = user.role === 'ADMIN';
                  return (
                    <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20 transition-colors">
                      {/* User Profiling */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold shadow-sm ${
                            isAdmin 
                              ? 'bg-gradient-to-tr from-purple-650 to-indigo-500 text-white' 
                              : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
                          }`}>
                            {initial}
                          </div>
                          <div>
                            <span className="font-bold text-[13px] block text-zinc-950 dark:text-white">{user.name}</span>
                            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono">ID: {user.id.substring(0, 8)}...</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 font-mono text-[11px] text-zinc-600 dark:text-zinc-400">
                        {user.email}
                      </td>

                      {/* Role Pill */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold tracking-wide uppercase ${
                          isAdmin 
                            ? 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-900/30'
                            : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-650 dark:text-emerald-455 border border-emerald-200/50 dark:border-emerald-900/30'
                        }`}>
                          <Shield className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>

                      {/* Created Date */}
                      <td className="px-6 py-4 text-zinc-500 dark:text-zinc-450">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setViewingUser(user)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-950 dark:hover:text-white transition-all cursor-pointer"
                            title="View user details"
                          >
                            <User className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(user)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-blue-600 hover:text-blue-700 transition-all cursor-pointer"
                            title="Edit user role"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-rose-600 hover:text-rose-700 transition-all cursor-pointer"
                            title="Delete user account"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-850 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
              <h3 className="font-bold text-sm text-zinc-950 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-purple-500" />
                User Profile Details
              </h3>
              <button onClick={() => setViewingUser(null)} className="p-1 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-semibold">
              <div className="flex items-center gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-black shadow ${
                  viewingUser.role === 'ADMIN' 
                    ? 'bg-gradient-to-tr from-purple-650 to-indigo-500 text-white' 
                    : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white'
                }`}>
                  {viewingUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-zinc-950 dark:text-white">{viewingUser.name}</h4>
                  <span className="text-[10px] text-zinc-400 font-mono">ID: {viewingUser.id}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-zinc-550">
                  <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Address</span>
                  <span className="font-mono text-zinc-950 dark:text-white select-all">{viewingUser.email}</span>
                </div>

                <div className="flex items-center justify-between text-zinc-550">
                  <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Account Role</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                    viewingUser.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-800'
                  }`}>{viewingUser.role}</span>
                </div>

                <div className="flex items-center justify-between text-zinc-550">
                  <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Join Date</span>
                  <span className="text-zinc-950 dark:text-white">{formatDate(viewingUser.createdAt)}</span>
                </div>
              </div>

              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
                <button
                  onClick={() => setViewingUser(null)}
                  className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded-lg cursor-pointer transition-colors"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <form onSubmit={handleUpdateUser} className="bg-white dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-850 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/30">
              <h3 className="font-bold text-sm text-zinc-955 dark:text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-blue-500" />
                Edit Account Settings
              </h3>
              <button type="button" onClick={handleCloseEdit} className="p-1 text-zinc-400 hover:text-zinc-650 dark:hover:text-zinc-200 transition-colors cursor-pointer">
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs font-bold text-zinc-700 dark:text-zinc-300">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Full Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-850 rounded-lg bg-zinc-50 dark:bg-zinc-950 text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-semibold"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Email Address</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-zinc-200 dark:border-zinc-850 rounded-lg bg-zinc-50 dark:bg-zinc-955 text-zinc-950 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-semibold"
                />
              </div>

              {/* Account Role Selector */}
              <div className="space-y-1.5">
                <label className="block text-[11px] uppercase tracking-wider text-zinc-450 dark:text-zinc-500">Account Access Role</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditRole('CUSTOMER')}
                    className={`px-4 py-3 rounded-lg border text-center transition-all cursor-pointer font-extrabold uppercase tracking-wide text-[10px] ${
                      editRole === 'CUSTOMER'
                        ? 'border-emerald-500 bg-emerald-50/40 text-emerald-650'
                        : 'border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole('ADMIN')}
                    className={`px-4 py-3 rounded-lg border text-center transition-all cursor-pointer font-extrabold uppercase tracking-wide text-[10px] ${
                      editRole === 'ADMIN'
                        ? 'border-purple-500 bg-purple-50/40 text-purple-650'
                        : 'border-zinc-200 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500'
                    }`}
                  >
                    Administrator
                  </button>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-750 text-white rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow"
                >
                  {isUpdating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUpdating ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Delete User Modal */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-955 border border-zinc-250 dark:border-zinc-850 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/20 text-rose-600 flex items-center justify-center mx-auto">
                <AlertCircle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-bold text-sm text-zinc-950 dark:text-white">Delete User Account?</h3>
                <p className="text-xs text-zinc-500 font-medium mt-1.5 max-w-xs mx-auto">
                  Are you sure you want to permanently delete the account for <strong className="text-zinc-800 dark:text-zinc-350">{deletingUser.name}</strong> ({deletingUser.email})? This action is irreversible.
                </p>
              </div>

              <div className="pt-2 flex justify-center gap-3 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-rose-650 hover:bg-rose-700 text-white rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow"
                >
                  {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isDeleting ? 'Deleting...' : 'Confirm Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
