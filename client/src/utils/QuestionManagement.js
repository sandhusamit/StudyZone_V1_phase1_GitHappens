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
    const allowedQuestionTypes = ["mcq", "ddq"];

    const isQuestionStart = (line) => /^\s*\d+\.\s+/.test(line);
    const isChoiceStart = (line) => /^\s*[A-D]\.\s*(.*)?$/.test(line);
    const isAnswerLine = (line) => /^\s*Answer:\s*[A-D]\s*$/i.test(line);
    const isExplanationLine = (line) =>
      /^\s*Explanation:\s*/i.test(line) || /^\s*Explaination:\s*/i.test(line);
    const isSubjectLine = (line) => /^\s*Subject:\s*/i.test(line);
    const isTypeLine = (line) => /^\s*Type:\s*(mcq|ddq)\s*$/i.test(line);
    const isDropboxLine = (line) => /^\s*Dropbox:\s*/i.test(line);
    const isDragItemLine = (line) => /^\s*DragItem:\s*/i.test(line);

    const isMetadataLine = (line) =>
      isQuestionStart(line) ||
      isChoiceStart(line) ||
      isAnswerLine(line) ||
      isExplanationLine(line) ||
      isSubjectLine(line) ||
      isTypeLine(line) ||
      isDropboxLine(line) ||
      isDragItemLine(line);

    const pushCurrentQuestion = () => {
      if (!current) return;

      current.text = current.text ?? "";
      current.explanation = current.explanation ?? "";
      current.subject = current.subject?.trim() || "General";
      current.questionType = current.questionType?.trim().toLowerCase() || "mcq";

      const hasText = current.text !== "";

      if (!hasText) {
        errors.push(`Question ${questionNumber}: missing question text.`);
      }

      if (!allowedSubjects.includes(current.subject)) {
        errors.push(
          `Question ${questionNumber}: invalid subject "${current.subject}". Use Math, SWE, Data, or General.`
        );
      }

      if (!allowedQuestionTypes.includes(current.questionType)) {
        errors.push(
          `Question ${questionNumber}: invalid question type "${current.questionType}". Use mcq or ddq.`
        );
      }

      if (current.questionType === "mcq") {
        const hasFourChoices = current.choices.length === 4;
        const correctCount = current.choices.filter((c) => c.isCorrect).length;

        if (!hasFourChoices) {
          errors.push(
            `Question ${questionNumber}: MCQ must have exactly 4 choices. Found ${current.choices.length}.`
          );
        }

        if (correctCount !== 1) {
          errors.push(
            `Question ${questionNumber}: MCQ must have exactly 1 correct answer.`
          );
        }

        if (
          hasText &&
          hasFourChoices &&
          correctCount === 1 &&
          allowedSubjects.includes(current.subject)
        ) {
          questions.push({
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

      if (current.questionType === "ddq") {
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
          text: title,
          questionType: "mcq",
          choices: [],
          dragItems: [],
          dropboxes: [],
          points: 1,
          explanation: "",
          subject: "General",
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

        current.questionType = line.replace(/^\s*Type:\s*/i, "").trim().toLowerCase();
        i++;
        continue;
      }

      if (isChoiceStart(line)) {
        if (!current) {
          errors.push(`Choice found before first question: "${line}"`);
          i++;
          continue;
        }

        if (current.questionType !== "mcq") {
          errors.push(
            `Question ${questionNumber}: found MCQ choice in a ${current.questionType.toUpperCase()} question.`
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

        if (current.questionType !== "mcq") {
          errors.push(
            `Question ${questionNumber}: found Answer line in a ${current.questionType.toUpperCase()} question.`
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

        if (current.questionType !== "ddq") {
          errors.push(
            `Question ${questionNumber}: found Dropbox line in a ${current.questionType.toUpperCase()} question.`
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

        if (current.questionType !== "ddq") {
          errors.push(
            `Question ${questionNumber}: found DragItem line in a ${current.questionType.toUpperCase()} question.`
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