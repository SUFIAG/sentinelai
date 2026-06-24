'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useAuthProtection() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (!token) {
        router.replace('/login');
      }
    }
  }, [router]);
}

