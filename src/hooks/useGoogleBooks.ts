import { useState, useRef, useCallback } from 'react';
import { searchBooks } from '../utils/googleBooks';
import type { GoogleBookVolume } from '../types';

export function useGoogleBooksSearch() {
  const [results, setResults] = useState<GoogleBookVolume[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback((query: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const items = await searchBooks(query);
        setResults(items);
      } catch {
        setError('Search failed. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }, 400);
  }, []);

  const clear = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return { results, isLoading, error, search, clear };
}
