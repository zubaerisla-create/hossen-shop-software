'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from './types';
import { getProducts, initializeStorage } from './utils/storage';
import LandingPage from '@/components/LandingPage';
import Header from '@/components/Header';

export default function Home() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    initializeStorage();
    setProducts(getProducts());

    // Sync with backend to get the latest database products (including videoUrls)
    const sync = async () => {
      const { syncWithBackend } = await import('./utils/storage');
      await syncWithBackend();
      setProducts(getProducts());
    };
    sync();
  }, []);

  const handleSelectProduct = (prod: Product) => {
    router.push(`/products/${prod.id}`);
  };

  const handleStartCustomProject = () => {
    const role = localStorage.getItem('apex_user_role');
    if (role === 'customer') {
      router.push('/user');
    } else {
      localStorage.setItem('apex_user_role', 'customer');
      router.push('/user');
    }
  };

  const handleImportToCustomForm = (title: string, desc: string, budget: number, tech: string) => {
    localStorage.setItem('apex_imported_estimate', JSON.stringify({ title, desc, budget, tech }));
    localStorage.setItem('apex_user_role', 'customer');
    router.push('/user');
  };

  return (
    <div className="flex flex-col flex-1 bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans min-h-screen transition-colors">
      <Header />

      <main className="flex-1 w-full pb-6">
        <LandingPage
          products={products}
          onSelectProduct={handleSelectProduct}
          onStartCustomProject={handleStartCustomProject}
          isLoggedIn={true}
          onOpenLogin={() => { }}
          onImportToCustomForm={handleImportToCustomForm}
        />
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-900 bg-zinc-50 dark:bg-zinc-950/40 py-8 text-center text-xs text-zinc-500">
        <p>© 2026 Hossen Shop Hybrid Marketplace & Software Engineering Firm. Uttara Sector 11 Dhaka BD.</p>
        <p className="mt-1 text-[10px] text-zinc-600 dark:text-zinc-600">Built as a pure React / Next.js high-fidelity frontend mockup.</p>
      </footer>
    </div>
  );
}
