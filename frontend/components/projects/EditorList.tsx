'use client';

import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface EditorListProps {
  project: any;
}

export default function EditorList({ project }: EditorListProps) {
  const queryClient = useQueryClient();

  const removeMutation = useMutation({
    mutationFn: async (editorId: string) => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/projects/${project.id}/editors/${editorId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
          },
        },
      );
      if (!response.ok) throw new Error('Failed to remove editor');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', project.id] });
    },
  });

  const editors = project.editors || [];

  if (editors.length === 0) {
    return (
      <div className="rounded-2xl p-12 text-center" style={{ border: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
        <p className="text-base font-medium" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>No editors invited yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {editors.map((editor: any) => (
        <div
          key={editor.id}
          className="flex items-center justify-between rounded-2xl p-5 transition-all duration-300"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 102, 255, 0.25)';
            e.currentTarget.style.backgroundColor = 'rgba(0, 102, 255, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
          }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl text-white text-base font-bold shadow-lg" style={{ backgroundColor: '#0066FF', boxShadow: '0 4px 12px rgba(0, 102, 255, 0.3)' }}>
              {editor.editor.name?.[0] || editor.editor.email[0].toUpperCase()}
            </div>
            <div>
              <p className="font-semibold mb-0.5" style={{ color: '#FFFFFF', letterSpacing: '-0.01em' }}>
                {editor.editor.name || editor.editor.email}
              </p>
              <p className="text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.55)' }}>{editor.editor.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-xs font-semibold px-3 py-1.5 rounded-lg" style={{ color: 'rgba(255, 255, 255, 0.7)', backgroundColor: 'rgba(255, 255, 255, 0.06)' }}>
              {editor.canOpenInEditor && '🎬 Editor'}
              {editor.canView && ' 👁️ View'}
            </div>
            <button
              onClick={() => {
                if (confirm('Remove this editor from the project?')) {
                  removeMutation.mutate(editor.editorId);
                }
              }}
              className="rounded-xl px-4 py-2 text-sm font-semibold transition-all duration-200"
              style={{
                border: '1px solid rgba(239, 68, 68, 0.25)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: '#ef4444'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
              }}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
