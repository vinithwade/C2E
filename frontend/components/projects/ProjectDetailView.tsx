'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import FileUpload from './FileUpload';
import FileList from './FileList';
import InviteEditorModal from './InviteEditorModal';
import EditorList from './EditorList';

interface ProjectDetailViewProps {
  project: any;
  isCreator: boolean;
}

export default function ProjectDetailView({ project, isCreator }: ProjectDetailViewProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const queryClient = useQueryClient();
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const { data: files, isLoading: filesLoading } = useQuery({
    queryKey: ['files', project.id],
    queryFn: () => api.getFiles(project.id),
    enabled: !!project.id,
  });

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      await api.logout(refreshToken);
    }
    await logout();
    router.push('/login');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0A0A0F', color: '#FFFFFF' }}>
      {/* Header */}
      <header className="sticky top-0 z-40 border-b" style={{ borderColor: 'rgba(255, 255, 255, 0.08)', backgroundColor: '#0A0A0F', backdropFilter: 'blur(20px)' }}>
        <div className="flex h-20 items-center justify-between px-8">
          <div className="flex items-center gap-5">
              <button
                onClick={() => router.push('/dashboard')}
              className="rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
              style={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: 'rgba(255, 255, 255, 0.03)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#FFFFFF';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.7)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
              }}
              >
                ← Back
              </button>
            <div className="h-6 w-px" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}></div>
              <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: '#FFFFFF', fontFamily: '"Space Grotesk", sans-serif' }}>{project.name}</h1>
                {project.description && (
                <p className="mt-1 text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>{project.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
            <span className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>{user?.email}</span>
              <button
                onClick={handleLogout}
              className="rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
              style={{ 
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: '#FFFFFF'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.16)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
              }}
              >
                Logout
              </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8">
        <div className="space-y-10">
          {/* Files Section */}
          <section>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-1" style={{ color: '#FFFFFF', fontFamily: '"Space Grotesk", sans-serif' }}>Files</h2>
                <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Manage project files and videos</p>
              </div>
              {isCreator && <FileUpload projectId={project.id} />}
            </div>
            <FileList files={files || []} isLoading={filesLoading} isCreator={isCreator} />
          </section>

          {/* Editors Section (Creator only) */}
          {isCreator && (
            <section>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight mb-1" style={{ color: '#FFFFFF', fontFamily: '"Space Grotesk", sans-serif' }}>Editors</h2>
                  <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Collaborators on this project</p>
                </div>
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-all duration-200 shadow-lg"
                  style={{ 
                    backgroundColor: '#0066FF',
                    boxShadow: '0 4px 14px 0 rgba(0, 102, 255, 0.25)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#0052CC';
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(0, 102, 255, 0.35)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#0066FF';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(0, 102, 255, 0.25)';
                  }}
                >
                  + Invite Editor
                </button>
              </div>
              <EditorList project={project} />
            </section>
          )}
        </div>
      </main>

      <InviteEditorModal
        projectId={project.id}
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
      />
    </div>
  );
}
