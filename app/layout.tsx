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

export const metadata: Metadata = {
  title: {
    default: "Hossen Software Shop | Premium Web Solutions & SaaS Templates",
    template: "%s | Hossen Software Shop"
  },
  description: "Get premium website templates, custom software designs, responsive source code packages, and tailored business software systems from Hossen Software Shop.",
  icons: {
    icon: "/icon.png",
  }
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
      <body className="min-h-full flex flex-col overflow-x-clip" suppressHydrationWarning>
        {children}
        <GlobalChatWidget />
      </body>
    </html>
  );
}
