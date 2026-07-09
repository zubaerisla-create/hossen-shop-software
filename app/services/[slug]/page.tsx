// Server Component — no 'use client'
import { notFound } from 'next/navigation';
import { getServiceBySlug, servicesData } from '../../data/services';
import Header from '@/components/Header';
import ServicePageClient from './ServicePageClient';

// Allow any slug to be rendered dynamically (no static pre-generation needed in dev)
export const dynamic = 'force-dynamic';

interface ServicePageProps {
  params: Promise<{ slug: string }>;
}

export default async function ServicePage({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);

  if (!service) notFound();

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white dark:bg-[#09090b]">
        <ServicePageClient service={service} />
      </main>
    </>
  );
}

export async function generateMetadata({ params }: ServicePageProps) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  return {
    title: service ? `${service.title} — HOSSEN Software Shop` : 'Service Not Found',
    description: service?.shortDesc ?? '',
  };
}
