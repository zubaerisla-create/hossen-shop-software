import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import GlobalChatWidget from "@/components/GlobalChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_CLIENT_URL || 'https://hosen-software-shop.solutionsquad.tech';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Hosen Software Shop | Premium Web Solutions & SaaS Templates",
    template: "%s | Hosen Software Shop"
  },
  description: "Hosen Software Shop offers premium website templates, full-stack web apps, SaaS products, mobile apps, and custom software development services. Buy ready-made source code or order a custom project.",
  keywords: [
    "Hosen Software Shop",
    "hosen software shop",
    "premium website templates",
    "custom software development",
    "full stack web development",
    "SaaS templates",
    "source code for sale",
    "web app development Bangladesh",
    "software agency",
    "buy website template",
    "React Next.js templates",
    "mobile app development",
  ],
  authors: [{ name: "Hosen Software Shop", url: siteUrl }],
  creator: "Hosen Software Shop",
  publisher: "Hosen Software Shop",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Hosen Software Shop',
    title: 'Hosen Software Shop | Premium Web Solutions & SaaS Templates',
    description: 'Buy premium website templates, full-stack web apps, SaaS products, and custom software from Hosen Software Shop.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'Hosen Software Shop - Premium Web Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@hosensoftware',
    creator: '@hosensoftware',
    title: 'Hosen Software Shop | Premium Web Solutions',
    description: 'Buy premium website templates, full-stack apps, and custom software from Hosen Software Shop.',
    images: [`${siteUrl}/og-image.png`],
  },
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
  },
  category: 'technology',
};

const jsonLdOrganization = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hosen Software Shop',
  url: siteUrl,
  logo: `${siteUrl}/icon.png`,
  description: 'Premium web solutions, SaaS templates, and custom software development agency.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: ['English', 'Bengali'],
  },
  sameAs: [],
};

const jsonLdWebsite = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Hosen Software Shop',
  url: siteUrl,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/products?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased overflow-x-clip`}
      suppressHydrationWarning
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdWebsite) }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-clip" suppressHydrationWarning>
        {children}
        <GlobalChatWidget />
      </body>
    </html>
  );
}

