'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface FileListProps {
  files: any[];
  isLoading: boolean;
  isCreator: boolean;
}

export default function FileList({ files, isLoading, isCreator }: FileListProps) {
  const queryClient = useQueryClient();
  const [openingFile, setOpeningFile] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => api.deleteFile(fileId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files'] });
    },
  });

  const handleOpenInEditor = async (fileId: string) => {
    setOpeningFile(fileId);
    try {
      const { url } = await api.getFileUrl(fileId, 'open_in_editor');
      
      // Try to open via desktop connector protocol
      const protocolUrl = `c2e://open?fileId=${fileId}&url=${encodeURIComponent(url)}`;
      
      // Attempt to open desktop app
      window.location.href = protocolUrl;
      
      // Fallback: Show URL if desktop app not installed
      setTimeout(() => {
        if (confirm('Desktop app not detected. Open in browser instead?')) {
          window.open(url, '_blank');
        }
      }, 1000);
    } catch (error) {
      alert('Failed to open file. Please check your permissions.');
    } finally {
      setOpeningFile(null);
    }
  };

  const formatFileSize = (bytes: string | number) => {
    const size = typeof bytes === 'string' ? parseInt(bytes) : bytes;
    if (size < 1024) return size + ' B';
    if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
    if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(2) + ' MB';
    return (size / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl"
            style={{ border: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
          />
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl p-16 text-center" style={{ border: '1px solid rgba(255, 255, 255, 0.08)', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
        <div className="mb-6 text-5xl">🎬</div>
        <h3 className="mb-3 text-xl font-semibold" style={{ color: '#FFFFFF' }}>No files yet</h3>
        <p className="text-base" style={{ color: 'rgba(255, 255, 255, 0.6)', maxWidth: '400px' }}>
          {isCreator ? 'Upload your first video file to get started' : 'No files in this project'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="group flex items-center justify-between rounded-2xl p-5 transition-all duration-300"
          style={{
            border: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(10px)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(0, 102, 255, 0.25)';
            e.currentTarget.style.backgroundColor = 'rgba(0, 102, 255, 0.06)';
            e.currentTarget.style.transform = 'translateX(4px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          <div className="flex items-center gap-5">
            <div className="rounded-xl p-3" style={{ backgroundColor: 'rgba(0, 102, 255, 0.1)' }}>
              <div className="text-2xl">🎬</div>
            </div>
            <div>
              <h3 className="font-semibold mb-1" style={{ color: '#FFFFFF', letterSpacing: '-0.01em' }}>{file.name}</h3>
              <div className="flex items-center gap-3 text-sm font-medium" style={{ color: 'rgba(255, 255, 255, 0.55)' }}>
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleOpenInEditor(file.id)}
              disabled={openingFile === file.id}
              className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all duration-200 disabled:opacity-50 shadow-lg"
              style={{ 
                backgroundColor: '#0066FF',
                boxShadow: '0 4px 12px 0 rgba(0, 102, 255, 0.2)'
              }}
              onMouseEnter={(e) => {
                if (!e.currentTarget.disabled) {
                  e.currentTarget.style.backgroundColor = '#0052CC';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px 0 rgba(0, 102, 255, 0.3)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#0066FF';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px 0 rgba(0, 102, 255, 0.2)';
              }}
            >
              {openingFile === file.id ? 'Opening...' : 'Open in Editor'}
            </button>
            {isCreator && (
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to delete this file?')) {
                    deleteMutation.mutate(file.id);
                  }
                }}
                className="rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200"
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
                Delete
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
