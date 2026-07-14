'use client';

import React, { useEffect, useState, use } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowLeft, Briefcase, ExternalLink, Calendar, Layers } from 'lucide-react';
import { API_BASE_URL } from '@/app/utils/api';
import { CaseStudy, Product } from '../../types';

export default function CaseStudyDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [caseStudy, setCaseStudy] = useState<CaseStudy | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCaseStudyAndProduct = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/casestudies/${id}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.data && data.data.caseStudy) {
            const cs = data.data.caseStudy;
            setCaseStudy(cs);
            
            // If there's a linked product, fetch it as well
            if (cs.productId) {
              const pRes = await fetch(`${API_BASE_URL}/api/products/${cs.productId}`);
              if (pRes.ok) {
                const pData = await pRes.json();
                if (pData.status === 'success' && pData.data && pData.data.product) {
                  setProduct(pData.data.product);
                }
              }
            }
          } else {
            setError('Failed to load the case study details.');
          }
        } else {
          setError('Case study not found.');
        }
      } catch (err) {
        console.error('Failed to fetch case study details:', err);
        setError('Network error while loading case study details.');
      } finally {
        setLoading(false);
      }
    };
    fetchCaseStudyAndProduct();
  }, [id]);

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
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-500 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </div>

        {/* Loading / Error / Content */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="w-8 h-8 border-4 border-zinc-955 dark:border-white border-t-transparent dark:border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-bold text-zinc-400 mt-4 uppercase tracking-wider">Loading case study details...</p>
          </div>
        ) : error || !caseStudy ? (
          <div className="py-24 text-center border border-dashed border-rose-250 dark:border-rose-900/40 rounded-lg">
            <p className="text-sm font-bold text-rose-500 dark:text-rose-400 uppercase tracking-wider">{error || 'Case study not found'}</p>
            <Link href="/" className="text-xs text-zinc-500 dark:text-zinc-400 underline mt-2 block">
              Back to Home
            </Link>
          </div>
        ) : (
          <article className="space-y-8 animate-fadeIn">
            {/* Header info */}
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-[10px] text-zinc-500 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-350 border border-zinc-200 dark:border-zinc-800 px-2 py-0.5 rounded font-mono">
                  {caseStudy.type}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Deployed: {formatDate(caseStudy.createdAt)}
                </span>
              </div>

              <h1 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight text-zinc-950 dark:text-white leading-tight">
                {caseStudy.title}
              </h1>
            </div>

            {/* Cover Image */}
            <div className="relative aspect-video rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={caseStudy.image} 
                alt={caseStudy.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Content body */}
            <div className="space-y-6 pt-4">
              <div className="prose prose-zinc dark:prose-invert max-w-none text-zinc-700 dark:text-zinc-355 font-semibold text-sm md:text-base leading-relaxed whitespace-pre-wrap">
                {caseStudy.desc}
              </div>

              {/* Linked Product Banner */}
              {product && (
                <div className="mt-12 bg-gradient-to-r from-purple-500/5 via-violet-500/5 to-transparent dark:from-purple-950/10 dark:via-violet-950/10 dark:to-transparent border border-purple-200/50 dark:border-purple-900/30 rounded-xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" /> Linked Marketplace Template
                    </span>
                    <h3 className="text-base font-extrabold uppercase text-zinc-950 dark:text-white tracking-wide">
                      {product.name}
                    </h3>
                    <p className="text-zinc-550 dark:text-zinc-450 text-xs max-w-xl font-medium">
                      Inspect, review details, or purchase this ready-made template to build your own version of this system immediately.
                    </p>
                  </div>
                  <Link
                    href={`/products/${product.id}`}
                    className="px-5 py-2.5 bg-zinc-950 hover:bg-zinc-800 dark:bg-white dark:hover:bg-zinc-200 text-white dark:text-black rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shrink-0"
                  >
                    <span>View Template</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </article>
        )}
      </main>

      <Footer />
    </div>
  );
}
