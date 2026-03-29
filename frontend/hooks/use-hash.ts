'use client';

import { useEffect, useState } from 'react';

export function useHash(): string {
  const [hash, setHash] = useState('');

  useEffect(() => {
    const sync = () => {
      setHash(
        typeof window !== 'undefined' ? window.location.hash : '',
      );
    };
    sync();
    window.addEventListener('hashchange', sync);
    return () => window.removeEventListener('hashchange', sync);
  }, []);

  return hash;
}
