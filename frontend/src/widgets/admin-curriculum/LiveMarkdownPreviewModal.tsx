import React, { useState } from 'react';
import { X, Save, Eye, Edit3, Columns } from 'lucide-react';
import { MarkdownViewer } from '@/shared/ui/MarkdownViewer';

interface LiveMarkdownPreviewModalProps {
  isOpen: boolean;
  initialContent: string;
  lessonTitle: string;
  onSave: (newContent: string) => void;
  onClose: () => void;
}

export const LiveMarkdownPreviewModal: React.FC<LiveMarkdownPreviewModalProps> = ({
  isOpen,
  initialContent,
  lessonTitle,
  onSave,
  onClose,
}) => {
  const [content, setContent] = useState(initialContent || '');
  const [mode, setMode] = useState<'split' | 'edit' | 'preview'>('split');

  React.useEffect(() => {
    if (isOpen) {
      setContent(initialContent || '');
    }
  }, [isOpen, initialContent]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(content);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-[#121216] border border-white/10 rounded-lg w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-white/10 flex items-center justify-between bg-[#16161c]">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-semibold text-white truncate max-w-md">
              Редактор конспекта урока: {lessonTitle}
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
              markdown
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* View Mode Switcher */}
            <div className="flex items-center rounded-md bg-zinc-900 border border-white/10 p-0.5 text-xs">
              <button
                type="button"
                onClick={() => setMode('split')}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  mode === 'split' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Columns className="w-3.5 h-3.5" />
                <span>Сплит</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('edit')}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  mode === 'edit' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Редактор</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('preview')}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                  mode === 'preview' ? 'bg-zinc-800 text-white font-medium' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Превью</span>
              </button>
            </div>

            {/* Actions */}
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white text-black text-xs font-medium hover:bg-zinc-200 transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Сохранить</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Editor Pane */}
          {(mode === 'split' || mode === 'edit') && (
            <div className={`flex flex-col border-r border-white/10 ${mode === 'split' ? 'w-1/2' : 'w-full'}`}>
              <div className="px-4 py-2 bg-zinc-950/60 border-b border-white/5 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                <span>SOURCE MARKDOWN</span>
                <span>{content.length} симв.</span>
              </div>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Введите конспект урока в Markdown..."
                className="flex-1 p-4 bg-zinc-950 text-xs text-zinc-200 font-mono resize-none focus:outline-none leading-relaxed selection:bg-zinc-800"
                spellCheck={false}
              />
            </div>
          )}

          {/* Preview Pane */}
          {(mode === 'split' || mode === 'preview') && (
            <div className={`flex flex-col bg-[#0e0e11] overflow-y-auto ${mode === 'split' ? 'w-1/2' : 'w-full'}`}>
              <div className="px-4 py-2 bg-zinc-950/60 border-b border-white/5 text-[10px] font-mono text-zinc-400 sticky top-0 z-10 backdrop-blur-sm">
                <span>LIVE PREVIEW</span>
              </div>
              <div className="p-6">
                <MarkdownViewer content={content} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
