'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import { Product } from '../types';
import { getProducts, initializeStorage } from '../utils/storage';
import { Search, ArrowRight, ChevronLeft, ChevronRight, SlidersHorizontal, BookOpen } from 'lucide-react';

function ProductCardVideo({ src, isHovered }: { src: string; isHovered: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isHovered) {
      video.play().catch(() => {});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [isHovered]);

  return (
    <video
      ref={videoRef}
      src={src}
      className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 z-10 ${
        isHovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      muted
      loop
      playsInline
    />
  );
}

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'All' | Product['category']>('All');
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    initializeStorage();
    setProducts(getProducts());

    // Sync with backend to get the latest database products (including videoUrls)
    const sync = async () => {
      const { syncWithBackend } = await import('../utils/storage');
      await syncWithBackend();
      setProducts(getProducts());
    };
    sync();
  }, []);

  // Read search query parameter from URL
  useEffect(() => {
    const searchVal = searchParams.get('search');
    if (searchVal !== null) {
      setSearchQuery(searchVal);
    }
  }, [searchParams]);

  // Filter products by category and search query
  const filteredProducts = products.filter((prod) => {
    const matchesCategory = activeCategory === 'All' || prod.category === activeCategory;
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      prod.name.toLowerCase().includes(searchLower) ||
      prod.description.toLowerCase().includes(searchLower) ||
      prod.technologies.some((t) => t.toLowerCase().includes(searchLower)) ||
      prod.category.toLowerCase().includes(searchLower);

    return matchesCategory && matchesSearch;
  });

  // Reset page when search or filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeCategory]);

  // Calculate pagination boundaries
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans min-h-screen transition-colors">
      <Header />

      <main className="flex-1 max-w-[1440px] mx-auto w-full px-4 md:px-6 py-10 space-y-8">

        {/* Breadcrumb & Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
            <Link href="/" className="hover:text-zinc-950 dark:hover:text-white transition-colors">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-zinc-400 dark:text-zinc-600">Digital Products</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-950 dark:text-white uppercase tracking-tight">Digital Products</h1>
          <p className="text-zinc-500 text-xs max-w-lg">Discover our premium range of verified, well-tested SaaS starter kits, complete mobile application bundles, and high-conversion e-commerce code templates.</p>
        </div>

        {/* Search & Filter Controls */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center border-b border-zinc-200 dark:border-zinc-900 pb-6">
          {/* Search bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-600" />
            <input
              type="text"
              placeholder="Search products by name, tag, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 rounded text-xs text-zinc-950 dark:text-white focus:outline-none placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            />
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-1.5 items-center">
            <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-bold uppercase tracking-wider mr-1">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filter:</span>
            </div>
            {(['All', 'SaaS', 'Full Website', 'Website Template', 'Mobile App', 'Source Code', 'UI/UX', 'AI Project'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer ${activeCategory === cat
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-black'
                    : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white border border-zinc-200 dark:border-zinc-800'
                  }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {currentItems.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {currentItems.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => router.push(`/products/${prod.id}`)}
                  onMouseEnter={() => setHoveredProductId(prod.id)}
                  onMouseLeave={() => setHoveredProductId(null)}
                  className="bg-zinc-50 dark:bg-[#121214]/60 border border-zinc-200 dark:border-zinc-800 rounded overflow-hidden group cursor-pointer transition-colors flex flex-col justify-between"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video overflow-hidden bg-zinc-200 dark:bg-zinc-955">
                    {prod.videoUrl && (
                      <ProductCardVideo
                        src={prod.videoUrl}
                        isHovered={hoveredProductId === prod.id}
                      />
                    )}
                    <img
                      src={prod.images[0]}
                      alt={prod.name}
                      className={`w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-300 ${
                        hoveredProductId === prod.id ? 'opacity-0' : ''
                      }`}
                    />
                    <span className="absolute top-2.5 left-2.5 bg-white/90 dark:bg-black/70 backdrop-blur-sm border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded text-[9px] font-mono text-zinc-700 dark:text-zinc-300 z-20 font-bold">
                      {prod.category}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-zinc-900 dark:text-white text-xs group-hover:text-zinc-500 dark:group-hover:text-zinc-300 transition-colors leading-snug line-clamp-2">
                        {prod.name}
                      </h3>
                      <p className="text-zinc-500 dark:text-zinc-500 text-[11px] leading-relaxed line-clamp-2">{prod.description}</p>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="flex flex-wrap gap-1">
                        {prod.technologies.slice(0, 3).map((tech, idx) => (
                          <span key={idx} className="bg-white dark:bg-zinc-950 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded text-[9px] font-mono">
                            {tech}
                          </span>
                        ))}
                      </div>

                      <div className="flex justify-between items-center border-t border-zinc-200 dark:border-zinc-900/80 pt-2.5">
                        <span className="text-xs font-bold text-zinc-950 dark:text-white">{prod.price.toLocaleString()} BDT</span>
                        <span className="text-zinc-950 dark:text-white text-[10px] font-bold flex items-center gap-1">
                          Details <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-zinc-200 dark:border-zinc-900 text-xs">
                <span className="text-zinc-500 font-medium">
                  Showing <strong className="text-zinc-900 dark:text-white">{startIndex + 1}</strong> to <strong className="text-zinc-900 dark:text-white">{endIndex}</strong> of <strong className="text-zinc-900 dark:text-white">{totalItems}</strong> products
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded disabled:opacity-40 text-zinc-700 dark:text-zinc-300 cursor-pointer disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <div className="flex items-center px-4 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-950 dark:text-white font-bold rounded">
                    Page {currentPage} of {totalPages}
                  </div>

                  <button
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 rounded disabled:opacity-40 text-zinc-700 dark:text-zinc-300 cursor-pointer disabled:cursor-not-allowed hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-800 rounded py-16 text-center text-zinc-500 text-xs space-y-3">
            <BookOpen className="w-8 h-8 mx-auto text-zinc-400" />
            <p className="font-semibold text-zinc-700 dark:text-zinc-300">No products found matching your criteria.</p>
            <p>Try resetting filters or adjusting search terms.</p>
          </div>
        )}

      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950/40 py-8 text-center text-xs text-zinc-500">
        <p>© 2026 Hossen Shop Hybrid Marketplace & Software Engineering Firm. Uttara Sector 11 Dhaka BD.</p>
      </footer>
    </div>
  );
}

export default function AllProductsPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col flex-1 bg-white dark:bg-[#09090b] text-zinc-500 justify-center items-center h-screen text-xs">
        Loading catalog...
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
