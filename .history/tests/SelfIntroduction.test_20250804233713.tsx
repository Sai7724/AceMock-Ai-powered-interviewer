import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SelfIntroduction from '../components/SelfIntroduction';

// Mock the Gemini service
vi.mock('../services/geminiService', () => ({
  analyzeSelfIntroduction: vi.fn().mockResolvedValue({
    strengths: ['Good communication'],
    weaknesses: ['Could be more specific'],
    suggestions: ['Add more details about experience'],
    score: 7
  })
}));

// Mock the onComplete prop
const mockOnComplete = vi.fn();

describe('SelfIntroduction Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders self introduction form', () => {
    render(<SelfIntroduction onComplete={mockOnComplete} />);
    expect(screen.getByText(/Self Introduction/i)).toBeInTheDocument();
  });

  it('displays textarea for introduction', () => {
    render(<SelfIntroduction onComplete={mockOnComplete} />);
    const textarea = screen.getByPlaceholderText(/Tell us about yourself/i);
    expect(textarea).toBeInTheDocument();
  });

  it('allows user to type introduction', () => {
    render(<SelfIntroduction onComplete={mockOnComplete} />);
    const textarea = screen.getByPlaceholderText(/Tell us about yourself/i);
    
    fireEvent.change(textarea, { 
      target: { value: 'Hello, I am a software developer with 3 years of experience.' } 
    });
    
    expect(textarea).toHaveValue('Hello, I am a software developer with 3 years of experience.');
  });

  it('shows submit button', () => {
    render(<SelfIntroduction onComplete={mockOnComplete} />);
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('handles form submission', async () => {
    render(<SelfIntroduction onComplete={mockOnComplete} />);
    const textarea = screen.getByPlaceholderText(/Tell us about yourself/i);
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    
    fireEvent.change(textarea, { 
      target: { value: 'Hello, I am a software developer with 3 years of experience.' } 
    });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('shows loading state during submission', async () => {
    render(<SelfIntroduction onComplete={mockOnComplete} />);
    const textarea = screen.getByPlaceholderText(/Tell us about yourself/i);
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    
    fireEvent.change(textarea, { 
      target: { value: 'Hello, I am a software developer with 3 years of experience.' } 
    });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/Analyzing/i)).toBeInTheDocument();
  });

  it('validates empty submission', () => {
    render(<SelfIntroduction onComplete={mockOnComplete} />);
    const submitButton = screen.getByRole('button', { name: /Submit/i });
    
    fireEvent.click(submitButton);
    
    expect(mockOnComplete).not.toHaveBeenCalled();
  });
}); 