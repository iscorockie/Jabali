'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Scroll-reveal wrapper. Adds `data-reveal="in"` once the node enters the
 * viewport; honours prefers-reduced-motion (styles handle that in globals.css).
 */
export default function Reveal({
  children,
  as: Tag = 'div',
  delay = 0,
  className = '',
  once = true,
  id,
  style,
}: {
  children: React.ReactNode;
  as?: React.ElementType;
  delay?: number;
  className?: string;
  once?: boolean;
  id?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<'idle' | 'in'>('idle');

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (typeof IntersectionObserver === 'undefined') {
      setState('in');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setState('in');
            if (once) io.unobserve(entry.target);
          } else if (!once) {
            setState('idle');
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [once]);

  return (
    <Tag
      ref={ref as never}
      id={id}
      data-reveal={state}
      style={{ ...(delay ? { transitionDelay: `${delay}ms` } : {}), ...style }}
      className={className}
    >
      {children}
    </Tag>
  );
}
