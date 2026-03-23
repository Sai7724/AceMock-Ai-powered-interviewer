export enum InterviewStage {
  WELCOME,
  LANGUAGE_SELECTION,
  SELF_INTRODUCTION,
  APTITUDE_TEST,
  TECHNICAL_QA,
  CODING_CHALLENGE,
  HR_ROUND,
  FEEDBACK
}

export interface Feedback {
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  score: number; // out of 10
}

export interface SelfIntroductionFeedback extends Feedback {}

export interface AptitudeQuestion {
  question: string;
  options: string[];
  answer: string;
}

export interface AptitudeFeedback extends Feedback {
  correctCount: number;
  totalQuestions: number;
  detailedResults: {
    question: string;
    userAnswer: string;
    correctAnswer: string;
    isCorrect: boolean;
  }[];
}

export interface TechnicalQADetailedResult {
    question: string;
    answer: string;
    evaluation: string;
    score: number;
}

export interface TechnicalQAFeedback extends Feedback {
  questionCount: number;
  detailedResults: TechnicalQADetailedResult[];
}

export interface CodingFeedback extends Feedback {
  logic: string;
  syntax: string;
  efficiency: string;
}

export interface HRDetailedResult {
  question: string;
  response: string;
  evaluation: string;
  score: number;
}

export interface HRFeedback extends Feedback {
  communication: number;
  problemSolving: number;
  culturalFit: number;
  leadership: number;
  detailedResults: HRDetailedResult[];
}

export interface InterviewResults {
  selfIntroduction?: SelfIntroductionFeedback;
  aptitude?: AptitudeFeedback;
  technicalQA?: TechnicalQAFeedback;
  coding?: CodingFeedback;
  hrRound?: HRFeedback;
}

// Web Speech API types for TypeScript compatibility
export interface SpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onstart: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

export interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

export interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  readonly length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

export interface SpeechRecognitionErrorEvent extends Event {
  readonly error: string;
  readonly message: string;
}

export interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition: SpeechRecognitionStatic;
    webkitSpeechRecognition: SpeechRecognitionStatic;
  }
}