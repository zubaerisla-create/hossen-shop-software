import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Client Reviews & Testimonials | Hossen Software Shop',
  description: 'Read genuine reviews and testimonials from happy clients of Hossen Software Shop. See what businesses say about our web development, templates, and custom software services.',
  keywords: [
    'Hossen Software Shop reviews',
    'software agency testimonials',
    'web development client reviews',
    'customer feedback Bangladesh',
    'software shop rating',
  ],
  alternates: {
    canonical: '/reviews',
  },
  openGraph: {
    title: 'Client Reviews & Testimonials | Hossen Software Shop',
    description: 'Genuine client reviews on web development, templates, and custom software services.',
    url: '/reviews',
    type: 'website',
  },
};

export default function ReviewsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
