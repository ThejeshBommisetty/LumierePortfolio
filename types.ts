
export type LayoutType = 'classic' | 'editorial' | 'wide';

export interface Photo {
  id: string;
  url: string;
  title: string;
  category: string;
  description?: string;
  isPublished: boolean;
  isCategoryHero: boolean;
  layoutType: LayoutType;
}

export enum ViewMode {
  SHOWCASE = 'SHOWCASE',
  ABOUT = 'ABOUT',
  CONTACT = 'CONTACT',
  ADMIN = 'ADMIN'
}

export interface AIAnalysisResult {
  title: string;
  category: string;
  description: string;
}
