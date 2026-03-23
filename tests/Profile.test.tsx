import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const {
  mockSignOut,
  mockOrder,
  mockEq,
  mockSelect,
  mockFrom,
} = vi.hoisted(() => {
  const hoistedMockSignOut = vi.fn();
  const hoistedMockOrder = vi.fn();
  const hoistedMockEq = vi.fn(() => ({ order: hoistedMockOrder }));
  const hoistedMockSelect = vi.fn(() => ({ eq: hoistedMockEq }));
  const hoistedMockFrom = vi.fn(() => ({ select: hoistedMockSelect }));

  return {
    mockSignOut: hoistedMockSignOut,
    mockOrder: hoistedMockOrder,
    mockEq: hoistedMockEq,
    mockSelect: hoistedMockSelect,
    mockFrom: hoistedMockFrom,
  };
});

vi.mock('../App', () => ({
  useAuth: () => ({
    user: {
      id: 'user-1',
      email: 'demo@example.com',
      user_metadata: { username: 'Demo User' },
    },
    signOut: mockSignOut,
  }),
}));

vi.mock('../services/supabaseClient', () => ({
  supabase: {
    from: mockFrom,
  },
}));

import Profile from '../components/Profile';

describe('Profile', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.localStorage.removeItem?.('acemock:reports:user-1');
    window.sessionStorage.removeItem?.('acemock:report-save:user-1:1');
    window.sessionStorage.removeItem?.('acemock:report-save:user-1:3');
    mockFrom.mockReturnValue({ select: mockSelect });
    mockSelect.mockReturnValue({ eq: mockEq });
    mockEq.mockReturnValue({ order: mockOrder });
  });

  it('renders safely even when report rows contain malformed stage data', async () => {
    mockOrder.mockResolvedValue({
      data: [
        {
          id: 'report-1',
          created_at: '2026-03-11T12:00:00.000Z',
          stage: null,
          score: 7,
          summary: 'Solid attempt',
          user_id: 'user-1',
        },
      ],
      error: null,
    });

    render(<Profile onReturnToHome={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Demo User/i)).toBeInTheDocument();
    });

    expect(screen.getByText(/Recent Activity/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Interview Report/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/7\/10/i).length).toBeGreaterThan(0);
  });

  it('shows locally saved reports when cloud fetching fails', async () => {
    window.localStorage.setItem(
      'acemock:reports:user-1',
      JSON.stringify([
        {
          id: 'local-1',
          created_at: '2026-03-11T12:00:00.000Z',
          stage: 'technical_qa',
          score: 8,
          summary: 'Strong technical answers with clear communication.',
          user_id: 'user-1',
        },
      ])
    );

    mockOrder.mockResolvedValue({
      data: null,
      error: new Error('network error'),
    });

    render(<Profile onReturnToHome={vi.fn()} />);

    await waitFor(() => {
      expect(screen.getByText(/Cloud sync is unavailable right now/i)).toBeInTheDocument();
    });

    expect(screen.getAllByText(/Technical Q&A/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Total Assessments/i)).toBeInTheDocument();
    expect(screen.getAllByText(/^1$/i).length).toBeGreaterThan(0);
  });
});
