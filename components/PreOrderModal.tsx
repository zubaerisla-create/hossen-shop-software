'use client';

import React, { useState, useEffect } from 'react';
import { X, Shield, DollarSign, Building, MapPin, Mail, Phone, User, Globe, MessageSquare } from 'lucide-react';
import { API_BASE_URL } from '@/app/utils/api';
import { showSuccessAlert, showErrorAlert } from '@/app/utils/alert';

interface PreOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  productName?: string;
  productPrice?: number;
}

export default function PreOrderModal({ isOpen, onClose, productName = '', productPrice = 0 }: PreOrderModalProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    companyName: '',
    productName: productName,
    budget: productPrice ? productPrice.toString() : '',
    address: '',
    country: '',
    message: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Autofill name and email if user is logged in
  useEffect(() => {
    if (isOpen) {
      const storedName = localStorage.getItem('apex_user_name') || '';
      const storedEmail = localStorage.getItem('apex_user_email') || '';
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || storedName,
        email: prev.email || storedEmail,
        productName: productName,
        budget: prev.budget || (productPrice ? productPrice.toString() : '')
      }));
      setErrors({});
    }
  }, [isOpen, productName, productPrice]);

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = () => {
    const tempErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      tempErrors.fullName = 'Full name is required';
    }

    if (!formData.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      tempErrors.email = 'Invalid email address format';
    }

    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^\+?[0-9\s\-()]{7,20}$/.test(formData.phone)) {
      tempErrors.phone = 'Invalid phone number format (7-20 digits/symbols)';
    }

    if (!formData.budget.trim()) {
      tempErrors.budget = 'Budget is required';
    } else {
      const budgetNum = Number(formData.budget);
      if (isNaN(budgetNum) || budgetNum <= 0) {
        tempErrors.budget = 'Budget must be a positive numeric value';
      }
    }

    if (!formData.address.trim()) {
      tempErrors.address = 'Address is required';
    }

    if (!formData.country.trim()) {
      tempErrors.country = 'Country is required';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/pre-orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          budget: Number(formData.budget)
        })
      });

      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData.message || 'Submission failed');
      }

      showSuccessAlert(
        'Request Received!',
        'Your pre-order/license request has been saved. A confirmation email has been dispatched, and our licensing specialists will get back to you shortly.'
      );
      onClose();
    } catch (err: any) {
      console.error(err);
      showErrorAlert(
        'Submission Failed',
        err.message || 'An error occurred while submitting your pre-order request. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white dark:bg-[#121214] border border-zinc-200 dark:border-zinc-800 w-full max-w-2xl rounded-2xl shadow-2xl relative font-sans animate-scaleIn my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer z-10 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="bg-zinc-50 dark:bg-zinc-950/80 p-6 border-b border-zinc-200 dark:border-zinc-850 rounded-t-2xl flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-950/40 p-2.5 rounded-lg text-purple-650 dark:text-purple-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-extrabold text-base text-zinc-950 dark:text-white tracking-tight">Pre-Order &amp; License Request</h2>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
              Submit your request and our sales team will draft custom licensing agreements and coordinates.
            </p>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className={`w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 border rounded-lg p-3 text-xs font-semibold focus:outline-none focus:ring-1 transition-all ${
                  errors.fullName 
                    ? 'border-rose-500 focus:ring-rose-500' 
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 focus:ring-zinc-400'
                }`}
              />
              {errors.fullName && <p className="text-rose-500 text-[10px] font-semibold mt-0.5">{errors.fullName}</p>}
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="johndoe@example.com"
                className={`w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 border rounded-lg p-3 text-xs font-semibold focus:outline-none focus:ring-1 transition-all ${
                  errors.email 
                    ? 'border-rose-500 focus:ring-rose-500' 
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 focus:ring-zinc-400'
                }`}
              />
              {errors.email && <p className="text-rose-500 text-[10px] font-semibold mt-0.5">{errors.email}</p>}
            </div>

            {/* Phone Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" /> Phone Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 019-2834"
                className={`w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 border rounded-lg p-3 text-xs font-semibold focus:outline-none focus:ring-1 transition-all ${
                  errors.phone 
                    ? 'border-rose-500 focus:ring-rose-500' 
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 focus:ring-zinc-400'
                }`}
              />
              {errors.phone && <p className="text-rose-500 text-[10px] font-semibold mt-0.5">{errors.phone}</p>}
            </div>

            {/* Company Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Company Name <span className="text-zinc-450 dark:text-zinc-600 font-normal text-[9px]">(Optional)</span>
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Acme Corp"
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-400 rounded-lg p-3 text-xs font-semibold focus:outline-none transition-all"
              />
            </div>

            {/* Product/License Name */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5" /> Product/License Name
              </label>
              <input
                type="text"
                name="productName"
                value={formData.productName}
                onChange={handleChange}
                placeholder="Custom Software License"
                className="w-full bg-zinc-55 dark:bg-zinc-900/60 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-400 rounded-lg p-3 text-xs font-semibold focus:outline-none transition-all"
              />
            </div>

            {/* Budget */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5" /> Budget (USD) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="499"
                className={`w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 border rounded-lg p-3 text-xs font-semibold focus:outline-none focus:ring-1 transition-all ${
                  errors.budget 
                    ? 'border-rose-500 focus:ring-rose-500' 
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 focus:ring-zinc-400'
                }`}
              />
              {errors.budget && <p className="text-rose-500 text-[10px] font-semibold mt-0.5">{errors.budget}</p>}
            </div>

            {/* Address */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" /> Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="123 Main St, Suite 400"
                className={`w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 border rounded-lg p-3 text-xs font-semibold focus:outline-none focus:ring-1 transition-all ${
                  errors.address 
                    ? 'border-rose-500 focus:ring-rose-500' 
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 focus:ring-zinc-400'
                }`}
              />
              {errors.address && <p className="text-rose-500 text-[10px] font-semibold mt-0.5">{errors.address}</p>}
            </div>

            {/* Country */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Country <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="United States"
                className={`w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 border rounded-lg p-3 text-xs font-semibold focus:outline-none focus:ring-1 transition-all ${
                  errors.country 
                    ? 'border-rose-500 focus:ring-rose-500' 
                    : 'border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 focus:ring-zinc-400'
                }`}
              />
              {errors.country && <p className="text-rose-500 text-[10px] font-semibold mt-0.5">{errors.country}</p>}
            </div>

            {/* Additional Requirements / Message */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5" /> Additional Requirements / Message <span className="text-zinc-450 dark:text-zinc-600 font-normal text-[9px]">(Optional)</span>
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Detail any hosting setup, specific customization request, branding requirements, etc."
                className="w-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-zinc-650 border border-zinc-200 dark:border-zinc-800 focus:border-zinc-400 dark:focus:border-zinc-700 focus:ring-1 focus:ring-zinc-400 rounded-lg p-3 text-xs font-semibold focus:outline-none min-h-[80px] resize-y transition-all"
              />
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-850">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-zinc-100 hover:bg-zinc-250 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-lg uppercase tracking-wider text-[10px] cursor-pointer transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-purple-650 hover:bg-purple-700 dark:bg-purple-650 dark:hover:bg-purple-600 text-white font-extrabold rounded-lg uppercase tracking-wider text-[10px] cursor-pointer shadow-md transition-all hover:scale-[1.02] active:scale-100 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-400 border-t-white animate-spin"></span>
                  Submitting...
                </>
              ) : (
                'Submit Pre-Order'
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
