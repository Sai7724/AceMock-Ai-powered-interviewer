import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Welcome from '../components/Welcome';

const mockOnStart = vi.fn();

beforeEach(() => {
  mockOnStart.mockClear();
});

describe('Welcome Component', () => {
  it('renders the hero headline', () => {
    render(<Welcome onStart={mockOnStart} />);
    expect(screen.getByText(/Master the/i)).toBeInTheDocument();
  });

  it('displays the product description', () => {
    render(<Welcome onStart={mockOnStart} />);
    expect(screen.getByText(/AceMock is your high-fidelity AI interview coach/i)).toBeInTheDocument();
  });

  it('shows start button', () => {
    render(<Welcome onStart={mockOnStart} />);
    const startButton = screen.getByRole('button', { name: /Initialize Assessment/i });
    expect(startButton).toBeInTheDocument();
  });

  it('shows the test stages entry link', () => {
    render(<Welcome onStart={mockOnStart} />);
    const testStagesLink = screen.getByRole('link', { name: /Explore Stages/i });
    expect(testStagesLink).toBeInTheDocument();
    expect(testStagesLink).toHaveAttribute('href', '/test-stages');
  });

  it('calls onStart when start button is clicked', () => {
    render(<Welcome onStart={mockOnStart} />);
    const startButton = screen.getByRole('button', { name: /Initialize Assessment/i });
    fireEvent.click(startButton);
    expect(mockOnStart).toHaveBeenCalledTimes(1);
  });

  it('displays interview stages information', () => {
    render(<Welcome onStart={mockOnStart} />);
    expect(screen.getByText(/1\. Vector Selection/i)).toBeInTheDocument();
    expect(screen.getByText(/2\. Narrative Identity/i)).toBeInTheDocument();
    expect(screen.getByText(/3\. Logical Validation/i)).toBeInTheDocument();
    expect(screen.getByText(/4\. Technical Depth/i)).toBeInTheDocument();
    expect(screen.getByText(/5\. Execution Proof/i)).toBeInTheDocument();
    expect(screen.getByText(/6\. Cultural Alignment/i)).toBeInTheDocument();
  });
});
