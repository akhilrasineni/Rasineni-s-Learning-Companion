
export enum AppTab {
  COACH = 'coach',
  ROADMAP = 'roadmap',
  RESEARCH = 'research',
  VOICE = 'voice',
  QUIZ = 'quiz',
  STUDIO = 'studio',
  SUMMARIZE = 'summarize'
}

export interface RoadmapLink {
  title: string;
  url: string;
}

export interface RoadmapDay {
  day: number;
  title: string;
  tasks: string[];
  revisionTip: string;
  links?: RoadmapLink[];
}

export interface Roadmap {
  topic: string;
  duration: number;
  level: string;
  schedule: RoadmapDay[];
}

export interface QuizScore {
  topic: string;
  score: number;
  total: number;
  timestamp: number;
}

export interface RoadmapProgress {
  completedDays: number[];
  roadmap: Roadmap;
}

export interface UserProgress {
  name: string;
  roadmaps: Record<string, RoadmapProgress>;
  quizHistory: QuizScore[];
  lastActive: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  sources?: Array<{ web: { uri: string; title: string } }>;
}

export interface VisualConcept {
  imageUrl: string;
  explanation: string;
  prompt: string;
}

export interface QuizItem {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
