import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";


export default function QuizList() {
  const { fetchQuizzes } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiURL = "http://localhost:3000/api/quizzes";

  // Fetch quizzes on mount
  // useEffect(() => {
  //   const fetchQuizzes = async () => {
  //     const token = localStorage.getItem("token");
  //     if (!token) {
  //       console.warn("No token found. Cannot fetch quizzes.");
  //       setLoading(false);
  //       return;
  //     }

  //     try {
  //       const res = await fetch(apiURL, {
  //         headers: {
  //           "Content-Type": "application/json",
  //           "Authorization": `Bearer ${token}`,
  //         },
  //       });

  //       if (!res.ok) {
  //         throw new Error(`Failed to fetch quizzes: ${res.status}`);
  //       }

  //       const data = await res.json();
  //       setQuizzes(Array.isArray(data) ? data : data.quizzes || []);
  //     } catch (err) {
  //       console.error("Error fetching quizzes:", err);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchQuizzes();
  // }, []);

// Commented out above code to use context instead
useEffect(() => {
  const load = async () => {
    const data = await fetchQuizzes();
    setQuizzes(data);
    console.log("Fetched quizzes:", data);
    setLoading(false);
  };

  load();
}, []);

  // Delete a quiz
  const handleDelete = async (quizId) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch(`${apiURL}/${quizId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error(`Failed to delete quiz: ${res.status}`);

      // Remove deleted quiz from state
      setQuizzes((prev) => prev.filter((q) => q._id !== quizId));
    } catch (err) {
      console.error("Error deleting quiz:", err);
    }
  };

  //Event handler to see which quiz clicked 

  const navigate = useNavigate();
  
  const handleOpenQuiz = (quiz) => {
    navigate(`/play`, {
      state: { quiz }
    });
  };
  




  if (loading) return <p>Loading quizzes...</p>;

  return (
    <section>
      <h2>Quiz List</h2>

      {quizzes.length === 0 ? (
        <p>No quizzes available.</p>
      ) : (
        <div>
          {quizzes.map((quiz) => (
            <div key={quiz._id} style={{ marginBottom: "1rem" }}>
              <button onClick={() => handleOpenQuiz(quiz)}>
                <label>{quiz.title}</label>
              </button>
              <button onClick={() => handleDelete(quiz._id)}>Delete</button>

            </div>
          ))}
        </div>
      )}
    </section>
  );
}
