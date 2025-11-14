import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
// import { createQuiz, getAllQuizzes } from '../services/quiz';
import { getAllQuizzes } from '../services/quiz';

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);

  useEffect(() => {
    const fetchQuizzes = async () => {
      const fetchedQuizzes = await getAllQuizzes();
      setQuizzes(fetchedQuizzes);
    };

    fetchQuizzes();
  }, []);

  let navigate = useNavigate();

  const handleGoToAddQuiz = () => {
    navigate('/create');
  };

  return (
    <div>
      <h1>Quiz List</h1>
      <div>
        <button onClick={handleGoToAddQuiz}>Add Quiz</button>
      </div>
      <div>
        {quizzes.map((quiz) => (
          <div key={quiz._id} className="card">
            <h2>{quiz.title}</h2>
            <p>{quiz.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
