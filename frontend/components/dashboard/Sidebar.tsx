'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

interface SidebarProps {
  userRole?: 'CREATOR' | 'EDITOR';
}

export default function Sidebar({ userRole = 'CREATOR' }: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuthStore();

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname?.startsWith(path);
  };

  const navItems = [
    {
      id: 'dashboard',
      icon: '🏠',
      label: 'Dashboard',
      path: '/dashboard',
      active: isActive('/dashboard'),
    },
    {
      id: 'projects',
      icon: '📁',
      label: 'Projects',
      path: '/dashboard',
      active: isActive('/dashboard'),
    },
    {
      id: 'files',
      icon: '🎬',
      label: 'Files',
      path: '/dashboard',
      active: false,
    },
    {
      id: 'collaborators',
      icon: '👥',
      label: 'Collaborators',
      path: '/dashboard',
      active: false,
    },
  ];

  return (
    <aside
      className="h-full w-60 border-r transition-all duration-300 flex flex-col"
      style={{
        backgroundColor: '#020617',
        borderColor: 'rgba(148, 163, 184, 0.35)',
      }}
    >
      <div className="flex-1 px-2 py-4 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => router.push(item.path)}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition-all duration-150"
            style={{
              backgroundColor: item.active ? 'rgba(37, 99, 235, 0.18)' : 'transparent',
              color: item.active ? '#60a5fa' : 'rgba(148, 163, 184, 0.95)',
            }}
            onMouseEnter={(e) => {
              if (!item.active) {
                e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.active) {
                e.currentTarget.style.backgroundColor = 'transparent';
              }
            }}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}

        <div className="mt-6 rounded-lg border px-3 py-3 text-xs" style={{ borderColor: 'rgba(148, 163, 184, 0.35)', backgroundColor: 'rgba(15, 23, 42, 0.9)' }}>
          <div className="mb-1 font-semibold uppercase tracking-wide" style={{ color: 'rgba(148, 163, 184, 0.9)' }}>
            Account
          </div>
          <div className="truncate text-[13px]" style={{ color: 'rgba(226, 232, 240, 0.96)' }}>
            {user?.email}
          </div>
          <div className="mt-1 text-[11px]" style={{ color: 'rgba(148, 163, 184, 0.9)' }}>
            {userRole === 'CREATOR' ? 'Creator' : 'Editor'}
          </div>
        </div>
      </div>
    </aside>
  );
}
