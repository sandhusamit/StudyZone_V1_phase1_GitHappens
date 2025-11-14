import { useLocation, Link } from 'react-router-dom';

export default function ErrorPage() {
  const { state } = useLocation();
  const errMessage = state;

  return (
    <div>
      <h1>Error</h1>
      {errMessage && <p>{errMessage}</p>}
      <Link to="/">Home</Link>
    </div>
  );
}
