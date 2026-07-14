import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Project Cost Estimator | Get a Free Quote for Your Software Project',
  description: 'Use our free project cost estimator to get an instant quote for your web app, mobile app, or custom software project from Hossen Software Shop.',
  keywords: [
    'software project cost estimator',
    'web app development cost',
    'mobile app price calculator',
    'free project quote Bangladesh',
    'software development pricing',
    'custom project estimate',
    'Hossen Software Shop estimator',
  ],
  alternates: {
    canonical: '/estimator',
  },
  openGraph: {
    title: 'Free Project Cost Estimator | Hossen Software Shop',
    description: 'Instantly estimate the cost of your web app, mobile app, or custom software project.',
    url: '/estimator',
    type: 'website',
  },
};

export default function EstimatorLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
