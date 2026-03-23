import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';
import { supabase } from '../services/supabaseClient';

// Mock WebGL-dependent visual components that crash in jsdom
vi.mock('../components/common/FaultyTerminal', () => ({
  default: () => null,
}));
vi.mock('../components/common/Silk', () => ({
  default: () => null,
}));
vi.mock('../components/common/DarkVeil', () => ({
  default: () => null,
}));

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the welcome screen by default', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/Master the/i)).toBeInTheDocument();
    });
    expect(screen.getAllByRole('button', { name: /Start Assessment/i }).length).toBeGreaterThan(0);
  });

  it('opens the auth modal after starting when auth is enabled', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Start Assessment/i }).length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByRole('button', { name: /Start Assessment/i })[0]);

    expect(screen.getByRole('heading', { name: /Access Terminal/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Institutional Email/i)).toBeInTheDocument();
  });

  it('allows switching between login and signup modes', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Start Assessment/i }).length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByRole('button', { name: /Start Assessment/i })[0]);
    // Switch to signup mode
    fireEvent.click(screen.getByRole('button', { name: /New operative\? Create an account/i }));

    expect(screen.getByRole('heading', { name: /Join the Directive/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Username$/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/^Phone$/i)).toBeInTheDocument();
  });

  it('submits the login form through Supabase auth', async () => {
    vi.mocked(supabase.auth.signInWithPassword).mockResolvedValueOnce({ data: {}, error: null } as any);

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Start Assessment/i }).length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByRole('button', { name: /Start Assessment/i })[0]);
    fireEvent.change(screen.getByPlaceholderText(/Institutional Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Security Password/i), { target: { value: 'password123' } });
    const loginForm = screen.getByPlaceholderText(/Institutional Email/i).closest('form');
    expect(loginForm).not.toBeNull();
    fireEvent.click(within(loginForm as HTMLFormElement).getByRole('button', { name: /Initialize Session/i }));

    await waitFor(() => {
      expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      });
    });
  });

  it('shows a confirmation message when signup succeeds without a session', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: {
        user: { id: 'user-1', email: 'new@example.com' },
        session: null,
      },
      error: null,
    } as any);

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Start Assessment/i }).length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByRole('button', { name: /Start Assessment/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /New operative\? Create an account/i }));

    fireEvent.change(screen.getByPlaceholderText(/^Username$/i), { target: { value: 'New User' } });
    fireEvent.change(screen.getByPlaceholderText(/^Phone$/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByPlaceholderText(/Institutional Email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Security Password/i), { target: { value: 'password123' } });

    const signupForm = screen.getByPlaceholderText(/Institutional Email/i).closest('form');
    fireEvent.click(within(signupForm as HTMLFormElement).getByRole('button', { name: /Create Credentials/i }));

    await waitFor(() => {
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'password123',
        options: {
          data: {
            username: 'New User',
            phone: '9876543210',
          },
        },
      });
    });

    expect(
      screen.getByText(/Account created\. Check your email to confirm it, then log in\./i)
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Access Terminal/i })).toBeInTheDocument();
  });

  it('shows a friendly message when signup hits the email rate limit', async () => {
    vi.mocked(supabase.auth.signUp).mockResolvedValueOnce({
      data: {
        user: null,
        session: null,
      },
      error: new Error('Email rate limit exceeded'),
    } as any);

    render(<App />);

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /Start Assessment/i }).length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getAllByRole('button', { name: /Start Assessment/i })[0]);
    fireEvent.click(screen.getByRole('button', { name: /New operative\? Create an account/i }));

    fireEvent.change(screen.getByPlaceholderText(/^Username$/i), { target: { value: 'New User' } });
    fireEvent.change(screen.getByPlaceholderText(/^Phone$/i), { target: { value: '9876543210' } });
    fireEvent.change(screen.getByPlaceholderText(/Institutional Email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Security Password/i), { target: { value: 'password123' } });

    const signupForm = screen.getByPlaceholderText(/Institutional Email/i).closest('form');
    fireEvent.click(within(signupForm as HTMLFormElement).getByRole('button', { name: /Create Credentials/i }));

    await waitFor(() => {
      expect(
        screen.getByText(
          /Too many signup emails were requested\. Check your inbox and spam for the earlier confirmation email, then wait before trying again\./i
        )
      ).toBeInTheDocument();
    });
  });
});
