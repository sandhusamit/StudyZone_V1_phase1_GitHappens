import React, { useMemo, useState } from "react";
import { parseBulkQuestions } from "../../../utils/QuestionProduction/BulkParser.js";
import BulkImportPreview from "./BulkImportPreview.jsx";
import "./BulkQuizImportPanel.css";

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

Explanation: HTML is used on the frontend, Node.js is used on the backend.
Subject: SWE

3. Add matrices A and B.
Type: matrix
MatrixType: addition
Prompt: Find A + B.
Points: 1
Difficulty: easy
Subject: Math

Matrix: A | square | 2x2
1 2
3 4

Matrix: B | square | 2x2
5 6
7 8

Expected: Answer | square | 2x2
6 8
10 12

Explanation: Add corresponding elements.

4. Reduce an augmented matrix to RREF.
Type: matrix
MatrixType: RREF
Prompt: Convert the augmented matrix to RREF.
Points: 1
Difficulty: medium
Subject: Math

Matrix: Augmented Matrix | rectangular | 2x3 | divider=2
1 2 5
3 4 11

Expected: Step 1 | rectangular | 2x3 | divider=2
1 2 5
0 -2 -4

Expected: Step 2 | rectangular | 2x3 | divider=2
1 2 5
0 1 2

Expected: Final | rectangular | 2x3 | divider=2
1 0 1
0 1 2

Explanation: The divider appears after column 2 to separate coefficients from constants.`;

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

      <div className="bulk-import-format-header">
        <label className="cq-label">Required Format</label>

        <button
          type="button"
          className="bulk-copy-btn"
          onClick={() => {
            navigator.clipboard.writeText(exampleFormat);
            setStatus("Copied example format to clipboard.");
          }}
        >
          Copy Format
        </button>
      </div>

      <pre className="bulk-import-example">{exampleFormat}</pre>

      <label className="cq-label">Paste Questions</label>
      <textarea
        title="Paste formatted questions here..."
        value={rawText}
        onChange={(e) => setRawText(e.target.value)}
        className="cq-input cq-textarea"
        rows={16}
        placeholder="Paste formatted questions here..."
      />

      <div className="bulk-import-actions">
        <button title="Parse Questions" type="button" className="cq-btn" onClick={handleParse}>
          Parse Questions
        </button>

        <button
          title="Import Into Quiz"
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