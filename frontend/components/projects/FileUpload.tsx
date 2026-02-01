'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { api } from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface FileUploadProps {
  projectId: string;
}

export default function FileUpload({ projectId }: FileUploadProps) {
  const [uploading, setUploading] = useState<string | null>(null);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Get signed upload URL
      const { uploadUrl, key } = await api.getUploadUrl(
        projectId,
        file.name,
        file.type,
      );

      // Step 2: Upload directly to S3
      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      // Step 3: Create file metadata in database
      const fileData = await api.createFileMetadata(projectId, {
        name: file.name,
        mimeType: file.type,
        storagePath: key,
        size: file.size,
      });

      return fileData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['files', projectId] });
      setUploading(null);
    },
    onError: () => {
      setUploading(null);
    },
  });

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      for (const file of acceptedFiles) {
        setUploading(file.name);
        uploadMutation.mutate(file);
      }
    },
    [uploadMutation],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi', '.mkv', '.m4v'],
    },
    multiple: true,
  });

  return (
    <div>
      <div
        {...getRootProps()}
        className="cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all duration-300"
        style={{
          borderColor: isDragActive ? '#0066FF' : 'rgba(255, 255, 255, 0.12)',
          backgroundColor: isDragActive ? 'rgba(0, 102, 255, 0.08)' : 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          if (!isDragActive) {
            e.currentTarget.style.borderColor = 'rgba(0, 102, 255, 0.3)';
            e.currentTarget.style.backgroundColor = 'rgba(0, 102, 255, 0.05)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isDragActive) {
            e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
          }
        }}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <div className="mb-4 text-4xl">📤</div>
          <p className="text-base font-medium mb-1" style={{ color: '#FFFFFF' }}>
            {isDragActive
              ? 'Drop video files here'
              : 'Drag & drop video files or click to select'}
          </p>
          <p className="text-sm" style={{ color: 'rgba(255, 255, 255, 0.55)' }}>
            Supports MP4, MOV, AVI, MKV, M4V
          </p>
        </div>
      </div>

      {uploading && (
        <div className="mt-5 rounded-2xl p-4" style={{ border: '1px solid rgba(0, 102, 255, 0.25)', backgroundColor: 'rgba(0, 102, 255, 0.08)' }}>
          <div className="flex items-center gap-4">
            <div className="h-2.5 flex-1 animate-pulse rounded-full" style={{ backgroundColor: 'rgba(0, 102, 255, 0.4)' }} />
            <span className="text-sm font-medium" style={{ color: '#FFFFFF' }}>Uploading {uploading}...</span>
          </div>
        </div>
      )}
    </div>
  );
}
