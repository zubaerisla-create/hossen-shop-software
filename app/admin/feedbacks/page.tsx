'use client';

import React, { useEffect, useState } from 'react';
import { Product } from '../../types';
import { getProducts as getStoredProducts, syncWithBackend } from '../../utils/storage';
import { Trash2, Edit3, MessageSquare, Save, X, Search, Filter } from 'lucide-react';

interface FeedbackItem {
  productId: string;
  productName: string;
  index: number; // to identify the comment index inside the array
  user: string;
  avatar?: string | null;
  comment: string;
  date: string;
}

export default function AdminFeedbacksPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [filterProduct, setFilterProduct] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit state
  const [editingItem, setEditingItem] = useState<{ productId: string; index: number; comment: string } | null>(null);

  // Load products and feedbacks on mount
  useEffect(() => {
    const init = async () => {
      await syncWithBackend();
      const prods = getStoredProducts();
      setProducts(prods);
      loadAllFeedbacks(prods);
    };
    init();
  }, []);

  const loadAllFeedbacks = (prods: Product[]) => {
    const allItems: FeedbackItem[] = [];
    prods.forEach((prod) => {
      let list: any[] = [];
      if (prod.reviews && Array.isArray(prod.reviews) && prod.reviews.length > 0) {
        list = prod.reviews;
      } else {
        const key = `apex_feedbacks_${prod.id}`;
        const stored = localStorage.getItem(key);
        if (stored) {
          try {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              list = parsed;
            }
          } catch (e) {
            console.error(e);
          }
        }
      }

      list.forEach((item, idx) => {
        allItems.push({
          productId: prod.id,
          productName: prod.name,
          index: idx,
          user: item.user,
          avatar: item.avatar || null,
          comment: item.comment,
          date: item.date ? item.date.split('T')[0] : ''
        });
      });
    });
    setFeedbacks(allItems);
  };

  const handleDelete = async (productId: string, index: number) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    let reviewsList: any[] = [];
    if (prod.reviews && Array.isArray(prod.reviews) && prod.reviews.length > 0) {
      reviewsList = [...prod.reviews];
    } else {
      const stored = localStorage.getItem(`apex_feedbacks_${productId}`);
      if (stored) {
        reviewsList = JSON.parse(stored);
      }
    }

    reviewsList.splice(index, 1);

    const token = localStorage.getItem('apex_user_token');
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reviews: reviewsList })
      });

      if (response.ok) {
        await syncWithBackend();
        const updatedProds = getStoredProducts();
        setProducts(updatedProds);
        loadAllFeedbacks(updatedProds);
        
        window.dispatchEvent(
          new CustomEvent('apex-admin-toast', { detail: 'Feedback deleted successfully from database.' })
        );
        return;
      }
    } catch (e) {
      console.error('Failed to delete review on backend:', e);
    }

    // Fallback
    localStorage.setItem(`apex_feedbacks_${productId}`, JSON.stringify(reviewsList));
    window.dispatchEvent(
      new CustomEvent('apex-admin-toast', { detail: 'Feedback deleted locally (Offline).' })
    );
    loadAllFeedbacks(products);
  };

  const handleEditClick = (item: FeedbackItem) => {
    setEditingItem({
      productId: item.productId,
      index: item.index,
      comment: item.comment
    });
  };

  const handleSaveEdit = async () => {
    if (!editingItem) return;

    const { productId, index, comment } = editingItem;
    const prod = products.find(p => p.id === productId);
    if (!prod) return;

    let reviewsList: any[] = [];
    if (prod.reviews && Array.isArray(prod.reviews) && prod.reviews.length > 0) {
      reviewsList = [...prod.reviews];
    } else {
      const stored = localStorage.getItem(`apex_feedbacks_${productId}`);
      if (stored) {
        reviewsList = JSON.parse(stored);
      }
    }

    if (reviewsList[index]) {
      reviewsList[index].comment = comment.trim();
    }

    const token = localStorage.getItem('apex_user_token');
    try {
      const response = await fetch(`http://localhost:5000/api/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reviews: reviewsList })
      });

      if (response.ok) {
        await syncWithBackend();
        const updatedProds = getStoredProducts();
        setProducts(updatedProds);
        loadAllFeedbacks(updatedProds);
        setEditingItem(null);

        window.dispatchEvent(
          new CustomEvent('apex-admin-toast', { detail: 'Feedback updated successfully in database.' })
        );
        return;
      }
    } catch (e) {
      console.error('Failed to update review on backend:', e);
    }

    // Fallback
    localStorage.setItem(`apex_feedbacks_${productId}`, JSON.stringify(reviewsList));
    setEditingItem(null);
    window.dispatchEvent(
      new CustomEvent('apex-admin-toast', { detail: 'Feedback updated locally (Offline).' })
    );
    loadAllFeedbacks(products);
  };

  // Filter & Search
  const filteredFeedbacks = feedbacks.filter((item) => {
    const matchesProduct = filterProduct === 'All' || item.productId === filterProduct;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      item.user.toLowerCase().includes(query) ||
      item.comment.toLowerCase().includes(query) ||
      item.productName.toLowerCase().includes(query);
    return matchesProduct && matchesSearch;
  });

  return (
    <div className="p-6 md:p-10 space-y-8 bg-white dark:bg-zinc-950 min-h-screen text-zinc-900 dark:text-zinc-100 font-sans transition-colors">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950 dark:text-white uppercase tracking-tight">Manage Feedbacks</h1>
        <p className="text-zinc-500 text-xs max-w-lg">View, edit, and delete client feedback across all template products.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center border-b border-zinc-200 dark:border-zinc-900 pb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600" />
          <input
            type="text"
            placeholder="Search feedback content, users or products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-950 dark:text-white focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
          />
        </div>

        {/* Dropdown product filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-zinc-400" />
          <select
            value={filterProduct}
            onChange={(e) => setFilterProduct(e.target.value)}
            className="bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none font-bold"
          >
            <option value="All">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name.slice(0, 30)}...
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Feedbacks Listing */}
      {filteredFeedbacks.length > 0 ? (
        <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-900/50 font-bold uppercase text-[10px] text-zinc-500 tracking-wider">
                  <th className="p-4">Product</th>
                  <th className="p-4">User</th>
                  <th className="p-4">Feedback / Comment</th>
                  <th className="p-4">Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-900">
                {filteredFeedbacks.map((item, idx) => (
                  <tr key={`${item.productId}-${item.index}-${idx}`} className="hover:bg-zinc-100/50 dark:hover:bg-zinc-900/20 transition-colors">
                    <td className="p-4 font-bold text-zinc-950 dark:text-white max-w-[150px] truncate">
                      {item.productName}
                    </td>
                    <td className="p-4 font-semibold text-zinc-700 dark:text-zinc-300">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-zinc-350 dark:border-zinc-700 shadow-xs font-bold text-[10px] uppercase text-zinc-650 dark:text-zinc-300 select-none">
                          {item.avatar ? (
                            <img src={item.avatar} alt={item.user} className="w-full h-full object-cover" />
                          ) : (
                            item.user ? item.user.charAt(0) : 'C'
                          )}
                        </div>
                        <span>{item.user}</span>
                      </div>
                    </td>
                    <td className="p-4 text-zinc-600 dark:text-zinc-400 max-w-sm">
                      {editingItem && editingItem.productId === item.productId && editingItem.index === item.index ? (
                        <div className="flex gap-2 items-center">
                          <textarea
                            value={editingItem.comment}
                            onChange={(e) => setEditingItem({ ...editingItem, comment: e.target.value })}
                            className="flex-1 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-850 rounded p-1.5 text-xs font-semibold focus:outline-none min-h-[50px] resize-y"
                          />
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={handleSaveEdit}
                              className="p-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded cursor-pointer"
                              title="Save Changes"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              className="p-1.5 bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded hover:bg-zinc-350 dark:hover:bg-zinc-700 cursor-pointer"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="line-clamp-2 leading-relaxed">{item.comment}</p>
                      )}
                    </td>
                    <td className="p-4 text-zinc-500 font-mono text-[10px] whitespace-nowrap">
                      {item.date}
                    </td>
                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditClick(item)}
                          disabled={editingItem !== null}
                          className="p-2 border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 rounded hover:border-zinc-400 dark:hover:border-zinc-750 transition-colors disabled:opacity-50 cursor-pointer text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white"
                          title="Edit Comment"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.productId, item.index)}
                          className="p-2 border border-zinc-200 dark:border-zinc-850 bg-white dark:bg-zinc-950 rounded hover:border-red-500 hover:text-red-500 transition-colors cursor-pointer text-zinc-650 dark:text-zinc-455"
                          title="Delete Comment"
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
      ) : (
        <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded py-16 text-center text-zinc-500 text-xs space-y-3">
          <MessageSquare className="w-8 h-8 mx-auto text-zinc-400" />
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">No feedbacks or comments found.</p>
          <p>Once clients leave comments on templates, they will display here.</p>
        </div>
      )}
    </div>
  );
}
