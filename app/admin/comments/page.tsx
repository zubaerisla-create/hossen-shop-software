'use client';

import React, { useState, useEffect } from 'react';
import { MessageCircle, Search, Edit2, Trash2, X, Check, Loader2, AlertCircle, ExternalLink, Calendar } from 'lucide-react';
import { API_BASE_URL } from '@/app/utils/api';

interface BlogComment {
  id: string;
  blogId: string;
  blogTitle: string;
  blogSlug: string;
  user: string;
  text: string;
  createdAt: string;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit modal state
  const [editingComment, setEditingComment] = useState<BlogComment | null>(null);
  const [editText, setEditText] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString();
    } catch {
      return 'N/A';
    }
  };

  const formatTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString();
    } catch {
      return '';
    }
  };

  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    setIsLoading(true);
    setError(null);
    const token = localStorage.getItem('apex_user_token');

    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/comments/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success' && data.data?.comments) {
          setComments(data.data.comments);
        } else {
          setError('Failed to retrieve comments.');
        }
      } else {
        setError('Unauthorized or database fetch failed.');
      }
    } catch (err) {
      setError('Network error occurred while fetching comments.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEdit = (comment: BlogComment) => {
    setEditingComment(comment);
    setEditText(comment.text);
  };

  const handleCloseEdit = () => {
    setEditingComment(null);
    setEditText('');
  };

  const handleUpdateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComment || !editText.trim()) return;

    setIsUpdating(true);
    const token = localStorage.getItem('apex_user_token');

    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/comments/${editingComment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          text: editText.trim(),
          blogId: editingComment.blogId
        })
      });

      if (res.ok) {
        // Update local state
        setComments(prev =>
          prev.map(c =>
            c.id === editingComment.id ? { ...c, text: editText.trim() } : c
          )
        );
        handleCloseEdit();
        // Dispatch toast event to parent layout
        window.dispatchEvent(new CustomEvent('apex-admin-toast', { detail: 'Comment updated successfully.' }));
      } else {
        alert('Failed to update comment.');
      }
    } catch (err) {
      alert('Error updating comment.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteComment = async (commentId: string, blogId: string) => {
    if (!confirm('Are you sure you want to delete this comment? This action is permanent.')) return;

    const token = localStorage.getItem('apex_user_token');

    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/comments/${commentId}?blogId=${blogId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.ok) {
        // Remove from local state
        setComments(prev => prev.filter(c => c.id !== commentId));
        window.dispatchEvent(new CustomEvent('apex-admin-toast', { detail: 'Comment deleted successfully.' }));
      } else {
        alert('Failed to delete comment.');
      }
    } catch (err) {
      alert('Error deleting comment.');
    }
  };

  // Filtered comments
  const filteredComments = comments.filter(c => {
    const query = searchQuery.toLowerCase();
    return (
      c.user.toLowerCase().includes(query) ||
      c.text.toLowerCase().includes(query) ||
      c.blogTitle.toLowerCase().includes(query)
    );
  });

  return (
    <div className="flex-1 p-6 md:p-10 w-full space-y-8">
      
      {/* Title Header Banner */}
      <div className="border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <h1 className="text-xl md:text-3xl font-black uppercase tracking-tight text-zinc-950 dark:text-white flex items-center gap-3">
          <MessageCircle className="w-8 h-8 text-purple-600 dark:text-purple-400" />
          Blog Comments Control
        </h1>
        <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed font-semibold">
          Moderate user discussions, edit feedback, and clean up spam or inappropriate comment entries across all articles.
        </p>
      </div>

      {/* Toolbar controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-450">
            <Search className="h-4 w-4" />
          </span>
          <input
            type="text"
            placeholder="Search by user, keyword, or blog title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-lg pl-9 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-purple-500 transition-colors"
          />
        </div>
        <button
          onClick={fetchComments}
          className="w-full sm:w-auto bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[10px] font-extrabold px-4 py-2.5 rounded-lg uppercase tracking-wider transition-all cursor-pointer"
        >
          Refresh Comments
        </button>
      </div>

      {/* Table listing */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-2">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-400">Loading Comments...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-2">
          <AlertCircle className="w-10 h-10 text-rose-500" />
          <p className="text-xs font-bold text-rose-600">{error}</p>
          <button onClick={fetchComments} className="text-xs font-bold text-purple-500 underline uppercase">Retry</button>
        </div>
      ) : filteredComments.length === 0 ? (
        <div className="text-center py-16 text-zinc-450 border border-dashed border-zinc-200 dark:border-zinc-850 rounded-xl font-semibold text-xs">
          No comments matching your search criteria were found.
        </div>
      ) : (
        <div className="border border-zinc-200 dark:border-zinc-850 rounded-xl overflow-hidden bg-white dark:bg-[#070708]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-850 text-zinc-500 text-[9px] uppercase font-bold tracking-wider">
                  <th className="p-4">Author</th>
                  <th className="p-4">Comment Content</th>
                  <th className="p-4">Associated Blog</th>
                  <th className="p-4">Submitted Date</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-150 dark:divide-zinc-850 font-semibold text-zinc-700 dark:text-zinc-300">
                {filteredComments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10">
                    <td className="p-4">
                      <div className="font-extrabold text-zinc-900 dark:text-white">{comment.user}</div>
                      <span className="text-[9px] text-purple-600 dark:text-purple-400 uppercase font-bold tracking-wide">Reader</span>
                    </td>
                    <td className="p-4 max-w-sm">
                      <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed break-words">{comment.text}</p>
                    </td>
                    <td className="p-4">
                      <a
                        href={`/blogs/${comment.blogSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                      >
                        <span className="max-w-[150px] truncate">{comment.blogTitle}</span>
                        <ExternalLink className="w-3 h-3 shrink-0" />
                      </a>
                    </td>
                    <td className="p-4 text-zinc-450 dark:text-zinc-400 font-mono text-[10px] space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 opacity-60" />
                        <span>{formatDate(comment.createdAt)}</span>
                      </div>
                      <span className="text-[9px] opacity-75">{formatTime(comment.createdAt)}</span>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(comment)}
                          className="p-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-purple-400 cursor-pointer transition-colors"
                          title="Edit Comment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteComment(comment.id, comment.blogId)}
                          className="p-2 border border-rose-100 dark:border-rose-950/20 rounded bg-rose-50/20 text-rose-600 hover:bg-rose-50 cursor-pointer transition-colors"
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
      )}

      {/* Edit comment overlay modal */}
      {editingComment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-850 w-full max-w-md rounded-xl shadow-2xl overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-850">
              <h3 className="font-extrabold text-xs text-zinc-900 dark:text-white uppercase tracking-wider">
                Edit Comment
              </h3>
              <button
                onClick={handleCloseEdit}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleUpdateComment} className="p-5 space-y-4">
              <div className="space-y-1">
                <span className="text-[9px] uppercase font-extrabold text-zinc-450 block">Comment Author</span>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">{editingComment.user}</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] uppercase font-extrabold text-zinc-450 block">Comment Text</label>
                <textarea
                  rows={4}
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  required
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-xs rounded-lg p-3 font-semibold focus:outline-none focus:border-purple-500 transition-colors leading-relaxed"
                />
              </div>

              {/* Modal footer */}
              <div className="flex justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-850">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="px-4 py-2 border border-zinc-200 dark:border-zinc-800 text-xs font-extrabold rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 uppercase tracking-wide cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating || !editText.trim()}
                  className="bg-zinc-950 dark:bg-white text-white dark:text-black hover:bg-zinc-850 dark:hover:bg-zinc-200 px-4 py-2 text-xs font-extrabold rounded-lg uppercase tracking-wide cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
