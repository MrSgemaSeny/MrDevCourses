import React from 'react';
import type { LessonMaterial } from '@/shared/types';
import { FileText, Code2, ExternalLink, Download, BookOpen } from 'lucide-react';

interface LessonMaterialsListProps {
  materials?: LessonMaterial[];
}

export const LessonMaterialsList: React.FC<LessonMaterialsListProps> = ({ materials = [] }) => {
  if (!materials || materials.length === 0) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'CHEAT_SHEET':
        return <FileText className="w-4 h-4 text-amber-400" />;
      case 'SOURCE_CODE':
      case 'REPO_LINK':
        return <Code2 className="w-4 h-4 text-[#58a6ff]" />;
      case 'PDF':
        return <Download className="w-4 h-4 text-emerald-400" />;
      default:
        return <BookOpen className="w-4 h-4 text-zinc-500" />;
    }
  };

  return (
    <div className="bg-[#18181b] border border-white/5 rounded-sm p-4 space-y-3">
      <h3 className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 text-[#58a6ff]" />
        <span>Материалы и ссылки к уроку ({materials.length})</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {materials.map((mat) => (
          <a
            key={mat.id}
            href={mat.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-sm bg-[#0a0a0c] border border-white/5 hover:border-[#58a6ff]/50 hover:bg-[#1f242c] transition-all group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-1.5 rounded bg-zinc-900 shrink-0">{getIcon(mat.materialType)}</div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-[#c9d1d9] group-hover:text-white truncate">
                  {mat.title}
                </div>
                <div className="text-[10px] text-zinc-500">{mat.materialType}</div>
              </div>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#58a6ff] shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
};
