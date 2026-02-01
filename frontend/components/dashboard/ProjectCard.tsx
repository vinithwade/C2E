'use client';

import { useRouter } from 'next/navigation';

interface ProjectCardProps {
  project: any;
  isEditor?: boolean;
}

export default function ProjectCard({ project, isEditor = false }: ProjectCardProps) {
  const router = useRouter();

  const fileCount = project.files?.length || 0;
  const editorCount = project.editors?.length || 0;

  return (
    <div
      className="group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300"
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.3)';
        e.currentTarget.style.borderColor = 'rgba(0, 102, 255, 0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.08)';
      }}
      onClick={() => router.push(`/projects/${project.id}`)}
    >
      {/* Thumbnail Area */}
      <div 
        className="aspect-video flex items-center justify-center relative overflow-hidden"
        style={{ backgroundColor: 'rgba(0, 102, 255, 0.1)' }}
      >
        <div className="text-6xl opacity-50">📁</div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        {fileCount > 0 && (
          <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', color: '#FFFFFF' }}>
            {fileCount} {fileCount === 1 ? 'file' : 'files'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-sm font-semibold mb-2 line-clamp-2 leading-snug" style={{ color: '#FFFFFF', letterSpacing: '-0.01em' }}>
          {project.name}
        </h3>

      {project.description && (
          <p className="text-xs mb-3 line-clamp-2 leading-relaxed" style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            {project.description}
          </p>
      )}

        <div className="flex items-center justify-between text-xs" style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
          <div className="flex items-center gap-3">
        {!isEditor && (
          <span className="flex items-center gap-1">
            <span>👥</span>
                {editorCount}
          </span>
        )}
            <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      </div>
  );
}
