import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Case Studies | Real Projects Built by Hosen Software Shop',
  description: 'Explore real-world project case studies by Hosen Software Shop — from SaaS platforms and e-commerce sites to mobile apps and full-stack web applications.',
  keywords: [
    'software case studies',
    'web development portfolio',
    'real projects Bangladesh',
    'SaaS case study',
    'app development portfolio',
    'Hosen Software Shop work',
    'full-stack project examples',
  ],
  alternates: {
    canonical: '/casestudies',
  },
  openGraph: {
    title: 'Case Studies | Hosen Software Shop',
    description: 'Real-world project case studies: SaaS platforms, e-commerce sites, mobile apps, and more.',
    url: '/casestudies',
    type: 'website',
  },
};

export default function CaseStudiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
