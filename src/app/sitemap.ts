import type { MetadataRoute } from 'next';
import { DESTINATIONS, EXPEDITIONS } from '@/data/expeditions';

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';
const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/$/, '');

const url = (path: string) => `${SITE_URL}${BASE_PATH}${path}`;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: url('/'), lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: url('/expeditions'), lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: url('/booking'), lastModified: now, changeFrequency: 'daily', priority: 0.9 },
    { url: url('/destinations'), lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/about'), lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: url('/contact'), lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];

  const expeditionRoutes: MetadataRoute.Sitemap = EXPEDITIONS.map((exp) => ({
    url: url(`/expeditions/${exp.slug}`),
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.85,
  }));

  const destinationRoutes: MetadataRoute.Sitemap = DESTINATIONS.map((dest) => ({
    url: url(`/destinations#${dest.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticRoutes, ...expeditionRoutes, ...destinationRoutes];
}
