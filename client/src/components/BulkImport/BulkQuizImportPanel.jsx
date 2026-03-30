import React, { useMemo, useState } from "react";
import "client/src/pages/styles/BulkQuizImportPanel.css";
import { parseBulkQuestions } from "../../utils/QuestionManagement.js";
import BulkImportPreview from "./BulkImportPreview.jsx";

export default function BulkQuestionImportPanel({ onImport, onClose }) {
  // State for raw input, parsed questions, errors, and status messages
  const [rawText, setRawText] = useState("");
  const [parsedQuestions, setParsedQuestions] = useState([]);
  const [parseErrors, setParseErrors] = useState([]);
  const [status, setStatus] = useState("");

  const exampleFormat = `1. What is HTML?
Type: mcq
A. HyperText Markup Language
B. HighText Markdown Language
C. Hyper Tool Markup Language
D. Home Tool Markup Language
Answer: A
Explanation: HTML is the standard markup language for creating web pages.
Subject: SWE

2. Match each language to its purpose.
Type: ddq
Dropbox: frontend | Frontend
Dropbox: backend | Backend

DragItem: html | HTML | frontend
DragItem: node | Node.js | backend

Explanation: HTML is used on the frontend, Node.js on the backend.
Subject: SWE`;

  const canImport = useMemo(() => {
    return parsedQuestions.length > 0 && parseErrors.length === 0;
  }, [parsedQuestions, parseErrors]);


  

  const handleParse = () => {
    setStatus("");

    const result = parseBulkQuestions(rawText);
    setParsedQuestions(result.questions);
    setParseErrors(result.errors);

    if (result.questions.length > 0 && result.errors.length === 0) {
      setStatus(`Parsed ${result.questions.length} question(s) successfully.`);
    } else if (result.questions.length > 0 && result.errors.length > 0) {
      setStatus(
        `Parsed ${result.questions.length} question(s), but found ${result.errors.length} issue(s).`
      );
    } else {
      setStatus("Could not parse any valid questions.");
    }
  };

  const handleImport = () => {
    if (!canImport) return;
    onImport(parsedQuestions);
    setStatus(`Imported ${parsedQuestions.length} question(s) into quiz builder.`);
    setRawText("");
    setParsedQuestions([]);
    setParseErrors([]);
  };

  return (
    <div className="bulk-import-panel">
      <div className="bulk-import-header">
        <h3>Bulk Import Questions</h3>
        {onClose && (
          <button type="button" className="cq-btn danger-btn" onClick={onClose}>
            Close
          </button>
        )}
      </div>

      <p className="bulk-import-subtext">
        Parse a block of questions and add them directly into this quiz. After import,
        you can still edit or remove them like any other question.
      </p>

      <label className="cq-label">Required Format</label>
      <pre className="bulk-import-example">{exampleFormat}</pre>

      <label className="cq-label">Paste Questions</label>
      <textarea
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        className="cq-input cq-textarea"
        rows={16}
        placeholder="Paste formatted questions here..."
      />

      <div className="bulk-import-actions">
        <button type="button" className="cq-btn" onClick={handleParse}>
          Parse Questions
        </button>

        <button
          type="button"
          className="cq-btn primary-btn"
          disabled={!canImport}
          onClick={handleImport}
        >
          Import Into Quiz
        </button>
      </div>

      {status && <div className="bulk-import-status">{status}</div>}

      {parseErrors.length > 0 && (
        <div className="bulk-import-errors">
          <h4>Parse Errors</h4>
          <ul>
            {parseErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {parsedQuestions.length > 0 && (
        <div className="bulk-import-preview">
         <BulkImportPreview questions={parsedQuestions} />
        </div>
      )}
    </div>
  );
}