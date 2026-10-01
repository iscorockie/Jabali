'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { useSite } from '@/components/providers/SiteProvider';
import { EXPEDITIONS } from '@/data/expeditions';

/**
 * Shortlist toggle for a single expedition. Persists to localStorage through
 * the site context so the navbar badge, /expeditions?view=saved and the
 * command palette all stay in sync.
 */
export default function WishlistButton({
  expeditionId,
  variant = 'chip',
  className = '',
}: {
  expeditionId: string;
  variant?: 'chip' | 'icon' | 'panel';
  className?: string;
}) {
  const { wishlist, toggleWishlist, pushToast } = useSite();
  const saved = wishlist.includes(expeditionId);
  const expedition = EXPEDITIONS.find((e) => e.id === expeditionId);

  const onClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(expeditionId);
    pushToast({
      tone: saved ? 'info' : 'success',
      title: saved ? 'Removed from your shortlist' : 'Saved to your shortlist',
      message: `${expedition?.title || 'Expedition'}${
        saved ? '' : ` — compare it any time on the catalogue or continue to permits.`
      }`,
    });
  };

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        aria-label={saved ? 'Remove from shortlist' : 'Save to shortlist'}
        title={saved ? 'Remove from shortlist' : 'Save to shortlist'}
        className={`grid h-8 w-8 place-items-center rounded-full border backdrop-blur-md transition-all hover:scale-105 ${
          saved
            ? 'border-terracotta/60 bg-terracotta text-white'
            : 'border-white/25 bg-black/40 text-parchment hover:border-terracotta/60'
        } ${className}`}
      >
        <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
      </button>
    );
  }

  if (variant === 'panel') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-pressed={saved}
        className={`btn w-full justify-center ${
          saved ? 'btn-primary' : 'btn-onPanel'
        } ${className}`}
      >
        <Heart className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
        {saved ? 'Saved to shortlist' : 'Save for later'}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={saved}
      className={`chip transition-all hover:-translate-y-px ${
        saved ? '!border-terracotta/45 !bg-terracotta/10 !text-terracotta' : ''
      } ${className}`}
    >
      <Heart className={`h-3 w-3 ${saved ? 'fill-terracotta' : ''}`} />
      {saved ? 'Saved' : 'Compare later'}
    </button>
  );
}
