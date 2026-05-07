import { useState } from "react";
export const makeDdqQuestion = () => {
  const box1 = makeId("box");
  const box2 = makeId("box");

  return {
    questionModel: "Question",
    questionType: "ddq",
    text: "",
    points: 1,
    explanation: "",
    subject: "General",
    dragItems: [{ id: makeId("item"), text: "", dropboxId: box1 }],
    dropboxes: [
      { id: box1, title: "" },
      { id: box2, title: "" },
    ],
  };
};

export const makeMcqQuestion = () => ({
  questionModel: "Question",
  questionType: "mcq",
  text: "",
  choices: [
    { text: "", isCorrect: false },
    { text: "", isCorrect: false },
  ],
  points: 1,
  explanation: "",
  subject: "General",
});


// Enter the matrix
export const makeMatrix = (label = "A", rowCount = 2, columnCount = 2) => ({
  label,
  matrixType: rowCount === columnCount ? "square" : "rectangular",
  rows: Array.from({ length: rowCount }, () => Array(columnCount).fill(0)),
  rowCount,
  columnCount,
  dividerIndex: null,
});

export const makeMatrixQuestion = () => ({
  questionModel: "MatrixQuestion",
  questionType: "addition",
  title: "Matrix Addition",
  prompt: "",
  points: 1,
  explanation: "",
  subject: "Math",
  difficulty: "easy",
  answerMode: "single",
  matrices: [makeMatrix("A"), makeMatrix("B")],
  expectedAnswers: [makeMatrix("Answer")],
});


// Helper
export const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;