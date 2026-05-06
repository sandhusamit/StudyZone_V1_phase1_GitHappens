import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./styles/QuizList.css";

export default function QuizListPublic() {
  const {
    fetchQuizzesByUser,
    fetchPublicQuizzes,
    removeQuiz,
    generateAccessToken,
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

        if (isPublic || isGuestLoggedIn || isGuest) {
          data = await fetchPublicQuizzes();
        } else if (isLoggedIn) {
          data = await fetchQuizzesByUser();
        }

        setQuizzes(Array.isArray(data) ? data : data?.quizzes || []);
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

  const handleOpenQuiz = (quiz) => {
    navigate(`/play/${quiz._id}`);
  };

  const handleDelete = async (quizId) => {
    const result = await removeQuiz(quizId);

    if (result && !result.error && !result.hasError) {
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } else {
      console.error("Error deleting quiz:", result?.message);
      alert(result?.message || "Failed to delete quiz.");
    }
  };

  const handleShareQuiz = async (quiz) => {
    try {
      if (quiz.visibility === "private") {
        alert("Private quizzes cannot be shared.");
        return;
      }

      let guestLink = `${window.location.origin}/play/${quiz._id}`;
      let shareExpiry = "7d";

      if (quiz.visibility === "unlisted") {
        shareExpiry = prompt(
          "Enter share link expiry (e.g. '1h' for 1 hour, '7d' for 7 days):",
          shareExpiry
        );
        const accessToken = await generateAccessToken(quiz._id, shareExpiry);

        if (!accessToken) {
          alert("Could not generate share link.");
          return;
        }

        guestLink = `${window.location.origin}/play/${
          quiz._id
        }?access=${encodeURIComponent(accessToken)}`;
      }

      await navigator.clipboard.writeText(guestLink);
      alert("Guest link copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy guest link:", err);
      alert("Failed to copy guest link. Please try again.");
    }
  };

  const handleShareQuizEmail = async (quiz) => {
    if (quiz.visibility === "private") {
      alert("Private quizzes cannot be shared.");
      return;
    }

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

  const handleVisibility = () => {
    setIsPublic((prev) => {
      const next = !prev;
      setViewTitle(next ? "Public Quizzes" : "My Quizzes");
      return next;
    });
  };

  const canManageQuizzes =
    isLoggedIn && !isGuestLoggedIn && !isGuest && !isPublic;

  if (authLoading || loadingQuizzes) {
    return <p>Loading quizzes...</p>;
  }

  return (
    <section>
      <div className="header-bar">
        {isGuestLoggedIn || isGuest ? (
          <h2>Public Quizzes</h2>
        ) : isLoggedIn ? (
          <button className="heading-btn" onClick={handleVisibility}>
            {viewTitle}
          </button>
        ) : (
          <h2>Public Quizzes</h2>
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