import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import TestStagesPage from '../test-workflow/routes/TestStagesPage';

describe('TestStagesPage', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

  it('renders the isolated stage testing interface', () => {
    render(<TestStagesPage />);

    expect(screen.getByRole('heading', { name: /Test Interview Stages/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Self Introduction/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Aptitude Round/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Technical Round/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Coding Round/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /HR Round/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Back to Home/i })).toHaveAttribute('href', '/');
  });

  it('keeps combined results disabled until at least one stage result exists', () => {
    render(<TestStagesPage />);

    expect(screen.getByRole('button', { name: /View Combined Results/i })).toBeDisabled();
  });
});
