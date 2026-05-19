'use client';

import { useEffect, type ReactNode } from 'react';

interface BottomSheetProps {
  open: boolean;
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
}

export function BottomSheet({ open, title, description, children, onClose }: BottomSheetProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center" role="dialog" aria-modal="true" aria-labelledby="bottom-sheet-title">
      <button
        type="button"
        className="absolute inset-0 cursor-default bg-[#1d140d]/45 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close sheet"
      />
      <section className="relative max-h-[88svh] w-full max-w-2xl overflow-hidden rounded-t-[34px] border border-white/80 bg-[#fffaf5] shadow-[0_-24px_90px_rgba(29,20,13,0.26)] dark:border-[#4a372b] dark:bg-[#231914] sm:rounded-[34px]">
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-[#d8c4b3] dark:bg-[#7b604d]" aria-hidden="true" />
        <header className="flex items-start justify-between gap-4 border-b border-[#ead9ca] px-5 pb-4 pt-4 dark:border-[#4a372b] sm:px-6">
          <div>
            <h2 id="bottom-sheet-title" className="text-2xl font-bold tracking-[-0.04em] text-[#1d140d] dark:text-[#fff7ed]">
              {title}
            </h2>
            {description ? <p className="mt-1 text-sm leading-6 text-[#5f5145] dark:text-[#d6c2ae]">{description}</p> : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#d8c4b3] bg-white/70 text-lg font-bold text-[#4e4035] dark:border-[#4a372b] dark:bg-[#15100c] dark:text-[#fff7ed]"
            aria-label="Close"
          >
            ×
          </button>
        </header>
        <div className="max-h-[calc(88svh-7rem)] overflow-y-auto px-5 pb-[calc(1rem+var(--safe-bottom))] pt-4 sm:px-6">
          {children}
        </div>
      </section>
    </div>
  );
}
