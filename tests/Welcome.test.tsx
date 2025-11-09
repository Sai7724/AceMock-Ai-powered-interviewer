import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Welcome from '../components/Welcome';

// Mock the onStart prop
const mockOnStart = vi.fn();

describe('Welcome Component', () => {
  it('renders welcome message', () => {
    render(<Welcome onStart={mockOnStart} />);
    expect(screen.getByText(/Welcome to AceMock/i)).toBeInTheDocument();
  });

  it('displays the application description', () => {
    render(<Welcome onStart={mockOnStart} />);
    expect(screen.getByText(/comprehensive interview simulation/i)).toBeInTheDocument();
  });

  it('shows start button', () => {
    render(<Welcome onStart={mockOnStart} />);
    const startButton = screen.getByRole('button', { name: /Start Interview/i });
    expect(startButton).toBeInTheDocument();
  });

  it('calls onStart when start button is clicked', () => {
    render(<Welcome onStart={mockOnStart} />);
    const startButton = screen.getByRole('button', { name: /Start Interview/i });
    fireEvent.click(startButton);
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it('displays interview stages information', () => {
    render(<Welcome onStart={mockOnStart} />);
    expect(screen.getByText(/Self Introduction/i)).toBeInTheDocument();
    expect(screen.getByText(/Aptitude Test/i)).toBeInTheDocument();
    expect(screen.getByText(/Technical Q&A/i)).toBeInTheDocument();
    expect(screen.getByText(/Coding Challenge/i)).toBeInTheDocument();
    expect(screen.getByText(/HR Round/i)).toBeInTheDocument();
  });
}); 