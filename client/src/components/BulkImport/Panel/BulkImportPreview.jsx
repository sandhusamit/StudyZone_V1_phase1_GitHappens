import MCQPreviewCard from "../Question/MCQPreviewCard.jsx";
import DDQPreviewCard from "../Question/DDQPreviewCard.jsx";
import MatrixPreviewCard from "../Matrix/MatrixPreviewCard.jsx";

export default function BulkImportPreview({ questions }) {
  return (
    <div>
      <h4>Preview ({questions.length})</h4>

      {questions.map((question, index) => {
        if (question.questionType === "mcq") {
          return <MCQPreviewCard key={index} question={question} index={index} />;
        }

        if (question.questionType === "ddq") {
          return <DDQPreviewCard key={index} question={question} index={index} />;
        }

        if (question.questionModel === "MatrixQuestion") { 
          return <MatrixPreviewCard key={index} question={question} index={index} />;
        }

        <p>Points: {question.points}</p>

        return null;
      })}

    </div>
  );
}