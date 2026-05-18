'use client';

import { useEffect } from 'react';

export function PwaLifecycle() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production' || !('serviceWorker' in navigator)) {
      return;
    }

    window.addEventListener('load', () => {
      void navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        // The app should keep working even when the browser blocks service workers.
      });
    });
  }, []);

  return null;
}
