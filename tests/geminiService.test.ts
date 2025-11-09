import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  analyzeSelfIntroduction, 
  generateAptitudeQuestions, 
  evaluateAptitudePerformance,
  generateTechnicalQuestions,
  evaluateTechnicalAnswers,
  generateCodingChallenge,
  evaluateCode,
  generateHRQuestions,
  evaluateHRResponse
} from '../services/geminiService';

// Mock the GoogleGenAI
vi.mock('@google/genai', () => ({
  GoogleGenAI: vi.fn().mockImplementation(() => ({
    models: {
      generateContent: vi.fn()
    }
  })),
  Type: {
    OBJECT: 'object',
    ARRAY: 'array',
    STRING: 'string',
    INTEGER: 'integer'
  }
}));

describe('Gemini Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeSelfIntroduction', () => {
    it('should analyze self introduction and return feedback', async () => {
      const mockResponse = {
        text: JSON.stringify({
          strengths: ['Good communication'],
          weaknesses: ['Could be more specific'],
          suggestions: ['Add more details'],
          score: 7
        })
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new GoogleGenAI({ apiKey: 'test' });
      mockAI.models.generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await analyzeSelfIntroduction('Hello, I am a developer');
      
      expect(result).toEqual({
        strengths: ['Good communication'],
        weaknesses: ['Could be more specific'],
        suggestions: ['Add more details'],
        score: 7
      });
    });
  });

  describe('generateAptitudeQuestions', () => {
    it('should generate aptitude questions', async () => {
      const mockResponse = {
        text: JSON.stringify([
          {
            question: 'What is 15% of 200?',
            options: ['25', '30', '35', '40'],
            answer: '30'
          }
        ])
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new GoogleGenAI({ apiKey: 'test' });
      mockAI.models.generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await generateAptitudeQuestions(1);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('question');
      expect(result[0]).toHaveProperty('options');
      expect(result[0]).toHaveProperty('answer');
    });
  });

  describe('evaluateAptitudePerformance', () => {
    it('should evaluate aptitude test performance', async () => {
      const questions = [
        {
          question: 'What is 15% of 200?',
          options: ['25', '30', '35', '40'],
          answer: '30'
        }
      ];
      const userAnswers = ['30'];

      const mockResponse = {
        text: JSON.stringify({
          strengths: ['Good mathematical reasoning'],
          weaknesses: ['Could improve on time management'],
          suggestions: ['Practice more speed-based questions'],
          score: 8
        })
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new GoogleGenAI({ apiKey: 'test' });
      mockAI.models.generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await evaluateAptitudePerformance(questions, userAnswers);
      
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('correctCount');
      expect(result).toHaveProperty('totalQuestions');
    });
  });

  describe('generateTechnicalQuestions', () => {
    it('should generate technical questions for a language', async () => {
      const mockResponse = {
        text: JSON.stringify([
          'What is the difference between list and tuple in Python?',
          'Explain the GIL in Python'
        ])
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new GoogleGenAI({ apiKey: 'test' });
      mockAI.models.generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await generateTechnicalQuestions('Python');
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('evaluateTechnicalAnswers', () => {
    it('should evaluate technical Q&A performance', async () => {
      const questions = ['What is the difference between list and tuple?'];
      const answers = ['Lists are mutable, tuples are immutable'];
      const language = 'Python';

      const mockResponse = {
        text: JSON.stringify({
          strengths: ['Good understanding of basic concepts'],
          weaknesses: ['Could provide more examples'],
          suggestions: ['Practice explaining with examples'],
          score: 7,
          questionCount: 1,
          detailedResults: []
        })
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new GoogleGenAI({ apiKey: 'test' });
      mockAI.models.generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await evaluateTechnicalAnswers(questions, answers, language);
      
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('questionCount');
      expect(result).toHaveProperty('detailedResults');
    });
  });

  describe('generateCodingChallenge', () => {
    it('should generate a coding challenge', async () => {
      const mockResponse = {
        text: JSON.stringify({
          title: 'Reverse String',
          description: 'Write a function to reverse a string',
          defaultCode: 'function reverseString(str) {\n  // Your code here\n}'
        })
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new GoogleGenAI({ apiKey: 'test' });
      mockAI.models.generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await generateCodingChallenge('JavaScript');
      
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('defaultCode');
    });
  });

  describe('evaluateCode', () => {
    it('should evaluate submitted code', async () => {
      const problem = 'Reverse String';
      const language = 'JavaScript';
      const code = 'function reverseString(str) { return str.split("").reverse().join(""); }';

      const mockResponse = {
        text: JSON.stringify({
          strengths: ['Correct logic'],
          weaknesses: ['Could add input validation'],
          suggestions: ['Add error handling'],
          score: 8,
          logic: 'Good algorithmic approach',
          syntax: 'Clean and readable code',
          efficiency: 'O(n) time complexity'
        })
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new GoogleGenAI({ apiKey: 'test' });
      mockAI.models.generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await evaluateCode(problem, language, code);
      
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('logic');
      expect(result).toHaveProperty('syntax');
      expect(result).toHaveProperty('efficiency');
    });
  });

  describe('generateHRQuestions', () => {
    it('should generate HR interview questions', async () => {
      const mockResponse = {
        text: JSON.stringify([
          { question: 'Tell me about yourself', category: 'behavioral' },
          { question: 'Why do you want to work here?', category: 'motivational' }
        ])
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new GoogleGenAI({ apiKey: 'test' });
      mockAI.models.generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await generateHRQuestions();
      
      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('question');
      expect(result[0]).toHaveProperty('category');
    });
  });

  describe('evaluateHRResponse', () => {
    it('should evaluate HR interview responses', async () => {
      const questions = [
        { question: 'Tell me about yourself', category: 'behavioral' }
      ];
      const responses = ['I am a passionate developer with 3 years of experience'];

      const mockResponse = {
        text: JSON.stringify({
          strengths: ['Good communication'],
          weaknesses: ['Could be more specific'],
          suggestions: ['Add more details about achievements'],
          score: 7,
          communication: 8,
          problemSolving: 6,
          culturalFit: 7,
          leadership: 5,
          detailedResults: []
        })
      };

      const { GoogleGenAI } = await import('@google/genai');
      const mockAI = new GoogleGenAI({ apiKey: 'test' });
      mockAI.models.generateContent = vi.fn().mockResolvedValue(mockResponse);

      const result = await evaluateHRResponse(questions, responses);
      
      expect(result).toHaveProperty('strengths');
      expect(result).toHaveProperty('weaknesses');
      expect(result).toHaveProperty('suggestions');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('communication');
      expect(result).toHaveProperty('problemSolving');
      expect(result).toHaveProperty('culturalFit');
      expect(result).toHaveProperty('leadership');
      expect(result).toHaveProperty('detailedResults');
    });
  });
}); 