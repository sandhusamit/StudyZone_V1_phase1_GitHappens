import { screen, fireEvent, waitFor } from '@testing-library/react';
import Login from '../pages/Login';
import { createMockLocalStorage, renderWithMockAuth, renderWithAuth } from './test-helpers';

const mockNavigate = jest.fn();

// Assert the successful login of user redirects to home page
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Login', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockNavigate.mockClear();

    Object.defineProperty(window, 'localStorage', {
      value: createMockLocalStorage(),
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('lets the user fill out each field', () => {
    const providerProps = {
      value: {
        loginUser: jest.fn(),
      },
    };

    // fireEvent.change(firstNameInput, { target: { name: 'firstName', value: 'Ellen' } });
    renderWithMockAuth(<Login />, { providerProps });
    const emailInput = screen.getByLabelText(/login-email/i);
    const passwordInput = screen.getByLabelText(/login-password/i);

    fireEvent.change(emailInput, {
      target: { name: 'email', value: 'ellenripley@weyland.yutani' },
    });
    fireEvent.change(passwordInput, { target: { name: 'password', value: 'pa$$word' } });

    expect(emailInput).toHaveValue('ellenripley@weyland.yutani');
    expect(passwordInput).toHaveValue('pa$$word');
  });

  test('submits form, but email field is left blank', () => {
    const loginUser = jest.fn();

    renderWithMockAuth(<Login />, { providerProps: { value: loginUser } });
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);

    fireEvent.change(passwordInput, { target: { value: 'pa$$word' } });

    expect(emailInput).toHaveValue('');
    expect(passwordInput).toHaveValue('pa$$word');
    expect(loginUser).not.toHaveBeenCalled();
  });

  test('submits form, but password field is left blank', () => {
    const loginUser = jest.fn();

    renderWithMockAuth(<Login />, { providerProps: { value: loginUser } });
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);

    fireEvent.change(emailInput, { target: { value: 'ellenripley@weyland.yutani' } });

    expect(emailInput).toHaveValue('ellenripley@weyland.yutani');
    expect(passwordInput).toHaveValue('');

    expect(loginUser).not.toHaveBeenCalled();
  });

  test('submits and checks request body', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) }); // Not necessary, but added in case we want to test the response in the future

    renderWithAuth(<Login />);

    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getAllByRole('button').find((button) => button.type === 'submit');

    fireEvent.change(emailInput, { target: { value: 'ellenripley@weyland.yutani' } });
    fireEvent.change(passwordInput, { target: { value: 'pa$$word' } });
    fireEvent.click(submitButton);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const [url, options] = global.fetch.mock.calls[0];

    expect(url).toBe('/api/login');
    expect(options).toEqual(
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': expect.stringMatching(/application\/json/i),
        }),
      }),
    );

    expect(JSON.parse(options.body)).toEqual({
      email: 'ellenripley@weyland.yutani',
      password: 'pa$$word',
    });
  });

  test('submits the form and successfully logs in user', async () => {
    // Mock response from server
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        token: 'jwt-token-from-server',
        user: {
          _id: 'B5156170',
          email: 'ellenripley@weyland.yutani',
        },
      }),
      ok: true,
      status: 200,
    });

    renderWithAuth(<Login />);

    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getAllByRole('button').find((button) => button.type === 'submit');

    fireEvent.change(emailInput, { target: { value: 'ellenripley@weyland.yutani' } });
    fireEvent.change(passwordInput, { target: { value: 'pa$$word' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/login',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    expect(window.localStorage.setItem).toHaveBeenCalledWith('token', 'jwt-token-from-server');
    expect(window.localStorage.setItem).toHaveBeenCalledWith('userId', 'B5156170');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  test('submits the form but fails to log in user', async () => {
    // Mock response from server
    global.fetch.mockResolvedValueOnce({
      json: async () => ({}),
      status: 500,
    });

    renderWithAuth(<Login />);

    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getAllByRole('button').find((button) => button.type === 'submit');

    fireEvent.change(emailInput, { target: { value: 'ellenripley@weyland.yutani' } });
    fireEvent.change(passwordInput, { target: { value: 'pa$$word' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/login',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith('/error', {
      state: {
        hasError: true,
        message: 'A problem occured logging in. Please try again.',
      },
    });
  });
});
