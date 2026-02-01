'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import ProjectDetailView from '@/components/projects/ProjectDetailView';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, fetchUser } = useAuthStore();
  const projectId = params.id as string;

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser().catch(() => router.push('/login'));
    }
  }, [isAuthenticated, fetchUser, router]);

  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => api.getProject(projectId),
    enabled: isAuthenticated && !!projectId,
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">Loading project...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Project not found</h2>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-[#0066FF] hover:underline"
          >
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  const isCreator = user.role === 'CREATOR' && project.creatorId === user.id;

  return <ProjectDetailView project={project} isCreator={isCreator} />;
}
