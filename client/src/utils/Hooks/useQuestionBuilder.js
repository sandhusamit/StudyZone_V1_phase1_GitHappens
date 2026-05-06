import { useState } from "react";
import { makeDdqQuestion, makeMcqQuestion, makeMatrix, makeMatrixQuestion, makeId } from "../QuestionProduction/QuestionFactory.js";

export function useQuestionBuilder(rotationClicked, setRotationClicked, showBulkImport, setShowBulkImport) {

  const [quizData, setQuizData] = useState({
    title: "",
    description: "",
    visibility: "private",
    rotation: 0,
    questions: [],
  });

  /* ========================================================
     GENERAL QUIZ HELPERS
  ======================================================== */

  const updateQuizField = (field, value) => {
    setQuizData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateQuestionField = (qIndex, field, value) => {
    setQuizData((prev) => {
      const questions = [...prev.questions];

      questions[qIndex] = {
        ...questions[qIndex],
        [field]: value,
      };

      return {
        ...prev,
        questions,
      };
    });
  };

  const removeQuestion = (qIndex) => {
    setQuizData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== qIndex),
    }));
  };

  const appendQuestion = (newQuestion) => {
    setQuizData((prev) => {
      const questions = [...prev.questions, newQuestion];

      return {
        ...prev,
        rotation:
          !rotationClicked && Number(prev.rotation) === 0
            ? questions.length
            : prev.rotation,
        questions,
      };
    });
  };

    /* ========================================================
       ADD QUESTION HELPERS
    ======================================================== */
  
    const addMcqQuestion = () => appendQuestion(makeMcqQuestion());
  
    const addDdqQuestion = () => appendQuestion(makeDdqQuestion());
  
    const addMatrixQuestion = () => appendQuestion(makeMatrixQuestion());
  
    const handleBulkImport = (importedQuestions) => {
      setQuizData((prev) => {
        const questions = [...prev.questions, ...importedQuestions];
  
        return {
          ...prev,
          rotation:
            !rotationClicked && Number(prev.rotation) === 0
              ? questions.length
              : prev.rotation,
          questions,
        };
      });
  
      setShowBulkImport(false);
    };


      /* ========================================================
         MCQ HELPERS
      ======================================================== */
    
      const addChoice = (qIndex) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          question.choices = [
            ...(question.choices || []),
            { text: "", isCorrect: false },
          ];
    
          questions[qIndex] = question;
          return { ...prev, questions };
        });
      };
    
      const removeChoice = (qIndex, cIndex) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          question.choices = question.choices.filter((_, i) => i !== cIndex);
    
          questions[qIndex] = question;
          return { ...prev, questions };
        });
      };
    
      const updateChoiceText = (qIndex, cIndex, value) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          question.choices = question.choices.map((choice, i) =>
            i === cIndex ? { ...choice, text: value } : choice
          );
    
          questions[qIndex] = question;
          return { ...prev, questions };
        });
      };
    
      const setCorrectChoice = (qIndex, cIndex) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          question.choices = question.choices.map((choice, i) => ({
            ...choice,
            isCorrect: i === cIndex,
          }));
    
          questions[qIndex] = question;
          return { ...prev, questions };
        });
      };
    
      /* ========================================================
         DDQ HELPERS
      ======================================================== */
    
      const addDragItem = (qIndex) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          const defaultBoxId = question.dropboxes?.[0]?.id || "";
    
          question.dragItems = [
            ...(question.dragItems || []),
            {
              id: makeId("item"),
              text: "",
              dropboxId: defaultBoxId,
            },
          ];
    
          questions[qIndex] = question;
          return { ...prev, questions };
        });
      };
    
      const removeDragItem = (qIndex, itemIndex) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          question.dragItems = question.dragItems.filter((_, i) => i !== itemIndex);
    
          questions[qIndex] = question;
          return { ...prev, questions };
        });
      };
    
      const updateDragItemText = (qIndex, itemIndex, value) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          question.dragItems = question.dragItems.map((item, i) =>
            i === itemIndex ? { ...item, text: value } : item
          );
    
          questions[qIndex] = question;
          return { ...prev, questions };
        });
      };
    
      const updateDragItemDropbox = (qIndex, itemIndex, dropboxId) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          question.dragItems = question.dragItems.map((item, i) =>
            i === itemIndex ? { ...item, dropboxId } : item
          );
    
          questions[qIndex] = question;
          return { ...prev, questions };
        });
      };
    
      const addDropBox = (qIndex) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          question.dropboxes = [
            ...(question.dropboxes || []),
            { id: makeId("box"), title: "" },
          ];
    
          questions[qIndex] = question;
          return { ...prev, questions };
        });
      };
    
      const removeDropBox = (qIndex, boxIndex) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          if (question.dropboxes.length <= 1) return prev;
    
          const removedBoxId = question.dropboxes[boxIndex].id;
          const dropboxes = question.dropboxes.filter((_, i) => i !== boxIndex);
          const fallbackId = dropboxes[0]?.id || "";
    
          question.dropboxes = dropboxes;
          question.dragItems = question.dragItems.map((item) => ({
            ...item,
            dropboxId:
              item.dropboxId === removedBoxId ? fallbackId : item.dropboxId,
          }));
    
          questions[qIndex] = question;
          return { ...prev, questions };
        });
      };
    
      const updateDropBoxTitle = (qIndex, boxIndex, value) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          question.dropboxes = question.dropboxes.map((box, i) =>
            i === boxIndex ? { ...box, title: value } : box
          );
    
          questions[qIndex] = question;
          return { ...prev, questions };
        });
      };
    
      /* ========================================================
         MATRIX QUESTION HELPERS
         These edit q.matrices[]
      ======================================================== */
    
      const updateMatrixAt = (qIndex, matrixIndex, updater) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          const matrices = [...(question.matrices || [])];
          const matrix = { ...matrices[matrixIndex] };
    
          matrices[matrixIndex] = updater(matrix);
    
          question.matrices = matrices;
          questions[qIndex] = question;
    
          return { ...prev, questions };
        });
      };
    
      const addRow = (qIndex, matrixIndex, value = 1) => {
        updateMatrixAt(qIndex, matrixIndex, (matrix) => {
          const rows = matrix.rows.map((row) => [...row]);
    
          for (let i = 0; i < value; i++) {
            rows.push(Array(matrix.columnCount).fill(0));
          }
    
          return {
            ...matrix,
            rows,
            rowCount: rows.length,
          };
        });
      };
    
      const removeRow = (qIndex, matrixIndex, rowIndex) => {
        updateMatrixAt(qIndex, matrixIndex, (matrix) => {
          if (matrix.rowCount <= 1) return matrix;
    
          const rows = matrix.rows
            .filter((_, i) => i !== rowIndex)
            .map((row) => [...row]);
    
          return {
            ...matrix,
            rows,
            rowCount: rows.length,
          };
        });
      };
    
      const addColumn = (qIndex, matrixIndex, value = 1) => {
        updateMatrixAt(qIndex, matrixIndex, (matrix) => {
          const rows = matrix.rows.map((row) => [
            ...row,
            ...Array(value).fill(0),
          ]);
    
          return {
            ...matrix,
            rows,
            columnCount: rows[0]?.length || 0,
          };
        });
      };
    
      const removeColumn = (qIndex, matrixIndex, colIndex) => {
        updateMatrixAt(qIndex, matrixIndex, (matrix) => {
          if (matrix.columnCount <= 1) return matrix;
    
          const rows = matrix.rows.map((row) =>
            row.filter((_, i) => i !== colIndex)
          );
    
          const columnCount = rows[0]?.length || 0;
    
          return {
            ...matrix,
            rows,
            columnCount,
            dividerIndex:
              matrix.dividerIndex && matrix.dividerIndex >= columnCount
                ? null
                : matrix.dividerIndex,
          };
        });
      };
    
      const addMatrix = (qIndex) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          const matrices = [...(question.matrices || [])];
    
          const base = matrices[0] || { rowCount: 2, columnCount: 2 };
    
          matrices.push(
            makeMatrix(
              String.fromCharCode(65 + matrices.length),
              base.rowCount,
              base.columnCount
            )
          );
    
          question.matrices = matrices;
          questions[qIndex] = question;
    
          return { ...prev, questions };
        });
      };
    
      const removeMatrix = (qIndex, matrixIndex) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          const matrices = [...(question.matrices || [])];
    
          if (matrices.length <= 1) return prev;
    
          question.matrices = matrices.filter((_, i) => i !== matrixIndex);
          questions[qIndex] = question;
    
          return { ...prev, questions };
        });
      };
    
      const updateMatrixLabel = (qIndex, mIndex, value) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          const matrices = [...(question.matrices || [])];
    
          matrices[mIndex] = {
            ...matrices[mIndex],
            label: value,
          };
    
          question.matrices = matrices;
          questions[qIndex] = question;
    
          return { ...prev, questions };
        });
      };
    
      const getDuplicateMatrixLabels = (answerMatrices = [], matrices = []) => {
        const counts = {};
    
        matrices.forEach((m) => {
          const key = m.label?.trim().toUpperCase();
          if (!key) return;
          counts[key] = (counts[key] || 0) + 1;
        });
    
        answerMatrices.filter(isMatrixAnswer).forEach((a) => {
          const key = a.label?.trim().toUpperCase();
          if (!key) return;
          counts[key] = (counts[key] || 0) + 1;
        });
    
        return Object.keys(counts).filter((key) => counts[key] > 1);
      };
    
      /* ========================================================
         MATRIX ANSWER HELPERS
         These edit q.expectedAnswers[]
      ======================================================== */

      const isMatrixAnswer = (answer) =>
        answer && typeof answer === "object" && Array.isArray(answer.rows);
    
      const updateExpectedAnswerAt = (qIndex, answerIndex, updater) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          const expectedAnswers = [...(question.expectedAnswers || [])];
          const currentAnswer = expectedAnswers[answerIndex];
    
          expectedAnswers[answerIndex] = updater(currentAnswer);
    
          question.expectedAnswers = expectedAnswers;
          questions[qIndex] = question;
    
          return { ...prev, questions };
        });
      };
    
      const addExpectedAnswerMatrix = (qIndex) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          const expectedAnswers = [...(question.expectedAnswers || [])];
    
          const matrixAnswers = expectedAnswers.filter(isMatrixAnswer);
    
          const base =
            matrixAnswers[0] ||
            question.matrices?.[0] ||
            { rowCount: 2, columnCount: 2 };
    
          expectedAnswers.push(
            makeMatrix(
              `Answer ${matrixAnswers.length + 1}`,
              base.rowCount,
              base.columnCount
            )
          );
    
          question.expectedAnswers = expectedAnswers;
          questions[qIndex] = question;
    
          return { ...prev, questions };
        });
      };
    
      const removeExpectedAnswerMatrix = (qIndex, answerIndex) => {
        setQuizData((prev) => {
          const questions = [...prev.questions];
          const question = { ...questions[qIndex] };
    
          const expectedAnswers = [...(question.expectedAnswers || [])];
    
          if (expectedAnswers.length <= 1) return prev;
    
          question.expectedAnswers = expectedAnswers.filter(
            (_, i) => i !== answerIndex
          );
    
          questions[qIndex] = question;
    
          return { ...prev, questions };
        });
      };
    
      const updateExpectedAnswerLabel = (qIndex, answerIndex, value) => {
        updateExpectedAnswerAt(qIndex, answerIndex, (answer) => {
          if (!isMatrixAnswer(answer)) return answer;
    
          return {
            ...answer,
            label: value,
          };
        });
      };
    
      const addAnswerRow = (qIndex, answerIndex, value = 1) => {
        updateExpectedAnswerAt(qIndex, answerIndex, (answer) => {
          if (!isMatrixAnswer(answer)) return answer;
    
          const rows = answer.rows.map((row) => [...row]);
    
          for (let i = 0; i < value; i++) {
            rows.push(Array(answer.columnCount).fill(0));
          }
    
          return {
            ...answer,
            rows,
            rowCount: rows.length,
          };
        });
      };
    
      const removeAnswerRow = (qIndex, answerIndex, rowIndex) => {
        updateExpectedAnswerAt(qIndex, answerIndex, (answer) => {
          if (!isMatrixAnswer(answer)) return answer;
          if (answer.rowCount <= 1) return answer;
    
          const rows = answer.rows
            .filter((_, i) => i !== rowIndex)
            .map((row) => [...row]);
    
          return {
            ...answer,
            rows,
            rowCount: rows.length,
          };
        });
      };
    
      const addAnswerColumn = (qIndex, answerIndex, value = 1) => {
        updateExpectedAnswerAt(qIndex, answerIndex, (answer) => {
          if (!isMatrixAnswer(answer)) return answer;
    
          const rows = answer.rows.map((row) => [
            ...row,
            ...Array(value).fill(0),
          ]);
    
          return {
            ...answer,
            rows,
            columnCount: rows[0]?.length || 0,
          };
        });
      };
    
      const removeAnswerColumn = (qIndex, answerIndex, colIndex) => {
        updateExpectedAnswerAt(qIndex, answerIndex, (answer) => {
          if (!isMatrixAnswer(answer)) return answer;
          if (answer.columnCount <= 1) return answer;
    
          const rows = answer.rows.map((row) =>
            row.filter((_, i) => i !== colIndex)
          );
    
          const columnCount = rows[0]?.length || 0;
    
          return {
            ...answer,
            rows,
            columnCount,
            dividerIndex:
              answer.dividerIndex && answer.dividerIndex >= columnCount
                ? null
                : answer.dividerIndex,
          };
        });
      };
    
  


  return { 
    quizData, setQuizData, updateQuizField, updateQuestionField, removeQuestion, appendQuestion,
    addMcqQuestion, addDdqQuestion, addMatrixQuestion, handleBulkImport,
    addChoice, removeChoice, updateChoiceText, setCorrectChoice,
    addDragItem, removeDragItem, updateDragItemText, updateDragItemDropbox, addDropBox, removeDropBox, updateDropBoxTitle,
    updateMatrixAt, addRow, removeRow, addColumn, removeColumn, addMatrix, removeMatrix, updateMatrixLabel, getDuplicateMatrixLabels,
    updateExpectedAnswerAt, addExpectedAnswerMatrix, removeExpectedAnswerMatrix, updateExpectedAnswerLabel, addAnswerRow, removeAnswerRow, addAnswerColumn, removeAnswerColumn 
  };
}