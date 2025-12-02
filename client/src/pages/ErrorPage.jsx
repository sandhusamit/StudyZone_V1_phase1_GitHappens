import { useLocation, Link } from 'react-router-dom';

export default function ErrorPage() {
  const { state } = useLocation();
  const { message, hasError } = state;

  return (
    <section>
      <h1 className="heading">Error</h1>
      {hasError && <p>{message}</p>}
      <Link to="/">Home</Link>
    </section>
  );
}
