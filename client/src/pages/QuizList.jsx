import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { getAllQuizzes } from '../services/quiz';
import { useAuth } from '../contexts/AuthContext';
import QuizCard from '../components/QuizCard';

export default function QuizList() {
  const { isLoggedIn } = useAuth();
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const fetchedQuizzes = await getAllQuizzes();
      setQuizzes(fetchedQuizzes);
    };

    fetchQuizzes();
  }, []);

  return (
    <div>
      <h1>Quiz List</h1>
      {isLoggedIn ? (
        <Link to="/create">
          <button>Add Quiz</button>
        </Link>
      ) : (
        <></>
      )}

      <div>
        {quizzes.map((quiz) => (
          <QuizCard key={quiz._id} title={quiz.title} description={quiz.description} />
        ))}
      </div>
    </div>
  );
}
