import { useLocation, Link } from 'react-router-dom';

export default function ErrorPage() {
  const { state } = useLocation();
  const { message, hasError } = state;

  return (
    <div>
      <h1>Error</h1>
      {hasError && <p>{message}</p>}
      <Link to="/">Home</Link>
    </div>
  );
}
