import { useState } from 'react';
import Question from '../components/Question';

export default function CreateQuiz() {
  const [questions, setQuestions] = useState([{ value: '' }]);

  const handleQuestionValueChange = (idx, { target: { value } }) => {
    const values = [...questionInputs];
    values[idx].value = value;
    setQuestions(values);
  };

  const handleAddQuestion = (e) => {
    e.preventDefault();
    setQuestions([...questions, { value: '' }]);
  };

  const handleRemoveQuestion = (index) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(index, 1);
    setQuestions(updatedQuestions);
  };

  return (
    <>
      <div>
        <h2>Create Quiz</h2>

        <form>
          <label>Quiz Title:</label>
          <br />
          <input type="text" placeholder="Enter quiz title" />
          <br />
          <br />

          <label>Quiz Description:</label>
          <br />
          <textarea placeholder="Enter quiz description" />
          <br />
          <br />
          <button onClick={handleAddQuestion}>Add Question</button>
          <br />
          {questions.map(({ value }, index) => (
            <Question key={index} id={index + 1} />
          ))}
          <button type="submit">Create Quiz</button>
        </form>
      </div>
    </>
  );
}
