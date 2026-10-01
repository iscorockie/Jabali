/**
 * Resolves public asset paths (`/images/...`) across root domains (Vercel, localhost)
 * and GitHub Pages project subpaths (`/Jabali/images/...`).
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export function withBasePath(assetPath: string): string {
  if (!assetPath) return assetPath;
  if (assetPath.startsWith('http://') || assetPath.startsWith('https://')) {
    return assetPath;
  }
  const normalized = assetPath.startsWith('/') ? assetPath : `/${assetPath}`;
  if (BASE_PATH && !normalized.startsWith(`${BASE_PATH}/`)) {
    return `${BASE_PATH}${normalized}`;
  }
  return normalized;
}
