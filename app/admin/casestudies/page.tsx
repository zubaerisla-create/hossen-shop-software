'use client';

import React, { useEffect, useState } from 'react';
import { CaseStudy, Product } from '../../types';
import Swal from 'sweetalert2';
import { showSuccessAlert, showErrorAlert, showSuccessToast, showErrorToast } from '../../utils/alert';
import { API_BASE_URL } from '@/app/utils/api';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  X, 
  Image as ImageIcon,
  Briefcase,
  Link as LinkIcon,
  ExternalLink
} from 'lucide-react';

export default function AdminCaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Selected items
  const [editingCS, setEditingCS] = useState<CaseStudy | null>(null);
  const [viewingCS, setViewingCS] = useState<CaseStudy | null>(null);

  // Form Fields States
  const [formTitle, setFormTitle] = useState('');
  const [formType, setFormType] = useState('Web App');
  const [formImage, setFormImage] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formProductId, setFormProductId] = useState('');

  const [uploadingImage, setUploadingImage] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch Case Studies
      const csRes = await fetch(`${API_BASE_URL}/api/casestudies`);
      if (csRes.ok) {
        const csData = await csRes.json();
        if (csData.status === 'success' && csData.data && csData.data.caseStudies) {
          setCaseStudies(csData.data.caseStudies);
        }
      }

      // Fetch Products (for the dropdown link selection)
      const pRes = await fetch(`${API_BASE_URL}/api/products`);
      if (pRes.ok) {
        const pData = await pRes.json();
        if (pData.status === 'success' && pData.data && pData.data.products) {
          setProducts(pData.data.products);
        }
      }
    } catch (err) {
      console.error('Failed to fetch admin case study page data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      showErrorToast('Authentication token not found. Please log in.');
      return;
    }

    setUploadingImage(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Upload failed');
      }

      setFormImage(resData.url);
      showSuccessToast('Image uploaded successfully!');
    } catch (err: any) {
      console.error(err);
      showErrorAlert('Upload Failed', err.message || 'Failed to upload image.');
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  const openAddModal = () => {
    setIsEditMode(false);
    setEditingCS(null);
    setFormTitle('');
    setFormType('Web App');
    setFormImage('https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=600&q=80');
    setFormDesc('');
    setFormProductId('');
    setShowModal(true);
  };

  const openEditModal = (cs: CaseStudy) => {
    setIsEditMode(true);
    setEditingCS(cs);
    setFormTitle(cs.title);
    setFormType(cs.type);
    setFormImage(cs.image);
    setFormDesc(cs.desc);
    setFormProductId(cs.productId || '');
    setShowModal(true);
  };

  const openViewModal = (cs: CaseStudy) => {
    setViewingCS(cs);
    setShowViewModal(true);
  };

  const handleDeleteCS = async (id: string, title: string) => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete case study "${title}".`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#4b5563',
      background: isDark ? '#121214' : '#ffffff',
      color: isDark ? '#ffffff' : '#09090b',
    }).then(async (result) => {
      if (result.isConfirmed) {
        const token = localStorage.getItem('apex_user_token');
        if (!token) {
          showErrorToast('Authentication token not found. Please log in.');
          return;
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/casestudies/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            setCaseStudies(prev => prev.filter(c => c.id !== id));
            showSuccessToast('Case study deleted successfully.');
          } else {
            const resData = await response.json();
            throw new Error(resData.message || 'Failed to delete case study.');
          }
        } catch (err: any) {
          console.error(err);
          showErrorAlert('Delete Failed', err.message || 'Failed to delete case study.');
        }
      }
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showErrorToast('Case study title is required.');
      return;
    }
    if (formTitle.trim().length < 2) {
      showErrorToast('Case study title must be at least 2 characters.');
      return;
    }
    if (!formType.trim()) {
      showErrorToast('Type is required.');
      return;
    }
    if (!formDesc.trim()) {
      showErrorToast('Description is required.');
      return;
    }
    if (formDesc.trim().length < 5) {
      showErrorToast('Description must be at least 5 characters.');
      return;
    }

    if (!formImage.trim()) {
      showErrorToast('Cover image URL is required.');
      return;
    }
    try {
      new URL(formImage.trim());
    } catch (_) {
      showErrorToast('Cover image must be a valid URL.');
      return;
    }

    const payload = {
      title: formTitle.trim(),
      type: formType.trim(),
      image: formImage.trim(),
      desc: formDesc.trim(),
      productId: formProductId || null
    };

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      showErrorToast('Authentication token not found. Please log in.');
      return;
    }

    try {
      const url = isEditMode && editingCS 
        ? `${API_BASE_URL}/api/casestudies/${editingCS.id}`
        : `${API_BASE_URL}/api/casestudies`;
      
      const method = isEditMode && editingCS ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();

      if (!response.ok) {
        if (resData.errors && Array.isArray(resData.errors)) {
          const detailMsgs = resData.errors.map((err: any) => {
            const field = err.path.replace('body.', '');
            return `• ${field.charAt(0).toUpperCase() + field.slice(1)}: ${err.message}`;
          }).join('\n');
          throw new Error(`Validation failed:\n${detailMsgs}`);
        }
        throw new Error(resData.message || 'Failed to save case study.');
      }

      if (isEditMode) {
        showSuccessAlert('Case Study Updated!', 'The case study has been successfully modified.');
      } else {
        showSuccessAlert('Case Study Added!', 'The new case study has been successfully added.');
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      console.error(err);
      showErrorAlert('Operation Failed', err.message || 'Failed to save case study.');
    }
  };

  const getLinkedProductName = (prodId: string | null) => {
    if (!prodId) return 'None';
    const prod = products.find(p => p.id === prodId);
    return prod ? prod.name : 'Unknown Product';
  };

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      {/* Upper header */}
      <div className="sticky top-0 bg-white dark:bg-[#09090b] z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900 flex justify-between items-center transition-colors">
        <div>
          <h2 className="text-xl font-bold text-zinc-955 dark:text-white uppercase tracking-tight">Case Studies / Deployments</h2>
          <p className="text-zinc-500 text-[10px]">Add, edit, preview, and delete showcase-level case study deployments.</p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2 rounded font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors text-[11px]"
        >
          <Plus className="w-4 h-4" /> Add Case Study
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1 bg-white dark:bg-zinc-955 transition-colors">
        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-zinc-955 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[10px] font-bold text-zinc-400 mt-4 uppercase tracking-wider">Loading Case Studies...</p>
          </div>
        ) : (
          /* Case Studies Table */
          <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold tracking-wider text-[10px] bg-zinc-50 dark:bg-zinc-900/60">
                  <th className="p-4 w-[80px]">Preview</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Description</th>
                  <th className="p-4">Linked Template</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {caseStudies.length > 0 ? (
                  caseStudies.map((cs) => (
                    <tr key={cs.id} className="border-b border-zinc-200 dark:border-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-8 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={cs.image || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=150&q=80'} 
                            alt={cs.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-4 max-w-[200px] font-bold text-zinc-950 dark:text-white truncate" title={cs.title}>
                        {cs.title}
                      </td>
                      <td className="p-4">
                        <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-850 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded font-mono text-[9px]">
                          {cs.type}
                        </span>
                      </td>
                      <td className="p-4 max-w-[250px] text-zinc-500 dark:text-zinc-400 truncate font-semibold" title={cs.desc}>
                        {cs.desc}
                      </td>
                      <td className="p-4 text-zinc-800 dark:text-zinc-300 font-semibold max-w-[150px] truncate">
                        {cs.productId ? (
                          <span className="inline-flex items-center gap-1 text-purple-650 dark:text-purple-400">
                            <LinkIcon className="w-3 h-3" />
                            {getLinkedProductName(cs.productId)}
                          </span>
                        ) : (
                          <span className="text-zinc-400 dark:text-zinc-650 font-normal">None</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => openViewModal(cs)}
                            title="Preview Case Study"
                            className="text-zinc-650 hover:text-zinc-955 dark:text-zinc-400 dark:hover:text-white border border-zinc-255 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-850/80 p-1.5 rounded cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(cs)}
                            title="Edit Case Study"
                            className="text-zinc-650 hover:text-zinc-955 dark:text-zinc-400 dark:hover:text-white border border-zinc-255 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-850/80 p-1.5 rounded cursor-pointer transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteCS(cs.id, cs.title)}
                            title="Delete Case Study"
                            className="text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-zinc-255 dark:border-zinc-850 hover:border-rose-300 dark:hover:border-rose-900 p-1.5 rounded cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-450 dark:text-zinc-555 font-bold">
                      No case studies published yet. Click &quot;Add Case Study&quot; to add one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================== ADD / EDIT MODAL ==================== */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 w-full max-w-xl rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-zinc-955 dark:text-white">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    {isEditMode ? 'Modify Case Study' : 'Create Case Study'}
                  </h3>
                  <p className="text-[10px] text-zinc-550 dark:text-zinc-450">Set Title, Type, Description, Cover and related product link.</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0 bg-white dark:bg-[#0c0c0e]">
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  
                  <div>
                    <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Case Study Title *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. AuraShop - Minimalist Fashion Store" 
                      value={formTitle} 
                      onChange={(e) => setFormTitle(e.target.value)} 
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-255 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 font-bold" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Type/Category *</label>
                      <select
                        value={formType} 
                        onChange={(e) => setFormType(e.target.value)} 
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-255 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 font-semibold" 
                      >
                        <option value="Web App">Web App</option>
                        <option value="Mobile App">Mobile App</option>
                        <option value="Full Website">Full Website</option>
                        <option value="SaaS Platform">SaaS Platform</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Link to Marketplace Template</label>
                      <select
                        value={formProductId} 
                        onChange={(e) => setFormProductId(e.target.value)} 
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-255 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 font-semibold" 
                      >
                        <option value="">None (Display without marketplace link)</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-zinc-650 dark:text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Cover Image URL *</label>
                      <label className="text-[9px] text-zinc-950 dark:text-white font-bold hover:underline cursor-pointer flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={uploadingImage}
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <input 
                      type="url" 
                      required 
                      placeholder="https://images.unsplash.com/photo-..." 
                      value={formImage} 
                      onChange={(e) => setFormImage(e.target.value)} 
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-255 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 font-mono" 
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Deployment Summary / Description *</label>
                    <textarea 
                      rows={5} 
                      required 
                      placeholder="e.g. A real-time ride booking and vehicle rental platform handling 50k+ bookings." 
                      value={formDesc} 
                      onChange={(e) => setFormDesc(e.target.value)} 
                      className="w-full bg-white dark:bg-zinc-955 border border-zinc-255 dark:border-zinc-800 text-zinc-900 dark:text-white rounded p-3 text-xs resize-none focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 font-medium leading-relaxed" 
                    />
                  </div>

                </div>

                <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 bg-zinc-50 dark:bg-zinc-900/60">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 hover:border-zinc-450 text-zinc-700 dark:text-zinc-300 rounded font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold cursor-pointer"
                  >
                    Save Case Study
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== VIEW MODAL ==================== */}
        {showViewModal && viewingCS && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 w-full max-w-xl rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-zinc-955 dark:text-white">
              
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60">
                <span className="font-extrabold text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5" />
                  Case Study Preview
                </span>
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="text-zinc-405 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-2">
                  <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-850 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded font-mono text-[9px] font-bold uppercase tracking-wider">
                    {viewingCS.type}
                  </span>
                  <h1 className="text-xl md:text-2xl font-black uppercase text-zinc-950 dark:text-white tracking-tight">{viewingCS.title}</h1>
                  {viewingCS.productId && (
                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wide flex items-center gap-1">
                      <LinkIcon className="w-3.5 h-3.5" />
                      Linked Product: <span className="text-purple-650 dark:text-purple-400">{getLinkedProductName(viewingCS.productId)}</span>
                    </div>
                  )}
                </div>

                <div className="aspect-video rounded overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={viewingCS.image} alt={viewingCS.title} className="w-full h-full object-cover" />
                </div>

                <div className="space-y-2">
                  <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider block">Description</span>
                  <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold whitespace-pre-wrap text-[11px]">
                    {viewingCS.desc}
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end bg-zinc-50 dark:bg-zinc-900/60">
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="px-5 py-1.5 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold cursor-pointer text-[10px]"
                >
                  Close Preview
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
