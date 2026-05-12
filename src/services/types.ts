export interface MythCitation {
  title: string;
  url: string;
}

export interface EducatorInput {
  userQuestion: string;
  threadContext?: string;
}

export interface EducatorResult {
  lesson: string;
  wordCount: number;
  disclaimer: string;
  evidenceBasis: string[];
  provider: 'llm' | 'fallback';
}

export interface EducatorMythCorrectionInput {
  communityPostText: string;
  threadContext?: string;
}

export interface EducatorMythCorrectionResult {
  suggestedCorrection: string;
  context: string;
  citations: MythCitation[];
  disclaimer: string;
  provider: 'llm' | 'fallback';
}
