import { screen, fireEvent, waitFor } from '@testing-library/react';
import Register from '../pages/Register';
import { renderWithAuth, renderWithMockAuth } from './test-helpers';

const mockNavigate = jest.fn();

// Asserts that successful registration of the user to the login page
// Asserts that failed regisration of the user to the error page
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Register', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    mockNavigate.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('lets the user fill out each field', () => {
    const providerProps = {
      value: {
        registerUser: jest.fn(),
      },
    };

    renderWithMockAuth(<Register />, { providerProps });
    const firstNameInput = screen.getByPlaceholderText(/First\sName/i);
    const lastNameInput = screen.getByPlaceholderText(/Last\sName/i);
    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);

    fireEvent.change(firstNameInput, { target: { value: 'Ellen' } });
    fireEvent.change(lastNameInput, { target: { value: 'Ripley' } });
    fireEvent.change(usernameInput, { target: { value: 'ellenripley' } });
    fireEvent.change(emailInput, { target: { value: 'ellenripley@weyland.yutani' } });
    fireEvent.change(passwordInput, { target: { value: 'pa$$word' } });

    expect(firstNameInput).toHaveValue('Ellen');
    expect(lastNameInput).toHaveValue('Ripley');
    expect(usernameInput).toHaveValue('ellenripley');
    expect(emailInput).toHaveValue('ellenripley@weyland.yutani');
    expect(passwordInput).toHaveValue('pa$$word');
  });

  test('submits and checks request body', async () => {
    global.fetch.mockResolvedValue({ ok: true, status: 200, json: async () => ({}) }); // Not necessary, but added in case we want to test the response in the future

    renderWithAuth(<Register />);

    const firstNameInput = screen.getByPlaceholderText(/First\sName/i);
    const lastNameInput = screen.getByPlaceholderText(/Last\sName/i);
    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);

    const submitButton = screen.getAllByRole('button').find((button) => button.type === 'submit');

    fireEvent.change(firstNameInput, { target: { value: 'Ellen' } });
    fireEvent.change(lastNameInput, { target: { value: 'Ripley' } });
    fireEvent.change(usernameInput, { target: { value: 'ellenripley' } });
    fireEvent.change(emailInput, { target: { value: 'ellenripley@weyland.yutani' } });
    fireEvent.change(passwordInput, { target: { value: 'pa$$word' } });

    fireEvent.click(submitButton);

    await waitFor(() => expect(global.fetch).toHaveBeenCalled());

    const [url, options] = global.fetch.mock.calls[0];

    expect(url).toBe('/api/users');
    expect(options).toEqual(
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': expect.stringMatching(/application\/json/i),
        }),
      }),
    );

    expect(JSON.parse(options.body)).toEqual({
      firstName: 'Ellen',
      lastName: 'Ripley',
      username: 'ellenripley',
      email: 'ellenripley@weyland.yutani',
      password: 'pa$$word',
    });
  });

  test('submits the form and checks response', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        token: 'jwt-token-from-server',
        user: {
          firstName: 'ellen',
          lastName: 'ripley',
          username: 'ellenripley',
          email: 'ellenripley@weyland.yutani',
          password: '',
        },
      }),
      ok: true,
      status: 200,
    });

    renderWithAuth(<Register />);

    const firstNameInput = screen.getByPlaceholderText(/First\sName/i);
    const lastNameInput = screen.getByPlaceholderText(/Last\sName/i);
    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);

    const submitButton = screen.getAllByRole('button').find((button) => button.type === 'submit');

    fireEvent.change(firstNameInput, { target: { value: 'Ellen' } });
    fireEvent.change(lastNameInput, { target: { value: 'Ripley' } });
    fireEvent.change(usernameInput, { target: { value: 'ellenripley' } });
    fireEvent.change(emailInput, { target: { value: 'ellenripley@weyland.yutani' } });
    fireEvent.change(passwordInput, { target: { value: 'pa$$word' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/users',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  //
  test('submitting the form receives failed response from server', async () => {
    global.fetch.mockResolvedValueOnce({
      json: async () => ({
        token: 'jwt-token-from-server',
        user: {
          firstName: 'ellen',
          lastName: 'ripley',
          username: 'ellenripley',
          email: 'ellenripley@weyland.yutani',
          password: '',
        },
      }),
      ok: false,
      status: 500,
    });

    renderWithAuth(<Register />);

    const firstNameInput = screen.getByPlaceholderText(/First\sName/i);
    const lastNameInput = screen.getByPlaceholderText(/Last\sName/i);
    const usernameInput = screen.getByPlaceholderText(/Username/i);
    const emailInput = screen.getByPlaceholderText(/Email/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);

    const submitButton = screen.getAllByRole('button').find((button) => button.type === 'submit');

    fireEvent.change(firstNameInput, { target: { value: 'Ellen' } });
    fireEvent.change(lastNameInput, { target: { value: 'Ripley' } });
    fireEvent.change(usernameInput, { target: { value: 'ellenripley' } });
    fireEvent.change(emailInput, { target: { value: 'ellenripley@weyland.yutani' } });
    fireEvent.change(passwordInput, { target: { value: 'pa$$word' } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/users',
        expect.objectContaining({
          method: 'POST',
        }),
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith('/error', {
      state: {
        message: {
          hasError: true,
          message: 'A problem occured during registration. Please try again.',
        },
      },
    });
  });
});
