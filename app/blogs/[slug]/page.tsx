'use client';

import React, { useEffect, useState, use } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';
import { API_BASE_URL } from '@/app/utils/api';
import { Blog } from '../../types';

export default function BlogDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/blogs/${slug}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.data && data.data.blog) {
            setBlog(data.data.blog);
          } else {
            setError('Failed to load the article details.');
          }
        } else {
          setError('Article not found.');
        }
      } catch (err) {
        console.error('Failed to fetch blog details:', err);
        setError('Network error while loading article details.');
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-[#070708] text-zinc-900 dark:text-zinc-100 font-sans min-h-screen transition-colors">
      <Header />

      <main className="flex-1 w-full max-w-[900px] mx-auto px-6 py-12 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blogs
          </Link>
        </div>

        {/* Loading / Error / Article Content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-zinc-950 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-zinc-400 mt-4 uppercase tracking-wider">Loading article details...</p>
          </div>
        ) : error || !blog ? (
          <div className="py-24 text-center border border-dashed border-rose-250 dark:border-rose-900/40 rounded-lg">
            <p className="text-sm font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider">{error || 'Article not found'}</p>
            <Link href="/blogs" className="text-xs text-zinc-500 dark:text-zinc-400 underline mt-2 block">
              Back to all blogs
            </Link>
          </div>
        ) : (
          <article className="space-y-8">
            {/* Header info */}
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
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-zinc-950 dark:text-white leading-tight">
                {blog.title}
              </h1>

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

            {/* Cover Image */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={blog.image} 
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content body */}
            <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-300 font-medium text-sm md:text-base leading-relaxed space-y-6 whitespace-pre-wrap pt-4">
              {blog.content}
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
