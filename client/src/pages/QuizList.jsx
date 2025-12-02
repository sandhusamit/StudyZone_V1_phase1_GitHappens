import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './styles/QuizList.css';

export default function QuizList() {
  // Constants for auth context and navigation methods

  const { fetchQuizzes, removeQuiz, jwtToken, isLoading } = useAuth();
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState([]);

  // Using authContext - fetch all quizzes and load them into state
  useEffect(() => {
    const load = async () => {
      //calls fetchQuizzes from auth context - ensures token is used
      const data = await fetchQuizzes();
      setQuizzes(data);
      console.log('Fetched quizzes:', data);
    };

    if (!isLoading) load();
  }, [jwtToken, isLoading]);

  // EVENT HANDLERS
  // Delete a quiz
  const handleDelete = async (quizId) => {
    const result = await removeQuiz(quizId);
    if (result && !result.error) {
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } else {
      console.error('Error deleting quiz:', result.message);
    }
  };

  //Open specific quiz to play
  const handleOpenQuiz = (quiz) => {
    navigate(`/play`, {
      state: { quiz },
    });
  };

  // Edit a quiz
  const handleEditQuiz = (quiz) => {
    navigate(`/edit/${quiz._id}`, {
      state: { quiz },
    });
  };

  if (isLoading) return <p>Loading quizzes...</p>;

  return (
    <section>
      <h2 className="heading">Quiz List</h2>

      {quizzes.length === 0 ? (
        <p className="empty">No quizzes available.</p>
      ) : (
        <div>
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <span className="quiz-title">{quiz.title}</span>

              <div className="quiz-actions">
                <button className="play-btn" onClick={() => handleOpenQuiz(quiz)}>
                  Play
                </button>

                <button className="edit-btn" onClick={() => navigate('/edit', { state: { quiz } })}>
                  Edit
                </button>

                <button className="delete-btn" onClick={() => handleDelete(quiz._id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
