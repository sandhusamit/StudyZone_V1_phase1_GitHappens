import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createMockLocalStorage, renderWithMockAuth } from './test-helpers';
import QuizList from '../pages/QuizList';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('QuizList', () => {
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

  test('fetch quizzes', async () => {
    const quizzes = [
      { _id: '1', title: 'Nostromo Trivia' },
      { _id: '2', title: 'Xenomorph Basics' },
    ];

    const fetchQuizzes = jest.fn(async () => quizzes);
    const removeQuiz = jest.fn();

    renderWithMockAuth(<QuizList />, {
      providerProps: { value: { fetchQuizzes, removeQuiz } },
    });

    expect(screen.getByText(/Loading quizzes/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchQuizzes).toHaveBeenCalledTimes(1);
    });

    expect(await screen.findByText(/Quiz List/i)).toBeInTheDocument();
    expect(await screen.getByText('Nostromo Trivia')).toBeInTheDocument();
    expect(await screen.getByText('Xenomorph Basics')).toBeInTheDocument();
  });
});
