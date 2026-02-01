'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useQueryClient } from '@tanstack/react-query';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';
import Sidebar from './Sidebar';

interface CreatorDashboardProps {
  projects: any[];
  isLoading: boolean;
}

export default function CreatorDashboard({ projects, isLoading }: CreatorDashboardProps) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await api.logout(refreshToken);
    }
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#020617', color: '#e5e7eb' }}>
      {/* Top blue bar (Docker-style) */}
      <header
        className="flex items-center justify-between px-6 py-3 border-b"
        style={{
          background: 'linear-gradient(90deg, #0b1f4b 0%, #1d4ed8 60%, #1d4ed8 100%)',
          borderColor: 'rgba(30, 64, 175, 0.8)',
        }}
      >
            <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-md text-sm font-bold"
              style={{ backgroundColor: 'rgba(15,23,42,0.7)', color: '#60a5fa' }}
            >
              C2E
            </div>
            <span className="text-sm font-semibold tracking-wide" style={{ color: '#e5e7eb' }}>
              Creator Dashboard
            </span>
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6">
          <div
            className="flex w-full max-w-xl items-center gap-2 rounded-md px-3 py-1 text-sm"
            style={{ backgroundColor: 'rgba(15,23,42,0.92)', border: '1px solid rgba(51, 65, 85, 0.8)' }}
          >
            <span className="text-xs" style={{ color: 'rgba(148,163,184,0.9)' }}>
              Search projects…
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="rounded-md px-3 py-1.5 text-xs font-semibold shadow-sm transition-colors"
            style={{ backgroundColor: '#1d4ed8', color: '#e5e7eb' }}
          >
            + New project
          </button>
          <button
            onClick={handleLogout}
            className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              backgroundColor: 'rgba(15,23,42,0.7)',
              color: 'rgba(226,232,240,0.9)',
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Body: sidebar + content */}
      <div className="flex flex-1">
        <Sidebar userRole="CREATOR" />

        <main className="flex-1 px-6 py-6">
          {/* Top summary + title row */}
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2
                className="text-sm font-semibold tracking-wide"
                style={{ color: 'rgba(226,232,240,0.96)' }}
              >
                Containers (projects)
              </h2>
              <p className="mt-1 text-xs" style={{ color: 'rgba(148,163,184,0.95)' }}>
                Manage your video collaboration projects and their files.
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs" style={{ color: 'rgba(148,163,184,0.95)' }}>
              <div className="flex items-center gap-1">
                <span
                  className="inline-flex h-2 w-2 rounded-full"
                  style={{ backgroundColor: '#22c55e' }}
                />
                <span>{projects.length} total</span>
              </div>
            </div>
          </div>

          {/* Projects table */}
          <div
            className="overflow-hidden rounded-lg border text-xs"
            style={{
              borderColor: 'rgba(30, 64, 175, 0.65)',
              backgroundColor: '#020617',
            }}
          >
            <div
              className="grid grid-cols-[20px_minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.2fr)] gap-3 px-4 py-2"
              style={{
                borderBottom: '1px solid rgba(30,64,175,0.6)',
                backgroundColor: 'rgba(15,23,42,0.95)',
                color: 'rgba(148,163,184,0.95)',
              }}
            >
              <div />
              <div>Name</div>
              <div>Description</div>
              <div>Files</div>
              <div>Last updated</div>
        </div>

        {isLoading ? (
              <div className="divide-y" style={{ borderColor: 'rgba(15,23,42,0.9)' }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                    className="grid grid-cols-[20px_minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.2fr)] gap-3 px-4 py-3"
                  >
                    <div className="h-3 w-3 rounded-sm bg-slate-800" />
                    <div className="h-3 rounded bg-slate-800" />
                    <div className="h-3 rounded bg-slate-800" />
                    <div className="h-3 rounded bg-slate-800" />
                    <div className="h-3 rounded bg-slate-800" />
                  </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
              <div className="px-4 py-10 text-center text-xs" style={{ color: 'rgba(148,163,184,0.95)' }}>
                No projects yet. Click <span className="font-semibold">“New project”</span> to create one.
          </div>
        ) : (
              <div className="divide-y" style={{ borderColor: 'rgba(15,23,42,0.9)' }}>
                {projects.map((project) => (
                  <button
                key={project.id}
                    onClick={() => router.push(`/projects/${project.id}`)}
                    className="grid w-full grid-cols-[20px_minmax(0,2fr)_minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.2fr)] items-center gap-3 px-4 py-2.5 text-left transition-colors"
                    style={{
                      backgroundColor: '#020617',
                      color: 'rgba(226,232,240,0.96)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#0b1120';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = '#020617';
                    }}
                  >
                    <div
                      className="h-3 w-3 rounded-sm"
                      style={{ backgroundColor: '#22c55e' }}
                    />
                    <div className="truncate">{project.name}</div>
                    <div className="truncate text-[11px]" style={{ color: 'rgba(148,163,184,0.95)' }}>
                      {project.description || '—'}
                    </div>
                    <div className="text-[11px]" style={{ color: 'rgba(148,163,184,0.95)' }}>
                      {project.files?.length ?? 0} files
                    </div>
                    <div className="text-[11px]" style={{ color: 'rgba(148,163,184,0.95)' }}>
                      {project.updatedAt
                        ? new Date(project.updatedAt).toLocaleDateString()
                        : '—'}
                    </div>
                  </button>
            ))}
          </div>
        )}
          </div>
      </main>
      </div>

      <CreateProjectModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}
