export type UserRole = 'user' | 'admin';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type IELTSLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
export type WritingType = 'task1' | 'task2' | 'gt' | 'academic';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  joinDate: Date;
  preferences: {
    difficulty: DifficultyLevel;
    level: IELTSLevel;
    theme: 'light' | 'dark';
  };
}

export interface Vocabulary {
  id: string;
  word: string;
  bengaliMeaning: string;
  pronunciation: string;
  example: string;
  exampleBengali?: string;
  difficulty: DifficultyLevel;
  level: IELTSLevel;
  partOfSpeech?: string;
  tags?: string[];
}

export interface Grammar {
  id: string;
  title: string;
  content: string;
  rules: string[];
  exercises: Exercise[];
  difficulty: DifficultyLevel;
  level: IELTSLevel;
  youtubeLink?: string;
}

export interface Exercise {
  id: string;
  question: string;
  options?: string[];
  answer: string;
  explanation: string;
  type: 'mcq' | 'fillBlank' | 'spelling';
}

export interface ReadingPassage {
  id: string;
  passage: string;
  questions: ReadingQuestion[];
  difficulty: DifficultyLevel;
  timeLimit: number; // in seconds
  youtubeLink?: string;
}

export interface ReadingQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  type: 'mcq' | 'truefalse' | 'shortanswer';
}

export interface ListeningPractice {
  id: string;
  audioUrl: string;
  transcript: string;
  questions: ListeningQuestion[];
  difficulty: DifficultyLevel;
  timeLimit: number;
  youtubeLink?: string;
}

export interface ListeningQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  type: 'mcq' | 'fillBlank' | 'matching';
}

export interface WritingPrompt {
  id: string;
  topic: string;
  description: string;
  difficulty: DifficultyLevel;
  type: WritingType;
  wordLimit: number;
  youtubeLink?: string;
}

export interface SpeakingCueCard {
  id: string;
  topic: string;
  cueCard: string;
  difficulty: DifficultyLevel;
  timeLimit: number;
  youtubeLink?: string;
}

export interface Book {
  id: string;
  title: string;
  author: string;
  pdfUrl: string;
  type: string;
  description: string;
  coverImage?: string;
}

export interface WritingSubmission {
  id: string;
  userId: string;
  writingId: string;
  content: string;
  aiFeedback?: {
    score: number;
    bandScore: number;
    feedback: string;
    strengths: string[];
    weaknesses: string[];
  };
  timestamp: Date;
  wordCount: number;
}

export interface SpeakingSubmission {
  id: string;
  userId: string;
  speakingId: string;
  audioUrl: string;
  transcript?: string;
  aiScore?: {
    score: number;
    fluency: number;
    pronunciation: number;
    vocabulary: number;
    grammar: number;
    feedback: string;
  };
  timestamp: Date;
}

export interface UserProgress {
  id: string;
  userId: string;
  vocabularyLearned: string[];
  grammarCompleted: string[];
  readingScores: { passageId: string; score: number; timestamp: Date }[];
  listeningScores: { practiceId: string; score: number; timestamp: Date }[];
  writingSubmissions: string[];
  speakingSubmissions: string[];
  studyStreak: number;
  lastActivityDate: Date;
  xp: number;
  level: number;
  badges: string[];
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  xpReward: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  xpReward: number;
  completed: boolean;
}

export interface Dictionary {
  id: string;
  word: string;
  definition: string;
  bengaliMeaning: string;
  pronunciation: string;
  partOfSpeech: string;
  examples: { english: string; bengali: string }[];
  synonyms: string[];
  antonyms: string[];
  level: IELTSLevel;
}

export interface SpellingPractice {
  id: string;
  pronunciation: string;
  correctSpelling: string;
  createdAt?: Date;
}

export interface TongueTwister {
  id: string;
  text: string;
  difficulty: DifficultyLevel;
  createdAt?: Date;
}

export interface PronunciationLesson {
  id: string;
  title: string;
  explanation: string;
  audioUrl?: string;
  examples?: string[];
  tips?: string[];
  createdAt?: Date;
}

// Type aliases for Firestore collection names
export type Reading = ReadingPassage;
export type Listening = ListeningPractice;
