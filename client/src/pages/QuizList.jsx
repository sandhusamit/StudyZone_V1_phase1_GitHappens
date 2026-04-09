import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './styles/QuizList.css';
import { set } from 'mongoose';

export default function QuizListPublic() {
  // Constants for auth context and navigation methods

  const { fetchQuizzes, removeQuiz, jwtToken, isLoading, fetchQuizzesByUser, fetchPublicQuizzes, generateGuestToken } = useAuth();
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
    navigate(`/play/${quiz._id}`, {
      state: { quiz },
    });
  };

  // Edit a quiz
  const handleEditQuiz = (quiz) => {
    navigate(`/edit/${quiz._id}`, {
      state: { quiz },
    });
  };

  const handleShareQuizEmail = async (quiz) => {
    //alert message with input for email
    setShareToEmail(prompt('Enter the email address to share the quiz with:'));
    console.log(shareToEmail);
    const result = await shareQuiz(quiz._id, shareToEmail);

  }

  const handleShareQuiz = async (quiz) => {
    const guestToken = await generateGuestToken(quiz._id);
    const guestLink = `${window.location.origin}/play/${quiz._id}?guestToken=${guestToken}`;    
    navigator.clipboard.writeText(guestLink)
      .then(() => {
        alert('Guest link copied to clipboard!');
      })
      .catch((err) => {
        console.error('Failed to copy guest link:', err);
        alert('Failed to copy guest link. Please try again.');
      });
  };

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


  <div className="header-bar">
    <button className="heading-btn" onClick={handleVisibility}>
      {viewTitle}
    </button>

    <button title="Create a new quiz" className="create-btn" onClick={() => navigate('/create')}>
      +
    </button>
  </div>

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
                        title="Edit Quiz"
                      >
                        Edit
                      </button>

                      <button
                        className="delete-btn"
                        onClick={() => handleDelete(quiz._id)}
                      >
                        Delete
                      </button>

      
                      <button className="share-btn"
                        disabled={quiz.visibility === 'private'}
                        title={quiz.visibility === 'private' ? 'Cannot Share Private Quiz' : 'Get Link to Share'}
                        onClick={() => handleShareQuiz(quiz)}
                      >
                        Share
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
