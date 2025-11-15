<<<<<<< HEAD
import { useState, useEffect } from "react";

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const apiURL = "http://localhost:3000/api/quizzes";

  // Fetch quizzes on mount
  useEffect(() => {
    const fetchQuizzes = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.warn("No token found. Cannot fetch quizzes.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(apiURL, {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Failed to fetch quizzes: ${res.status}`);
        }

        const data = await res.json();
        setQuizzes(Array.isArray(data) ? data : data.quizzes || []);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
      } finally {
        setLoading(false);
      }
=======
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
>>>>>>> 918ce62af2785af261320dc401251db48ff499c6
    };

    fetchQuizzes();
  }, []);

<<<<<<< HEAD
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
              <button>
                <label>{quiz.title}</label>
              </button>
              <button onClick={() => handleDelete(quiz._id)}>Delete</button>
            </div>
          ))}
        </div>
      )}
    </section>
=======
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
>>>>>>> 918ce62af2785af261320dc401251db48ff499c6
  );
}
