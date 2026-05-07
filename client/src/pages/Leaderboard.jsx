import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./styles/Leaderboard.css";

export default function Leaderboard() {
  const { fetchPublicLeaderboard } = useAuth();

  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuizId, setSelectedQuizId] = useState("all");

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);

        const data = await fetchPublicLeaderboard();

        setScores(Array.isArray(data) ? data : data?.scores || []);
      } catch (err) {
        console.error("Failed to load leaderboard:", err);
        setScores([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [fetchPublicLeaderboard]);

  const publicScores = useMemo(() => {
    return scores.filter((s) => s.quiz?.visibility === "public");
  }, [scores]);

  const quizzes = useMemo(() => {
    const map = new Map();

    publicScores.forEach((score) => {
      if (score.quiz?._id) {
        map.set(score.quiz._id, score.quiz);
      }
    });

    return Array.from(map.values());
  }, [publicScores]);

  const filteredScores = useMemo(() => {
    const result =
      selectedQuizId === "all"
        ? publicScores
        : publicScores.filter((s) => s.quiz?._id === selectedQuizId);

    return [...result].sort((a, b) => b.score - a.score);
  }, [publicScores, selectedQuizId]);

  const groupedScores = useMemo(() => {
    return filteredScores.reduce((groups, score) => {
      const quizTitle = score.quiz?.title || "Unknown Quiz";

      if (!groups[quizTitle]) {
        groups[quizTitle] = [];
      }

      groups[quizTitle].push(score);
      return groups;
    }, {});
  }, [filteredScores]);

  const getPlayerName = (score) => {
    if (!score.user && !score.guest) return "Unknown Guest";
    if (score.user) {
      return score.user.firstName + " " + score.user.lastName;
    }
    return score.guest?.name || "Anonymous";
  };

  const formatPercent = (score) => {
    return `${Math.round((score || 0) * 100)}%`;
  };

  if (loading) {
    return (
      <section className="leaderboard-page">
        <h2 className="heading">Leaderboard</h2>
        <p>Loading leaderboard...</p>
      </section>
    );
  }

  return (
    <section className="leaderboard-page">
      <div className="leaderboard-header">
        <div>
          <h2 className="heading">Leaderboard</h2>
          <p>Top scores from public quizzes.</p>
        </div>

        <select
          value={selectedQuizId}
          onChange={(e) => setSelectedQuizId(e.target.value)}
        >
          <option value="all">All Public Quizzes</option>

          {quizzes.map((quiz) => (
            <option key={quiz._id} value={quiz._id}>
              {quiz.title}
            </option>
          ))}
        </select>
      </div>

      {filteredScores.length === 0 ? (
        <p>No scores yet.</p>
      ) : (
        Object.entries(groupedScores).map(([quizTitle, quizScores]) => (
          <div key={quizTitle} className="leaderboard-card">
            <h3>{quizTitle}</h3>

            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Player</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {quizScores.map((score, index) => (
                  <tr key={score._id}>
                    <td>#{index + 1}</td>
                    <td>{getPlayerName(score)}</td>
                    <td>{formatPercent(score.score)}</td>
                    <td>
                      {score.createdAt
                        ? new Date(score.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </section>
  );
}