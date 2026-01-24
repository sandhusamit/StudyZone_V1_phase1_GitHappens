import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './styles/QuizList.css';
import { set } from 'mongoose';

export default function QuizListPublic() {
  // Constants for auth context and navigation methods

  const { fetchQuizzes, removeQuiz, jwtToken, isLoading, fetchQuizzesByUser, fetchPublicQuizzes } = useAuth();
  const navigate = useNavigate();
  const [isPublic, setVisibility] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [viewTitle, setViewTitle] = useState('Click to View Your Own Quizzes');

  const [shareToEmail, setShareToEmail] = useState('');

  // Using authContext - fetch all quizzes and load them into state
  useEffect(() => {
    const load = async () => {
      //calls fetchQuizzes from auth context - ensures token is used
      let data;
      if (isPublic) {
      data = await fetchPublicQuizzes();
      } else {
      data = await fetchQuizzesByUser();
      }
      setQuizzes(data);
      console.log('Fetched quizzes:', data);
    };

    if (!isLoading) load();
  }, [jwtToken, isLoading, isPublic]);

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

  const handleShareQuiz = async (quiz) => {

    //alert message with input for email

    setShareToEmail(prompt('Enter the email address to share the quiz with:'));
    console.log(shareToEmail);
    const result = await shareQuiz(quiz._id, shareToEmail);

  }

  const handleVisibility = () => {
    if (isPublic) {
      setVisibility(false);
      setViewTitle('My Quizzes');
    }
    else {
      setVisibility(true);
      setViewTitle('Public Quizzes');

    }
  }

  if (isLoading) return <p>Loading quizzes...</p>;

  return (
    <section>

      <h2 className="heading"><button onClick={handleVisibility}>{viewTitle}</button></h2>

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

                  {!isPublic && (
                    <>
                      <button
                        className="edit-btn"
                        onClick={() => navigate('/edit', { state: { quiz } })}
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(quiz._id)}
                      >
                        Delete
                      </button>

                    </>
                  )}
                </div>

            </div>
          ))}
        </div>
      )}
    </section>
  );
}
