import React from 'react';
import { API_BASE_URL } from '@/app/utils/api';
import { Metadata } from 'next';
import BlogDetailsClient from './BlogDetailsClient';

async function getBlog(slug: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/blogs/${slug}`, {
      next: { revalidate: 60 }
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status === 'success' && data.data && data.data.blog) {
      return data.data.blog;
    }
  } catch (err) {
    console.error('Failed to fetch blog in server component:', err);
  }
  return null;
}

export async function generateMetadata(
  props: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await props.params;
  const blog = await getBlog(slug);
  if (!blog) {
    return {
      title: 'Article Not Found | Hossen Academy',
      description: 'The requested publishing article was not found.'
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://hossenacademy.com';

  return {
    title: blog.seoTitle || `${blog.title} | Hossen Academy`,
    description: blog.seoDesc || blog.excerpt || 'Technical guide from Hossen Academy',
    keywords: blog.seoKeywords || blog.tags.join(', '),
    alternates: {
      canonical: blog.canonicalUrl || `${siteUrl}/blogs/${blog.slug}`
    },
    openGraph: {
      title: blog.ogTitle || blog.title,
      description: blog.ogDesc || blog.excerpt,
      url: `${siteUrl}/blogs/${blog.slug}`,
      images: [
        {
          url: blog.ogImage || blog.image,
          alt: blog.imageAlt || blog.title
        }
      ],
      type: 'article',
      publishedTime: blog.publishDate || blog.createdAt,
      authors: [blog.author]
    },
    twitter: {
      card: 'summary_large_image',
      title: blog.ogTitle || blog.title,
      description: blog.ogDesc || blog.excerpt,
      images: [blog.twitterCardImage || blog.image]
    },
    robots: {
      index: blog.robotsIndex !== false,
      follow: blog.robotsIndex !== false
    }
  };
}

export default async function BlogDetailsPage(
  props: { params: Promise<{ slug: string }> }
) {
  const { slug } = await props.params;
  const blog = await getBlog(slug);

  if (!blog) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen py-24 text-center bg-white dark:bg-[#070708]">
        <p className="text-sm font-bold text-rose-500 uppercase tracking-wider">Article not found</p>
        <a href="/blogs" className="text-xs text-zinc-500 underline mt-2 block">
          Back to all blogs
        </a>
      </div>
    );
  }

  return <BlogDetailsClient initialBlog={blog} />;
}
