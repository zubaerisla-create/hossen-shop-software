import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Software Development Services | Custom Web, Mobile & SaaS Solutions',
  description: 'Professional software development services from Hossen Software Shop — custom web apps, mobile applications, SaaS platforms, UI/UX design, and full-stack development for businesses.',
  keywords: [
    'custom software development services',
    'web app development',
    'mobile app development service',
    'SaaS development company',
    'full stack developer Bangladesh',
    'hire software developer',
    'Hossen Software Shop services',
    'custom website development',
  ],
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'Software Development Services | Hossen Software Shop',
    description: 'Custom web apps, mobile apps, SaaS platforms, and full-stack development services.',
    url: '/services',
    type: 'website',
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
