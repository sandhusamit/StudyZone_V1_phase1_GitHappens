import { Link } from 'react-router-dom';

export default function Dashboard() {
  return (
    <>
      <h2>Dashboard</h2>

      <div>
        <Link to="/create">
          <button>Create New Quiz</button>
        </Link>
      </div>

      <br />

      <div>
        <Link to="/quizlist">
          <button>View Your Quizzes</button>
        </Link>
      </div>

      <br />

      <div>
        <Link to="/leaderboard">
          <button>Check Leaderboard</button>
        </Link>
      </div>
    </>
  );
}
