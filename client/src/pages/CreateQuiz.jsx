import { useState } from 'react';
import Question from '../components/Question';
import { useAuth } from '../contexts/AuthContext';

export default function CreateQuiz() {
  const { authUserId, isLoggedIn } = useAuth();

  const [questions, setQuestions] = useState([{ question: '', answers: [''] }]);

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

  return isLoggedIn ? (
    <>
      <h2>Create Quiz</h2>

      <form>
        <label>Quiz Title:</label>
        <br />
        <input type="text" className="form-inputs" placeholder="Enter quiz title" />
        <br />
        <br />

        <label>Quiz Description:</label>
        <br />
        <textarea className="form-inputs" placeholder="Enter quiz description" />
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
