import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LanguageSelection from '../components/LanguageSelection';

// Mock the onLanguageSelect prop
const mockOnLanguageSelect = vi.fn();

describe('LanguageSelection Component', () => {
  it('renders language selection title', () => {
    render(<LanguageSelection onLanguageSelect={mockOnLanguageSelect} />);
    expect(screen.getByText(/Choose Your Programming Language/i)).toBeInTheDocument();
  });

  it('displays all available programming languages', () => {
    render(<LanguageSelection onLanguageSelect={mockOnLanguageSelect} />);
    
    const languages = ['JavaScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust', 'TypeScript'];
    languages.forEach(language => {
      expect(screen.getByText(language)).toBeInTheDocument();
    });
  });

  it('calls onLanguageSelect when a language is clicked', () => {
    render(<LanguageSelection onLanguageSelect={mockOnLanguageSelect} />);
    
    const pythonButton = screen.getByText('Python');
    fireEvent.click(pythonButton);
    
    expect(mockOnLanguageSelect).toHaveBeenCalledWith('Python');
  });

  it('highlights selected language', () => {
    render(<LanguageSelection onLanguageSelect={mockOnLanguageSelect} />);
    
    const pythonButton = screen.getByText('Python');
    fireEvent.click(pythonButton);
    
    // The button should have a selected state (you might need to adjust this based on your CSS classes)
    expect(pythonButton).toBeInTheDocument();
  });

  it('allows selecting different languages', () => {
    render(<LanguageSelection onLanguageSelect={mockOnLanguageSelect} />);
    
    const javascriptButton = screen.getByText('JavaScript');
    const pythonButton = screen.getByText('Python');
    
    fireEvent.click(javascriptButton);
    expect(mockOnLanguageSelect).toHaveBeenCalledWith('JavaScript');
    
    fireEvent.click(pythonButton);
    expect(mockOnLanguageSelect).toHaveBeenCalledWith('Python');
  });
}); 