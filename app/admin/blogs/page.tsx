'use client';

import React, { useEffect, useState } from 'react';
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
  Image as ImageIcon,
  BookOpen, 
  Calendar,
  User,
  Tag as TagIcon
} from 'lucide-react';

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Selected blogs
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [viewingBlog, setViewingBlog] = useState<Blog | null>(null);

  // Form Fields States
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formAuthor, setFormAuthor] = useState('Hossen Shop Team');

  const [uploadingImage, setUploadingImage] = useState(false);

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

  useEffect(() => {
    fetchBlogs();
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
    setEditingBlog(null);
    setFormTitle('');
    setFormContent('');
    setFormImage('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80');
    setFormTags('Next.js, React, Engineering');
    setFormAuthor('Hossen Shop Team');
    setShowModal(true);
  };

  const openEditModal = (blog: Blog) => {
    setIsEditMode(true);
    setEditingBlog(blog);
    setFormTitle(blog.title);
    setFormContent(blog.content);
    setFormImage(blog.image);
    setFormTags(blog.tags.join(', '));
    setFormAuthor(blog.author);
    setShowModal(true);
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      showErrorToast('Blog title is required.');
      return;
    }
    if (!formContent.trim()) {
      showErrorToast('Content is required.');
      return;
    }

    const tagsArray = formTags.split(',').map(tag => tag.trim()).filter(Boolean);

    const payload = {
      title: formTitle.trim(),
      content: formContent.trim(),
      image: formImage.trim(),
      tags: tagsArray,
      author: formAuthor.trim() || 'Hossen Shop Team'
    };

    const token = localStorage.getItem('apex_user_token');
    if (!token) {
      showErrorToast('Authentication token not found. Please log in.');
      return;
    }

    try {
      const url = isEditMode && editingBlog 
        ? `${API_BASE_URL}/api/blogs/${editingBlog.id}`
        : `${API_BASE_URL}/api/blogs`;
      
      const method = isEditMode && editingBlog ? 'PUT' : 'POST';

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
        throw new Error(resData.message || 'Failed to save blog post.');
      }

      if (isEditMode) {
        showSuccessAlert('Article Updated!', 'The blog post has been successfully modified.');
      } else {
        showSuccessAlert('Article Added!', 'The new blog post has been successfully published.');
      }

      setShowModal(false);
      fetchBlogs();
    } catch (err: any) {
      console.error(err);
      showErrorAlert('Operation Failed', err.message || 'Failed to save blog.');
    }
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
      <div className="sticky top-0 bg-white dark:bg-[#09090b] z-20 px-6 py-5 md:px-8 md:py-6 border-b border-zinc-200 dark:border-zinc-900 flex justify-between items-center transition-colors">
        <div>
          <h2 className="text-xl font-bold text-zinc-955 dark:text-white uppercase tracking-tight">Blog Management</h2>
          <p className="text-zinc-500 text-[10px]">Create, edit, preview, and delete company articles and tutorials.</p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black px-4 py-2 rounded font-bold flex items-center gap-1.5 cursor-pointer shadow-sm transition-colors text-[11px]"
        >
          <Plus className="w-4 h-4" /> Add Blog Post
        </button>
      </div>

      <div className="p-6 md:p-8 space-y-6 flex-1 bg-white dark:bg-zinc-950 transition-colors">
        {/* Loading Spinner */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-zinc-955 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-[10px] font-bold text-zinc-400 mt-4 uppercase tracking-wider">Loading Blogs...</p>
          </div>
        ) : (
          /* Blogs Table */
          <div className="bg-white dark:bg-zinc-900/30 border border-zinc-200 dark:border-zinc-800 rounded overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase font-bold tracking-wider text-[10px] bg-zinc-50 dark:bg-zinc-900/60">
                  <th className="p-4 w-[80px]">Cover</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Author</th>
                  <th className="p-4">Date</th>
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
                      <td className="p-4 max-w-[250px] font-bold text-zinc-950 dark:text-white truncate" title={blog.title}>
                        {blog.title}
                      </td>
                      <td className="p-4 font-semibold text-zinc-800 dark:text-zinc-300">
                        {blog.author}
                      </td>
                      <td className="p-4 font-mono text-[10px]">
                        {formatDate(blog.createdAt)}
                      </td>
                      <td className="p-4 max-w-[200px]">
                        <div className="flex flex-wrap gap-1">
                          {blog.tags.map((t, idx) => (
                            <span key={idx} className="bg-zinc-100 dark:bg-zinc-900 text-[9px] px-2 py-0.5 rounded font-bold border border-zinc-250/20 dark:border-zinc-800/40">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => openViewModal(blog)}
                            title="Preview Post"
                            className="text-zinc-650 hover:text-zinc-955 dark:text-zinc-400 dark:hover:text-white border border-zinc-255 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-850/80 p-1.5 rounded cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => openEditModal(blog)}
                            title="Edit Post"
                            className="text-zinc-650 hover:text-zinc-955 dark:text-zinc-400 dark:hover:text-white border border-zinc-255 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-850/80 p-1.5 rounded cursor-pointer transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteBlog(blog.id, blog.title)}
                            title="Delete Post"
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
                      No blog posts published yet. Click &quot;Add Blog Post&quot; to publish one.
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
            <div className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 w-full max-w-2xl rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-zinc-950 dark:text-white">
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-white">
                    {isEditMode ? 'Modify Blog Post' : 'Publish Blog Post'}
                  </h3>
                  <p className="text-[10px] text-zinc-550 dark:text-zinc-450">Set title, metadata, cover image and article text.</p>
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
                    <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Article Title *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g. Scaling Express & Prisma Client to 10k RPS" 
                      value={formTitle} 
                      onChange={(e) => setFormTitle(e.target.value)} 
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 font-bold" 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Author *</label>
                      <input 
                        type="text" 
                        required 
                        value={formAuthor} 
                        onChange={(e) => setFormAuthor(e.target.value)} 
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 font-semibold" 
                      />
                    </div>
                    <div>
                      <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Tags (Comma separated) *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Next.js, Prisma, database" 
                        value={formTags} 
                        onChange={(e) => setFormTags(e.target.value)} 
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 font-semibold" 
                      />
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
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded px-3 py-2 text-xs focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 font-mono" 
                    />
                  </div>

                  <div>
                    <label className="block text-zinc-650 dark:text-zinc-400 font-bold mb-1 uppercase tracking-wider text-[9px]">Article Body Content *</label>
                    <textarea 
                      rows={10} 
                      required 
                      placeholder="Write your blog content here (supports multiline text)..." 
                      value={formContent} 
                      onChange={(e) => setFormContent(e.target.value)} 
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-zinc-900 dark:text-white rounded p-3 text-xs resize-none focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 font-medium leading-relaxed" 
                    />
                  </div>

                </div>

                <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end gap-2 bg-zinc-50 dark:bg-zinc-900/60">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-zinc-250 dark:border-zinc-800 hover:border-zinc-400 text-zinc-700 dark:text-zinc-300 rounded font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold cursor-pointer"
                  >
                    Publish Post
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================== VIEW MODAL ==================== */}
        {showViewModal && viewingBlog && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 w-full max-w-2xl rounded-lg overflow-hidden shadow-2xl flex flex-col max-h-[85vh] text-zinc-950 dark:text-white">
              
              <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center bg-zinc-50 dark:bg-zinc-900/60">
                <span className="font-extrabold text-[10px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  Article Preview
                </span>
                <button 
                  onClick={() => setShowViewModal(false)} 
                  className="text-zinc-405 hover:text-zinc-950 dark:hover:text-white cursor-pointer transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                    <span className="flex items-center gap-0.5">
                      <Calendar className="w-3 h-3" />
                      {formatDate(viewingBlog.createdAt)}
                    </span>
                    <span className="flex items-center gap-0.5">
                      <User className="w-3 h-3" />
                      {viewingBlog.author}
                    </span>
                  </div>
                  <h1 className="text-xl md:text-2xl font-black uppercase text-zinc-950 dark:text-white tracking-tight">{viewingBlog.title}</h1>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {viewingBlog.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-[8px] font-bold text-zinc-500 rounded uppercase tracking-wider flex items-center gap-0.5">
                        <TagIcon className="w-2.5 h-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="aspect-video rounded overflow-hidden border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={viewingBlog.image} alt={viewingBlog.title} className="w-full h-full object-cover" />
                </div>

                <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold whitespace-pre-wrap text-[11px]">
                  {viewingBlog.content}
                </p>
              </div>

              <div className="px-6 py-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-end bg-zinc-50 dark:bg-zinc-900/60">
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="px-5 py-1.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded font-bold cursor-pointer text-[10px]"
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
