'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Blog } from '../../types';
import Swal from 'sweetalert2';
import { showSuccessAlert, showErrorAlert, showSuccessToast, showErrorToast } from '../../utils/alert';
import { API_BASE_URL } from '@/app/utils/api';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Eye, 
  X, 
  BookOpen, 
  Calendar,
  User,
  Tag as TagIcon,
  ThumbsUp,
  Award
} from 'lucide-react';

export default function AdminBlogsPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  // Preview modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs`);
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data && data.data.blogs) {
          setBlogs(data.data.blogs);
        }
      }
    } catch (err) {
      console.error('Failed to fetch blogs:', err);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    router.push('/admin/blogs/new');
  };

  const openEditModal = (blog: Blog) => {
    router.push(`/admin/blogs/edit/${blog.id}`);
  };

  const openViewModal = (blog: Blog) => {
    setViewingBlog(blog);
    setShowViewModal(true);
  };

  const handleDeleteBlog = async (id: string, title: string) => {
    const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
    Swal.fire({
      title: 'Are you sure?',
      text: `You are about to delete "${title}" from the articles list.`,
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
          const response = await fetch(`${API_BASE_URL}/api/blogs/${id}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });

          if (response.ok) {
            setBlogs(prev => prev.filter(b => b.id !== id));
            showSuccessToast('Article deleted successfully.');
          } else {
            const resData = await response.json();
            throw new Error(resData.message || 'Failed to delete blog.');
          }
        } catch (err: any) {
          console.error(err);
          showErrorAlert('Delete Failed', err.message || 'Failed to delete blog.');
        }
      }
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="animate-fadeIn text-xs flex flex-col min-h-full">
      {/* Upper header */}
      <div className="sticky top-0 bg-white dark:bg-[#09090b] z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200/80 dark:border-zinc-900 flex justify-between items-center transition-colors">
        <div>
          <h2 className="text-xl font-bold text-zinc-950 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Publishing Center
          </h2>
          <p className="text-zinc-500 text-[10px]">Create, edit, analyze, and optimize articles and academy blog posts with AI integration.</p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2 rounded font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-all text-[11px] hover:translate-y-[-1px]"
        >
          <Plus className="w-4 h-4" /> Add Blog Post
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1 bg-white dark:bg-zinc-950 transition-colors">
        
        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-zinc-950 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[10px] font-bold text-zinc-400 mt-4 uppercase tracking-wider">Loading Blogs...</p>
          </div>
        ) : (
          /* Blogs Table */
          <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold tracking-wider text-[10px] bg-zinc-50 dark:bg-zinc-900/60">
                  <th className="p-4 w-[80px]">Cover</th>
                  <th className="p-4">Title & Excerpt</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Stats (Views/Likes)</th>
                  <th className="p-4">Tags</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {blogs.length > 0 ? (
                  blogs.map((blog) => (
                    <tr key={blog.id} className="border-b border-zinc-200 dark:border-zinc-900/80 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 text-zinc-700 dark:text-zinc-300 transition-colors">
                      <td className="p-4">
                        <div className="w-12 h-8 rounded overflow-hidden bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={blog.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80'} 
                            alt={blog.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </td>
                      <td className="p-4 max-w-[220px]">
                        <div className="font-bold text-zinc-950 dark:text-white truncate" title={blog.title}>
                          {blog.title}
                        </div>
                        <div className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate" title={blog.excerpt}>
                          {blog.excerpt || 'No description preview available.'}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-zinc-850 dark:text-zinc-300">{blog.author}</div>
                        <div className="text-[9px] text-zinc-400 font-mono">{formatDate(blog.createdAt)}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded font-mono text-[9px] font-bold border ${
                          blog.status === 'Published' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-650 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/40'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800'
                        }`}>
                          {blog.status || 'Published'}
                        </span>
                      </td>
                      <td className="p-4 font-mono text-[10px] space-y-0.5">
                        <div className="flex items-center gap-1.5 text-zinc-900 dark:text-zinc-300">
                          <Eye className="w-3 h-3 text-zinc-400" />
                          <span>{(blog.views || 0).toLocaleString()} views</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-zinc-400">
                          <ThumbsUp className="w-3 h-3 text-zinc-500" />
                          <span>{(blog.likes || 0).toLocaleString()} likes</span>
                        </div>
                      </td>
                      <td className="p-4 max-w-[150px]">
                        <div className="flex flex-wrap gap-1">
                          {blog.tags.slice(0, 3).map((t, idx) => (
                            <span key={idx} className="bg-zinc-100 dark:bg-zinc-900 text-[9px] px-1.5 py-0.2 rounded font-mono border border-zinc-200/50 dark:border-zinc-800/40">
                              {t}
                            </span>
                          ))}
                          {blog.tags.length > 3 && (
                            <span className="text-[9px] text-zinc-400 font-mono font-bold">+{blog.tags.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => openViewModal(blog)}
                            title="Preview Post"
                            className="text-zinc-650 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white border border-zinc-250 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-850/80 p-1.5 rounded cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(blog)}
                            title="Edit Post"
                            className="text-zinc-650 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-white border border-zinc-250 dark:border-zinc-855 hover:bg-zinc-100 dark:hover:bg-zinc-850/80 p-1.5 rounded cursor-pointer transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.id, blog.title)}
                            title="Delete Post"
                            className="text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 border border-zinc-250 dark:border-zinc-855 hover:border-rose-355 dark:hover:border-rose-900 p-1.5 rounded cursor-pointer transition-colors"
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
                      No blog posts published yet. Click &quot;Add Blog Post&quot; to publish one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ==================== PREVIEW MODAL ==================== */}
        {showViewModal && viewingBlog && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 w-full max-w-4xl rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-zinc-950 dark:text-white">
              
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60">
                <span className="font-extrabold text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  Live Preview Engine
                </span>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                
                {/* Meta details */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[10px] font-bold text-zinc-450 dark:text-zinc-500">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {viewingBlog.author}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(viewingBlog.createdAt)}
                    </span>
                    <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-zinc-650 dark:text-zinc-350">
                      <Award className="w-3 h-3" />
                      {viewingBlog.difficulty || 'Beginner'}
                    </span>
                  </div>
                  
                  <h1 className="text-2xl md:text-4xl font-extrabold text-zinc-950 dark:text-white tracking-tight uppercase leading-tight">
                    {viewingBlog.title}
                  </h1>

                  <p className="text-sm text-zinc-500 leading-relaxed font-semibold italic border-l-2 border-zinc-250 dark:border-zinc-850 pl-3">
                    {viewingBlog.excerpt || 'No excerpt available.'}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    {viewingBlog.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-[8px] font-bold text-zinc-500 rounded uppercase tracking-wider flex items-center gap-0.5">
                        <TagIcon className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hero Cover */}
                <div className="relative aspect-video rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shadow-sm max-w-2xl mx-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={viewingBlog.image} alt={viewingBlog.title} className="w-full h-full object-cover" />
                </div>

                {/* HTML content rendered */}
                <div 
                  className="prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-350 font-medium text-xs md:text-sm leading-relaxed space-y-6 pt-4 border-t border-zinc-100 dark:border-zinc-900/50"
                  dangerouslySetInnerHTML={{ __html: viewingBlog.content }}
                />

                {/* FAQ Details if present */}
                {viewingBlog.faqs && (viewingBlog.faqs as any[]).length > 0 && (
                  <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900/50 space-y-4">
                    <span className="font-extrabold text-xs text-zinc-950 dark:text-white uppercase tracking-wider">Frequently Asked Questions (FAQ schema ready)</span>
                    <div className="space-y-3">
                      {(viewingBlog.faqs as any[]).map((faq, fIdx) => (
                        <div key={fIdx} className="border border-zinc-200 dark:border-zinc-800 p-4 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/30">
                          <span className="font-extrabold text-xs text-zinc-950 dark:text-white block mb-2 font-mono">Q: {faq.q}</span>
                          <span className="text-zinc-650 dark:text-zinc-400 text-xs font-semibold leading-relaxed block">A: {faq.a}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
