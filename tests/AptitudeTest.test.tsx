import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import AptitudeTest from '../components/AptitudeTest';
import { generateAptitudeQuestions, evaluateAptitudePerformance } from '../services/geminiService';

const mockQuestions = [
  {
    question: 'What is 15% of 200?',
    options: ['25', '30', '35', '40'],
    answer: '30',
  },
  {
    question: 'If a train travels 120 km in 2 hours, what is its speed?',
    options: ['40 km/h', '50 km/h', '60 km/h', '70 km/h'],
    answer: '60 km/h',
  },
];

const mockFeedback = {
  strengths: ['Good mathematical reasoning'],
  weaknesses: ['Could improve on time management'],
  suggestions: ['Practice more speed-based questions'],
  score: 8,
  correctCount: 2,
  totalQuestions: 2,
  detailedResults: [],
};

vi.mock('../services/geminiService', () => ({
  generateAptitudeQuestions: vi.fn(),
  evaluateAptitudePerformance: vi.fn(),
}));

const mockOnComplete = vi.fn();

describe('AptitudeTest Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(generateAptitudeQuestions).mockResolvedValue(mockQuestions);
    vi.mocked(evaluateAptitudePerformance).mockResolvedValue(mockFeedback);
  });

  it('shows the loading state before questions arrive', async () => {
    render(<AptitudeTest onComplete={mockOnComplete} />);

    expect(screen.getByText(/Generating your aptitude test/i)).toBeInTheDocument();
    await screen.findByText(/What is 15% of 200\?/i);
  });

  it('renders the first fetched question and options', async () => {
    render(<AptitudeTest onComplete={mockOnComplete} />);

    expect(await screen.findByText(/What is 15% of 200\?/i)).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('30')).toBeInTheDocument();
    expect(screen.getByText('35')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('advances to the next question after selecting an answer', async () => {
    render(<AptitudeTest onComplete={mockOnComplete} />);

    await screen.findByText(/What is 15% of 200\?/i);
    fireEvent.click(screen.getByText('30'));
    fireEvent.click(screen.getByRole('button', { name: /Next Question/i }));

    expect(await screen.findByText(/If a train travels 120 km in 2 hours/i)).toBeInTheDocument();
    expect(screen.getByText(/Question 2 of 2/i)).toBeInTheDocument();
  });

  it('submits all answers and calls onComplete with feedback', async () => {
    render(<AptitudeTest onComplete={mockOnComplete} />);

    await screen.findByText(/What is 15% of 200\?/i);
    fireEvent.click(screen.getByText('30'));
    fireEvent.click(screen.getByRole('button', { name: /Next Question/i }));

    await screen.findByText(/If a train travels 120 km in 2 hours/i);
    fireEvent.click(screen.getByText('60 km/h'));
    fireEvent.click(screen.getByRole('button', { name: /Finish & Submit/i }));

    await waitFor(() => {
      expect(evaluateAptitudePerformance).toHaveBeenCalledWith(mockQuestions, ['30', '60 km/h']);
      expect(mockOnComplete).toHaveBeenCalledWith(mockFeedback);
    });
  });
});
