'use client';

import { useState } from 'react';

interface Toast {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const toast = (config: Toast) => {
    // In production, this would trigger a toast notification
    console.log('[Toast]', config);
    setToasts((prev) => [...prev, config]);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  };

  return { toast, toasts };
}

