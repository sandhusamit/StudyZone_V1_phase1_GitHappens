import { useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function PlayQuiz() {
  const { quizId } = useParams();
  const { state } = useLocation();
  const [quiz, setQuiz] = useState(state?.quiz || null);

  
  console.log("PlayQuiz component mounted with quizId:", quizId);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    // If the quiz was NOT passed through state, fetch it from backend
    if (!quiz) {
      console.log("Fetching quiz with ID:", quizId);
      const fetchQuiz = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/quizzes/${quizId}`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
          });

          if (!res.ok) {
            throw new Error("Failed to fetch quiz");
          }

          const data = await res.json();
          setQuiz(data);
        } catch (err) {
          console.error("Error fetching quiz:", err);
        }
      };

      fetchQuiz();
    }
  }, [quiz, quizId]);

  if (!quiz) return <p>Loading...</p>;

  console.log("Now playing quiz:", quiz.title);

  return (
    <div>
      <h1>{quiz.title}</h1>
      <p>{quiz.description}</p>
    </div>
  );
}
