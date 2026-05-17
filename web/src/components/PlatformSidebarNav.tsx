'use client';

import { usePlatformContext } from '@/features/platform/PlatformProvider';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

const ALL_NAV_ITEMS = [
  { href: '/agents', label: 'AI Coach' },
  { href: '/coach', label: 'Coaching', roles: ['COACH', 'ADMIN'] },
  { href: '/workouts', label: 'Workouts' },
  { href: '/nutrition', label: 'Nutrition' },
  { href: '/reports', label: 'Reports' },
  { href: '/community', label: 'Community' },
  { href: '/store', label: 'Store' },
  { href: '/settings', label: 'Settings' },
];

function isActive(pathname: string, href: string): boolean {
  if (href === '/') {
    return pathname === '/';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PlatformSidebarNav() {
  const pathname = usePathname();
  const { workspace } = usePlatformContext();

  const navItems = useMemo(() => {
    return ALL_NAV_ITEMS.filter(item => {
      if (!item.roles) {
        return true;
      }
      return item.roles.includes(workspace.role);
    });
  }, [workspace.role]);

  return (
    <aside className="w-56 flex-shrink-0 border-r border-[#ead9ca] bg-[#fffaf5]/95 p-4">
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? 'bg-[#1d140d] font-semibold text-white'
                  : 'text-[#4e4035] hover:bg-[#f3e7da]'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
