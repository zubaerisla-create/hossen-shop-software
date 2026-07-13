'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Send, ShieldCheck } from 'lucide-react';
import { API_BASE_URL } from '@/app/utils/api';

interface FooterItem {
  label: string;
  url: string;
}

interface FooterData {
  brandName: string;
  brandDesc: string;
  githubUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  copyright: string;
  marketplace: FooterItem[];
  services: FooterItem[];
  platform: FooterItem[];
}

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [data, setData] = useState<FooterData>({
    brandName: "Hossen Software Shop",
    brandDesc: "Elite engineering agency and template marketplace turning complex business ideas into high-performance, production-ready full-stack software.",
    githubUrl: "https://github.com",
    twitterUrl: "https://twitter.com",
    linkedinUrl: "https://linkedin.com",
    copyright: "Hossen Software Shop. All Rights Reserved.",
    marketplace: [
      { label: "SaaS Boilerplates", url: "/products" },
      { label: "Mobile App Templates", url: "/products" },
      { label: "Full Web Systems", url: "/products" },
      { label: "UI/UX Kits", url: "/products" }
    ],
    services: [
      { label: "Custom SaaS Builds", url: "/services/custom-saas" },
      { label: "Web Systems", url: "/services/web-engineering" },
      { label: "Mobile Apps", url: "/services/mobile-apps" },
      { label: "Cloud & Architecture", url: "/services/cloud-infra" }
    ],
    platform: [
      { label: "AI Project Estimator", url: "/estimator" },
      { label: "Client Workspace", url: "/user" },
      { label: "Custom Deals", url: "/user/deals" },
      { label: "Help Desk Support", url: "/user/support" }
    ]
  });

  useEffect(() => {
    const fetchFooter = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/footer`);
        if (res.ok) {
          const resData = await res.json();
          if (resData.status === 'success' && resData.data && resData.data.footer) {
            setData(resData.data.footer);
          }
        }
      } catch (err) {
        console.error("Failed to fetch footer config:", err);
      }
    };
    fetchFooter();
  }, []);

  return (
    <footer className="w-full bg-[#070708] text-zinc-400 border-t border-zinc-900 pt-16 pb-8 font-sans transition-colors duration-500">
      <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-zinc-900">
        
        {/* Brand & Mission */}
        <div className="md:col-span-4 space-y-5">
          <Link href="/" className="inline-flex items-center gap-2 text-white font-extrabold text-sm uppercase tracking-widest">
            <div className="w-6 h-6 bg-white dark:bg-white rounded-md flex items-center justify-center text-black font-black text-xs">
              {data.brandName ? data.brandName.charAt(0) : 'H'}
            </div>
            <span>{data.brandName}</span>
          </Link>
          <p className="text-zinc-500 text-xs leading-relaxed max-w-sm">
            {data.brandDesc}
          </p>
          <div className="flex items-center gap-3.5 text-zinc-500">
            {data.githubUrl && (
              <a href={data.githubUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            )}
            {data.twitterUrl && (
              <a href={data.twitterUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <svg className="w-4.5 h-4.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
            )}
            {data.linkedinUrl && (
              <a href={data.linkedinUrl} target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Links: Marketplace */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-white text-[10px] font-bold uppercase tracking-widest">Marketplace</h4>
          <ul className="space-y-2.5 text-xs text-zinc-500 font-semibold">
            {data.marketplace && data.marketplace.map((item, idx) => (
              <li key={idx}>
                <Link href={item.url} className="hover:text-zinc-300 transition-colors">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Links: Services */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-white text-[10px] font-bold uppercase tracking-widest">Services</h4>
          <ul className="space-y-2.5 text-xs text-zinc-500 font-semibold">
            {data.services && data.services.map((item, idx) => (
              <li key={idx}>
                <Link href={item.url} className="hover:text-zinc-300 transition-colors">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Links: Platform */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-white text-[10px] font-bold uppercase tracking-widest">Platform</h4>
          <ul className="space-y-2.5 text-xs text-zinc-500 font-semibold">
            {data.platform && data.platform.map((item, idx) => (
              <li key={idx}>
                <Link href={item.url} className="hover:text-zinc-300 transition-colors">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Newsletter */}
        <div className="md:col-span-2 space-y-4">
          <h4 className="text-white text-[10px] font-bold uppercase tracking-widest">Newsletter</h4>
          <p className="text-zinc-500 text-xs leading-relaxed font-medium">
            Get notified of new templates and agency insights.
          </p>
          <div className="relative flex items-center">
            <input
              type="email"
              placeholder="Email address"
              className="w-full bg-zinc-950 border border-zinc-900 rounded-lg py-2.5 pl-3.5 pr-10 text-xs font-semibold focus:outline-none focus:border-zinc-800 text-white placeholder:text-zinc-650"
            />
            <button className="absolute right-2 p-1 text-zinc-450 hover:text-white transition-colors cursor-pointer">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Bottom section */}
      <div className="max-w-[1400px] mx-auto px-6 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex flex-wrap items-center gap-6 text-[10px] text-zinc-550 font-bold uppercase tracking-wider">
          <span>&copy; {currentYear} {data.copyright}</span>
          <span className="h-3 w-px bg-zinc-900 hidden md:inline" />
          <Link href="/privacy" className="hover:text-zinc-400 transition-colors">Privacy Policy</Link>
          <Link href="/terms" className="hover:text-zinc-400 transition-colors">Terms of Service</Link>
        </div>

        {/* Payment Partner Badges */}
        <div className="flex items-center gap-4 text-zinc-600 font-bold text-[9px] uppercase tracking-widest">
          <span className="inline-flex items-center gap-1"><ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure Payments:</span>
          <span className="hover:text-zinc-400 transition-colors cursor-default">bKash</span>
          <span className="hover:text-zinc-400 transition-colors cursor-default">Stripe</span>
          <span className="hover:text-zinc-400 transition-colors cursor-default">Visa</span>
          <span className="hover:text-zinc-400 transition-colors cursor-default">Mastercard</span>
        </div>
      </div>
    </footer>
  );
}
