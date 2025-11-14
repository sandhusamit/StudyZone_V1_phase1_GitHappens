import { useLocation } from 'react-router-dom';

export default function QuizPlay() {
  const { state } = useLocation();
  const { _id, title, description } = state || {};
  return (
    <>
      <h1>Attempt Your Quiz</h1>
      {title && <h2>{title}</h2>}
      {description && <p>{description}</p>}
    </>
  );
}
