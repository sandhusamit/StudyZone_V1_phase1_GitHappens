import { render } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../contexts/AuthContext';

export const createMockLocalStorage = () => {
  let store = {};

  return {
    getItem: jest.fn((key) => store[key] ?? null),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
};

export const renderWithMockAuth = (ui, { providerProps, ...renderOptions }) => {
  return render(
    <AuthContext.Provider {...providerProps}>{ui}</AuthContext.Provider>,
    renderOptions,
  );
};

export const renderWithAuth = (ui, renderOptions = {}) => {
  return render(<AuthProvider>{ui}</AuthProvider>, renderOptions);
};
