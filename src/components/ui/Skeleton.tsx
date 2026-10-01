import React from 'react';

export function Skeleton({
  className = '',
  rounded = 'rounded-xl',
}: {
  className?: string;
  rounded?: string;
}) {
  return <div className={`skeleton ${rounded} ${className}`} aria-hidden="true" />;
}

/** Placeholder shown while live UWA permit calendars are loading. */
export function AvailabilitySkeleton() {
  return (
    <div className="space-y-3" aria-busy="true" aria-live="polite">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-16" />
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: 35 }).map((_, i) => (
          <Skeleton key={i} className="h-11" rounded="rounded-lg" />
        ))}
      </div>
    </div>
  );
}

/** Card-shaped placeholder for catalogue grids. */
export function ExpeditionCardSkeleton() {
  return (
    <div className="card overflow-hidden">
      <Skeleton className="h-60 w-full" rounded="rounded-none" />
      <div className="space-y-3 p-6">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
      </div>
    </div>
  );
}
