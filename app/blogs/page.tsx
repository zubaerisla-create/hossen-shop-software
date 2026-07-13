'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Search, Calendar, User, Tag, ArrowRight } from 'lucide-react';
import { API_BASE_URL } from '@/app/utils/api';
import { Blog } from '../types';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBlogs = async () => {
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
    fetchBlogs();
  }, []);

  const filteredBlogs = blogs.filter((blog) => {
    return (
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

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

      <main className="flex-1 w-full max-w-[1400px] mx-auto px-6 py-12 space-y-12">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>

        {/* Page Title & Search */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 dark:border-zinc-900 pb-10">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest block">
              Knowledge Hub
            </span>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-zinc-950 dark:text-white leading-[1.1]">
              Engineering <br />
              & Tech Blogs
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs max-w-sm leading-relaxed">
              Explore resources, guides, and engineering insights from our product development teams.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search blogs or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-55/5 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs font-semibold focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 transition-colors"
            />
          </div>
        </div>

        {/* Loading / Content State */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-zinc-950 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-zinc-400 mt-4 uppercase tracking-wider">Loading articles...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">No articles found</p>
            <p className="text-xs text-zinc-400 mt-1">Try refining your search terms or tags.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBlogs.map((blog) => (
              <article 
                key={blog.id} 
                className="group flex flex-col bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-150 dark:border-zinc-900 rounded-lg overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-zinc-800 hover:shadow-lg"
              >
                {/* Image Section */}
                <Link href={`/blogs/${blog.slug}`} className="relative block aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={blog.image} 
                    alt={blog.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                {/* Content Section */}
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(blog.createdAt)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {blog.author}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="font-extrabold text-base md:text-lg text-zinc-900 dark:text-white line-clamp-2 leading-snug group-hover:text-purple-650 dark:group-hover:text-purple-400 transition-colors">
                      <Link href={`/blogs/${blog.slug}`}>
                        {blog.title}
                      </Link>
                    </h3>

                    {/* Snippet */}
                    <p className="text-zinc-555 dark:text-zinc-400 text-xs font-medium leading-relaxed line-clamp-3">
                      {blog.content}
                    </p>
                  </div>

                  {/* Tags and Action */}
                  <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-900/50 flex items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-1.5 max-w-[70%]">
                      {blog.tags.slice(0, 2).map((tag, idx) => (
                        <span 
                          key={idx} 
                          className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200/30 dark:border-zinc-800/40 text-[9px] font-bold text-zinc-500 dark:text-zinc-400 rounded uppercase tracking-wider flex items-center gap-0.5"
                        >
                          <Tag className="w-2.5 h-2.5 shrink-0" />
                          {tag}
                        </span>
                      ))}
                    </div>

                    <Link 
                      href={`/blogs/${blog.slug}`} 
                      className="inline-flex items-center gap-1 text-[10px] font-extrabold text-zinc-950 dark:text-white uppercase tracking-wider group-hover:gap-1.5 transition-all"
                    >
                      Read
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
