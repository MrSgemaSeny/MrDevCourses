export type GlossaryCategory = 'core' | 'backend' | 'frontend' | 'security' | 'ai' | 'devops';

export interface GlossaryTerm {
  id: string;
  term: string;
  category: GlossaryCategory;
  shortDefinition: string;
  fullExplanation: string;
  codeSnippet?: string;
  relatedDayNumbers?: number[];
  tags: string[];
}

export interface GlossaryFilterOptions {
  search?: string;
  category?: GlossaryCategory | 'all';
  dayNumber?: number;
}
