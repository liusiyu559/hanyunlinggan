
export enum Mode {
  RECORD = 'RECORD',
  GENERATE = 'GENERATE'
}

export type View = 'CREATOR' | 'LIBRARY';

export interface UserInput {
  theme: string;
  targetAudience: string; // e.g., Children, Adults, College Students
  level: string; // e.g., HSK 1, Advanced
  nativeLanguage: string;
  activityIdea?: string; // Only for RECORD mode
  requirements?: string; // New: Specific requirements for generation
}

export interface GrammarPoint {
  point: string;
  structure: string;
  usage: string;
  examples: string[];
}

export interface GeneratedActivity {
  id?: string;
  collectionId?: string; // Links to a Collection
  createdAt?: number;
  theme?: string;
  level?: string;
  title: string;
  rationale: string;
  
  // New Educational Fields
  teachingGoals: string[];
  keyPoints: string[]; // Teaching heavy/difficult points (重难点)
  grammarAnalysis: GrammarPoint[];
  
  props: string[];
  steps: string[];
  
  simulationContext: string; // Synopsis of dialogue
  simulation: string;
  imagePromptDescription: string;
  imageUrl?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  createdAt: number;
}

export interface ActivityCardProps {
  activity: GeneratedActivity;
  loadingImage: boolean;
  onSave?: (activity: GeneratedActivity) => void;
  onUpdate?: (activity: GeneratedActivity) => void;
  onDelete?: (id: string) => void;
  isSaved?: boolean;
  onGeneratePPT?: (activity: GeneratedActivity) => void;
  onGenerateExercises?: (activity: GeneratedActivity) => void;
  collections?: Collection[];
  onMoveToCollection?: (activityId: string, collectionId: string) => void;
  onGenerateImageBatch?: (activity: GeneratedActivity) => void;
}

// PPT Related Types
export type PPTStyle = 'INK_WASH' | 'FESTIVE_RED' | 'MINIMALIST_ZEN' | 'CUSTOM_UPLOAD';

export interface PPTConfig {
  title: string;
  style: PPTStyle;
  customBackground?: string; // Base64 image data
  outline: PPTOutlineItem[];
}

export interface PPTOutlineItem {
  title: string;
  note: string; // Brief description of what should be on this slide
}

export interface SlideContent {
  title: string;
  bulletPoints: string[];
  speakerNotes: string;
}

export interface PPTSchema {
  slides: SlideContent[];
}

// Exercise Related Types
export type ExerciseType = 'MULTIPLE_CHOICE' | 'FILL_IN_BLANK' | 'MATCHING' | 'TRANSLATION' | 'OPEN_ENDED';

export interface ExerciseConfig {
  types: ExerciseType[];
  count: number; // Questions per type
  includeAnswerKey: boolean;
  includePinyin: boolean; // New: Whether to generate Pinyin
}

export interface ExerciseItem {
  type: ExerciseType;
  question: string;
  options?: string[]; // For multiple choice
  answer: string;
}

export interface ExerciseSchema {
  title: string;
  exercises: ExerciseItem[];
}

// Image Batch Types
export interface ImageBatchConfig {
  focusPoint: string; // The specific grammar or vocabulary point to practice
  count: number;
}

export interface ImageGenerationItem {
  id: string;
  description: string; // The prompt used for image generation
  dialogue: string; // The practice dialogue associated with the scene
  imageUrl?: string;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
}