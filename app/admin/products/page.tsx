'use client';

import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { getProducts, saveProducts } from '../../utils/storage';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdPrice, setNewProdPrice] = useState(5000);
  const [newProdCategory, setNewProdCategory] = useState<'Website Template' | 'Full Website' | 'SaaS' | 'Mobile App' | 'UI/UX' | 'AI Project'>('SaaS');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdTech, setNewProdTech] = useState('');
  const [newProdFeatures, setNewProdFeatures] = useState('');
  const [newProdReq, setNewProdReq] = useState('');

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const triggerToast = (text: string) => {
    const event = new CustomEvent('apex-admin-toast', { detail: text });
    window.dispatchEvent(event);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdDesc) return;

    const freshProduct: Product = {
      id: `prod-${Math.floor(Math.random() * 10000)}`,
      name: newProdName,
      price: newProdPrice,
      category: newProdCategory,
      description: newProdDesc,
      technologies: newProdTech.split(',').map(t => t.trim()),
      features: newProdFeatures.split('\n').map(f => f.trim()),
      requirements: newProdReq.split('\n').map(r => r.trim()),
      demoUrl: 'https://demo.agency.com',
      images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80'],
      version: '1.0.0',
      changelog: [{ version: '1.0.0', date: '2026-07-05', changes: ['Initial code release'] }],
      license: 'Commercial License',
      salesCount: 0,
      rating: 5,
      reviews: [],
      faqs: []
    };

    const updated = [freshProduct, ...products];
    saveProducts(updated);
    setProducts(updated);
    
    // Clear inputs
    setNewProdName('');
    setNewProdDesc('');
    setNewProdTech('');
    setNewProdFeatures('');
    setNewProdReq('');
    setShowAddProductModal(false);
    
    triggerToast('Marketplace listing updated.');
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    saveProducts(updated);
    setProducts(updated);
    triggerToast('Product deleted from listings.');
  };

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      <div className="sticky top-0 bg-white dark:bg-zinc-950 z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight">Marketplace Catalog</h2>
          <p className="text-zinc-500 text-[10px]">Add new templates, configure pricing, and delete obsolete listings.</p>
        </div>

        <button
          onClick={() => setShowAddProductModal(true)}
          className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2 rounded font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1">

      <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[600px]">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold tracking-wider text-[10px] bg-zinc-50 dark:bg-zinc-900/60">
              <th className="p-4">Product Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price (BDT)</th>
              <th className="p-4">Sold</th>
              <th className="p-4">Tech tags</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id} className="border-b border-zinc-200 dark:border-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300">
                <td className="p-4 font-bold text-zinc-950 dark:text-white">{prod.name}</td>
                <td className="p-4">{prod.category}</td>
                <td className="p-4 font-mono font-bold text-zinc-950 dark:text-white">{prod.price.toLocaleString()}</td>
                <td className="p-4 font-semibold text-zinc-500">{prod.salesCount} units</td>
                <td className="p-4 max-w-[200px] truncate">{prod.technologies.join(', ')}</td>
                <td className="p-4 text-center">
                  <button
                    onClick={() => handleDeleteProduct(prod.id)}
                    className="text-rose-600 dark:text-rose-455 hover:underline p-1 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal Overlay */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-md rounded overflow-hidden shadow-2xl p-6 space-y-4 text-zinc-950 dark:text-white">
            <h3 className="text-base font-bold text-zinc-950 dark:text-white uppercase tracking-wider">Add New Product</h3>
            
            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Product Title</label>
                <input type="text" required placeholder="e.g. EcoShop nextjs template" value={newProdName} onChange={(e) => setNewProdName(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 focus:outline-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Category</label>
                  <select value={newProdCategory} onChange={(e) => setNewProdCategory(e.target.value as any)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 focus:outline-none">
                    <option>Website Template</option>
                    <option>Full Website</option>
                    <option>SaaS</option>
                    <option>Mobile App</option>
                    <option>UI/UX</option>
                    <option>AI Project</option>
                  </select>
                </div>
                <div>
                  <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Price (BDT)</label>
                  <input type="number" required value={newProdPrice} onChange={(e) => setNewProdPrice(Number(e.target.value))} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Technology Tags (comma separated)</label>
                <input type="text" placeholder="Next.js, Tailwind, React" value={newProdTech} onChange={(e) => setNewProdTech(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded px-3 py-2 focus:outline-none" />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Description</label>
                <textarea rows={2} required placeholder="Product summary..." value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-3 resize-none focus:outline-none" />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">Key Features (one per line)</label>
                <textarea rows={2} required placeholder="Prebuilt Auth&#10;Stripe integrations..." value={newProdFeatures} onChange={(e) => setNewProdFeatures(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-3 resize-none focus:outline-none" />
              </div>

              <div>
                <label className="block text-zinc-600 dark:text-zinc-400 font-bold mb-1">System Requirements (one per line)</label>
                <textarea rows={2} required placeholder="NodeJS 18+&#10;Postgres Database..." value={newProdReq} onChange={(e) => setNewProdReq(e.target.value)} className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-950 dark:text-white rounded p-3 resize-none focus:outline-none" />
              </div>

              <div className="flex gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-900">
                <button type="button" onClick={() => setShowAddProductModal(false)} className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded font-bold cursor-pointer transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold cursor-pointer transition-colors">Save Catalog</button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
