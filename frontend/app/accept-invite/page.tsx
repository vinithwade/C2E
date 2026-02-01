'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import Link from 'next/link';

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user, isAuthenticated, fetchUser, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [needsPassword, setNeedsPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const token = searchParams.get('token');

  useEffect(() => {
    // Check if user is already logged in
    if (isAuthenticated && user && token && !isLoading && !success) {
      // Try to accept with existing auth
      handleAcceptAuthenticated();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user, token]);

  const handleAcceptAuthenticated = async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError('');

    try {
      await api.acceptInviteAuthenticated(token);
      // Refresh user data to get updated role
      await fetchUser();
      setSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to accept invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Invalid invitation link');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.acceptInvite(token, password, name);
      
      // If user data is returned, update auth store
      if (response.user) {
        setUser(response.user);
      }
      
      // Refresh user data
      await fetchUser();
      
      setSuccess(true);
      setTimeout(() => {
        // Redirect to editor dashboard
        router.push('/dashboard');
      }, 2000);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to accept invitation';
      setError(errorMessage);
      
      // If error says password required, show password form
      if (errorMessage.includes('Password required') || errorMessage.includes('password')) {
        setNeedsPassword(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
          <p className="text-gray-600">This invitation link is invalid or expired.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <div className="text-center">
          <div className="mb-4 text-4xl">✅</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Invitation Accepted!</h2>
          <p className="text-gray-600">Redirecting to editor dashboard...</p>
        </div>
      </div>
    );
  }

  // If user is authenticated, show simple accept button
  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div className="text-center mb-6">
            <div className="mb-4 text-4xl">📬</div>
            <h1 className="text-xl font-semibold text-gray-900">You've been invited!</h1>
            <p className="mt-2 text-sm text-gray-600">
              Accept this invitation to collaborate on a video project
            </p>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600 mb-4">
              {error}
            </div>
          )}

          <button
            onClick={handleAcceptAuthenticated}
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Accepting...' : 'Accept Invitation'}
          </button>
        </div>
      </div>
    );
  }

  // Show registration form if user needs to create account
  return (
    <div className="flex min-h-screen items-center justify-center bg-white p-4">
      <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="mb-4 text-4xl">📬</div>
          <h1 className="text-xl font-semibold text-gray-900">You've been invited!</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create an account to accept this invitation and start collaborating
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-600 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Name (optional)
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password *
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="••••••••"
              minLength={8}
            />
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Accepting...' : 'Accept Invitation & Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href={`/login?invite=${token}`} className="font-medium text-blue-600 hover:text-blue-500">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-white p-4">
        <div className="text-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      </div>
    }>
      <AcceptInviteForm />
    </Suspense>
  );
}
