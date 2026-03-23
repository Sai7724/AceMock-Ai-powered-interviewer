import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AptitudeTest from '../components/AptitudeTest';

// Mock the Gemini service
vi.mock('../services/geminiService', () => ({
  generateAptitudeQuestions: vi.fn().mockResolvedValue([
    {
      question: 'What is 15% of 200?',
      options: ['25', '30', '35', '40'],
      answer: '30'
    },
    {
      question: 'If a train travels 120 km in 2 hours, what is its speed?',
      options: ['40 km/h', '50 km/h', '60 km/h', '70 km/h'],
      answer: '60 km/h'
    }
  ]),
  evaluateAptitudePerformance: vi.fn().mockResolvedValue({
    strengths: ['Good mathematical reasoning'],
    weaknesses: ['Could improve on time management'],
    suggestions: ['Practice more speed-based questions'],
    score: 8,
    correctCount: 1,
    totalQuestions: 2,
    detailedResults: []
  })
}));

// Mock the onComplete prop
const mockOnComplete = vi.fn();

describe('AptitudeTest Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders aptitude test title', () => {
    render(<AptitudeTest onComplete={mockOnComplete} />);
    expect(screen.getByText(/Aptitude Test/i)).toBeInTheDocument();
  });

  it('shows loading state initially', () => {
    render(<AptitudeTest onComplete={mockOnComplete} />);
    expect(screen.getByText(/Loading questions/i)).toBeInTheDocument();
  });

  it('displays questions after loading', async () => {
    render(<AptitudeTest onComplete={mockOnComplete} />);
    
    await waitFor(() => {
      expect(screen.getByText(/What is 15% of 200?/i)).toBeInTheDocument();
    });
  });

  it('shows multiple choice options', async () => {
    render(<AptitudeTest onComplete={mockOnComplete} />);
    
    await waitFor(() => {
      expect(screen.getByText('25')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('35')).toBeInTheDocument();
      expect(screen.getByText('40')).toBeInTheDocument();
    });
  });

  it('allows selecting answers', async () => {
    render(<AptitudeTest onComplete={mockOnComplete} />);
    
    await waitFor(() => {
      const option30 = screen.getByText('30');
      fireEvent.click(option30);
      expect(option30).toHaveClass('selected');
    });
  });

  it('shows submit button after answering questions', async () => {
    render(<AptitudeTest onComplete={mockOnComplete} />);
    
    await waitFor(() => {
      // Answer all questions
      const options = screen.getAllByRole('button');
      options.forEach(option => {
        if (option.textContent && ['25', '30', '40 km/h', '60 km/h'].includes(option.textContent)) {
          fireEvent.click(option);
        }
      });
      
      expect(screen.getByRole('button', { name: /Submit/i })).toBeInTheDocument();
    });
  });

  it('handles test submission', async () => {
    render(<AptitudeTest onComplete={mockOnComplete} />);
    
    await waitFor(async () => {
      // Answer questions
      const option30 = screen.getByText('30');
      const option60 = screen.getByText('60 km/h');
      
      fireEvent.click(option30);
      fireEvent.click(option60);
      
      const submitButton = screen.getByRole('button', { name: /Submit/i });
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        expect(mockOnComplete).toHaveBeenCalled();
      });
    });
  });

  it('shows progress indicator', async () => {
    render(<AptitudeTest onComplete={mockOnComplete} />);
    
    await waitFor(() => {
      expect(screen.getByText(/Question 1 of 2/i)).toBeInTheDocument();
    });
  });
}); 