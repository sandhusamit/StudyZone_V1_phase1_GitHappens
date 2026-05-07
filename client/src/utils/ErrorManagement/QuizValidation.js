export const validateQuiz = (quizData) => {
  if (!quizData.title?.trim()) {
    return { isValid: false, error: "Quiz title is required." };
  }

  if (!quizData.questions?.length) {
    return { isValid: false, error: "Add at least one question." };
  }

  const isValidNumber = (value) =>
    value !== "" && value !== null && value !== undefined && !Number.isNaN(Number(value));

  const validateMatrixObject = (matrix, label = "Matrix") => {
    if (!matrix.label?.trim()) {
      return `${label} must have a label.`;
    }

    if (!Array.isArray(matrix.rows) || matrix.rows.length < 1) {
      return `${matrix.label} must have at least one row.`;
    }

    if (!Array.isArray(matrix.rows[0]) || matrix.rows[0].length < 1) {
      return `${matrix.label} must have at least one column.`;
    }

    const rowCount = matrix.rows.length;
    const columnCount = matrix.rows[0].length;

    if (matrix.rowCount !== rowCount || matrix.columnCount !== columnCount) {
      return `${matrix.label} row/column count does not match its data.`;
    }

    for (const row of matrix.rows) {
      if (!Array.isArray(row) || row.length !== columnCount) {
        return `${matrix.label} rows must all have the same number of columns.`;
      }

      for (const cell of row) {
        if (!isValidNumber(cell)) {
          return `${matrix.label} contains invalid cell values.`;
        }
      }
    }

    if (
      matrix.dividerIndex !== null &&
      matrix.dividerIndex !== undefined &&
      matrix.dividerIndex !== ""
    ) {
      const divider = Number(matrix.dividerIndex);

      if (!Number.isInteger(divider) || divider < 1 || divider >= columnCount) {
        return `${matrix.label} has an invalid augmented divider.`;
      }
    }

    return null;
  };

  for (const q of quizData.questions) {
    const isMatrixQuestion = q.questionModel === "MatrixQuestion";

    if (isMatrixQuestion) {
      if (!q.prompt?.trim()) {
        return { isValid: false, error: "Each matrix question must have a prompt." };
      }

      if (!q.title?.trim()) {
        return { isValid: false, error: "Each matrix question must have a title." };
      }

      if (!Array.isArray(q.matrices) || q.matrices.length < 1) {
        return { isValid: false, error: "Each matrix question must have at least one matrix." };
      }

      const labels = q.matrices.map((m) => m.label?.trim().toUpperCase());
      const uniqueLabels = new Set(labels);

      if (uniqueLabels.size !== labels.length) {
        return { isValid: false, error: "Matrix labels must be unique." };
      }

      for (const matrix of q.matrices) {
        const matrixError = validateMatrixObject(matrix);
        if (matrixError) {
          return { isValid: false, error: matrixError };
        }
      }

      if (!q.expectedAnswer) {
        return { isValid: false, error: "Matrix questions must have an expected answer." };
      }

      const answerError = validateMatrixObject(q.expectedAnswer, "Expected Answer");
      if (answerError) {
        return { isValid: false, error: answerError };
      }

      const first = q.matrices[0];

      if (q.questionType === "determinant" || q.questionType === "inverse") {
        if (first.rowCount !== first.columnCount) {
          return {
            isValid: false,
            error: "Determinant and inverse questions require a square matrix.",
          };
        }
      }

      if (q.questionType === "addition" || q.questionType === "subtraction") {
        const sameDimensions = q.matrices.every(
          (m) =>
            m.rowCount === first.rowCount &&
            m.columnCount === first.columnCount
        );

        if (!sameDimensions) {
          return {
            isValid: false,
            error: "Addition/subtraction matrices must have the same dimensions.",
          };
        }
      }

      if (q.questionType === "multiplication") {
        if (q.matrices.length < 2) {
          return {
            isValid: false,
            error: "Multiplication requires at least two matrices.",
          };
        }

        for (let i = 0; i < q.matrices.length - 1; i++) {
          const left = q.matrices[i];
          const right = q.matrices[i + 1];

          if (left.columnCount !== right.rowCount) {
            return {
              isValid: false,
              error: "Matrix multiplication dimensions are not compatible.",
            };
          }
        }
      }

      if (q.questionType === "RREF" || q.questionType === "REF") {
        if (q.matrices.length !== 1) {
          return {
            isValid: false,
            error: "REF/RREF questions must have exactly one matrix.",
          };
        }
      }

      continue;
    }

    if (!q.text?.trim()) {
      return { isValid: false, error: "Each question must have text." };
    }

    if (q.questionType === "mcq") {
      if (!q.choices?.length || q.choices.length < 2) {
        return { isValid: false, error: "Each MCQ must have at least two choices." };
      }

      if (q.choices.some((c) => !c.text?.trim())) {
        return { isValid: false, error: "Each MCQ choice must have text." };
      }

      const correctCount = q.choices.filter((c) => c.isCorrect).length;

      if (correctCount !== 1) {
        return { isValid: false, error: "Each MCQ must have exactly one correct answer." };
      }
    }

    if (q.questionType === "ddq") {
      if (!q.dragItems?.length) {
        return { isValid: false, error: "Each DDQ must have at least one drag item." };
      }

      if (!q.dropboxes?.length) {
        return { isValid: false, error: "Each DDQ must have at least one drop box." };
      }

      if (q.dragItems.some((item) => !item.text?.trim())) {
        return { isValid: false, error: "Each drag item must have text." };
      }

      if (q.dropboxes.some((box) => !box.title?.trim())) {
        return { isValid: false, error: "Each drop box must have a title." };
      }

      const validBoxIds = q.dropboxes.map((b) => b.id);

      if (q.dragItems.some((item) => !validBoxIds.includes(item.dropboxId))) {
        return {
          isValid: false,
          error: "A drag item is assigned to an invalid drop box.",
        };
      }
    }
  }

  return { isValid: true, error: "" };
};