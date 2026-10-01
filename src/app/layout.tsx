import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'Jabali Trails Africa | Guided Expeditions in Uganda & East Africa',
    template: '%s | Jabali Trails Africa',
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
  openGraph: {
    title: 'Jabali Trails Africa — Guided Expeditions in Uganda & East Africa',
    description:
      'Authentic, conservation-led small-group and private expeditions across Bwindi, Kibale, Murchison Falls, Kidepo Valley, and the Serengeti.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Jabali Trails Africa',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400..700;1,9..144,400..600&family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen flex flex-col bg-parchment text-bark selection:bg-canopy selection:text-parchment">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
