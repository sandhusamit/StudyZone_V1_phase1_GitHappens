import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function QuizCard({ _id, title, description }) {
  const navigate = useNavigate();
  const handleOnClick = () => {
    navigate('/play', { state: { _id, title, description } });
  };

  return (
    <div className="card">
      <h2>{title}</h2>
      <p>{description}</p>

      <button onClick={handleOnClick}>Play</button>
    </div>
  );
}
