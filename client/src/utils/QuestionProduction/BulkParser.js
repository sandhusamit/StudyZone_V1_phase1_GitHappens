export const parseBulkQuestions = (input) => {
  const lines = input
    .split("\n")
    .map((line) => line.replace(/\r$/, ""))
    .filter((line) => line.trim() !== "");

  const questions = [];
  const errors = [];
  let current = null;
  let questionNumber = 0;

  const allowedSubjects = ["Math", "SWE", "Data", "General"];
  const allowedImportTypes = ["mcq", "ddq", "matrix"];
  const allowedMatrixTypes = [
    "addition",
    "subtraction",
    "multiplication",
    "determinant",
    "inverse",
    "transpose",
    "RREF",
    "REF",
  ];

  const isQuestionStart = (line) => /^\s*\d+\.\s+/.test(line);
  const isChoiceStart = (line) => /^\s*[A-D]\.\s*(.*)?$/.test(line);
  const isAnswerLine = (line) => /^\s*Answer:\s*[A-D]\s*$/i.test(line);
  const isExplanationLine = (line) =>
    /^\s*Explanation:\s*/i.test(line) || /^\s*Explaination:\s*/i.test(line);
  const isSubjectLine = (line) => /^\s*Subject:\s*/i.test(line);
  const isTypeLine = (line) => /^\s*Type:\s*(mcq|ddq|matrix)\s*$/i.test(line);
  const isDropboxLine = (line) => /^\s*Dropbox:\s*/i.test(line);
  const isDragItemLine = (line) => /^\s*DragItem:\s*/i.test(line);

  const isMatrixTypeLine = (line) => /^\s*MatrixType:\s*/i.test(line);
  const isMatrixLine = (line) => /^\s*Matrix:\s*/i.test(line);
  const isExpectedMatrixLine = (line) => /^\s*Expected:\s*/i.test(line);
  const isPromptLine = (line) => /^\s*Prompt:\s*/i.test(line);
  const isDifficultyLine = (line) => /^\s*Difficulty:\s*/i.test(line);
  const isPointsLine = (line) => /^\s*Points:\s*/i.test(line);

  const isMetadataLine = (line) =>
    isQuestionStart(line) ||
    isChoiceStart(line) ||
    isAnswerLine(line) ||
    isExplanationLine(line) ||
    isSubjectLine(line) ||
    isTypeLine(line) ||
    isDropboxLine(line) ||
    isDragItemLine(line) ||
    isMatrixTypeLine(line) ||
    isMatrixLine(line) ||
    isExpectedMatrixLine(line) ||
    isPromptLine(line) ||
    isDifficultyLine(line) ||
    isPointsLine(line);

  const parseMatrixBlock = (line, startIndex, isExpected) => {
    const value = line.replace(/^\s*(Matrix|Expected):\s*/i, "");
    const parts = value.split("|").map((p) => p.trim());

    if (parts.length !== 3) {
      errors.push(
        `Question ${questionNumber}: invalid matrix format. Use "Matrix: A | square | 2x2" or "Expected: Answer | square | 2x2".`
      );
      return { matrix: null, nextIndex: startIndex + 1 };
    }

    const [label, matrixType, size] = parts;
    const [expectedRows, expectedCols] = size.toLowerCase().split("x").map(Number);

    if (!label || !matrixType || !size || !expectedRows || !expectedCols) {
      errors.push(`Question ${questionNumber}: invalid matrix header "${line}".`);
      return { matrix: null, nextIndex: startIndex + 1 };
    }

    const rows = [];
    let j = startIndex + 1;

    while (j < lines.length && !isMetadataLine(lines[j])) {
      const row = lines[j].trim().split(/\s+/).map(Number);

      if (row.some((value) => Number.isNaN(value))) {
        errors.push(
          `Question ${questionNumber}: matrix "${label}" has a non-number row: "${lines[j]}".`
        );
      }

      rows.push(row);
      j++;
    }

    if (rows.length !== expectedRows) {
      errors.push(
        `Question ${questionNumber}: matrix "${label}" expected ${expectedRows} row(s), found ${rows.length}.`
      );
    }

    const badRow = rows.find((row) => row.length !== expectedCols);
    if (badRow) {
      errors.push(
        `Question ${questionNumber}: matrix "${label}" expected ${expectedCols} column(s) per row.`
      );
    }

    return {
      matrix: {
        label,
        matrixType,
        rows,
        rowCount: rows.length,
        columnCount: rows[0]?.length || 0,
        dividerIndex: null,
      },
      nextIndex: j,
    };
  };

  const pushCurrentQuestion = () => {
    if (!current) return;

    current.text = current.text ?? "";
    current.explanation = current.explanation ?? "";
    current.subject = current.subject?.trim() || "General";
    current.importType = current.importType || "mcq";

    const importType = current.importType;
    const hasText = current.text.trim() !== "";

    if (!allowedImportTypes.includes(importType)) {
      errors.push(
        `Question ${questionNumber}: invalid type "${importType}". Use mcq, ddq, or matrix.`
      );
      return;
    }

    if (!allowedSubjects.includes(current.subject)) {
      errors.push(
        `Question ${questionNumber}: invalid subject "${current.subject}". Use Math, SWE, Data, or General.`
      );
    }

    if (importType !== "matrix" && !hasText) {
      errors.push(`Question ${questionNumber}: missing question text.`);
    }

    if (importType === "mcq") {
      const hasFourChoices = current.choices.length === 4;
      const correctCount = current.choices.filter((c) => c.isCorrect).length;

      if (!hasFourChoices) {
        errors.push(
          `Question ${questionNumber}: MCQ must have exactly 4 choices. Found ${current.choices.length}.`
        );
      }

      if (correctCount !== 1) {
        errors.push(`Question ${questionNumber}: MCQ must have exactly 1 correct answer.`);
      }

      if (
        hasText &&
        hasFourChoices &&
        correctCount === 1 &&
        allowedSubjects.includes(current.subject)
      ) {
        questions.push({
          questionModel: "Question",
          text: current.text,
          points: current.points ?? 1,
          explanation: current.explanation,
          subject: current.subject,
          questionType: "mcq",
          choices: current.choices.map(({ text, isCorrect }) => ({
            text,
            isCorrect,
          })),
        });
      }
    }

    if (importType === "ddq") {
      const hasDropboxes = current.dropboxes.length > 0;
      const hasDragItems = current.dragItems.length > 0;

      if (!hasDropboxes) {
        errors.push(`Question ${questionNumber}: DDQ must have at least 1 dropbox.`);
      }

      if (!hasDragItems) {
        errors.push(`Question ${questionNumber}: DDQ must have at least 1 drag item.`);
      }

      const dropboxIds = new Set(current.dropboxes.map((d) => d.id));

      current.dragItems.forEach((item) => {
        if (!dropboxIds.has(item.dropboxId)) {
          errors.push(
            `Question ${questionNumber}: drag item "${item.text}" references missing dropboxId "${item.dropboxId}".`
          );
        }
      });

      const uniqueDropboxIds = new Set(current.dropboxes.map((d) => d.id));
      if (uniqueDropboxIds.size !== current.dropboxes.length) {
        errors.push(`Question ${questionNumber}: duplicate dropbox ids found.`);
      }

      const uniqueDragItemIds = new Set(current.dragItems.map((d) => d.id));
      if (uniqueDragItemIds.size !== current.dragItems.length) {
        errors.push(`Question ${questionNumber}: duplicate drag item ids found.`);
      }

      if (
        hasText &&
        hasDropboxes &&
        hasDragItems &&
        allowedSubjects.includes(current.subject) &&
        current.dragItems.every((item) => dropboxIds.has(item.dropboxId))
      ) {
        questions.push({
          questionModel: "Question",
          text: current.text,
          points: current.points ?? 1,
          explanation: current.explanation,
          subject: current.subject,
          questionType: "ddq",
          dragItems: current.dragItems.map(({ id, text, dropboxId }) => ({
            id,
            text,
            dropboxId,
          })),
          dropboxes: current.dropboxes.map(({ id, title }) => ({
            id,
            title,
          })),
        });
      }
    }

    if (importType === "matrix") {
      const prompt = current.prompt?.trim() || current.text?.trim();

      if (!prompt) {
        errors.push(`Question ${questionNumber}: matrix question missing prompt.`);
      }

      if (!allowedMatrixTypes.includes(current.questionType)) {
        errors.push(
          `Question ${questionNumber}: invalid MatrixType "${current.questionType}".`
        );
      }

      if (current.matrices.length === 0) {
        errors.push(`Question ${questionNumber}: no matrices defined.`);
      }

      if (current.expectedAnswers.length === 0) {
        errors.push(`Question ${questionNumber}: no expected answers defined.`);
      }

      if (
        prompt &&
        allowedMatrixTypes.includes(current.questionType) &&
        current.matrices.length > 0 &&
        current.expectedAnswers.length > 0 &&
        allowedSubjects.includes(current.subject)
      ) {
        questions.push({
          questionModel: "MatrixQuestion",
          questionType: current.questionType,
          title: current.title || current.text || "",
          prompt,
          points: current.points ?? 1,
          explanation: current.explanation,
          subject: current.subject,
          difficulty: current.difficulty || "easy",
          answerMode: current.expectedAnswers.length > 1 ? "multiple" : "single",
          matrices: current.matrices,
          expectedAnswers: current.expectedAnswers,
        });
      }
    }
  };

  for (let i = 0; i < lines.length; ) {
    const line = lines[i];

    if (isQuestionStart(line)) {
      pushCurrentQuestion();

      let title = line.replace(/^\s*\d+\.\s+/, "");
      let j = i + 1;

      while (j < lines.length && !isMetadataLine(lines[j])) {
        title += "\n" + lines[j];
        j++;
      }

      questionNumber += 1;

      current = {
        questionModel: "Question",
        importType: "mcq",
        text: title,
        title: "",
        prompt: "",
        questionType: "mcq",
        choices: [],
        dragItems: [],
        dropboxes: [],
        matrices: [],
        expectedAnswers: [],
        points: 1,
        explanation: "",
        subject: "General",
        difficulty: "easy",
      };

      i = j;
      continue;
    }

    if (isTypeLine(line)) {
      if (!current) {
        errors.push(`Type found before first question: "${line}"`);
        i++;
        continue;
      }

      const type = line.replace(/^\s*Type:\s*/i, "").trim().toLowerCase();

      current.importType = type;

      if (type === "matrix") {
        current.questionModel = "MatrixQuestion";
        current.questionType = "addition";
        current.matrices = [];
        current.expectedAnswers = [];
      } else {
        current.questionModel = "Question";
        current.questionType = type;
      }

      i++;
      continue;
    }

    if (isMatrixTypeLine(line)) {
      if (!current) {
        errors.push(`MatrixType found before first question: "${line}"`);
        i++;
        continue;
      }

      current.questionType = line.replace(/^\s*MatrixType:\s*/i, "").trim();
      i++;
      continue;
    }

    if (isPromptLine(line)) {
      if (!current) {
        errors.push(`Prompt found before first question: "${line}"`);
        i++;
        continue;
      }

      current.prompt = line.replace(/^\s*Prompt:\s*/i, "").trim();
      i++;
      continue;
    }

    if (isDifficultyLine(line)) {
      if (!current) {
        errors.push(`Difficulty found before first question: "${line}"`);
        i++;
        continue;
      }

      current.difficulty = line.replace(/^\s*Difficulty:\s*/i, "").trim();
      i++;
      continue;
    }

    if (isPointsLine(line)) {
      if (!current) {
        errors.push(`Points found before first question: "${line}"`);
        i++;
        continue;
      }

      const points = Number(line.replace(/^\s*Points:\s*/i, "").trim());
      current.points = Number.isNaN(points) ? 1 : points;
      i++;
      continue;
    }

    if (isMatrixLine(line) || isExpectedMatrixLine(line)) {
      if (!current || current.importType !== "matrix") {
        errors.push(`Matrix found outside of matrix question: "${line}"`);
        i++;
        continue;
      }

      const isExpected = isExpectedMatrixLine(line);
      const { matrix, nextIndex } = parseMatrixBlock(line, i, isExpected);

      if (matrix) {
        if (isExpected) current.expectedAnswers.push(matrix);
        else current.matrices.push(matrix);
      }

      i = nextIndex;
      continue;
    }

    if (isChoiceStart(line)) {
      if (!current) {
        errors.push(`Choice found before first question: "${line}"`);
        i++;
        continue;
      }

      if (current.importType !== "mcq") {
        errors.push(
          `Question ${questionNumber}: found MCQ choice in a ${current.importType.toUpperCase()} question.`
        );
        i++;
        continue;
      }

      const labelMatch = line.match(/^\s*([A-D])\./i);
      const label = labelMatch ? labelMatch[1].toUpperCase() : null;

      let choiceText = line.replace(/^\s*[A-D]\.\s*/, "");
      let z = i + 1;

      while (z < lines.length && !isMetadataLine(lines[z])) {
        choiceText += (choiceText ? "\n" : "") + lines[z];
        z++;
      }

      current.choices.push({
        label,
        text: choiceText,
        isCorrect: false,
      });

      i = z;
      continue;
    }

    if (isAnswerLine(line)) {
      if (!current) {
        errors.push(`Answer found before first question: "${line}"`);
        i++;
        continue;
      }

      if (current.importType !== "mcq") {
        errors.push(
          `Question ${questionNumber}: found Answer line in a ${current.importType.toUpperCase()} question.`
        );
        i++;
        continue;
      }

      const correctLetter = line.split(":")[1].trim().toUpperCase();

      current.choices = current.choices.map((choice) => ({
        ...choice,
        isCorrect: choice.label === correctLetter,
      }));

      i++;
      continue;
    }

    if (isDropboxLine(line)) {
      if (!current) {
        errors.push(`Dropbox found before first question: "${line}"`);
        i++;
        continue;
      }

      if (current.importType !== "ddq") {
        errors.push(
          `Question ${questionNumber}: found Dropbox line in a ${current.importType.toUpperCase()} question.`
        );
        i++;
        continue;
      }

      const value = line.replace(/^\s*Dropbox:\s*/i, "");
      const parts = value.split("|").map((p) => p.trim());

      if (parts.length !== 2) {
        errors.push(
          `Question ${questionNumber}: invalid Dropbox format. Use "Dropbox: id | title".`
        );
      } else {
        const [id, title] = parts;
        current.dropboxes.push({ id, title });
      }

      i++;
      continue;
    }

    if (isDragItemLine(line)) {
      if (!current) {
        errors.push(`DragItem found before first question: "${line}"`);
        i++;
        continue;
      }

      if (current.importType !== "ddq") {
        errors.push(
          `Question ${questionNumber}: found DragItem line in a ${current.importType.toUpperCase()} question.`
        );
        i++;
        continue;
      }

      const value = line.replace(/^\s*DragItem:\s*/i, "");
      const parts = value.split("|").map((p) => p.trim());

      if (parts.length !== 3) {
        errors.push(
          `Question ${questionNumber}: invalid DragItem format. Use "DragItem: id | text | dropboxId".`
        );
      } else {
        const [id, text, dropboxId] = parts;
        current.dragItems.push({ id, text, dropboxId });
      }

      i++;
      continue;
    }

    if (isExplanationLine(line)) {
      if (!current) {
        errors.push(`Explanation found before first question: "${line}"`);
        i++;
        continue;
      }

      current.explanation = line
        .replace(/^\s*Explanation:\s*/i, "")
        .replace(/^\s*Explaination:\s*/i, "");

      i++;
      continue;
    }

    if (isSubjectLine(line)) {
      if (!current) {
        errors.push(`Subject found before first question: "${line}"`);
        i++;
        continue;
      }

      current.subject = line.replace(/^\s*Subject:\s*/i, "").trim();

      i++;
      continue;
    }

    errors.push(`Unrecognized line: "${line}"`);
    i++;
  }

  pushCurrentQuestion();

  return { questions, errors };
};