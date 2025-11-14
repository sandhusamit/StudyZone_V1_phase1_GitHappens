import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createQuiz } from '../services/quiz';
import Question from '../components/Question';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const { authUserId, isLoggedIn, jwtToken } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [questions, setQuestions] = useState([
    { question: '', answers: [{ choice: '', isCorrect: true }] },
  ]);

  const handleQuestionValueChange = (idx, { target: { name, value } }) => {
    const questionValues = [...questions];
    questionValues[idx].question = value;
    setQuestions(questionValues);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    setQuestions([...questions, { question: '', answers: [''] }]);
  };

  const handleRemoveQuestion = (index, e) => {
    e.preventDefault();
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const quiz = {
      title,
      author: authUserId,
      description,
      questions,
    };

    createQuiz(quiz, jwtToken);
    navigate('/success');
  };

  return isLoggedIn ? (
    <>
      <h2>Create Quiz</h2>

      <form onSubmit={handleSubmit}>
        <label>Quiz Title:</label>
        <br />
        <input
          type="text"
          className="form-inputs"
          placeholder="Enter quiz title"
          onChange={({ target: { value } }) => setTitle(value)}
        />
        <br />
        <br />
        <label>Quiz Description:</label>
        <br />
        <textarea
          className="form-inputs"
          placeholder="Enter quiz description"
          onChange={({ target: { value } }) => setDescription(value)}
        />

        <br />
        <br />
        <button onClick={handleAddQuestion}>Add Question</button>
        <br />
        {questions.map(({ question }, index) => (
          <Question
            key={index}
            id={index + 1}
            value={question}
            onChange={(e) => handleQuestionValueChange(index, e)}
            onDelete={(e) => handleRemoveQuestion(index, e)}
          />
        ))}
        <br />
        <button type="submit">Create Quiz</button>
      </form>
    </>
  ) : (
    <>
      <h2>Please Login to Create a Quiz</h2>
    </>
  );
}
