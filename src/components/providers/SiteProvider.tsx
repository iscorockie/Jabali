'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

/* -----------------------------------------------------------------------------
 * Persistent local storage hook (SSR-safe, quota-safe)
 * -------------------------------------------------------------------------- */
export function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore malformed payloads */
    }
    setHydrated(true);
  }, [key]);

  const set = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved =
          typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        try {
          window.localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          /* ignore quota errors */
        }
        return resolved;
      });
    },
    [key]
  );

  return [value, set, hydrated] as const;
}

/* -----------------------------------------------------------------------------
 * Currencies
 * -------------------------------------------------------------------------- */
export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'UGX';

export const CURRENCIES: Record<
  CurrencyCode,
  { code: CurrencyCode; label: string; symbol: string; rate: number; locale: string }
> = {
  USD: { code: 'USD', label: 'US Dollar', symbol: '$', rate: 1, locale: 'en-US' },
  EUR: { code: 'EUR', label: 'Euro', symbol: '€', rate: 0.92, locale: 'de-DE' },
  GBP: { code: 'GBP', label: 'Pound Sterling', symbol: '£', rate: 0.78, locale: 'en-GB' },
  UGX: { code: 'UGX', label: 'Ugandan Shilling', symbol: 'USh', rate: 3720, locale: 'en-UG' },
};

/* -----------------------------------------------------------------------------
 * Toasts
 * -------------------------------------------------------------------------- */
export type ToastTone = 'success' | 'info' | 'warn' | 'error';
export interface Toast {
  id: number;
  title: string;
  message?: string;
  tone: ToastTone;
}

interface SiteContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  money: (usd: number, opts?: { decimals?: number }) => string;
  wishlist: string[];
  toggleWishlist: (id: string) => void;
  inWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  compare: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  toasts: Toast[];
  pushToast: (t: Omit<Toast, 'id'>) => void;
  dismissToast: (id: number) => void;
  paletteOpen: boolean;
  setPaletteOpen: (open: boolean) => void;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [currency, setCurrency] = useLocalStorage<CurrencyCode>('jabali_currency_v1', 'USD');
  const [wishlist, setWishlist, wishlistHydrated] = useLocalStorage<string[]>(
    'jabali_wishlist_v1',
    []
  );
  const [compare, setCompare] = useLocalStorage<string[]>('jabali_compare_v1', []);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const toastSeq = useRef(0);

  /* Theme: read the class the inline boot script already applied (no FOUC). */
  useEffect(() => {
    setTheme(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  }, []);

  const applyTheme = useCallback((next: 'light' | 'dark') => {
    setTheme(next);
    const root = document.documentElement;
    root.classList.toggle('dark', next === 'dark');
    root.style.colorScheme = next;
    try {
      window.localStorage.setItem('jabali_theme', next);
    } catch {
      /* private mode */
    }
  }, []);

  const toggleTheme = useCallback(
    () => applyTheme(theme === 'dark' ? 'light' : 'dark'),
    [applyTheme, theme]
  );

  /* Merge persisted compare list (max 3) after hydration */
  useEffect(() => {
    if (compare.length > 3) setCompare(compare.slice(-3));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wishlistHydrated]);

  const money = useCallback(
    (usd: number, opts?: { decimals?: number }) => {
      const info = CURRENCIES[currency] || CURRENCIES.USD;
      const converted = usd * info.rate;
      const decimals = opts?.decimals ?? (info.code === 'UGX' ? 0 : 0);
      try {
        return new Intl.NumberFormat(info.locale, {
          style: 'currency',
          currency: info.code,
          maximumFractionDigits: decimals,
          minimumFractionDigits: decimals,
        }).format(converted);
      } catch {
        return `${info.symbol}${Math.round(converted).toLocaleString('en-US')}`;
      }
    },
    [currency]
  );

  const pushToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++toastSeq.current;
    setToasts((prev) => [...prev.slice(-3), { ...t, id }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id));
    }, 5200);
  }, []);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const toggleWishlist = useCallback(
    (id: string) => {
      setWishlist((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    },
    [setWishlist]
  );

  const clearWishlist = useCallback(() => setWishlist([]), [setWishlist]);

  const toggleCompare = useCallback(
    (id: string) => {
      setCompare((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= 3) return [...prev.slice(1), id];
        return [...prev, id];
      });
    },
    [setCompare]
  );

  const clearCompare = useCallback(() => setCompare([]), [setCompare]);

  /* ⌘K / Ctrl-K global shortcut */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const value = useMemo<SiteContextValue>(
    () => ({
      theme,
      toggleTheme,
      currency,
      setCurrency,
      money,
      wishlist,
      toggleWishlist,
      inWishlist: (id: string) => wishlist.includes(id),
      clearWishlist,
      compare,
      toggleCompare,
      clearCompare,
      toasts,
      pushToast,
      dismissToast,
      paletteOpen,
      setPaletteOpen,
    }),
    [
      theme,
      toggleTheme,
      currency,
      setCurrency,
      money,
      wishlist,
      toggleWishlist,
      clearWishlist,
      compare,
      toggleCompare,
      clearCompare,
      toasts,
      pushToast,
      dismissToast,
      paletteOpen,
    ]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <SiteProvider>');
  return ctx;
}
