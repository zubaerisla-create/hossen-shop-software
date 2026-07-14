'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Tag, 
  ThumbsUp, 
  Bookmark, 
  BookOpen, 
  Award, 
  Clock, 
  CheckCircle,
  HelpCircle,
  Download,
  ExternalLink,
  MessageSquare,
  ChevronRight,
  Info
} from 'lucide-react';
import { API_BASE_URL } from '@/app/utils/api';
import { Blog, Product } from '../../types';

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const LinkedinIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
  </svg>
);

const GithubIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
  </svg>
);

interface BlogDetailsClientProps {
  initialBlog: Blog;
}

export default function BlogDetailsClient({ initialBlog: blog }: BlogDetailsClientProps) {
  const [linkedProduct, setLinkedProduct] = useState<Product | null>(null);

  // Engagement States
  const [likesCount, setLikesCount] = useState(blog.likes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasSaved, setHasSaved] = useState(false);

  // Retrieve user liked/saved state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHasLiked(localStorage.getItem(`hasLiked_${blog.slug}`) === 'true');
      setHasSaved(localStorage.getItem(`hasSaved_${blog.slug}`) === 'true');
    }
  }, [blog.slug]);

  // Scroll Progress
  const [scrollProgress, setScrollProgress] = useState(0);

  // Dynamic comments state
  const [comments, setComments] = useState<any[]>(() => {
    if (blog.comments) {
      return Array.isArray(blog.comments) 
        ? blog.comments 
        : JSON.parse(blog.comments as any || '[]');
    }
    return [];
  });
  const [newCommentName, setNewCommentName] = useState('');
  const [newCommentText, setNewCommentText] = useState('');

  // Page Scroll listener for progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch linked product data if present
  useEffect(() => {
    if (blog && blog.productId) {
      const fetchLinkedProduct = async () => {
        try {
          const res = await fetch(`${API_BASE_URL}/api/products/${blog.productId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.status === 'success' && data.data && data.data.product) {
              setLinkedProduct(data.data.product);
            }
          }
        } catch (err) {
          console.error('Failed to fetch linked product:', err);
        }
      };
      fetchLinkedProduct();
    }
  }, [blog]);

  const handleLike = async () => {
    const nextLiked = !hasLiked;
    const action = nextLiked ? 'like' : 'unlike';

    // Optimistic UI updates
    setHasLiked(nextLiked);
    setLikesCount(prev => nextLiked ? prev + 1 : Math.max(0, prev - 1));
    if (typeof window !== 'undefined') {
      localStorage.setItem(`hasLiked_${blog.slug}`, String(nextLiked));
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/${blog.slug}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.status === 'success' && resData.data) {
          setLikesCount(resData.data.likes);
        }
      }
    } catch (err) {
      console.error('Failed to sync like action:', err);
    }
  };

  const handleSave = async () => {
    const nextSaved = !hasSaved;
    const action = nextSaved ? 'save' : 'unsave';

    // Optimistic UI updates
    setHasSaved(nextSaved);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`hasSaved_${blog.slug}`, String(nextSaved));
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/${blog.slug}/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (!res.ok) {
        console.error('Failed to sync save action');
      }
    } catch (err) {
      console.error('Failed to sync save action:', err);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentName.trim() || !newCommentText.trim()) return;

    const name = newCommentName.trim();
    const text = newCommentText.trim();

    setNewCommentName('');
    setNewCommentText('');

    try {
      const res = await fetch(`${API_BASE_URL}/api/blogs/${blog.slug}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user: name, text })
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.status === 'success' && resData.data && resData.data.comments) {
          const updatedComments = Array.isArray(resData.data.comments)
            ? resData.data.comments
            : JSON.parse(resData.data.comments || '[]');
          setComments(updatedComments);
        }
      }
    } catch (err) {
      console.error('Failed to submit comment:', err);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleSocialShare = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    if (typeof window === 'undefined') return;
    const url = window.location.href;
    const title = blog?.title || '';
    
    let shareUrl = '';
    if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (platform === 'linkedin') {
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-[#070708] text-zinc-900 dark:text-zinc-100 font-sans min-h-screen transition-colors">
      <Header />

      {/* Sticky Reading Progress Bar */}
      <div className="sticky top-[56px] left-0 right-0 h-0.5 bg-zinc-100 dark:bg-zinc-900 z-30">
        <div 
          className="h-full bg-purple-600 dark:bg-purple-400 transition-all duration-75" 
          style={{ width: `${scrollProgress}%` }} 
        />
      </div>

      <main className="flex-1 w-full max-w-[1300px] mx-auto px-6 py-12 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-955 dark:hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* Left/Main Column: Article content */}
          <article className="lg:col-span-8 space-y-8">
            
            {/* Header Info */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(blog.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  {blog.author}
                </span>
                {blog.difficulty && (
                  <span className="flex items-center gap-1 bg-purple-50 dark:bg-purple-955/20 text-purple-650 dark:text-purple-400 px-2.5 py-0.5 rounded border border-purple-100/30 dark:border-purple-900/30">
                    <Award className="w-3 h-3" />
                    {blog.difficulty}
                  </span>
                )}
                {blog.readingTime && (
                  <span className="flex items-center gap-1 text-zinc-450 dark:text-zinc-400">
                    <Clock className="w-3 h-3" />
                    {blog.readingTime} min read
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-5xl font-black uppercase tracking-tight text-zinc-950 dark:text-white leading-[1.1]">
                {blog.title}
              </h1>

              {blog.excerpt && (
                <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed italic border-l-4 border-purple-500 dark:border-purple-400 pl-4 py-1">
                  {blog.excerpt}
                </p>
              )}

              <div className="flex flex-wrap gap-1.5 pt-2">
                {blog.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="px-2.5 py-0.5 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-800 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 rounded uppercase tracking-wider flex items-center gap-0.5"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Cover Image & Details */}
            <div className="space-y-2">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={blog.image} 
                  alt={blog.imageAlt || blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
              {blog.imageCaption && (
                <p className="text-center text-[10px] text-zinc-450">
                  {blog.imageCaption} {blog.imageCredit && <span className="font-mono">({blog.imageCredit})</span>}
                </p>
              )}
            </div>

            {/* Engagement Panel */}
            <div className="flex items-center justify-between border-y border-zinc-200/60 dark:border-zinc-900/60 py-3 text-xs">
              <div className="flex items-center gap-4">
                <button 
                  onClick={handleLike} 
                  className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                    hasLiked ? 'text-purple-650 dark:text-purple-450' : 'text-zinc-500 hover:text-zinc-950 dark:hover:text-white'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{likesCount} Likes</span>
                </button>
                <button 
                  onClick={handleSave} 
                  className={`flex items-center gap-1.5 font-bold transition-colors cursor-pointer ${
                    hasSaved ? 'text-purple-650 dark:text-purple-450' : 'text-zinc-500 hover:text-zinc-955 dark:hover:text-white'
                  }`}
                >
                  <Bookmark className="w-4 h-4" />
                  <span>{hasSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-zinc-450">Share:</span>
                <button onClick={() => handleSocialShare('twitter')} className="text-zinc-500 hover:text-zinc-955 dark:hover:text-white transition-colors cursor-pointer">
                  <TwitterIcon className="w-4 h-4" />
                </button>
                <button onClick={() => handleSocialShare('linkedin')} className="text-zinc-500 hover:text-zinc-955 dark:hover:text-white transition-colors cursor-pointer">
                  <LinkedinIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Key Takeaways & Prerequisites Banner */}
            {((blog.keyTakeaways && blog.keyTakeaways.length > 0) || (blog.prerequisites && blog.prerequisites.length > 0)) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 bg-zinc-50/50 dark:bg-zinc-900/10">
                {blog.keyTakeaways && blog.keyTakeaways.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-purple-650 dark:text-purple-400 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" />
                      What You Will Learn
                    </h4>
                    <ul className="space-y-2">
                      {blog.keyTakeaways.map((takeaway, idx) => (
                        <li key={idx} className="text-xs text-zinc-750 dark:text-zinc-350 leading-relaxed font-semibold">
                          • {takeaway}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {blog.prerequisites && blog.prerequisites.length > 0 && (
                  <div className="space-y-3 md:border-l md:border-zinc-200 dark:md:border-zinc-850 md:pl-5">
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                      <Info className="w-4 h-4 text-zinc-400" />
                      Recommended Prerequisites
                    </h4>
                    <ul className="space-y-2">
                      {blog.prerequisites.map((req, idx) => (
                        <li key={idx} className="text-xs text-zinc-750 dark:text-zinc-350 leading-relaxed font-semibold">
                          • {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Main Content Render (Compiled Blocks HTML) */}
            <div 
              className="prose prose-zinc dark:prose-invert max-w-none text-zinc-750 dark:text-zinc-300 font-medium text-sm md:text-base leading-relaxed space-y-6 pt-4"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Attachments / Downloads list */}
            {blog.attachments && (blog.attachments as any[]).length > 0 && (
              <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 space-y-3">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-zinc-955 dark:text-white flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  Downloadable Assets & Source Code
                </h4>
                <div className="space-y-2">
                  {(blog.attachments as any[]).map((att, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-zinc-55/5 dark:bg-zinc-900/30 p-3 border border-zinc-200 dark:border-zinc-850 rounded-lg text-xs">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-zinc-450" />
                        <span className="font-semibold text-zinc-800 dark:text-zinc-300">{att.name}</span>
                      </div>
                      <a 
                        href={att.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-205 text-white dark:text-black font-extrabold px-3 py-1 rounded text-[10px] tracking-wide uppercase flex items-center gap-1"
                      >
                        Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FAQ Accordion Section */}
            {blog.faqs && (blog.faqs as any[]).length > 0 && (
              <div className="space-y-4 pt-6 border-t border-zinc-200/50 dark:border-zinc-900/50">
                <h3 className="font-extrabold text-lg uppercase tracking-tight text-zinc-950 dark:text-white flex items-center gap-1.5">
                  <HelpCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Frequently Asked Questions
                </h3>
                <div className="space-y-3">
                  {(blog.faqs as any[]).map((faq, idx) => (
                    <details key={idx} className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-4 group bg-zinc-50/20 dark:bg-zinc-900/5">
                      <summary className="font-bold cursor-pointer text-xs md:text-sm list-none flex justify-between items-center select-none">
                        {faq.q}
                        <span className="text-zinc-400 group-open:rotate-180 transition-transform">
                          <ChevronRight className="w-4 h-4" />
                        </span>
                      </summary>
                      <p className="mt-3 text-xs md:text-sm text-zinc-655 dark:text-zinc-400 leading-relaxed font-semibold">
                        {faq.a}
                      </p>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            {blog.allowComments !== false && (
              <div className="space-y-6 pt-8 border-t border-zinc-200/60 dark:border-zinc-900/60">
                <h3 className="font-extrabold text-lg uppercase tracking-tight text-zinc-950 dark:text-white flex items-center gap-1.5">
                  <MessageSquare className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Community Comments ({comments.length})
                </h3>

                <div className="space-y-4">
                  {comments.map((c) => (
                    <div key={c.id} className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-150 dark:border-zinc-900 p-4 rounded-lg space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-xs text-zinc-955 dark:text-white">{c.user}</span>
                        <span className="text-[10px] text-zinc-450 font-mono">
                          {c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'Just now'}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-655 dark:text-zinc-400 leading-relaxed font-medium">
                        {c.text}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Comment Form */}
                <form onSubmit={handleCommentSubmit} className="space-y-3 bg-zinc-50/20 dark:bg-zinc-900/5 p-5 border border-zinc-200/50 dark:border-zinc-800 rounded-lg">
                  <span className="font-bold text-xs uppercase tracking-wider text-zinc-500 block mb-1">Add to the discussion</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      placeholder="Your Name" 
                      required
                      value={newCommentName}
                      onChange={(e) => setNewCommentName(e.target.value)}
                      className="bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-xs rounded px-3 py-2 w-full"
                    />
                  </div>
                  <textarea 
                    rows={3} 
                    placeholder="Write your feedback..." 
                    required
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                    className="bg-white dark:bg-zinc-950 border border-zinc-250 dark:border-zinc-800 text-xs rounded p-3 w-full resize-none"
                  />
                  <button 
                    type="submit" 
                    className="bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-205 text-white dark:text-black font-extrabold px-4 py-2 rounded text-[10px] uppercase cursor-pointer"
                  >
                    Post Comment
                  </button>
                </form>
              </div>
            )}

          </article>

          {/* Right Column: Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Sticky Container */}
            <div className="sticky top-[80px] space-y-6">
              
              {/* Heading Navigation (Table of Contents) */}
              {blog.tableOfContents && (blog.tableOfContents as any[]).length > 0 && (
                <div className="border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl bg-white dark:bg-zinc-900/10 space-y-4">
                  <span className="font-extrabold text-[10px] text-zinc-450 uppercase tracking-widest block border-b border-zinc-200 dark:border-zinc-850 pb-2">
                    Table of Contents
                  </span>
                  <nav className="space-y-2">
                    {(blog.tableOfContents as any[]).map((heading, idx) => (
                      <a 
                        key={idx}
                        href={`#${heading.id}`}
                        className={`block text-xs font-bold transition-colors hover:text-purple-600 dark:hover:text-purple-400 ${
                          heading.level === 1 ? 'pl-0' : heading.level === 2 ? 'pl-3 text-zinc-500' : 'pl-6 text-zinc-450'
                        }`}
                      >
                        {heading.text}
                      </a>
                    ))}
                  </nav>
                </div>
              )}

              {/* Author Card Info */}
              <div className="border border-zinc-200 dark:border-zinc-800 p-5 rounded-xl bg-white dark:bg-zinc-900/10 space-y-4">
                <span className="font-extrabold text-[10px] text-zinc-450 uppercase tracking-widest block border-b border-zinc-200 dark:border-zinc-850 pb-2">
                  Meet The Author
                </span>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/40 border border-purple-200 dark:border-purple-800 flex items-center justify-center font-extrabold text-sm text-purple-700 dark:text-purple-300">
                      {blog.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-extrabold text-xs text-zinc-955 dark:text-white leading-none">{blog.author}</h4>
                      <span className="text-[9px] text-zinc-400">Technical Content Writer</span>
                    </div>
                  </div>

                  <p className="text-zinc-650 dark:text-zinc-400 text-xs leading-relaxed font-semibold">
                    {blog.authorBio || 'Software engineer specializing in distributed applications, schema validations, and high performance content engines.'}
                  </p>

                  {/* Author Social Handles */}
                  {blog.authorSocials && (
                    <div className="flex items-center gap-3 pt-1">
                      {blog.authorSocials.twitter && (
                        <a href={`https://twitter.com/${blog.authorSocials.twitter}`} target="_blank" rel="noopener noreferrer" className="text-zinc-450 hover:text-zinc-955 dark:hover:text-white">
                          <TwitterIcon className="w-4 h-4" />
                        </a>
                      )}
                      {blog.authorSocials.linkedin && (
                        <a href={`https://linkedin.com/in/${blog.authorSocials.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-zinc-450 hover:text-zinc-955 dark:hover:text-white">
                          <LinkedinIcon className="w-4 h-4" />
                        </a>
                      )}
                      {blog.authorSocials.github && (
                        <a href={`https://github.com/${blog.authorSocials.github}`} target="_blank" rel="noopener noreferrer" className="text-zinc-450 hover:text-zinc-955 dark:hover:text-white">
                          <GithubIcon className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Linked Marketplace Product Banner */}
              {linkedProduct && (
                <div className="border border-purple-200 dark:border-purple-900/40 p-5 rounded-xl bg-purple-50/5 dark:bg-purple-950/10 space-y-4">
                  <span className="font-extrabold text-[9px] text-purple-700 dark:text-purple-400 uppercase tracking-widest block border-b border-purple-100 dark:border-purple-900/30 pb-2">
                    Featured Marketplace Item
                  </span>
                  <div className="space-y-3">
                    {linkedProduct.images?.[0] && (
                      <div className="aspect-video rounded-lg overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        <img src={linkedProduct.images[0]} alt={linkedProduct.name} className="w-full h-full object-cover" />
                      </div>
                    )}
                    <div>
                      <h4 className="font-black text-xs text-zinc-950 dark:text-white leading-tight uppercase">{linkedProduct.name}</h4>
                      <span className="text-[10px] text-purple-650 dark:text-purple-405 font-mono font-bold mt-1 block">BDT {linkedProduct.price.toLocaleString()}</span>
                    </div>
                    <p className="text-[10px] text-zinc-550 dark:text-zinc-400 leading-normal line-clamp-3">
                      {linkedProduct.description}
                    </p>
                    <Link 
                      href={`/products/${linkedProduct.id}`}
                      className="w-full bg-purple-650 hover:bg-purple-700 text-white font-extrabold py-2 px-3 rounded text-[10px] uppercase tracking-wide flex items-center justify-center gap-1 transition-all"
                    >
                      <span>Acquire Product Code</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              )}

            </div>

          </aside>

        </div>
      </main>

      <Footer />
    </div>
  );
}
