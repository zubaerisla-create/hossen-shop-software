import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Digital Products Marketplace | Website Templates & SaaS Source Code',
  description: 'Browse and buy premium website templates, SaaS starter kits, full-stack web apps, mobile app source code, and UI/UX kits from Hosen Software Shop. Verified, production-ready code.',
  keywords: [
    'buy website templates',
    'SaaS source code',
    'full stack web app template',
    'Next.js templates for sale',
    'React source code',
    'mobile app source code',
    'premium software templates',
    'Hosen Software Shop products',
  ],
  alternates: {
    canonical: '/products',
  },
  openGraph: {
    title: 'Digital Products Marketplace | Hosen Software Shop',
    description: 'Browse premium website templates, SaaS kits, and full-stack source code packages.',
    url: '/products',
    type: 'website',
  },
};

export default function ProductsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
