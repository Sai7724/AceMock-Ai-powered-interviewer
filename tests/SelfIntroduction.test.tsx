import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SelfIntroduction from '../components/SelfIntroduction';
import { analyzeSelfIntroduction } from '../services/geminiService';

vi.mock('../services/geminiService', () => ({
  analyzeSelfIntroduction: vi.fn().mockResolvedValue({
    strengths: ['Good communication'],
    weaknesses: ['Could be more specific'],
    suggestions: ['Add more details about experience'],
    score: 7,
  }),
}));

const mockOnComplete = vi.fn();
const INTRO_PLACEHOLDER = /Type or use the microphone to record your introduction/i;

describe('SelfIntroduction Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the current self-introduction prompt', () => {
    render(<SelfIntroduction onComplete={mockOnComplete} />);

    expect(screen.getByText(/Stage 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Self-Introduction/i)).toBeInTheDocument();
    expect(screen.getByText(/Tell me about yourself/i)).toBeInTheDocument();
  });

  it('lets the user type an introduction', () => {
    render(<SelfIntroduction onComplete={mockOnComplete} />);

    const textarea = screen.getByPlaceholderText(INTRO_PLACEHOLDER);
    fireEvent.change(textarea, {
      target: { value: 'Hello, I am a software developer with 3 years of experience.' },
    });

    expect(textarea).toHaveValue('Hello, I am a software developer with 3 years of experience.');
  });

  it('submits the introduction for analysis', async () => {
    render(<SelfIntroduction onComplete={mockOnComplete} />);

    fireEvent.change(screen.getByPlaceholderText(INTRO_PLACEHOLDER), {
      target: { value: 'Hello, I am a software developer with 3 years of experience.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit for Analysis/i }));

    await waitFor(() => {
      expect(analyzeSelfIntroduction).toHaveBeenCalledWith('Hello, I am a software developer with 3 years of experience.');
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('shows a loading state while analysis is in progress', () => {
    vi.mocked(analyzeSelfIntroduction).mockReturnValueOnce(new Promise(() => {}));

    render(<SelfIntroduction onComplete={mockOnComplete} />);

    fireEvent.change(screen.getByPlaceholderText(INTRO_PLACEHOLDER), {
      target: { value: 'Hello, I am a software developer with 3 years of experience.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Submit for Analysis/i }));

    expect(screen.getByPlaceholderText(INTRO_PLACEHOLDER)).toBeDisabled();
    expect(screen.queryByRole('button', { name: /Submit for Analysis/i })).not.toBeInTheDocument();
  });

  it('keeps submit disabled for an empty introduction', () => {
    render(<SelfIntroduction onComplete={mockOnComplete} />);

    expect(screen.getByRole('button', { name: /Submit for Analysis/i })).toBeDisabled();
  });
});
