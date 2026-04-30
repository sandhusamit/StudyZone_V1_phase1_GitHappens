import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./styles/QuizList.css";

export default function QuizListPublic() {
  const {
    fetchQuizzesByUser,
    fetchPublicQuizzes,
    removeQuiz,
    generateGuestToken,
    shareQuiz,
    authLoading,
    isLoggedIn,
    isGuestLoggedIn,
    isGuest,
  } = useAuth();

  const navigate = useNavigate();

  const [isPublic, setIsPublic] = useState(true);
  const [quizzes, setQuizzes] = useState([]);
  const [viewTitle, setViewTitle] = useState("Public Quizzes");
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  useEffect(() => {
    const loadQuizzes = async () => {
      try {
        setLoadingQuizzes(true);

        let data = [];

        if (isGuestLoggedIn || isGuest || isPublic) {
          data = await fetchPublicQuizzes();
        } else if (isLoggedIn) {
          data = await fetchQuizzesByUser();
        }

        setQuizzes(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load quizzes:", err);
        setQuizzes([]);
      } finally {
        setLoadingQuizzes(false);
      }
    };

    if (!authLoading) {
      loadQuizzes();
    }
  }, [
    authLoading,
    isPublic,
    isLoggedIn,
    isGuestLoggedIn,
    isGuest,
    fetchPublicQuizzes,
    fetchQuizzesByUser,
  ]);

  const handleDelete = async (quizId) => {
    const result = await removeQuiz(quizId);

    if (result && !result.error) {
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } else {
      console.error("Error deleting quiz:", result?.message);
    }
  };

  const handleOpenQuiz = (quiz) => {
    navigate(`/play/${quiz._id}`, {
      state: { quiz },
    });
  };

  const handleShareQuizEmail = async (quiz) => {
    const email = prompt("Enter the email address to share the quiz with:");

    if (!email?.trim()) return;

    try {
      await shareQuiz(quiz._id, email.trim());
      alert("Quiz shared successfully!");
    } catch (err) {
      console.error("Failed to share quiz by email:", err);
      alert("Failed to share quiz.");
    }
  };

  const handleShareQuiz = async (quiz) => {
    try {
      const guestToken = await generateGuestToken(quiz._id);
      const guestLink = `${window.location.origin}/play/${quiz._id}?guestToken=${guestToken}`;

      await navigator.clipboard.writeText(guestLink);

      alert("Guest link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy guest link:", err);
      alert("Failed to copy guest link. Please try again.");
    }
  };

  const handleVisibility = () => {
    setIsPublic((prev) => {
      const next = !prev;
      setViewTitle(next ? "Public Quizzes" : "My Quizzes");
      return next;
    });
  };

  const canManageQuizzes = isLoggedIn && !isGuestLoggedIn && !isGuest && !isPublic;

  if (authLoading || loadingQuizzes) {
    return <p>Loading quizzes...</p>;
  }

  return (
    <section>
      <div className="header-bar">
        {isGuestLoggedIn || isGuest ? (
          <h2>Public Quizzes</h2>
        ) : (
          <button className="heading-btn" onClick={handleVisibility}>
            {viewTitle}
          </button>
        )}

        {isLoggedIn && !isGuestLoggedIn && !isGuest && (
          <button
            title="Create a new quiz"
            className="create-btn"
            onClick={() => navigate("/create")}
          >
            +
          </button>
        )}
      </div>

      {quizzes.length === 0 ? (
        <p className="empty">No quizzes available.</p>
      ) : (
        <div>
          {quizzes.map((quiz) => (
            <div key={quiz._id} className="quiz-card">
              <span className="quiz-title">{quiz.title}</span>

              <div className="quiz-actions">
                <button
                  className="play-btn"
                  onClick={() => handleOpenQuiz(quiz)}
                >
                  Play
                </button>

                {canManageQuizzes && (
                  <>
                    <button
                      className="edit-btn"
                      onClick={() => navigate("/edit", { state: { quiz } })}
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

                    <button
                      className="share-btn"
                      disabled={quiz.visibility === "private"}
                      title={
                        quiz.visibility === "private"
                          ? "Cannot share private quiz"
                          : "Get guest link"
                      }
                      onClick={() => handleShareQuiz(quiz)}
                    >
                      Share Link
                    </button>

                    <button
                      className="share-btn"
                      disabled={quiz.visibility === "private"}
                      title={
                        quiz.visibility === "private"
                          ? "Cannot share private quiz"
                          : "Share quiz by email"
                      }
                      onClick={() => handleShareQuizEmail(quiz)}
                    >
                      Share Email
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