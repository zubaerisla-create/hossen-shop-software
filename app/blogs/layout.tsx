import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog & Technical Guides | Web Development, AI & Software Insights',
  description: 'Read expert articles and technical guides on web development, AI, SaaS, mobile apps, and software engineering from the Hosen Software Shop team.',
  keywords: [
    'web development blog',
    'software engineering articles',
    'AI programming tutorials',
    'Next.js guides',
    'React tutorials',
    'SaaS development tips',
    'Hosen Software Shop blog',
    'tech blog Bangladesh',
  ],
  alternates: {
    canonical: '/blogs',
  },
  openGraph: {
    title: 'Blog & Technical Guides | Hosen Software Shop',
    description: 'Expert articles on web development, AI, SaaS, and software engineering.',
    url: '/blogs',
    type: 'website',
  },
};

export default function BlogsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
