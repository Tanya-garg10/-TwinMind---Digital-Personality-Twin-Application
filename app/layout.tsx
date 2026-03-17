import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'TwinMind - Discover Your Digital Personality Twin',
  description: 'AI-powered personality analysis and what-if scenario simulation. Understand yourself better with TwinMind.',
  openGraph: {
    title: 'TwinMind — Discover Your Digital Personality Twin',
    description: 'AI-powered personality quiz, trait analysis, decision prediction & twin chat.',
    siteName: 'TwinMind',
    images: [{ url: '/opengraph-image', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TwinMind — Digital Personality Twin',
    description: 'AI-powered personality quiz, trait analysis, decision prediction & twin chat.',
    images: ['/opengraph-image'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
