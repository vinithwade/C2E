'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import CreatorDashboard from '@/components/dashboard/CreatorDashboard';
import EditorDashboard from '@/components/dashboard/EditorDashboard';

export default function DashboardPage() {
  const { user, isAuthenticated, fetchUser } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser().catch(() => router.push('/login'));
    }
  }, [isAuthenticated, fetchUser, router]);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.getProjects(),
    enabled: isAuthenticated,
  });

  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (user.role === 'CREATOR') {
    return <CreatorDashboard projects={projects || []} isLoading={isLoading} />;
  }

  return <EditorDashboard projects={projects || []} isLoading={isLoading} />;
}
