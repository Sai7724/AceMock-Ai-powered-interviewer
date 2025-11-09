import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock environment variables
vi.mock('./services/geminiService', () => ({
  analyzeSelfIntroduction: vi.fn(),
  generateAptitudeQuestions: vi.fn(),
  evaluateAptitudePerformance: vi.fn(),
  generateTechnicalQuestions: vi.fn(),
  evaluateTechnicalAnswers: vi.fn(),
  generateCodingChallenge: vi.fn(),
  evaluateCode: vi.fn(),
  generateHRQuestions: vi.fn(),
  evaluateHRResponse: vi.fn(),
}));

// Mock Supabase
vi.mock('./services/supabaseClient', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  },
}));

// Mock React Router
vi.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Routes: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Route: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/' }),
})); 