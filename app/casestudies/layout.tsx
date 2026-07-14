import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Studies | Real Projects Built by Hossen Software Shop',
  description: 'Explore real-world project case studies by Hossen Software Shop — from SaaS platforms and e-commerce sites to mobile apps and full-stack web applications.',
  keywords: [
    'software case studies',
    'web development portfolio',
    'real projects Bangladesh',
    'SaaS case study',
    'app development portfolio',
    'Hossen Software Shop work',
    'full-stack project examples',
  ],
  alternates: {
    canonical: '/casestudies',
  },
  openGraph: {
    title: 'Case Studies | Hossen Software Shop',
    description: 'Real-world project case studies: SaaS platforms, e-commerce sites, mobile apps, and more.',
    url: '/casestudies',
    type: 'website',
  },
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
