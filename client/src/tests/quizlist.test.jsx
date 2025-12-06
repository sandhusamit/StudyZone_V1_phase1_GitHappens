import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react'; // updated import
import { createMockLocalStorage, renderWithMockAuth } from './test-helpers';
import QuizList from '../pages/QuizList';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

describe('QuizList', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    Object.defineProperty(window, 'localStorage', {
      value: createMockLocalStorage(),
      writable: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state', async () => {
    const fetchQuizzes = jest.fn();
    const removeQuiz = jest.fn();

    await act(async () => {
      renderWithMockAuth(<QuizList />, {
        providerProps: { value: { fetchQuizzes, removeQuiz, isLoading: true } },
      });
    });

    expect(screen.getByText(/Loading quizzes/i)).toBeInTheDocument();
  });

  test('renders empty state when no quizzes', async () => {
    const fetchQuizzes = jest.fn(async () => []); // returns empty array
    const removeQuiz = jest.fn();

    await act(async () => {
      renderWithMockAuth(<QuizList />, {
        providerProps: { value: { fetchQuizzes, removeQuiz, isLoading: false } },
      });
    });

    await waitFor(() => expect(fetchQuizzes).toHaveBeenCalledTimes(1));
    expect(screen.getByText(/No quizzes available/i)).toBeInTheDocument();
  });

  test('renders quizzes after fetching', async () => {
    const quizzes = [
      { _id: '1', title: 'Nostromo Trivia' },
      { _id: '2', title: 'Xenomorph Basics' },
    ];

    const fetchQuizzes = jest.fn(async () => quizzes);
    const removeQuiz = jest.fn();

    await act(async () => {
      renderWithMockAuth(<QuizList />, {
        providerProps: { value: { fetchQuizzes, removeQuiz, isLoading: false } },
      });
    });

    await waitFor(() => expect(fetchQuizzes).toHaveBeenCalledTimes(1));

    expect(await screen.findByText('Nostromo Trivia')).toBeInTheDocument();
    expect(await screen.findByText('Xenomorph Basics')).toBeInTheDocument();
    expect(screen.getByText(/Quiz List/i)).toBeInTheDocument();
  });

  test('delete button removes a quiz', async () => {
    // realistic quiz state
    let quizzes = [{ _id: '1', title: 'Nostromo Trivia' }];
    const fetchQuizzes = jest.fn(async () => quizzes);
    const removeQuiz = jest.fn(async (id) => {
      quizzes = quizzes.filter(q => q._id !== id);
      return { success: true };
    });

    await act(async () => {
      renderWithMockAuth(<QuizList />, {
        providerProps: { value: { fetchQuizzes, removeQuiz, isLoading: false } },
      });
    });

    const deleteButton = await screen.findByText('Delete');
    fireEvent.click(deleteButton);

    // wait for deletion to reflect in DOM
    await waitFor(() => {
      expect(removeQuiz).toHaveBeenCalledWith('1');
      expect(screen.getByText(/No quizzes available/i)).toBeInTheDocument();
    });
  });

  test('play and edit buttons navigate correctly', async () => {
    const quizzes = [{ _id: '1', title: 'Nostromo Trivia' }];
    const fetchQuizzes = jest.fn(async () => quizzes);
    const removeQuiz = jest.fn();

    await act(async () => {
      renderWithMockAuth(<QuizList />, {
        providerProps: { value: { fetchQuizzes, removeQuiz, isLoading: false } },
      });
    });

    const playButton = await screen.findByText('Play');
    fireEvent.click(playButton);
    expect(mockNavigate).toHaveBeenCalledWith('/play', { state: { quiz: quizzes[0] } });

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);
    expect(mockNavigate).toHaveBeenCalledWith('/edit', { state: { quiz: quizzes[0] } });
  });
});
