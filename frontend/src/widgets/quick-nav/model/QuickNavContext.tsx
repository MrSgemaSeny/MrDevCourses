import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

export type QuickNavTab = 'glossary' | 'progress' | 'roadmap';

export interface QuickNavContextValue {
  isOpen: boolean;
  activeTab: QuickNavTab;
  selectedTerm: string | null;
  courseId: number | null;
  lessonId: number | null;
  dayNumber: number | null;
  openQuickNav: (tab?: QuickNavTab, term?: string | null) => void;
  closeQuickNav: () => void;
  setActiveTab: (tab: QuickNavTab) => void;
  setSelectedTerm: (term: string | null) => void;
  setContextData: (data: { courseId?: number | null; lessonId?: number | null; dayNumber?: number | null }) => void;
}

const QuickNavContext = createContext<QuickNavContextValue | undefined>(undefined);

export interface QuickNavProviderProps {
  children: React.ReactNode;
  initialCourseId?: number;
  initialLessonId?: number;
  initialDayNumber?: number;
}

export const QuickNavProvider: React.FC<QuickNavProviderProps> = ({
  children,
  initialCourseId = null,
  initialLessonId = null,
  initialDayNumber = null,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<QuickNavTab>('glossary');
  const [selectedTerm, setSelectedTerm] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<number | null>(initialCourseId);
  const [lessonId, setLessonId] = useState<number | null>(initialLessonId);
  const [dayNumber, setDayNumber] = useState<number | null>(initialDayNumber);

  const openQuickNav = useCallback((tab?: QuickNavTab, term?: string | null) => {
    if (tab) {
      setActiveTab(tab);
    }
    if (term !== undefined) {
      setSelectedTerm(term);
    }
    setIsOpen(true);
  }, []);

  const closeQuickNav = useCallback(() => {
    setIsOpen(false);
  }, []);

  const setContextData = useCallback((data: { courseId?: number | null; lessonId?: number | null; dayNumber?: number | null }) => {
    if (data.courseId !== undefined) setCourseId(data.courseId);
    if (data.lessonId !== undefined) setLessonId(data.lessonId);
    if (data.dayNumber !== undefined) setDayNumber(data.dayNumber);
  }, []);

  const value = useMemo<QuickNavContextValue>(
    () => ({
      isOpen,
      activeTab,
      selectedTerm,
      courseId,
      lessonId,
      dayNumber,
      openQuickNav,
      closeQuickNav,
      setActiveTab,
      setSelectedTerm,
      setContextData,
    }),
    [isOpen, activeTab, selectedTerm, courseId, lessonId, dayNumber, openQuickNav, closeQuickNav, setContextData]
  );

  return <QuickNavContext.Provider value={value}>{children}</QuickNavContext.Provider>;
};

export const useQuickNav = (): QuickNavContextValue => {
  const context = useContext(QuickNavContext);
  if (!context) {
    throw new Error('useQuickNav must be used within a QuickNavProvider');
  }
  return context;
};
