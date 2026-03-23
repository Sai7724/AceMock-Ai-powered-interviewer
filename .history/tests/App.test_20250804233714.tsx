import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import App from '../App';

// Mock the auth context
const mockAuthContext = {
  user: null,
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
};

// Mock the useAuth hook
vi.mock('../App', async () => {
  const actual = await vi.importActual('../App');
  return {
    ...actual,
    useAuth: () => mockAuthContext,
  };
});

describe('App Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/AceMock/i)).toBeInTheDocument();
  });

  it('shows login modal when user is not authenticated', () => {
    render(<App />);
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
  });

  it('allows switching between login and signup modes', () => {
    render(<App />);
    
    // Initially shows login
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    
    // Switch to signup
    const signupLink = screen.getByText(/Sign Up/i);
    fireEvent.click(signupLink);
    
    expect(screen.getByText(/Sign Up/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Username/i)).toBeInTheDocument();
  });

  it('handles form submission for login', async () => {
    render(<App />);
    
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /Login/i });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(mockAuthContext.signIn).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });
}); 