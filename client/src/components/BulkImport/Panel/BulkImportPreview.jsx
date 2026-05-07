import "./BulkImportPreview.css";

import MCQPreviewCard from "../Question/MCQPreviewCard.jsx";
import DDQPreviewCard from "../Question/DDQPreviewCard.jsx";
import MatrixPreviewCard from "../Matrix/MatrixPreviewCard.jsx";

export default function BulkImportPreview({ questions }) {
  return (
    <div className="bulk-preview-container">
      <div className="bulk-preview-header">
        <h4>Preview Questions</h4>

        <div className="bulk-preview-count">
          {questions.length} Question(s)
        </div>
      </div>

      <div className="bulk-preview-list">
        {questions.map((question, index) => {
          if (question.questionType === "mcq") {
            return (
              <MCQPreviewCard
                key={index}
                question={question}
                index={index}
              />
            );
          }

          if (question.questionType === "ddq") {
            return (
              <DDQPreviewCard
                key={index}
                question={question}
                index={index}
              />
            );
          }

          if (question.questionModel === "MatrixQuestion") {
            return (
              <MatrixPreviewCard
                key={index}
                question={question}
                index={index}
              />
            );
          }

          return null;
        })}
      </div>
    </div>
  );
}