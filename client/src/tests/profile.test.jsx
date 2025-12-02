import { screen, waitFor } from '@testing-library/react';
import { createMockLocalStorage, renderWithMockAuth } from './test-helpers';
import Profile from '../pages/Profile';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('Profile', () => {
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

  test('Fetches user data if logged in', async () => {
    const getCurrentUserData = jest.fn(async () => ({
      firstName: 'Ellen',
      lastName: 'Ripley',
      email: 'ellenripley@weyland.yutani',
    }));

    const providerProps = {
      value: {
        isLoggedIn: true,
        authUserId: 'B5156170',
        getCurrentUserData: getCurrentUserData,
      },
    };

    renderWithMockAuth(<Profile />, { providerProps });

    await waitFor(() => expect(getCurrentUserData).toHaveBeenCalled());

    expect(screen.getByText(/Profile Information/i)).toBeInTheDocument();
    expect(await screen.getByText(/id:\s*B5156170/i)).toBeInTheDocument();
    expect(await screen.findByText(/First Name:\s*Ellen/i)).toBeInTheDocument();
    expect(await screen.getByText(/Last Name:\s*Ripley/i)).toBeInTheDocument();
    expect(await screen.getByText(/Email:\s*ellenripley@weyland\.yutani/i)).toBeInTheDocument();
  });

  test('Renders message when not logged in', async () => {
    const getCurrentUserData = jest.fn(async () => ({}));

    const providerProps = {
      value: {
        isLoggedIn: false,
        authUserId: '',
        getCurrentUserData: getCurrentUserData,
      },
    };

    renderWithMockAuth(<Profile />, { providerProps });

    expect(screen.getByText(/Login to Access Profile/i)).toBeInTheDocument();
    expect(screen.queryByText(/Profile Information/i)).not.toBeInTheDocument();
    expect(getCurrentUserData).not.toHaveBeenCalled();
  });
});
