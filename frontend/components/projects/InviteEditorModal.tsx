'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface InviteEditorModalProps {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteEditorModal({
  projectId,
  isOpen,
  onClose,
}: InviteEditorModalProps) {
  const [email, setEmail] = useState('');
  const queryClient = useQueryClient();

  const inviteMutation = useMutation({
    mutationFn: (email: string) => api.inviteEditor(projectId, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      setEmail('');
      onClose();
      alert('Invitation sent successfully!');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    inviteMutation.mutate(email);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 backdrop-blur-sm"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md rounded-2xl p-8 shadow-2xl" style={{ border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: '#0A0A0F', backdropFilter: 'blur(20px)' }}>
        <h2 className="mb-8 text-2xl font-bold tracking-tight" style={{ color: '#FFFFFF', fontFamily: '"Space Grotesk", sans-serif' }}>Invite Editor</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold mb-2.5" style={{ color: '#FFFFFF' }}>
              Editor Email *
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm focus:outline-none transition-all duration-200"
              style={{
                border: '1px solid rgba(255, 255, 255, 0.12)',
                backgroundColor: 'rgba(255, 255, 255, 0.04)',
                color: '#FFFFFF'
              }}
              placeholder="editor@example.com"
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#0066FF';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0, 102, 255, 0.15)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {inviteMutation.error && (
            <div className="rounded-xl p-4 text-sm font-medium" style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444' }}>
              {(inviteMutation.error as any)?.response?.data?.message ||
                'Failed to send invitation'}
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200"
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
              Cancel
            </button>
            <button
              type="submit"
              disabled={inviteMutation.isPending}
              className="flex-1 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              style={{ 
                backgroundColor: '#0066FF',
                boxShadow: '0 4px 14px 0 rgba(0, 102, 255, 0.25)'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#0052CC';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 20px 0 rgba(0, 102, 255, 0.35)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0066FF';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px 0 rgba(0, 102, 255, 0.25)';
              }}
            >
              {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
