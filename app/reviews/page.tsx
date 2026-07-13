'use client';

import React, { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Star, ArrowLeft, Search, Filter } from 'lucide-react';
import { API_BASE_URL } from '@/app/utils/api';

interface Review {
  productId: string;
  productName: string;
  user: string;
  avatar: string | null;
  rating: number;
  comment: string;
  date: string;
  role?: string;
}

export default function AllFeedbackPage() {
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRating, setSelectedRating] = useState<number | 'all'>('all');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/products/reviews/all`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.data && data.data.reviews) {
            setReviewsList(data.data.reviews);
          }
        }
      } catch (err) {
        console.error('Failed to fetch reviews:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Filter reviews
  const filteredReviews = reviewsList.filter((rev) => {
    const matchesSearch =
      rev.comment.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.productName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = selectedRating === 'all' || rev.rating === selectedRating;

    return matchesSearch && matchesRating;
  });

  // Calculate statistics
  const totalReviews = reviewsList.length;
  const avgRating = totalReviews > 0
    ? (reviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  const ratingCounts = [5, 4, 3, 2, 1].map((r) => ({
    stars: r,
    count: reviewsList.filter((rev) => rev.rating === r).length,
  }));

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

        {/* Page Title & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start border-b border-zinc-200 dark:border-zinc-900 pb-10">
          <div className="lg:col-span-5 space-y-3">
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Wall of Love
            </span>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tight text-zinc-950 dark:text-white leading-[1.1]">
              Client <br />
              Testimonials
            </h1>
            <p className="text-zinc-500 dark:text-zinc-405 text-xs max-w-sm leading-relaxed">
              Read honest experiences from verified developers and business founders globally.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 text-center flex flex-col justify-center space-y-1">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Overall Rating
              </span>
              <div className="flex items-center justify-center gap-1">
                <span className="text-3xl font-black">{avgRating}</span>
                <Star className="w-5 h-5 text-amber-400 fill-amber-400 shrink-0" />
              </div>
              <span className="text-[9px] text-zinc-500">Out of 5.0 stars</span>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 rounded-xl p-5 text-center flex flex-col justify-center space-y-1">
              <span className="text-[9px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                Total Reviews
              </span>
              <span className="text-3xl font-black">{totalReviews}</span>
              <span className="text-[9px] text-zinc-500">100% Verified Users</span>
            </div>

            {/* Star Distribution */}
            <div className="bg-zinc-50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 rounded-xl p-4 flex flex-col justify-between space-y-1">
              {ratingCounts.slice(0, 3).map(({ stars, count }) => {
                const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-2 text-[9px] font-bold">
                    <span className="w-8 flex items-center gap-0.5">
                      {stars} <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400 shrink-0" />
                    </span>
                    <div className="flex-1 bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-4 text-right text-zinc-500">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 items-center bg-zinc-50/60 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 rounded-xl p-4">
          <div className="relative w-full sm:max-w-xs shadow-inner">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reviews, products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white border border-zinc-200 dark:border-zinc-850 rounded-lg pl-9 pr-4 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            />
          </div>

          <div className="flex flex-wrap gap-1.5 items-center w-full sm:w-auto justify-end">
            <span className="text-[9px] font-bold text-zinc-450 uppercase tracking-wider mr-1.5">
              Rating Filter:
            </span>
            {(['all', 5, 4, 3, 2, 1] as const).map((r) => (
              <button
                key={r}
                onClick={() => setSelectedRating(r)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedRating === r
                    ? 'bg-zinc-950 dark:bg-white text-white dark:text-black shadow-sm'
                    : 'bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 text-zinc-650 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                {r === 'all' ? 'All' : `${r} Star`}
              </button>
            ))}
          </div>
        </div>

        {/* Reviews Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-zinc-350 border-t-zinc-950 dark:border-zinc-800 dark:border-t-white animate-spin"></div>
            <p className="text-zinc-550 text-[10px] uppercase font-bold tracking-widest">Loading Reviews...</p>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-20 bg-zinc-50/20 dark:bg-zinc-900/10 border border-zinc-200 dark:border-zinc-900 rounded-xl">
            <p className="text-zinc-500 font-medium text-xs">No reviews found matching the filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReviews.map((rev, i) => (
              <Link
                href={`/products/${rev.productId}`}
                key={i}
                className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200 dark:border-zinc-900 p-6 rounded-xl flex flex-col justify-between space-y-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              >
                <div className="space-y-4">
                  {/* Product Reviewed Badge & Date */}
                  <div className="flex justify-between items-start gap-4">
                    <div className="bg-zinc-100 dark:bg-zinc-850 border border-zinc-200 dark:border-zinc-800 px-2.5 py-1 rounded-md text-[9px] font-bold text-zinc-750 dark:text-zinc-300 tracking-wide uppercase line-clamp-1 flex-1 group-hover:border-zinc-300 dark:group-hover:border-zinc-700 transition-colors">
                      <span className="text-zinc-450 dark:text-zinc-500 font-medium normal-case mr-1">Reviewed:</span>
                      {rev.productName}
                    </div>
                    {rev.date && (
                      <span className="text-[9px] text-zinc-450 dark:text-zinc-500 font-mono shrink-0 pt-1">
                        {new Date(rev.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>

                  {/* Stars & Comment */}
                  <div className="space-y-2">
                    <div className="flex text-amber-400 gap-0.5">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 ${
                            idx < (rev.rating || 5)
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-zinc-200 dark:text-zinc-800'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-zinc-650 dark:text-zinc-350 italic text-[11px] leading-relaxed line-clamp-4 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors">
                      "{rev.comment}"
                    </p>
                  </div>
                </div>

                {/* Customer Profile Info */}
                <div className="border-t border-zinc-200/80 dark:border-zinc-850 pt-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-zinc-300 dark:border-zinc-700 shadow-sm font-bold text-xs uppercase text-zinc-600 dark:text-zinc-350 select-none">
                    {rev.avatar ? (
                      <img src={rev.avatar} alt={rev.user} className="w-full h-full object-cover" />
                    ) : (
                      rev.user.charAt(0)
                    )}
                  </div>
                  <div className="flex flex-col text-[10px]">
                    <span className="text-zinc-900 dark:text-white font-bold group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                      {rev.user}
                    </span>
                    <span className="text-zinc-500 font-medium">
                      {rev.role || 'Verified Customer'}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
