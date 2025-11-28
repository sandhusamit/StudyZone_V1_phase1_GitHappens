import { Link } from 'react-router-dom';
import '/Users/samitsandhu/Desktop/MERN/StudyZone_GitHappens/client/src/pages/styles/Dashboard.css';
export default function Dashboard() {
  return (
    <div className="dashboard-container">
      <h2>Dashboard</h2>

      <div>
        <Link to="/create">
          <button>Create New Quiz</button>
        </Link>
      </div>

      <div>
        <Link to="/quizlist">
          <button>View Quizzes</button>
        </Link>
      </div>

      <div>
        <Link to="/leaderboard">
          <button>Check Leaderboard</button>
        </Link>
      </div>
    </div>
  );
}

