export const validateQuiz = (quizData) => {
  if (!quizData.title.trim()) {
    return { isValid: false, error: "Quiz title is required." };
  }

  if (quizData.questions.length === 0) {
    return { isValid: false, error: "Add at least one question." };
  }

  for (const q of quizData.questions) {
    if (!q.text?.trim()) {
      return { isValid: false, error: "Each question must have text." };
    }

    if (q.questionType === "mcq") {
      if (!q.choices?.length) {
        return { isValid: false, error: "Each MCQ must have at least one choice." };
      }

      if (q.choices.some((c) => !c.text.trim())) {
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

      if (q.dragItems.some((item) => !item.text.trim())) {
        return { isValid: false, error: "Each drag item must have text." };
      }

      if (q.dropboxes.some((box) => !box.title.trim())) {
        return { isValid: false, error: "Each drop box must have a title." };
      }

      const validBoxIds = q.dropboxes.map((b) => b.id);

      if (q.dragItems.some((item) => !validBoxIds.includes(item.dropboxId))) {
        return { isValid: false, error: "A drag item is assigned to an invalid drop box." };
      }
    }
  }

  return { isValid: true, error: "" };
};