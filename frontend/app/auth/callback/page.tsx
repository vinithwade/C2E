'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';

function OAuthCallback() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setUser, fetchUser } = useAuthStore();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Update API client tokens
      api.setTokens(accessToken, refreshToken);

      // Fetch user data and redirect
      fetchUser()
        .then(() => {
          router.push('/dashboard');
        })
        .catch((error) => {
          console.error('Failed to fetch user:', error);
          router.push('/login?error=oauth_failed');
        });
    } else {
      // No tokens, redirect to login
      router.push('/login?error=oauth_failed');
    }
  }, [searchParams, router, fetchUser]);

  return (
    <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#0A0A0F' }}>
      <div className="text-center">
        <div className="mb-4 text-4xl animate-spin">⏳</div>
        <p className="text-lg font-medium" style={{ color: '#FFFFFF' }}>Completing sign in...</p>
        <p className="mt-2 text-sm" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Please wait while we redirect you</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#0A0A0F' }}>
        <div className="text-center">
          <div className="mb-4 text-4xl animate-spin">⏳</div>
          <p className="text-lg font-medium" style={{ color: '#FFFFFF' }}>Loading...</p>
        </div>
      </div>
    }>
      <OAuthCallback />
    </Suspense>
  );
}
