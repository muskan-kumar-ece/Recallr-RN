'use client';

import { useMemo } from 'react';
import { useParams, usePathname } from 'next/navigation';

/**
 * Robust route parameter extractor that works seamlessly in:
 * 1. Next.js dev server (where useParams() returns the dynamic segment).
 * 2. Static export rewritten routes on Firebase Hosting (where useParams() might return static placeholders like 'item').
 */
export function useRouteParam(paramName: string = 'id', fallback: string = ''): string {
  const params = useParams();
  const pathname = usePathname();

  return useMemo(() => {
    const raw = params?.[paramName];
    if (typeof raw === 'string' && raw && raw !== 'item') {
      return raw;
    }

    const effectivePath = typeof window !== 'undefined' && window.location?.pathname
      ? window.location.pathname
      : pathname;

    if (effectivePath) {
      const segments = effectivePath.split('/').filter(Boolean);
      if (paramName === 'id' || paramName === 'slug') {
        const last = segments[segments.length - 1];
        if (last === 'edit' || last === 'share') {
          if (segments.length >= 2) {
            const candidate = segments[segments.length - 2];
            if (candidate && candidate !== 'item') return candidate;
          }
        } else if (last && last !== 'item') {
          return last;
        }
      }
    }

    if (typeof raw === 'string' && raw) {
      return raw;
    }

    return fallback;
  }, [params, pathname, paramName, fallback]);
}
