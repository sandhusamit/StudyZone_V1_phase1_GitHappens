import { Link } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";


export default function Home() {
  const { isLoggedIn } = useAuth();

  return (
    <>

      <div>
        <h1>StudyZone</h1>
        <h2>Your Personal Study Helper</h2>
      </div>


      {isLoggedIn ? (
        <div>
          <h3>Welcome back!</h3>
          <Link to="/dashboard">
            <button>Go to Dashboard</button>
          </Link>
          
          </div>
          ) : (
            <Link to="/login">
              <button>Login</button>
            </Link>
          )}
    </>
  );
}
