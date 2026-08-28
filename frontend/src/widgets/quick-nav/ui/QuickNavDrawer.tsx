import React, { useEffect } from 'react';
import { useQuickNav, QuickNavTab } from '../model/QuickNavContext';
import { GlossaryView } from './GlossaryView';
import { ProgressView } from './ProgressView';
import { RoadmapView } from './RoadmapView';
import { X, BookOpen, Flame, Map, Layers } from 'lucide-react';

interface QuickNavDrawerProps {
  // Optional overrides if used outside QuickNavContext
  isOpen?: boolean;
  activeTab?: QuickNavTab;
  selectedTerm?: string | null;
  courseId?: number | null;
  lessonId?: number | null;
  onClose?: () => void;
  onTabChange?: (tab: QuickNavTab) => void;
}

export const QuickNavDrawer: React.FC<QuickNavDrawerProps> = (props) => {
  const context = useQuickNav();

  // Use props if provided, otherwise context
  const isOpen = props.isOpen !== undefined ? props.isOpen : context.isOpen;
  const activeTab = props.activeTab !== undefined ? props.activeTab : context.activeTab;
  const selectedTerm = props.selectedTerm !== undefined ? props.selectedTerm : context.selectedTerm;
  const courseId = props.courseId !== undefined ? props.courseId : context.courseId;
  const lessonId = props.lessonId !== undefined ? props.lessonId : context.lessonId;
  const onClose = props.onClose || context.closeQuickNav;
  const setActiveTab = props.onTabChange || context.setActiveTab;

  // Handle ESC key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const tabs: { key: QuickNavTab; label: string; icon: React.ReactNode }[] = [
    { key: 'glossary', label: 'Глоссарий', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'progress', label: 'Прогресс', icon: <Flame className="w-4 h-4" /> },
    { key: 'roadmap', label: 'Roadmap', icon: <Map className="w-4 h-4" /> },
  ];

  return (
    <>
      {/* Backdrop overlay */}
      <div
        data-testid="quick-nav-backdrop"
        onClick={onClose}
        className={`fixed inset-0 bg-black/70 z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!isOpen}
      />

      {/* Slide-over Drawer Panel */}
      <aside
        data-testid="quick-nav-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Быстрая навигация"
        className={`fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#0a0a0c] border-l border-white/5 z-50 flex flex-col shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between bg-[#18181b]/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-zinc-800 border border-white/5 flex items-center justify-center text-zinc-300">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs font-bold text-white tracking-tight uppercase">
                Контекстная навигация
              </h2>
              <p className="text-xs text-zinc-400">Быстрый доступ без перезагрузки видео</p>
            </div>
          </div>

          <button
            data-testid="quick-nav-close-btn"
            onClick={onClose}
            aria-label="Закрыть панель"
            className="p-1.5 rounded-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 pb-2 border-b border-white/5 bg-[#0a0a0c]">
          <div className="grid grid-cols-3 gap-1 bg-[#18181b] p-1 rounded-sm border border-white/5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  data-testid={`quick-nav-tab-${tab.key}`}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-md text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? 'bg-zinc-200 text-zinc-900 shadow-sm'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-[#0a0a0c]">
          {activeTab === 'glossary' && (
            <GlossaryView initialSearch={selectedTerm} />
          )}
          {activeTab === 'progress' && (
            <ProgressView courseId={courseId} />
          )}
          {activeTab === 'roadmap' && (
            <RoadmapView
              courseId={courseId}
              currentLessonId={lessonId}
              onSelectLesson={() => {
                // optionally close drawer upon navigating to another lesson
                onClose();
              }}
            />
          )}
        </div>
      </aside>
    </>
  );
};
