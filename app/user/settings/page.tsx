'use client';

import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Lock, Shield, Bell, CheckCircle2, Save, Eye, EyeOff } from 'lucide-react';
import { showSuccessAlert, showErrorAlert, showSuccessToast, showErrorToast } from '../../utils/alert';

export default function UserSettingsPage() {
  // Profile state
  const [name, setName] = useState('John Doe (Demo)');
  const [email, setEmail] = useState('john.doe@example.com');
  const [phone, setPhone] = useState('+880 1711 000000');
  const [avatar, setAvatar] = useState('');
  
  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Toggles for password visibility
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Notification toggles
  const [notifyMilestones, setNotifyMilestones] = useState(true);
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem('apex_user_token');
      if (!token) return;
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const resData = await response.json();
        if (response.ok && resData.data?.user) {
          const user = resData.data.user;
          setName(user.name);
          setEmail(user.email);
          setAvatar(user.avatar || '');
          localStorage.setItem('apex_user_name', user.name);
          localStorage.setItem('apex_user_email', user.email);
          localStorage.setItem('apex_user_avatar', user.avatar || '');
          dispatchProfileUpdate();
        }
      } catch (err) {
        console.error('Failed to fetch profile from backend:', err);
      }
    };

    fetchUserProfile();

    // Load initial values from localStorage
    const storedPhone = localStorage.getItem('apex_user_phone');
    const storedAvatar = localStorage.getItem('apex_user_avatar');
    const storedMilestones = localStorage.getItem('apex_notify_milestones');
    const storedWhatsApp = localStorage.getItem('apex_notify_whatsapp');

    if (storedPhone) setPhone(storedPhone);
    if (storedAvatar) setAvatar(storedAvatar);
    if (storedMilestones !== null) setNotifyMilestones(storedMilestones === 'true');
    if (storedWhatsApp !== null) setNotifyWhatsApp(storedWhatsApp === 'true');
  }, []);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-user-toast', { detail: text });
    window.dispatchEvent(event);
  };

  const dispatchProfileUpdate = () => {
    const event = new Event('apex-user-profile-update');
    window.dispatchEvent(event);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      showErrorToast('Error: Authentication token missing.');
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, email, avatar }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to update profile');
      }

      // Persist profile in storage
      localStorage.setItem('apex_user_name', name);
      localStorage.setItem('apex_user_email', email);
      localStorage.setItem('apex_user_avatar', avatar);
      localStorage.setItem('apex_user_phone', phone);
      
      // Persist notifications
      localStorage.setItem('apex_notify_milestones', String(notifyMilestones));
      localStorage.setItem('apex_notify_whatsapp', String(notifyWhatsApp));

      showSuccessAlert('Profile Saved!', 'Your account profile settings have been updated successfully.');
      dispatchProfileUpdate();

    } catch (err: any) {
      console.error(err);
      showErrorAlert('Profile Update Failed', err?.message || 'Failed to save profile details.');
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showErrorToast('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      showErrorToast('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      showErrorToast('Confirm password does not match new password.');
      return;
    }

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      showErrorToast('Error: Authentication token missing.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/update-profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Failed to update password');
      }

      showSuccessAlert('Password Updated!', 'Your account password has been changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

    } catch (err: any) {
      console.error(err);
      showErrorAlert('Password Update Failed', err?.message || 'Failed to update password.');
    }
  };

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      {/* Page Header */}
      <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900">
        <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Account Settings</h2>
        <p className="text-zinc-500 text-[10px]">Manage your profile information, password credentials, and dashboard configurations.</p>
      </div>

      <div className="p-6 md:p-8 space-y-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Forms */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Form 1: Profile Details */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center gap-2">
                <User className="w-4 h-4 text-zinc-500" />
                <h3 className="font-bold text-zinc-950 dark:text-white uppercase tracking-wider text-[10px]">Profile Configuration</h3>
              </div>
              
              <form onSubmit={handleProfileSave} className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-650" />
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-650" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-650" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Profile Avatar URL</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
                      {avatar ? (
                        <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-3 h-3 text-zinc-400" />
                      )}
                    </div>
                    <input
                      type="url"
                      placeholder="https://example.com/avatar.jpg"
                      value={avatar}
                      onChange={(e) => setAvatar(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all"
                    />
                  </div>
                </div>

                <div className="border-t border-zinc-100 dark:border-zinc-900 pt-4 space-y-3">
                  <span className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Alerts & Notifications</span>
                  
                  <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10">
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">Milestone Status E-mails</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Receive immediate progress digests when engineering tasks complete.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifyMilestones(!notifyMilestones)}
                      className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
                        notifyMilestones ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'
                      }`}
                    >
                      <div
                        className={`bg-white dark:bg-zinc-950 w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                          notifyMilestones ? 'translate-x-4 dark:bg-zinc-950' : 'translate-x-0 dark:bg-zinc-300'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200/80 dark:border-zinc-850 bg-zinc-50/50 dark:bg-zinc-900/10">
                    <div>
                      <p className="font-bold text-zinc-800 dark:text-zinc-200 text-xs">WhatsApp Direct Messages</p>
                      <p className="text-[10px] text-zinc-500 mt-0.5">Opt-in to get contract proposals and quotation alerts on your phone.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifyWhatsApp(!notifyWhatsApp)}
                      className={`w-10 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all duration-300 ${
                        notifyWhatsApp ? 'bg-zinc-900 dark:bg-white' : 'bg-zinc-200 dark:bg-zinc-800'
                      }`}
                    >
                      <div
                        className={`bg-white dark:bg-zinc-950 w-4 h-4 rounded-full shadow-md transform transition-all duration-300 ${
                          notifyWhatsApp ? 'translate-x-4 dark:bg-zinc-950' : 'translate-x-0 dark:bg-zinc-300'
                        }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Profile Details
                  </button>
                </div>
              </form>
            </div>

            {/* Form 2: Change Password */}
            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-xl overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-900/10 flex items-center gap-2">
                <Lock className="w-4 h-4 text-zinc-500" />
                <h3 className="font-bold text-zinc-950 dark:text-white uppercase tracking-wider text-[10px]">Change Password</h3>
              </div>
              
              <form onSubmit={handlePasswordSave} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Current Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-650" />
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                    >
                      {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-650" />
                      <input
                        type={showNew ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                      >
                        {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-650" />
                      <input
                        type={showConfirm ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-9 pr-10 py-2.5 bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-zinc-400 dark:focus:ring-zinc-700 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 cursor-pointer"
                      >
                        {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    <Save className="w-3.5 h-3.5" /> Update Security Credentials
                  </button>
                </div>
              </form>
            </div>
            
          </div>

          {/* Right Column: Profile Summary & Security Level */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Profile Overview Card */}
            <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 p-5 rounded-lg space-y-4">
              <div className="flex flex-col items-center py-4 border-b border-zinc-200 dark:border-zinc-900 text-center space-y-3">
                {avatar ? (
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700 shadow-md">
                    <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-full bg-zinc-950 dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xl uppercase shadow-md select-none">
                    {name.charAt(0)}
                  </div>
                )}
                <div className="space-y-0.5">
                  <span className="font-extrabold text-sm text-zinc-950 dark:text-white block">{name}</span>
                  <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Client Role Profile</span>
                </div>
              </div>

              <div className="space-y-2.5 text-[11px] leading-normal text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Node Identifier:</span>
                  <span className="font-mono text-zinc-900 dark:text-white font-bold">usr_demo_client_node</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Created:</span>
                  <span className="font-bold text-zinc-900 dark:text-white">2026-07-01</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Security Clearance:</span>
                  <span className="font-bold text-emerald-600">Standard Customer</span>
                </div>
              </div>
            </div>

            {/* Security Audit Badge */}
            <div className="bg-zinc-50 dark:bg-[#121214] border border-zinc-200 dark:border-zinc-900 p-5 rounded-lg space-y-3 text-zinc-500 font-medium">
              <div className="font-bold text-zinc-900 dark:text-white uppercase tracking-wider text-[8px] flex items-center gap-1.5 border-b border-zinc-200 dark:border-zinc-800 pb-2">
                <Shield className="w-4 h-4 text-emerald-500 animate-pulse" />
                <span>Security Shield Active</span>
              </div>
              <p className="leading-relaxed text-[10.5px]">
                Your session is authorized via demo mock keys. Password modifications are simulated locally for security assurance.
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
