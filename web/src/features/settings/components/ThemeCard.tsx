'use client';

import { useEffect, useState, type ReactNode } from 'react';

type ThemeMode = 'light' | 'dark';

const THEME_STORAGE_KEY = 'steadyai.theme';

const themes: Array<{
  mode: ThemeMode;
  title: string;
  description: string;
}> = [
  {
    mode: 'light',
    title: 'Light',
    description: 'Warm, bright surfaces for daytime planning and review.'
  },
  {
    mode: 'dark',
    title: 'Dark',
    description: 'Lower-glare contrast for evening check-ins and coaching.'
  }
];

function applyTheme(mode: ThemeMode) {
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    applyTheme(storedTheme === 'dark' ? 'dark' : 'light');
  }, []);

  return children;
}

export function ThemeCard() {
  const [selectedTheme, setSelectedTheme] = useState<ThemeMode>('light');

  useEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    const nextTheme = storedTheme === 'dark' ? 'dark' : 'light';
    setSelectedTheme(nextTheme);
    applyTheme(nextTheme);
  }, []);

  function handleThemeChange(mode: ThemeMode) {
    setSelectedTheme(mode);
    window.localStorage.setItem(THEME_STORAGE_KEY, mode);
    applyTheme(mode);
  }

  return (
    <section className="rounded-[32px] border border-white/80 bg-[#fffaf5]/82 p-4 shadow-[0_18px_60px_rgba(80,48,24,0.1)] dark:border-[#4a372b] dark:bg-[#231914]/88 dark:shadow-[0_18px_60px_rgba(0,0,0,0.3)] sm:p-6">
      <h3 className="text-2xl font-bold tracking-[-0.04em] text-[#1d140d] dark:text-[#fff7ed]">Theme</h3>
      <p className="mt-2 text-sm leading-6 text-[#5f5145] dark:text-[#d6c2ae]">
        Choose how SteadyAI appears on this device. Your preference is saved locally.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {themes.map((theme) => {
          const isSelected = selectedTheme === theme.mode;

          return (
            <button
              key={theme.mode}
              type="button"
              onClick={() => handleThemeChange(theme.mode)}
              className={`rounded-[24px] border p-4 text-left transition ${
                isSelected
                  ? 'border-[#1d140d] bg-[#1d140d] text-white shadow-[0_14px_36px_rgba(29,20,13,0.18)] dark:border-[#f3c99f] dark:bg-[#fff7ed] dark:text-[#1d140d]'
                  : 'border-white/80 bg-white/72 text-[#4e4035] hover:border-[#d8c4b3] hover:bg-white dark:border-[#4a372b] dark:bg-[#15100c]/72 dark:text-[#fff7ed] dark:hover:border-[#f3c99f] dark:hover:bg-[#2b2018]'
              }`}
              aria-pressed={isSelected}
            >
              <div className="flex items-center justify-between gap-3">
                <span className="text-base font-bold">{theme.title}</span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                    isSelected ? 'border-white bg-white dark:border-[#1d140d]' : 'border-[#bca994] bg-[#fffaf5] dark:border-[#7b604d] dark:bg-[#231914]'
                  }`}
                  aria-hidden="true"
                >
                  {isSelected ? <span className="h-2.5 w-2.5 rounded-full bg-[#1d140d]" /> : null}
                </span>
              </div>
              <p className={`mt-2 text-sm leading-6 ${isSelected ? 'text-[#f3e7da] dark:text-[#5f5145]' : 'text-[#5f5145] dark:text-[#d6c2ae]'}`}>
                {theme.description}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
