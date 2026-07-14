'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Search, 
  Calendar, 
  User, 
  Tag, 
  ArrowRight, 
  Clock, 
  Award, 
  Eye, 
  ThumbsUp, 
  Sparkles 
} from 'lucide-react';
import { API_BASE_URL } from '@/app/utils/api';
import { Blog } from '../types';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categoriesList = ['All', 'Web Development', 'AI', 'Programming', 'Business', 'Marketing', 'Career', 'Design', 'Mobile App'];

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
    const matchesSearch = (
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const matchesCategory = selectedCategory === 'All' || 
      (blog.categories && blog.categories.includes(selectedCategory));

    return matchesSearch && matchesCategory;
  });

  // Identify Featured Post (only if explicitly marked isFeatured)
  const featuredBlog = blogs.find(b => b.isFeatured);
  const regularBlogs = featuredBlog 
    ? filteredBlogs.filter(b => b.id !== featuredBlog.id)
    : filteredBlogs;

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
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-955 dark:hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Marketplace
          </Link>
        </div>

        {/* Page Title & Search Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-zinc-200 dark:border-zinc-900 pb-10">
          <div className="space-y-3">
            <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Apex Publishing Hub
            </span>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-zinc-955 dark:text-white leading-[1.1]">
              Knowledge Hub <br />
              & Tech insights
            </h1>
            <p className="text-zinc-550 dark:text-zinc-400 text-xs max-w-sm leading-relaxed font-semibold">
              Explore resources, notion-style design blocks, guides, and engineering notes compiled by our academy educators.
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search guides, categories, tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-md text-xs font-semibold focus:outline-none focus:border-zinc-450 dark:focus:border-zinc-700 transition-colors"
            />
          </div>
        </div>

        {/* Category Selection Pills */}
        <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 dark:border-zinc-900/50 pb-6">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-black border-zinc-950 dark:border-white shadow-sm'
                  : 'bg-zinc-50 dark:bg-zinc-900/30 text-zinc-500 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800/80 hover:text-zinc-950 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Loading / Content State */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-zinc-955 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-zinc-400 mt-4 uppercase tracking-wider">Loading publishing catalog...</p>
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="py-24 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg">
            <p className="text-sm font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">No matching articles found</p>
            <p className="text-xs text-zinc-400 mt-1">Try resetting category filters or search parameters.</p>
          </div>
        ) : (
          <div className="space-y-12">
            
            {/* HERO FEATURED POST CARD */}
            {featuredCategorySelected() && featuredBlog && (
              <div className="border border-zinc-200 dark:border-zinc-850 rounded-2xl overflow-hidden bg-zinc-50/20 dark:bg-zinc-900/10 grid grid-cols-1 lg:grid-cols-12 shadow-lg hover:border-zinc-300 dark:hover:border-zinc-800 transition-colors">
                
                {/* Hero Image */}
                <Link 
                  href={`/blogs/${featuredBlog.slug}`} 
                  className="lg:col-span-7 relative block aspect-video lg:aspect-auto min-h-[250px] lg:min-h-[400px] overflow-hidden bg-zinc-100 dark:bg-zinc-850"
                >
                  <img 
                    src={featuredBlog.image} 
                    alt={featuredBlog.title} 
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-101" 
                  />
                  <span className="absolute top-4 left-4 bg-purple-650 text-white font-extrabold text-[9px] uppercase tracking-widest px-3 py-1 rounded-md shadow flex items-center gap-1">
                    <Sparkles className="w-3 h-3 animate-pulse" />
                    Featured Spotlight
                  </span>
                </Link>

                {/* Hero Info */}
                <div className="lg:col-span-5 p-8 md:p-10 flex flex-col justify-between space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDate(featuredBlog.createdAt)}
                      </span>
                      <span>•</span>
                      <span>By {featuredBlog.author}</span>
                      {featuredBlog.difficulty && (
                        <>
                          <span>•</span>
                          <span className="text-purple-650 dark:text-purple-400">{featuredBlog.difficulty}</span>
                        </>
                      )}
                    </div>

                    <h2 className="text-xl md:text-3xl font-black uppercase text-zinc-950 dark:text-white tracking-tight leading-tight hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                      <Link href={`/blogs/${featuredBlog.slug}`}>
                        {featuredBlog.title}
                      </Link>
                    </h2>

                    <p className="text-zinc-550 dark:text-zinc-400 text-xs md:text-sm leading-relaxed font-semibold">
                      {featuredBlog.excerpt || (featuredBlog.content ? featuredBlog.content.replace(/<[^>]*>/g, '') : 'Explore this featured technical walkthrough covering architecture optimization, database seeding schemas, and component builds.')}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-zinc-200 dark:border-zinc-900/50 flex items-center justify-between">
                    <div className="flex items-center gap-4 text-[10px] text-zinc-500 font-bold font-mono">
                      {featuredBlog.readingTime && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {featuredBlog.readingTime} Mins
                        </span>
                      )}
                      {featuredBlog.views !== undefined && (
                        <span className="flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          {featuredBlog.views} Views
                        </span>
                      )}
                    </div>
                    
                    <Link 
                      href={`/blogs/${featuredBlog.slug}`} 
                      className="bg-zinc-950 hover:bg-zinc-850 dark:bg-white dark:hover:bg-zinc-205 text-white dark:text-black font-extrabold px-5 py-2.5 rounded text-[10px] uppercase tracking-wide flex items-center gap-1.5 transition-colors"
                    >
                      Read Article
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* REGULAR ARCHIVE GRID LIST */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {regularBlogs.map((blog) => (
                <article 
                  key={blog.id} 
                  className="group flex flex-col bg-zinc-50/30 dark:bg-zinc-900/10 border border-zinc-150 dark:border-zinc-900 rounded-xl overflow-hidden transition-all hover:border-zinc-300 dark:hover:border-zinc-800 hover:shadow-lg"
                >
                  {/* Image wrapper */}
                  <Link href={`/blogs/${blog.slug}`} className="relative block aspect-video overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                    <img 
                      src={blog.image} 
                      alt={blog.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-102"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Difficulty Tag */}
                    {blog.difficulty && (
                      <span className="absolute bottom-3 left-3 bg-zinc-950/80 backdrop-blur-sm text-white border border-zinc-800 text-[8px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded">
                        {blog.difficulty}
                      </span>
                    )}
                  </Link>

                  {/* Body Content */}
                  <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2 text-[9px] text-zinc-500 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="w-3 h-3" />
                          {formatDate(blog.createdAt)}
                        </span>
                        <span>•</span>
                        <span>{blog.author}</span>
                      </div>

                      <h3 className="font-extrabold text-base text-zinc-905 dark:text-white line-clamp-2 leading-snug group-hover:text-purple-650 dark:group-hover:text-purple-400 transition-colors">
                        <Link href={`/blogs/${blog.slug}`}>
                          {blog.title}
                        </Link>
                      </h3>

                      <p className="text-zinc-555 dark:text-zinc-400 text-xs font-semibold leading-relaxed line-clamp-3">
                        {blog.excerpt || (blog.content ? blog.content.replace(/<[^>]*>/g, '') : 'No description summary details loaded.')}
                      </p>
                    </div>

                    {/* Footer Info tags */}
                    <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-900/50 flex items-center justify-between gap-4">
                      
                      {/* Left info */}
                      <div className="flex items-center gap-2 text-[9px] font-mono text-zinc-450">
                        {blog.readingTime && (
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3.5 h-3.5" />
                            {blog.readingTime}m
                          </span>
                        )}
                        {blog.views !== undefined && (
                          <span className="flex items-center gap-0.5">
                            <Eye className="w-3.5 h-3.5" />
                            {blog.views}
                          </span>
                        )}
                      </div>

                      {/* Read Link */}
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

          </div>
        )}
      </main>

      <Footer />
    </div>
  );

  // Helper to check if featured card should render based on category filter
  function featuredCategorySelected() {
    if (selectedCategory === 'All') return true;
    if (!featuredBlog) return false;
    return featuredBlog.categories && featuredBlog.categories.includes(selectedCategory);
  }
}
