'use client';

import { useAuth } from '@/auth';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const CORE_NAV_ITEMS: Array<{ href: string; label: string }> = [
  { href: '/', label: 'Coach OS' },
  { href: '/community', label: 'Community' },
  { href: '/reports', label: 'Reports' }
];

const AUTH_NAV_ITEMS: Array<{ href: string; label: string }> = [
  { href: '/ai-coach', label: 'AI Coach' },
  { href: '/community', label: 'Community' },
  { href: '/reports', label: 'Reports' }
];

const DEFAULT_POST_AUTH_PATH = '/onboarding';

function isActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppTopNav() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const {
    isAuthenticated,
    isGoogleAuthConfigured,
    isAppleAuthConfigured,
    isPasswordAuthConfigured,
    isSigningInWithGoogle,
    isSigningInWithApple,
    signInWithGoogle,
    signInWithApple,
    logout
  } = useAuth();
  const navItems = isAuthenticated
    ? AUTH_NAV_ITEMS
    : [...CORE_NAV_ITEMS.slice(0, 1), { href: '/onboarding', label: 'Onboarding' }, ...CORE_NAV_ITEMS.slice(1)];

  if (isAuthenticated && (pathname.startsWith('/ai-coach') || pathname.startsWith('/agents'))) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[#ead9ca] bg-[#fffaf5]/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-[#1d140d]">
          <Image src="/brand/steadyai-logo.svg" alt="SteadyAI logo" width={40} height={40} priority className="h-10 w-10 rounded-[14px]" />
          <div className="min-w-0">
            <p className="text-sm font-bold uppercase tracking-[0.26em] text-[#1d140d]">SteadyAI</p>
            <p className="text-xs text-[#7a4b28]">GoodHealth247</p>
          </div>
        </Link>

        <button
          type="button"
          className="rounded-full border border-[#d9c4af] px-3 py-2 text-sm text-[#4e4035] md:hidden"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-expanded={isOpen}
          aria-controls="top-nav-menu"
        >
          Menu
        </button>

        <div className="hidden items-center gap-3 md:flex">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    active ? 'bg-[#1d140d] text-white' : 'text-[#4e4035] hover:bg-[#f3e7da]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => logout()}
              className="rounded-full border border-[#d9c4af] px-4 py-2 text-sm text-[#4e4035]"
            >
              Sign out
            </button>
          ) : isGoogleAuthConfigured || isAppleAuthConfigured || isPasswordAuthConfigured ? (
            <div className="flex items-center gap-2">
              {isPasswordAuthConfigured ? (
                <Link href="/sign-in" className="rounded-full bg-[#1d140d] px-4 py-2 text-sm text-white">
                  Email
                </Link>
              ) : null}
              {isGoogleAuthConfigured ? (
                <button
                  type="button"
                  onClick={() => {
                    void signInWithGoogle({ redirectTo: DEFAULT_POST_AUTH_PATH });
                  }}
                  disabled={isSigningInWithGoogle || isSigningInWithApple}
                  className="rounded-full bg-[#1d140d] px-4 py-2 text-sm text-white disabled:bg-[#ab9a8c]"
                >
                  {isSigningInWithGoogle ? 'Connecting...' : 'Google'}
                </button>
              ) : null}
              {isAppleAuthConfigured ? (
                <button
                  type="button"
                  onClick={() => {
                    void signInWithApple({ redirectTo: DEFAULT_POST_AUTH_PATH });
                  }}
                  disabled={isSigningInWithGoogle || isSigningInWithApple}
                  className="rounded-full border border-[#1d140d] bg-white px-4 py-2 text-sm text-[#1d140d] disabled:border-[#cab8a8] disabled:text-[#ab9a8c]"
                >
                  {isSigningInWithApple ? 'Connecting...' : 'Apple'}
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

      </div>

      {isOpen ? (
        <nav id="top-nav-menu" className="border-t border-[#ead9ca] bg-[#fffaf5] px-4 py-2 md:hidden">
          <div className="flex flex-col gap-1">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`rounded-full px-3 py-2 text-sm ${
                    active ? 'bg-[#1d140d] text-white' : 'text-[#4e4035] hover:bg-[#f3e7da]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  logout();
                }}
                className="rounded-full px-3 py-2 text-left text-sm text-[#4e4035] hover:bg-[#f3e7da]"
              >
                Sign out
              </button>
            ) : isGoogleAuthConfigured || isAppleAuthConfigured || isPasswordAuthConfigured ? (
              <>
                {isPasswordAuthConfigured ? (
                  <Link
                    href="/sign-in"
                    onClick={() => setIsOpen(false)}
                    className="rounded-full bg-[#1d140d] px-3 py-2 text-left text-sm text-white"
                  >
                    Continue with email
                  </Link>
                ) : null}
                {isGoogleAuthConfigured ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      void signInWithGoogle({ redirectTo: DEFAULT_POST_AUTH_PATH });
                    }}
                    disabled={isSigningInWithGoogle || isSigningInWithApple}
                    className="rounded-full bg-[#1d140d] px-3 py-2 text-left text-sm text-white disabled:bg-[#ab9a8c]"
                  >
                    {isSigningInWithGoogle ? 'Connecting...' : 'Continue with Google'}
                  </button>
                ) : null}
                {isAppleAuthConfigured ? (
                  <button
                    type="button"
                    onClick={() => {
                      setIsOpen(false);
                      void signInWithApple({ redirectTo: DEFAULT_POST_AUTH_PATH });
                    }}
                    disabled={isSigningInWithGoogle || isSigningInWithApple}
                    className="rounded-full border border-[#1d140d] px-3 py-2 text-left text-sm text-[#1d140d] disabled:border-[#cab8a8] disabled:text-[#ab9a8c]"
                  >
                    {isSigningInWithApple ? 'Connecting...' : 'Continue with Apple'}
                  </button>
                ) : null}
              </>
            ) : null}
          </div>
        </nav>
      ) : null}
    </header>
  );
}
