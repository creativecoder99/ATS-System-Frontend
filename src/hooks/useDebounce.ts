import { useEffect, useState } from 'react';

/**
 * Delays propagating a rapidly-changing value. Used on the job search box so
 * typing "react developer" fires one request instead of sixteen.
 */
export function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
