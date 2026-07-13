'use client';

import React, { useEffect, useState } from 'react';
import { Product, FAQItem, ChangelogItem } from '../../types';
import { getProducts, saveProducts } from '../../utils/storage';
import Swal from 'sweetalert2';
import { showSuccessAlert, showErrorAlert, showSuccessToast, showErrorToast } from '../../utils/alert';
import { API_BASE_URL } from '@/app/utils/api';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  X, 
  PlusCircle, 
  MinusCircle, 
  Globe, 
  FileText, 
  Video, 
  Check, 
  Terminal, 
  HelpCircle, 
  Tag, 
  FileCode, 
  Info,
  Calendar,
  AlertCircle,
  ExternalLink,
  Download
} from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  
  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Selected products
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null);
  
  // Active Tab inside Form Modal
  const [formTab, setFormTab] = useState<'general' | 'media' | 'specs' | 'faqLogs'>('general');

  // Form Fields States
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState(5000);
  const [formCategory, setFormCategory] = useState<Product['category']>('SaaS');
  const [formDesc, setFormDesc] = useState('');
  const [formTech, setFormTech] = useState('');
  const [formFeatures, setFormFeatures] = useState('');
  const [formRequirements, setFormRequirements] = useState('');
  const [formDemoUrl, setFormDemoUrl] = useState('');
  const [formDocUrl, setFormDocUrl] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formGithubUrl, setFormGithubUrl] = useState('');
  const [formZipUrl, setFormZipUrl] = useState('');
  const [formImages, setFormImages] = useState('');
  const [formVersion, setFormVersion] = useState('1.0.0');
  const [formLicense, setFormLicense] = useState('Commercial License');
  const [formSalesCount, setFormSalesCount] = useState(0);
  const [formRating, setFormRating] = useState(5);
  const [formFaqs, setFormFaqs] = useState<FAQItem[]>([]);
  const [formChangelog, setFormChangelog] = useState<ChangelogItem[]>([]);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-admin-toast', { detail: text });
    window.dispatchEvent(event);
  };

  // Open Form for Adding New Product
  const openAddModal = () => {
    setIsEditMode(false);
    setEditingProduct(null);
    setFormTab('general');
    
    // Default values
    setFormName('');
    setFormPrice(5000);
    setFormCategory('SaaS');
    setFormDesc('');
    setFormTech('');
    setFormFeatures('');
    setFormRequirements('');
    setFormDemoUrl('https://demo.agency.com');
    setFormDocUrl('');
    setFormVideoUrl('');
    setFormGithubUrl('');
    setFormZipUrl('');
    setFormImages('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80');
    setFormVersion('1.0.0');
    setFormLicense('Commercial License');
    setFormSalesCount(0);
    setFormRating(5);
    setFormFaqs([]);
    setFormChangelog([{ version: '1.0.0', date: new Date().toISOString().split('T')[0], changes: ['Initial code release'] }]);
    
    setShowModal(true);
  };

  // Open Form for Editing Existing Product
  const openEditModal = (prod: Product) => {
    setIsEditMode(true);
    setEditingProduct(prod);
    setFormTab('general');
    
    setFormName(prod.name);
    setFormPrice(prod.price);
    setFormCategory(prod.category);
    setFormDesc(prod.description);
    setFormTech(prod.technologies.join(', '));
    setFormFeatures(prod.features.join('\n'));
    setFormRequirements(prod.requirements.join('\n'));
    setFormDemoUrl(prod.demoUrl || '');
    setFormDocUrl(prod.documentationUrl || '');
    setFormVideoUrl(prod.videoUrl || '');
    setFormGithubUrl(prod.githubUrl || '');
    setFormZipUrl(prod.zipUrl || '');
    setFormImages(prod.images.join('\n'));
    setFormVersion(prod.version || '1.0.0');
    setFormLicense(prod.license || 'Commercial License');
    setFormSalesCount(prod.salesCount || 0);
    setFormRating(prod.rating || 5);
    setFormFaqs(prod.faqs || []);
    setFormChangelog(prod.changelog || []);
    
    setShowModal(true);
  };

  // Open Read-Only details modal
  const openViewModal = (prod: Product) => {
    setViewingProduct(prod);
    setShowViewModal(true);
  };

  // Delete Product
  const handleDeleteProduct = async (id: string, name: string) => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${name}" from the product listings.`,
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
          const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            const updated = products.filter(p => p.id !== id);
            saveProducts(updated);
            setProducts(updated);
            showSuccessToast('Product deleted from listings.');
          } else {
            const resData = await response.json();
            throw new Error(resData.message || 'Failed to delete product from database');
          }
        } catch (err: any) {
          console.error(err);
          showErrorAlert('Delete Failed', err.message || 'Failed to delete product.');
        }
      }
    });
  };

  // Handle Form Submit
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showErrorToast('Product name is required.');
      return;
    }

    const imgList = formImages.split('\n').map(url => url.trim()).filter(Boolean);
    if (imgList.length === 0) {
      imgList.push('https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80');
    }

    const payload = {
      name: formName.trim(),
      price: Number(formPrice),
      category: formCategory,
      description: formDesc.trim(),
      technologies: formTech.split(',').map(t => t.trim()).filter(Boolean),
      features: formFeatures.split('\n').map(f => f.trim()).filter(Boolean),
      requirements: formRequirements.split('\n').map(r => r.trim()).filter(Boolean),
      demoUrl: formDemoUrl.trim() || 'https://demo.agency.com',
      images: imgList,
      videoUrl: formVideoUrl.trim() || null,
      documentationUrl: formDocUrl.trim() || null,
      githubUrl: formGithubUrl.trim() || null,
      zipUrl: formZipUrl.trim() || null,
      version: formVersion.trim() || '1.0.0',
      license: formLicense.trim() || 'Commercial License'
    };

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      showErrorToast('Authentication token not found. Please log in.');
      return;
    }

    try {
      const url = isEditMode && editingProduct 
        ? `${API_BASE_URL}/api/products/${editingProduct.id}`
        : `${API_BASE_URL}/api/products`;
      
      const method = isEditMode && editingProduct ? 'PUT' : 'POST';

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
        throw new Error(resData.message || 'Failed to save product to database');
      }

      const savedProduct = resData.data.product;

      let updatedList: Product[];
      if (isEditMode && editingProduct) {
        updatedList = products.map(p => p.id === editingProduct.id ? savedProduct : p);
        showSuccessAlert('Product Catalog Updated!', 'The product details have been successfully modified.');
      } else {
        updatedList = [savedProduct, ...products];
        showSuccessAlert('Product Added!', 'The new product has been successfully listed on the marketplace.');
      }

      saveProducts(updatedList);
      setProducts(updatedList);
      setShowModal(false);
    } catch (err: any) {
      console.error(err);
      showErrorAlert('Operation Failed', err.message || 'Failed to save product.');
    }
  };

  // FAQ handlers
  const handleAddFaq = () => {
    setFormFaqs([...formFaqs, { q: '', a: '' }]);
  };

  const handleUpdateFaq = (index: number, key: 'q' | 'a', value: string) => {
    const updated = [...formFaqs];
    updated[index] = { ...updated[index], [key]: value };
    setFormFaqs(updated);
  };

  const handleRemoveFaq = (index: number) => {
    setFormFaqs(formFaqs.filter((_, i) => i !== index));
  };

  // Changelog handlers
  const handleAddChangelog = () => {
    setFormChangelog([
      ...formChangelog, 
      { version: '', date: new Date().toISOString().split('T')[0], changes: [''] }
    ]);
  };

  const handleUpdateChangelog = (index: number, field: keyof ChangelogItem, value: any) => {
    const updated = [...formChangelog];
    updated[index] = { ...updated[index], [field]: value };
    setFormChangelog(updated);
  };

  const handleUpdateChangelogChanges = (index: number, textValue: string) => {
    const updated = [...formChangelog];
    updated[index] = { 
      ...updated[index], 
      changes: textValue.split('\n').map(c => c.trim()).filter(Boolean) 
    };
    setFormChangelog(updated);
  };

  const handleRemoveChangelog = (index: number) => {
    setFormChangelog(formChangelog.filter((_, i) => i !== index));
  };

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      
      {/* Upper header */}
      <div className="sticky top-0 bg-white dark:bg-[#09090b] z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900 flex justify-between items-center transition-colors">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Marketplace Catalog</h2>
          <p className="text-zinc-500 text-[10px]">Add, edit, preview, and delete SaaS kits, code templates, or digital assets.</p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2 rounded font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors text-[11px]"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1 bg-white dark:bg-zinc-950 transition-colors">
        
        {/* Products Table */}
        <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold tracking-wider text-[10px] bg-zinc-50 dark:bg-zinc-900/60">
                <th className="p-4 w-[80px]">Preview</th>
                <th className="p-4">Product details</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price (BDT)</th>
                <th className="p-4">Stats</th>
                <th className="p-4">Tech tags</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.length > 0 ? (
                products.map((prod) => (
                  <tr key={prod.id} className="border-b border-zinc-200 dark:border-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300 transition-colors">
                    
                    {/* Image cell */}
                    <td className="p-4">
                      <div className="w-12 h-8 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800">
                        <img 
                          src={prod.images[0] || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=150&q=80'} 
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </td>

                    {/* Details cell */}
                    <td className="p-4 max-w-[200px]">
                      <div className="font-bold text-zinc-950 dark:text-white truncate" title={prod.name}>
                        {prod.name}
                      </div>
                      <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate" title={prod.description}>
                        {prod.description}
                      </div>
                    </td>

                    {/* Category cell */}
                    <td className="p-4">
                      <span className="bg-zinc-100 dark:bg-zinc-900 text-zinc-850 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded font-mono text-[9px]">
                        {prod.category}
                      </span>
                    </td>

                    {/* Price cell */}
                    <td className="p-4 font-mono font-bold text-zinc-950 dark:text-white">
                      {prod.price.toLocaleString()} BDT
                    </td>

                    {/* Stats cell */}
                    <td className="p-4">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-300">{prod.salesCount || 0} sales</div>
                      <div className="text-[10px] text-zinc-400">Rating: {prod.rating || 5.0} ★</div>
                    </td>

                    {/* Tech tags cell */}
                    <td className="p-4 max-w-[150px]">
                      <div className="flex flex-wrap gap-1">
                        {prod.technologies.slice(0, 3).map((t, idx) => (
                          <span key={idx} className="bg-zinc-100/50 dark:bg-zinc-900/60 text-[9px] px-1 py-0.2 rounded font-mono border border-zinc-250/20 dark:border-zinc-800/40">
                            {t}
                          </span>
                        ))}
                        {prod.technologies.length > 3 && (
                          <span className="text-[9px] text-zinc-400 font-mono">+{prod.technologies.length - 3}</span>
                        )}
                      </div>
                    </td>

                    {/* Action buttons cell */}
                    <td className="p-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => openViewModal(prod)}
                          title="Preview Details"
                          className="text-zinc-650 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white border border-zinc-250 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-850/80 p-1.5 rounded cursor-pointer transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(prod)}
                          title="Edit Product"
                          className="text-zinc-650 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white border border-zinc-250 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-850/80 p-1.5 rounded cursor-pointer transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(prod.id, prod.name)}
                          title="Delete Product"
                          className="text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-zinc-250 dark:border-zinc-850 hover:border-rose-300 dark:hover:border-rose-900 p-1.5 rounded cursor-pointer transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-zinc-450 dark:text-zinc-555 font-bold">
                    No products added yet. Click &quot;Add Product&quot; to list a new digital product.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ==================== ADD / EDIT MODAL ==================== */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-4xl rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-zinc-950 dark:text-white">
              
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    {isEditMode ? `Edit Product: ${editingProduct?.name}` : 'Create New Marketplace Product'}
                  </h3>
                  <p className="text-[10px] text-zinc-550 dark:text-zinc-400">Configure catalog properties, assets, installation dependencies, and logs.</p>
                </div>
                <button 
                  onClick={() => setShowModal(false)} 
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Core Layout */}
              <div className="flex flex-1 overflow-hidden min-h-0">
                
                {/* Modal Sidebar Tab Controls */}
                <div className="w-48 bg-zinc-50 dark:bg-zinc-900/40 border-r border-zinc-250/80 dark:border-zinc-800/80 p-3 space-y-1 shrink-0 flex flex-col justify-start">
                  {[
                    { id: 'general', label: 'General Info', icon: <Info className="w-3.5 h-3.5" /> },
                    { id: 'media', label: 'Media & Links', icon: <Globe className="w-3.5 h-3.5" /> },
                    { id: 'specs', label: 'Specifications', icon: <Terminal className="w-3.5 h-3.5" /> },
                    { id: 'faqLogs', label: 'FAQs & Logs', icon: <HelpCircle className="w-3.5 h-3.5" /> }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setFormTab(tab.id as any)}
                      className={`w-full text-left px-3 py-2 rounded text-[11px] font-bold flex items-center gap-2 cursor-pointer transition-all ${
                        formTab === tab.id 
                          ? 'bg-zinc-950 text-white dark:bg-white dark:text-black font-extrabold shadow-sm' 
                          : 'text-zinc-650 hover:text-zinc-900 dark:text-zinc-450 dark:hover:text-white hover:bg-zinc-150 dark:hover:bg-zinc-850'
                      }`}
                    >
                      {tab.icon}
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Form scroll container */}
                <form onSubmit={handleFormSubmit} className="flex-1 flex flex-col overflow-hidden min-h-0 bg-white dark:bg-[#0c0c0e]">
                  
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    
                    {/* TAB 1: GENERAL INFO */}
                    {formTab === 'general' && (
                      <div className="space-y-4 animate-fadeIn">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Product Title *</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="e.g. DevFlow - Next.js 15 SaaS Starter Kit" 
                              value={formName} 
                              onChange={(e) => setFormName(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Category *</label>
                            <select 
                              value={formCategory} 
                              onChange={(e) => setFormCategory(e.target.value as any)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700"
                            >
                              <option value="Website Template">Website Template</option>
                              <option value="Full Website">Full Website</option>
                              <option value="SaaS">SaaS</option>
                              <option value="Mobile App">Mobile App</option>
                              <option value="Source Code">Source Code</option>
                              <option value="UI/UX">UI/UX</option>
                              <option value="AI Project">AI Project</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Price (BDT) *</label>
                            <input 
                              type="number" 
                              required 
                              min={0}
                              value={formPrice} 
                              onChange={(e) => setFormPrice(Number(e.target.value))} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">License Key Type</label>
                            <input 
                              type="text" 
                              placeholder="e.g. Single-Site Commercial License" 
                              value={formLicense} 
                              onChange={(e) => setFormLicense(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Version Tag</label>
                            <input 
                              type="text" 
                              placeholder="e.g. 1.0.0" 
                              value={formVersion} 
                              onChange={(e) => setFormVersion(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Sales Count (Seed value)</label>
                            <input 
                              type="number" 
                              min={0}
                              value={formSalesCount} 
                              onChange={(e) => setFormSalesCount(Number(e.target.value))} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Product Rating (1.0 to 5.0)</label>
                            <input 
                              type="number" 
                              min={1} 
                              max={5} 
                              step={0.1}
                              value={formRating} 
                              onChange={(e) => setFormRating(Number(e.target.value))} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Demo URL (Live Preview)</label>
                            <input 
                              type="url" 
                              placeholder="e.g. https://demo.example.com" 
                              value={formDemoUrl} 
                              onChange={(e) => setFormDemoUrl(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                            />
                          </div>
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Video Walkthrough URL (Demo Video)</label>
                            <input 
                              type="url" 
                              placeholder="e.g. https://www.w3schools.com/html/mov_bbb.mp4" 
                              value={formVideoUrl} 
                              onChange={(e) => setFormVideoUrl(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Marketing Description *</label>
                          <textarea 
                            rows={4} 
                            required 
                            placeholder="Describe your template, listing features, benefits and high points..." 
                            value={formDesc} 
                            onChange={(e) => setFormDesc(e.target.value)} 
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-3 text-xs resize-none focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                          />
                        </div>

                      </div>
                    )}

                    {/* TAB 2: MEDIA & LINKS */}
                    {formTab === 'media' && (
                      <div className="space-y-4 animate-fadeIn">
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Live Preview URL</label>
                            <div className="relative">
                              <Globe className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                              <input 
                                type="url" 
                                placeholder="https://example.com/demo" 
                                value={formDemoUrl} 
                                onChange={(e) => setFormDemoUrl(e.target.value)} 
                                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Documentation Guide URL</label>
                            <div className="relative">
                              <FileText className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                              <input 
                                type="url" 
                                placeholder="https://docs.example.com" 
                                value={formDocUrl} 
                                onChange={(e) => setFormDocUrl(e.target.value)} 
                                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Video Walkthrough URL</label>
                            <div className="relative">
                              <Video className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                              <input 
                                type="url" 
                                placeholder="https://youtube.com/watch?v=..." 
                                value={formVideoUrl} 
                                onChange={(e) => setFormVideoUrl(e.target.value)} 
                                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">GitHub Repository Code URL</label>
                            <div className="relative">
                              <FileCode className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                              <input 
                                type="url" 
                                placeholder="https://github.com/agency/repo" 
                                value={formGithubUrl} 
                                onChange={(e) => setFormGithubUrl(e.target.value)} 
                                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Source Code ZIP Download URL</label>
                            <div className="relative">
                              <Download className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                              <input 
                                type="url" 
                                placeholder="https://storage.agency.com/assets/code.zip" 
                                value={formZipUrl} 
                                onChange={(e) => setFormZipUrl(e.target.value)} 
                                className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                              />
                            </div>
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold uppercase tracking-wider text-[9px]">Product Image URLs (One URL per line)</label>
                            <span className="text-[9px] text-zinc-500">First line is primary thumbnail</span>
                          </div>
                          <textarea 
                            rows={5} 
                            placeholder="https://images.unsplash.com/photo-1&#10;https://images.unsplash.com/photo-2" 
                            value={formImages} 
                            onChange={(e) => setFormImages(e.target.value)} 
                            className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-3 text-[10px] font-mono resize-none focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                          />
                        </div>

                      </div>
                    )}

                    {/* TAB 3: SPECIFICATIONS */}
                    {formTab === 'specs' && (
                      <div className="space-y-4 animate-fadeIn">
                        
                        <div>
                          <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Tech Stack Tags (Comma separated)</label>
                          <div className="relative">
                            <Tag className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-zinc-500" />
                            <input 
                              type="text" 
                              placeholder="Next.js 15, React 19, TypeScript, Tailwind CSS, PostgreSQL" 
                              value={formTech} 
                              onChange={(e) => setFormTech(e.target.value)} 
                              className="w-full pl-8 pr-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Core Features list (One feature per line)</label>
                            <textarea 
                              rows={6} 
                              placeholder="Prebuilt Auth using NextAuth&#10;Full stripe subscription setup&#10;Dynamic responsive dark mode" 
                              value={formFeatures} 
                              onChange={(e) => setFormFeatures(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-3 text-xs resize-none focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                            />
                          </div>

                          <div>
                            <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">System Dependencies / Requirements (One per line)</label>
                            <textarea 
                              rows={6} 
                              placeholder="Node.js 18.x or higher&#10;PostgreSQL database instance&#10;Stripe merchant accounts" 
                              value={formRequirements} 
                              onChange={(e) => setFormRequirements(e.target.value)} 
                              className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-3 text-xs resize-none focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                            />
                          </div>
                        </div>

                      </div>
                    )}

                    {/* TAB 4: FAQS & LOGS */}
                    {formTab === 'faqLogs' && (
                      <div className="space-y-6 animate-fadeIn text-[11px]">
                        
                        {/* FAQ Repeated fields */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-2">
                            <span className="font-bold uppercase tracking-wider text-zinc-900 dark:text-white text-[10px]">Configure FAQs</span>
                            <button
                              type="button"
                              onClick={handleAddFaq}
                              className="text-[10px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white px-2 py-1 rounded font-bold cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <PlusCircle className="w-3.5 h-3.5" /> Add FAQ Item
                            </button>
                          </div>

                          {formFaqs.length > 0 ? (
                            <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                              {formFaqs.map((faq, index) => (
                                <div key={index} className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded relative space-y-2">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveFaq(index)}
                                    className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 p-0.5 rounded transition-colors"
                                  >
                                    <MinusCircle className="w-4 h-4" />
                                  </button>
                                  <div className="w-[90%] space-y-2">
                                    <div>
                                      <input 
                                        type="text" 
                                        placeholder="Question (e.g. Can I use this on multiple sites?)" 
                                        value={faq.q} 
                                        onChange={(e) => handleUpdateFaq(index, 'q', e.target.value)} 
                                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700" 
                                      />
                                    </div>
                                    <div>
                                      <textarea 
                                        rows={2}
                                        placeholder="Answer (e.g. The standard license allows only one site...)" 
                                        value={faq.a} 
                                        onChange={(e) => handleUpdateFaq(index, 'a', e.target.value)} 
                                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-2.5 py-1.5 focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 resize-none" 
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-zinc-500 text-center py-3 bg-zinc-50/50 dark:bg-zinc-900/10 border border-dashed border-zinc-200 dark:border-zinc-850 rounded">
                              No FAQs added. Dynamic Q&amp;A helps resolve client deployment queries.
                            </div>
                          )}
                        </div>

                        {/* Changelog Repeatable list */}
                        <div className="space-y-3">
                          <div className="flex justify-between items-center border-b border-zinc-150 dark:border-zinc-800 pb-2">
                            <span className="font-bold uppercase tracking-wider text-zinc-900 dark:text-white text-[10px]">Changelog &amp; Release History</span>
                            <button
                              type="button"
                              onClick={handleAddChangelog}
                              className="text-[10px] bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-white px-2 py-1 rounded font-bold cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <PlusCircle className="w-3.5 h-3.5" /> Add Log Entry
                            </button>
                          </div>

                          {formChangelog.length > 0 ? (
                            <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                              {formChangelog.map((log, index) => (
                                <div key={index} className="p-3 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded relative space-y-2">
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveChangelog(index)}
                                    className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 p-0.5 rounded transition-colors"
                                  >
                                    <MinusCircle className="w-4 h-4" />
                                  </button>
                                  
                                  <div className="grid grid-cols-2 gap-2 w-[90%]">
                                    <div>
                                      <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-0.5">Version</label>
                                      <input 
                                        type="text" 
                                        placeholder="e.g. 1.1.0" 
                                        value={log.version} 
                                        onChange={(e) => handleUpdateChangelog(index, 'version', e.target.value)} 
                                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-2 py-1 focus:outline-none focus:border-zinc-450" 
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-0.5">Release Date</label>
                                      <input 
                                        type="date" 
                                        value={log.date} 
                                        onChange={(e) => handleUpdateChangelog(index, 'date', e.target.value)} 
                                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-2 py-1 focus:outline-none focus:border-zinc-450" 
                                      />
                                    </div>
                                  </div>

                                  <div className="w-[90%]">
                                    <label className="block text-[8px] uppercase font-bold text-zinc-400 mb-0.5">Changes (One point per line)</label>
                                    <textarea 
                                      rows={2}
                                      placeholder="Added dark mode support&#10;Fixed middleware redirect bugs"
                                      value={Array.isArray(log.changes) ? log.changes.join('\n') : log.changes} 
                                      onChange={(e) => handleUpdateChangelogChanges(index, e.target.value)} 
                                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-2 focus:outline-none focus:border-zinc-450 resize-none" 
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-zinc-500 text-center py-3 bg-zinc-50/50 dark:bg-zinc-900/10 border border-dashed border-zinc-200 dark:border-zinc-850 rounded">
                              No logs recorded. Let clients know what changed in updates.
                            </div>
                          )}
                        </div>

                      </div>
                    )}

                  </div>

                  {/* Modal Footer Controls */}
                  <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 bg-zinc-50 dark:bg-zinc-900/60">
                    <button 
                      type="button" 
                      onClick={() => setShowModal(false)} 
                      className="px-4 py-2 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-850 dark:text-zinc-250 rounded font-bold cursor-pointer transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit" 
                      className="px-5 py-2 bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-150 text-white dark:text-black rounded font-bold cursor-pointer transition-colors"
                    >
                      {isEditMode ? 'Update Product' : 'Add to Catalog'}
                    </button>
                  </div>

                </form>

              </div>

            </div>
          </div>
        )}

        {/* ==================== VIEW PREVIEW MODAL ==================== */}
        {showViewModal && viewingProduct && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-3xl rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-zinc-950 dark:text-white">
              
              {/* Header */}
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60">
                <div className="flex items-center gap-2">
                  <span className="bg-zinc-950 text-white dark:bg-white dark:text-black text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase">
                    {viewingProduct.category}
                  </span>
                  <span className="text-[10px] text-zinc-400">ID: {viewingProduct.id}</span>
                </div>
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="text-zinc-455 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* View Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Intro Title */}
                <div className="space-y-2">
                  <h2 className="text-base font-extrabold text-zinc-950 dark:text-white tracking-tight">
                    {viewingProduct.name}
                  </h2>
                  <div className="flex flex-wrap gap-4 text-[10px] text-zinc-500 font-medium">
                    <div>Price: <strong className="text-zinc-900 dark:text-white">{viewingProduct.price.toLocaleString()} BDT</strong></div>
                    <div>Version: <strong className="text-zinc-900 dark:text-white">v{viewingProduct.version}</strong></div>
                    <div>License: <strong className="text-zinc-900 dark:text-white">{viewingProduct.license}</strong></div>
                    <div>Rating: <strong className="text-zinc-900 dark:text-white">{viewingProduct.rating} ★ ({viewingProduct.salesCount} sold)</strong></div>
                  </div>
                </div>

                {/* Images row */}
                <div className="space-y-1.5">
                  <span className="block font-bold text-zinc-400 uppercase tracking-wide text-[9px]">Gallery Images</span>
                  <div className="grid grid-cols-4 gap-2">
                    {viewingProduct.images.map((img, idx) => (
                      <div key={idx} className="aspect-video rounded overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-800">
                        <img src={img} alt="Product spec" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <span className="block font-bold text-zinc-400 uppercase tracking-wide text-[9px]">Marketing Description</span>
                  <p className="text-zinc-755 dark:text-zinc-350 leading-relaxed bg-zinc-50 dark:bg-zinc-900/40 p-3 rounded border border-zinc-200/60 dark:border-zinc-800/80">
                    {viewingProduct.description}
                  </p>
                </div>

                {/* Links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[10px]">
                  <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-850 p-2 rounded flex items-center justify-between">
                    <span className="text-zinc-400">Demo Page:</span>
                    {viewingProduct.demoUrl ? (
                      <a href={viewingProduct.demoUrl} target="_blank" rel="noreferrer" className="text-zinc-950 dark:text-white hover:underline flex items-center gap-1 font-bold">
                        Visit Demo <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : <span className="text-zinc-400">None</span>}
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-850 p-2 rounded flex items-center justify-between">
                    <span className="text-zinc-400">Documentation:</span>
                    {viewingProduct.documentationUrl ? (
                      <a href={viewingProduct.documentationUrl} target="_blank" rel="noreferrer" className="text-zinc-950 dark:text-white hover:underline flex items-center gap-1 font-bold">
                        Guides <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : <span className="text-zinc-400">None</span>}
                  </div>
                  <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-850 p-2 rounded flex items-center justify-between">
                    <span className="text-zinc-400">Video Guide:</span>
                    {viewingProduct.videoUrl ? (
                      <a href={viewingProduct.videoUrl} target="_blank" rel="noreferrer" className="text-zinc-950 dark:text-white hover:underline flex items-center gap-1 font-bold">
                        Watch Walkthrough <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : <span className="text-zinc-400">None</span>}
                  </div>
                </div>

                {/* Tech tags */}
                <div className="space-y-1.5">
                  <span className="block font-bold text-zinc-400 uppercase tracking-wide text-[9px]">Technologies integrated</span>
                  <div className="flex flex-wrap gap-1.5">
                    {viewingProduct.technologies.map((t, idx) => (
                      <span key={idx} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-350 px-2 py-0.5 rounded font-mono text-[9px] border border-zinc-200 dark:border-zinc-850">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Features & Requirements */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <span className="block font-bold text-zinc-400 uppercase tracking-wide text-[9px] border-b border-zinc-200 dark:border-zinc-800 pb-1">Features</span>
                    <ul className="space-y-1 text-zinc-650 dark:text-zinc-400">
                      {viewingProduct.features.map((f, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check className="w-3.5 h-3.5 text-zinc-450 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2">
                    <span className="block font-bold text-zinc-400 uppercase tracking-wide text-[9px] border-b border-zinc-200 dark:border-zinc-800 pb-1">System Dependencies</span>
                    <ul className="space-y-1 font-mono text-[10px] text-zinc-650 dark:text-zinc-400">
                      {viewingProduct.requirements.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Terminal className="w-3.5 h-3.5 text-zinc-455 shrink-0 mt-0.5" />
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* FAQs */}
                <div className="space-y-3">
                  <span className="block font-bold text-zinc-400 uppercase tracking-wide text-[9px] border-b border-zinc-200 dark:border-zinc-800 pb-1">Client FAQs</span>
                  {viewingProduct.faqs && viewingProduct.faqs.length > 0 ? (
                    <div className="space-y-2.5">
                      {viewingProduct.faqs.map((faq, idx) => (
                        <div key={idx} className="space-y-0.5">
                          <strong className="text-zinc-900 dark:text-white block">Q: {faq.q}</strong>
                          <p className="text-zinc-600 dark:text-zinc-400 pl-4">{faq.a}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-zinc-450 text-[10px]">No FAQs created.</div>
                  )}
                </div>

                {/* Changelog */}
                <div className="space-y-3">
                  <span className="block font-bold text-zinc-400 uppercase tracking-wide text-[9px] border-b border-zinc-200 dark:border-zinc-800 pb-1">Version Release Changelogs</span>
                  {viewingProduct.changelog && viewingProduct.changelog.length > 0 ? (
                    <div className="space-y-3">
                      {viewingProduct.changelog.map((log, idx) => (
                        <div key={idx} className="p-3 bg-zinc-50 dark:bg-zinc-900/40 rounded border border-zinc-200 dark:border-zinc-850 space-y-1">
                          <div className="flex justify-between items-center text-[10px]">
                            <strong className="text-zinc-950 dark:text-white">v{log.version}</strong>
                            <span className="text-zinc-450 flex items-center gap-1 font-semibold">
                              <Calendar className="w-3 h-3" /> {log.date}
                            </span>
                          </div>
                          <ul className="list-disc pl-4 space-y-0.5 text-zinc-600 dark:text-zinc-400">
                            {log.changes.map((change, cIdx) => (
                              <li key={cIdx}>{change}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-zinc-450 text-[10px]">No changelogs recorded.</div>
                  )}
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end bg-zinc-50 dark:bg-zinc-900/60">
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="px-5 py-2 bg-zinc-950 hover:bg-zinc-855 dark:bg-white dark:hover:bg-zinc-150 text-white dark:text-black font-bold rounded cursor-pointer transition-colors"
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
