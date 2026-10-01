import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { SiteProvider } from '@/components/providers/SiteProvider';
import Toaster from '@/components/ui/Toaster';
import CommandPalette from '@/components/CommandPalette';
import ScrollProgress from '@/components/ScrollProgress';
import BackToTop from '@/components/BackToTop';

export const dynamic = 'force-dynamic';

const SITE_NAME = 'Jabali Trails Africa';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} | Guided Expeditions in Uganda & East Africa`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    'Small-group and private guided expeditions in Uganda & East Africa. Mountain gorilla trekking in Bwindi Impenetrable Forest, chimpanzee tracking in Kibale, Kidepo walking safaris, and real-time UWA permit booking.',
  keywords: [
    'Uganda safari',
    'Bwindi mountain gorilla trekking',
    'Kibale chimpanzee tracking',
    'East Africa guided expeditions',
    'UWA gorilla permits',
    'Murchison Falls safari',
    'Kidepo Valley walking safari',
    'Jabali Trails Africa',
  ],
  applicationName: SITE_NAME,
  authors: [{ name: 'Jabali Trails Africa Ltd.' }],
  creator: 'Jabali Trails Africa',
  publisher: SITE_NAME,
  category: 'travel',
  alternates: { canonical: '/' },
  openGraph: {
    title: `${SITE_NAME} — Guided Expeditions in Uganda & East Africa`,
    description:
      'Authentic, conservation-led small-group and private expeditions across Bwindi, Kibale, Murchison Falls, Kidepo Valley, and the Serengeti.',
    type: 'website',
    url: SITE_URL,
    locale: 'en_US',
    siteName: SITE_NAME,
    images: [
      {
        url: `${SITE_URL}/images/bwindi-silverback.jpg`,
        width: 1200,
        height: 675,
        alt: 'Silverback mountain gorilla in Bwindi Impenetrable National Park, Uganda',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} — Guided Expeditions in Uganda & East Africa`,
    description:
      'Track mountain gorillas in Bwindi and wild chimpanzees in Kibale with Uganda’s lead field naturalists. Live UWA permit availability, instant Stripe checkout.',
    images: [`${SITE_URL}/images/bwindi-silverback.jpg`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
  icons: {
    icon: [{ url: '/images/favicon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/images/favicon.svg' }],
  },
  manifest: '/manifest.webmanifest',
  formatDetection: { telephone: true, address: true, email: true },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#112218' },
    { media: '(prefers-color-scheme: dark)', color: '#0B120E' },
  ],
};

/** Applies the persisted theme before first paint so night mode never flashes. */
const THEME_BOOT = `(function(){try{var s=localStorage.getItem('jabali_theme');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;var r=document.documentElement;r.classList.toggle('dark',!!d);r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Type pairing: Sen (text) + Sora (display) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Sen:wght@400..800&family=Sora:wght@200..800&display=swap"
          rel="stylesheet"
        />
        <link
          rel="preload"
          as="style"
          href="https://fonts.googleapis.com/css2?family=Sen:wght@400..800&family=Sora:wght@200..800&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
        <noscript>
          <style>{`[data-reveal]{opacity:1 !important;transform:none !important}`}</style>
        </noscript>
      </head>
      <body className="flex min-h-screen flex-col bg-surface text-ink">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-canopy focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-parchment"
        >
          Skip to main content
        </a>
        <SiteProvider>
          <ScrollProgress />
          <Navbar />
          <main id="main-content" className="flex-1 focus:outline-none">
            {children}
          </main>
          <Footer />
          <Toaster />
          <CommandPalette />
          <BackToTop />
        </SiteProvider>
      </body>
    </html>
  );
}
