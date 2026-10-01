'use client';

import React, { useState } from 'react';
import { Link2, Printer, Share2, Check } from 'lucide-react';
import { copyText } from '@/lib/format';
import { useSite } from '@/components/providers/SiteProvider';

/** Copy-link / native share / print utility row used on dossiers & receipts. */
export default function ShareActions({
  title,
  text,
  className = '',
  onPrint,
}: {
  title: string;
  text?: string;
  className?: string;
  onPrint?: () => void;
}) {
  const { pushToast } = useSite();
  const [copied, setCopied] = useState(false);

  const url =
    typeof window !== 'undefined' ? window.location.href : 'https://jabalitrails.africa';

  const handleCopy = async () => {
    const ok = await copyText(`${title}\n${url}`);
    setCopied(ok);
    pushToast({
      tone: ok ? 'success' : 'error',
      title: ok ? 'Dossier link copied' : 'Could not copy the link',
      message: ok ? 'Paste it to your travel companions to compare sectors together.' : url,
    });
    if (ok) window.setTimeout(() => setCopied(false), 2200);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: text || title, url });
        return;
      } catch {
        /* user dismissed the sheet — fall back to copy */
      }
    }
    handleCopy();
  };

  return (
    <div className={`no-print flex flex-wrap items-center gap-2 ${className}`}>
      <button type="button" onClick={handleCopy} className="btn btn-sm btn-outline">
        {copied ? <Check className="h-3.5 w-3.5 text-pos" /> : <Link2 className="h-3.5 w-3.5" />}
        {copied ? 'Copied' : 'Copy link'}
      </button>
      <button type="button" onClick={handleNativeShare} className="btn btn-sm btn-outline">
        <Share2 className="h-3.5 w-3.5" />
        Share
      </button>
      <button
        type="button"
        onClick={() => (onPrint ? onPrint() : window.print())}
        className="btn btn-sm btn-outline"
      >
        <Printer className="h-3.5 w-3.5" />
        Print dossier
      </button>
    </div>
  );
}
