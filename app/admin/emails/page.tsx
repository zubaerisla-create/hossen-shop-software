'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Send, Users, UserPlus, CheckSquare, Square, AlertCircle, CheckCircle2, XCircle, Loader2, Clock, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '@/app/utils/api';

interface RegisteredUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface ScheduledEmail {
  id: string;
  recipient: string;
  subject: string;
  message: string;
  sendAt: string;
  status: 'PENDING' | 'SENT' | 'FAILED';
  error?: string | null;
  createdAt: string;
}

export default function AdminEmailsPage() {
  // Input fields
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [manualEmails, setManualEmails] = useState('');
  const [delayValue, setDelayValue] = useState<number>(0);
  const [delayUnit, setDelayUnit] = useState<'minutes' | 'hours'>('minutes');
  
  // Selection mode: 'users' or 'manual'
  const [recipientMode, setRecipientMode] = useState<'users' | 'manual'>('users');
  
  // Registered users state
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);

  // Queue Monitor State
  const [queue, setQueue] = useState<ScheduledEmail[]>([]);
  const [isLoadingQueue, setIsLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState<string | null>(null);

  // Sending states
  const [isSending, setIsSending] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Fetch users & queue on mount
  useEffect(() => {
    fetchUsers();
    fetchQueue();
  }, []);

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    setUsersError(null);
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
          setSelectedUserIds(new Set(data.data.users.map((u: RegisteredUser) => u.id)));
        } else {
          setUsersError('Failed to parse registered users list.');
        }
      } else {
        setUsersError('Failed to retrieve registered users.');
      }
    } catch (err) {
      setUsersError('Network error occurred while fetching users.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const fetchQueue = async () => {
    setIsLoadingQueue(true);
    setQueueError(null);
    const token = localStorage.getItem('apex_user_token');

    try {
      const res = await fetch(`${API_BASE_URL}/api/emails/scheduled`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data?.emails) {
          setQueue(data.data.emails);
        } else {
          setQueueError('Failed to parse scheduled email queue.');
        }
      } else {
        setQueueError('Failed to load scheduled email queue.');
      }
    } catch (err) {
      setQueueError('Network error occurred while fetching queue.');
    } finally {
      setIsLoadingQueue(false);
    }
  };

  // Toggle individual user selection
  const toggleUserSelection = (userId: string) => {
    const nextSelected = new Set(selectedUserIds);
    if (nextSelected.has(userId)) {
      nextSelected.delete(userId);
    } else {
      nextSelected.add(userId);
    }
    setSelectedUserIds(nextSelected);
  };

  // Toggle select all users
  const toggleSelectAll = () => {
    if (selectedUserIds.size === users.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(users.map(u => u.id)));
    }
  };

  // Cancel / Delete scheduled email
  const handleCancelEmail = async (id: string) => {
    if (!confirm('Are you sure you want to cancel this scheduled email?')) return;
    
    const token = localStorage.getItem('apex_user_token');
    try {
      const res = await fetch(`${API_BASE_URL}/api/emails/scheduled/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        // Remove from local queue
        setQueue(prev => prev.filter(item => item.id !== id));
        alert('Scheduled email cancelled successfully.');
      } else {
        const data = await res.json();
        alert(data.message || 'Failed to cancel scheduled email.');
      }
    } catch (err) {
      alert('Error occurred while cancelling scheduled email.');
    }
  };

  // Submit email campaign
  const handleSendCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);
    setSuccessMsg(null);

    // Resolve recipients list
    let recipients: string[] = [];

    if (recipientMode === 'users') {
      const selectedUsers = users.filter(u => selectedUserIds.has(u.id));
      recipients = selectedUsers.map(u => u.email);
    } else {
      recipients = manualEmails
        .split(/[\n,;]+/)
        .map(email => email.trim())
        .filter(email => email.length > 0 && email.includes('@'));
    }

    if (recipients.length === 0) {
      setGeneralError('Please specify at least one valid recipient email address.');
      return;
    }

    if (!subject.trim()) {
      setGeneralError('Email subject line is required.');
      return;
    }

    if (!message.trim()) {
      setGeneralError('Email body message is required.');
      return;
    }

    setIsSending(true);
    const token = localStorage.getItem('apex_user_token');

    try {
      const res = await fetch(`${API_BASE_URL}/api/emails/send-bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          recipients,
          subject: subject.trim(),
          message: message.trim(),
          delayValue: Number(delayValue),
          delayUnit
        })
      });

      const resData = await res.json();

      if (res.ok && resData.status === 'success') {
        setSuccessMsg(resData.message || `Campaign successfully queued for delivery.`);
        setSubject('');
        setMessage('');
        setManualEmails('');
        setDelayValue(0);
        // Refresh queue
        fetchQueue();
      } else {
        setGeneralError(resData.message || 'An error occurred while launching email campaign.');
      }
    } catch (err) {
      setGeneralError('Network error occurred while launching email campaign.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 p-6 md:p-10 w-full space-y-8">
      
      {/* Title Header Banner */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight text-zinc-950 dark:text-white flex items-center gap-3">
          <Mail className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          Email Campaigns
        </h1>
        <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed font-semibold">
          Compose, stagger, schedule, and monitor email campaigns. Deliver announcements to custom email lists or registered users.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Compose Section */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-zinc-50/50 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-850 p-6 rounded-xl space-y-5">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-zinc-850 dark:text-zinc-250 flex items-center gap-2">
              <Send className="w-4 h-4 text-purple-500" />
              Compose Scheduled Campaign
            </h3>

            <form onSubmit={handleSendCampaign} className="space-y-4">
              
              {/* Recipient Selection Mode */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Recipients Target</label>
                <div className="flex gap-2 bg-zinc-100 dark:bg-zinc-950 p-1 border border-zinc-200 dark:border-zinc-850 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setRecipientMode('users')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                      recipientMode === 'users'
                        ? 'bg-zinc-950 text-white dark:bg-zinc-900 dark:text-white'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>Registered Users</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientMode('manual')}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded text-xs font-bold transition-all cursor-pointer ${
                      recipientMode === 'manual'
                        ? 'bg-zinc-950 text-white dark:bg-zinc-900 dark:text-white'
                        : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
                    }`}
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Manual Input</span>
                  </button>
                </div>
              </div>

              {/* Manual Email Input Textarea */}
              {recipientMode === 'manual' && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Recipient Emails</label>
                  <textarea
                    rows={4}
                    placeholder="Enter email addresses separated by commas, semicolons, or newlines (e.g. client1@gmail.com, client2@example.com)"
                    value={manualEmails}
                    onChange={(e) => setManualEmails(e.target.value)}
                    required
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs rounded-lg p-3 font-semibold focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <span className="text-[9px] text-zinc-400 block leading-normal">
                    Emails are parsed dynamically. Make sure each contains a valid @ character.
                  </span>
                </div>
              )}

              {/* Subject Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Email Subject</label>
                <input
                  type="text"
                  placeholder="e.g. Major Platform Update & Maintenance Notice"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs rounded-lg px-3 py-2.5 font-semibold focus:outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              {/* Staggered Delay / Serial Queue Settings */}
              <div className="bg-purple-50/20 dark:bg-purple-950/5 border border-purple-100 dark:border-purple-900/30 p-4 rounded-xl space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">Staggered Delivery Interval</h4>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 leading-normal font-semibold">
                  Specify the interval delay between each email. Emails will be sent one-by-one in serial order. Set to 0 to send all immediately.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-450 block">Delay Interval Value</label>
                    <input
                      type="number"
                      min={0}
                      value={delayValue}
                      onChange={(e) => setDelayValue(Math.max(0, parseInt(e.target.value) || 0))}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs rounded-lg px-3 py-2 font-semibold focus:outline-none focus:border-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] uppercase font-bold text-zinc-450 block">Delay Unit</label>
                    <select
                      value={delayUnit}
                      onChange={(e: any) => setDelayUnit(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs rounded-lg px-3 py-2.5 font-semibold focus:outline-none focus:border-purple-500 cursor-pointer"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Body Message Input */}
              <div className="space-y-1.5">
                <label className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 block">Message Body</label>
                <textarea
                  rows={9}
                  placeholder="Type your message content here. This message will be formatted into a high-quality announcement email with Hosen Software Shop logo and structure."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs rounded-lg p-3 font-semibold focus:outline-none focus:border-purple-500 transition-colors leading-relaxed"
                />
              </div>

              {/* Error messages */}
              {generalError && (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 p-3 rounded-lg flex items-start gap-2.5 text-xs text-red-650 dark:text-red-400 font-semibold">
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{generalError}</span>
                </div>
              )}

              {/* Success messages */}
              {successMsg && (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50 p-3 rounded-lg flex items-start gap-2.5 text-xs text-emerald-650 dark:text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSending}
                className="w-full bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black font-extrabold py-3 px-4 rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Scheduling Queue...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Schedule Campaign ({recipientMode === 'users' ? selectedUserIds.size : 'Manual'} target(s))</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Registered Users Selection List */}
        <div className="lg:col-span-5 space-y-6">
          
          {recipientMode === 'users' ? (
            <div className="border border-zinc-200 dark:border-zinc-850 rounded-xl overflow-hidden bg-zinc-50/20 dark:bg-zinc-900/5 flex flex-col h-[525px]">
              
              {/* Header block */}
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-850 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">Select Users</h4>
                  <span className="text-[10px] text-zinc-500 font-medium">Selected: {selectedUserIds.size} / {users.length}</span>
                </div>
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  disabled={users.length === 0}
                  className="bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase transition-all cursor-pointer disabled:opacity-50"
                >
                  {selectedUserIds.size === users.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Users scroll container */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                {isLoadingUsers ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-2 text-zinc-400">
                    <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                    <span className="text-[10px] font-semibold uppercase tracking-wider">Loading Accounts...</span>
                  </div>
                ) : usersError ? (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4 space-y-2 text-zinc-450">
                    <AlertCircle className="w-8 h-8 text-rose-500" />
                    <span className="text-xs font-semibold text-rose-600">{usersError}</span>
                    <button
                      onClick={fetchUsers}
                      className="text-[10px] font-bold text-purple-500 underline uppercase"
                    >
                      Retry
                    </button>
                  </div>
                ) : users.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-zinc-450 text-center p-4">
                    <Users className="w-8 h-8 text-zinc-300 mb-2" />
                    <span className="text-xs font-semibold">No registered users found.</span>
                  </div>
                ) : (
                  users.map((user) => {
                    const isSelected = selectedUserIds.has(user.id);
                    return (
                      <div
                        key={user.id}
                        onClick={() => toggleUserSelection(user.id)}
                        className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-all select-none ${
                          isSelected
                            ? 'bg-purple-50/50 dark:bg-purple-950/10 border-purple-200 dark:border-purple-900/30'
                            : 'bg-white dark:bg-zinc-950 border-zinc-150 dark:border-zinc-850 hover:bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <button type="button" className="text-purple-600 dark:text-purple-400">
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-400" />
                            )}
                          </button>
                          <div className="min-w-0">
                            <h5 className="text-xs font-bold text-zinc-900 dark:text-white truncate">{user.name}</h5>
                            <span className="text-[10px] text-zinc-440 dark:text-zinc-500 block truncate font-mono">{user.email}</span>
                          </div>
                        </div>
                        <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded border uppercase shrink-0 ${
                          user.role === 'ADMIN'
                            ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30'
                            : 'bg-zinc-100 border-zinc-200 text-zinc-500 dark:bg-zinc-900 dark:border-zinc-800'
                        }`}>
                          {user.role}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

            </div>
          ) : (
            <div className="border border-zinc-200 dark:border-zinc-850 rounded-xl p-5 bg-zinc-50/20 dark:bg-zinc-900/5 space-y-4">
              <h4 className="font-extrabold text-xs text-zinc-850 dark:text-zinc-250 uppercase tracking-wider flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-zinc-400" />
                Manual Campaign mode
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed font-semibold">
                You have selected manual input mode. You can enter any list of recipient email addresses. This is perfect for mailing leads, prospective clients, or developers who haven't registered an account yet.
              </p>
              <div className="p-3.5 bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg text-[10px] text-zinc-450 leading-normal">
                <strong>Format Guidelines:</strong><br />
                - Separate multiple emails using new lines, commas, or semicolons.<br />
                - Example:<br />
                <span className="font-mono text-zinc-500 block mt-1">
                  shakil@gmail.com,<br />
                  rakib@yahoo.com;<br />
                  tanvir@hosenshop.com
                </span>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* Queue Monitoring Section */}
      <div className="border border-zinc-200 dark:border-zinc-850 rounded-xl p-6 bg-zinc-50/10 dark:bg-zinc-900/5 space-y-5">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="font-black text-sm uppercase tracking-wider text-zinc-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4.5 h-4.5 text-purple-600 dark:text-purple-400" />
              Campaign Staggered Queue Monitor
            </h3>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-semibold leading-normal">
              Track the exact scheduled date, current delivery status, and errors for queued campaigns in real time.
            </p>
          </div>
          <button
            type="button"
            onClick={fetchQueue}
            className="bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-extrabold px-3 py-1.5 rounded uppercase tracking-wide transition-all cursor-pointer"
          >
            Refresh Queue
          </button>
        </div>

        {isLoadingQueue ? (
          <div className="flex items-center justify-center py-10 text-zinc-450 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
            <span className="text-[10px] uppercase font-bold tracking-wider">Refreshing Queue...</span>
          </div>
        ) : queueError ? (
          <div className="text-center py-8 text-rose-500 text-xs font-semibold">{queueError}</div>
        ) : queue.length === 0 ? (
          <div className="text-center py-10 text-zinc-450 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-semibold">
            No scheduled or sent emails exist in the campaign log.
          </div>
        ) : (
          <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-850 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-850 text-zinc-500 text-[9px] uppercase font-bold tracking-wider">
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Scheduled Delivery</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-850 bg-white dark:bg-[#070708]">
                {queue.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                    <td className="p-3.5 font-semibold text-zinc-800 dark:text-zinc-200">{item.recipient}</td>
                    <td className="p-3.5 max-w-[200px] truncate text-zinc-500 dark:text-zinc-400">{item.subject}</td>
                    <td className="p-3.5 font-mono text-[10px] text-zinc-550 dark:text-zinc-400">
                      {new Date(item.sendAt).toLocaleString()}
                    </td>
                    <td className="p-3.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[8px] font-extrabold uppercase border ${
                        item.status === 'SENT'
                          ? 'bg-emerald-50 border-emerald-100 text-emerald-600 dark:bg-emerald-950/20 dark:border-emerald-900/30'
                          : item.status === 'FAILED'
                          ? 'bg-rose-50 border-rose-100 text-rose-600 dark:bg-rose-950/20 dark:border-rose-900/30'
                          : 'bg-amber-50 border-amber-100 text-amber-600 dark:bg-amber-950/20 dark:border-amber-900/30'
                      }`}>
                        {item.status === 'SENT' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {item.status === 'FAILED' && <XCircle className="w-2.5 h-2.5" />}
                        {item.status === 'PENDING' && <Clock className="w-2.5 h-2.5" />}
                        {item.status}
                      </span>
                      {item.error && (
                        <p className="text-[8px] text-rose-500 mt-1 font-mono max-w-[220px] truncate leading-normal" title={item.error}>
                          Err: {item.error}
                        </p>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      {item.status === 'PENDING' ? (
                        <button
                          onClick={() => handleCancelEmail(item.id)}
                          className="text-rose-600 hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 p-1.5 rounded transition-all cursor-pointer"
                          title="Cancel scheduled delivery"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-zinc-400 dark:text-zinc-600 text-[10px] font-medium">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
