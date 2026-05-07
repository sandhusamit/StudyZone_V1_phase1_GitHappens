import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./styles/EditQuiz.css";
import NewQuestionCard from "client/src/components/CreateQuiz/Steps/Step2/NewQuestionCard.jsx";

/* ========================================================
   FACTORIES
======================================================== */

const makeId = (prefix) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const makeMatrix = (label = "A", rowCount = 2, columnCount = 2) => ({
  label,
  matrixType: rowCount === columnCount ? "square" : "rectangular",
  rows: Array.from({ length: rowCount }, () => Array(columnCount).fill(0)),
  rowCount,
  columnCount,
  dividerIndex: null,
});

const makeMcqQuestion = () => ({
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

const makeDdqQuestion = () => {
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

const makeMatrixQuestion = () => ({
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

/* ========================================================
   COMPONENT
======================================================== */

export default function EditQuiz() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const {
    updateQuiz,
    createQuestion,
    updateQuestion,
    createMatrixQuestion,
    updateMatrixQuestion,
  } = useAuth();

  const selectedQuiz = state?.quiz;

  const unwrapQuestion = (item) => {
    const q = item.questionId || item;

    return {
      ...q,
      questionModel: item.questionModel || q.questionModel || "Question",
    };
  };

  const normalizeQuestion = (item) => {
    const q = unwrapQuestion(item);

    if (q.questionModel === "MatrixQuestion") {
      return {
        ...makeMatrixQuestion(),
        ...q,
        matrices: q.matrices?.length ? q.matrices : [makeMatrix("A")],
        expectedAnswers:
          q.expectedAnswers?.length
            ? q.expectedAnswers
            : q.expectedAnswer
              ? [q.expectedAnswer]
              : [makeMatrix("Answer")],
      };
    }

    if (q.questionType === "ddq") {
      const box1 = makeId("box");

      return {
        ...q,
        questionModel: "Question",
        questionType: "ddq",
        dragItems: q.dragItems?.length
          ? q.dragItems
          : [{ id: makeId("item"), text: "", dropboxId: box1 }],
        dropboxes: q.dropboxes?.length
          ? q.dropboxes
          : [{ id: box1, title: "" }],
      };
    }

    return {
      ...q,
      questionModel: "Question",
      questionType: "mcq",
      choices: q.choices?.length
        ? q.choices
        : [
            { text: "", isCorrect: false },
            { text: "", isCorrect: false },
          ],
    };
  };

  const [title, setTitle] = useState(selectedQuiz?.title || "");
  const [description, setDescription] = useState(
    selectedQuiz?.description || ""
  );
  const [visibility, setVisibility] = useState(
    selectedQuiz?.visibility || "private"
  );
  const [rotation, setRotation] = useState(selectedQuiz?.rotation || 0);
  const [questions, setQuestions] = useState(
    (selectedQuiz?.questions || []).map(normalizeQuestion)
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!selectedQuiz) return <p>No quiz found.</p>;

  /* ========================================================
     GENERAL QUESTION HELPERS
  ======================================================== */

  const updateQuestionField = (qIndex, field, value) => {
    setQuestions((prev) => {
      const updated = [...prev];

      updated[qIndex] = {
        ...updated[qIndex],
        [field]: value,
      };

      return updated;
    });
  };

  const removeQuestion = (qIndex) => {
    setQuestions((prev) => prev.filter((_, i) => i !== qIndex));
  };

  const addQuestion = (type = "mcq") => {
    if (type === "ddq") {
      setQuestions((prev) => [...prev, makeDdqQuestion()]);
      return;
    }

    if (type === "matrix") {
      setQuestions((prev) => [...prev, makeMatrixQuestion()]);
      return;
    }

    setQuestions((prev) => [...prev, makeMcqQuestion()]);
  };

  /* ========================================================
     MCQ HELPERS
  ======================================================== */

  const updateChoiceText = (qIndex, cIndex, text) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      q.choices = q.choices.map((choice, i) =>
        i === cIndex ? { ...choice, text } : choice
      );

      updated[qIndex] = q;
      return updated;
    });
  };

  const setCorrectChoice = (qIndex, cIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      q.choices = q.choices.map((choice, i) => ({
        ...choice,
        isCorrect: i === cIndex,
      }));

      updated[qIndex] = q;
      return updated;
    });
  };

  const addChoice = (qIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      q.choices = [...(q.choices || []), { text: "", isCorrect: false }];

      updated[qIndex] = q;
      return updated;
    });
  };

  const removeChoice = (qIndex, cIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      if ((q.choices || []).length <= 1) return prev;

      q.choices = q.choices.filter((_, i) => i !== cIndex);

      updated[qIndex] = q;
      return updated;
    });
  };

  /* ========================================================
     DDQ HELPERS
  ======================================================== */

  const addDragItem = (qIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      const defaultBoxId = q.dropboxes?.[0]?.id || "";

      q.dragItems = [
        ...(q.dragItems || []),
        { id: makeId("item"), text: "", dropboxId: defaultBoxId },
      ];

      updated[qIndex] = q;
      return updated;
    });
  };

  const removeDragItem = (qIndex, itemIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      q.dragItems = q.dragItems.filter((_, i) => i !== itemIndex);

      updated[qIndex] = q;
      return updated;
    });
  };

  const updateDragItemText = (qIndex, itemIndex, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      q.dragItems = q.dragItems.map((item, i) =>
        i === itemIndex ? { ...item, text: value } : item
      );

      updated[qIndex] = q;
      return updated;
    });
  };

  const updateDragItemDropbox = (qIndex, itemIndex, dropboxId) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      q.dragItems = q.dragItems.map((item, i) =>
        i === itemIndex ? { ...item, dropboxId } : item
      );

      updated[qIndex] = q;
      return updated;
    });
  };

  const addDropBox = (qIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      q.dropboxes = [...(q.dropboxes || []), { id: makeId("box"), title: "" }];

      updated[qIndex] = q;
      return updated;
    });
  };

  const removeDropBox = (qIndex, boxIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      if ((q.dropboxes || []).length <= 1) return prev;

      const removedBoxId = q.dropboxes[boxIndex].id;
      const dropboxes = q.dropboxes.filter((_, i) => i !== boxIndex);
      const fallbackId = dropboxes[0]?.id || "";

      q.dropboxes = dropboxes;
      q.dragItems = q.dragItems.map((item) => ({
        ...item,
        dropboxId:
          item.dropboxId === removedBoxId ? fallbackId : item.dropboxId,
      }));

      updated[qIndex] = q;
      return updated;
    });
  };

  const updateDropBoxTitle = (qIndex, boxIndex, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      q.dropboxes = q.dropboxes.map((box, i) =>
        i === boxIndex ? { ...box, title: value } : box
      );

      updated[qIndex] = q;
      return updated;
    });
  };

  /* ========================================================
     MATRIX QUESTION HELPERS
     These edit q.matrices[]
  ======================================================== */

  const updateMatrixAt = (qIndex, matrixIndex, updater) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      const matrices = [...(q.matrices || [])];
      const matrix = { ...matrices[matrixIndex] };

      matrices[matrixIndex] = updater(matrix);

      q.matrices = matrices;
      updated[qIndex] = q;

      return updated;
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
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      const matrices = [...(q.matrices || [])];
      const base = matrices[0] || { rowCount: 2, columnCount: 2 };

      matrices.push(
        makeMatrix(
          String.fromCharCode(65 + matrices.length),
          base.rowCount,
          base.columnCount
        )
      );

      q.matrices = matrices;
      updated[qIndex] = q;

      return updated;
    });
  };

  const removeMatrix = (qIndex, matrixIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      const matrices = [...(q.matrices || [])];

      if (matrices.length <= 1) return prev;

      q.matrices = matrices.filter((_, i) => i !== matrixIndex);
      updated[qIndex] = q;

      return updated;
    });
  };

  const updateMatrixLabel = (qIndex, matrixIndex, value) => {
    updateMatrixAt(qIndex, matrixIndex, (matrix) => ({
      ...matrix,
      label: value,
    }));
  };

  const getDuplicateMatrixLabels = (answerMatrices = [], matrices = []) => {
    const counts = {};

    matrices.forEach((m) => {
      const key = m.label?.trim().toUpperCase();
      if (!key) return;
      counts[key] = (counts[key] || 0) + 1;
    });

    answerMatrices.forEach((a) => {
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

  const syncAnswerMode = (question) => {
    const answerCount = question.expectedAnswers?.length || 0;

    return {
      ...question,
      answerMode: answerCount > 1 ? "multiple" : "single",
    };
  };

  const updateExpectedAnswerAt = (qIndex, answerIndex, updater) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      const expectedAnswers = [...(q.expectedAnswers || [])];
      const answer = { ...expectedAnswers[answerIndex] };

      expectedAnswers[answerIndex] = updater(answer);

      q.expectedAnswers = expectedAnswers;
      updated[qIndex] = q;

      return updated;
    });
  };

  const addExpectedAnswerMatrix = (qIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      const expectedAnswers = [...(q.expectedAnswers || [])];
      const base =
        expectedAnswers[0] ||
        q.matrices?.[0] ||
        { rowCount: 2, columnCount: 2 };

      expectedAnswers.push(
        makeMatrix(
          `Answer ${expectedAnswers.length + 1}`,
          base.rowCount,
          base.columnCount
        )
      );

      q.expectedAnswers = expectedAnswers;
      updated[qIndex] = syncAnswerMode(q);

      return updated;
    });
  };

  const removeExpectedAnswerMatrix = (qIndex, answerIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = { ...updated[qIndex] };

      const expectedAnswers = [...(q.expectedAnswers || [])];

      if (expectedAnswers.length <= 1) return prev;

      q.expectedAnswers = expectedAnswers.filter((_, i) => i !== answerIndex);
      updated[qIndex] = syncAnswerMode(q);

      return updated;
    });
  };

  const updateExpectedAnswerLabel = (qIndex, answerIndex, value) => {
    updateExpectedAnswerAt(qIndex, answerIndex, (answer) => ({
      ...answer,
      label: value,
    }));
  };

  const addAnswerRow = (qIndex, answerIndex, value = 1) => {
    updateExpectedAnswerAt(qIndex, answerIndex, (answer) => {
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

  /* ========================================================
     SAVE
  ======================================================== */

  const createOrUpdateQuestionByModel = async (q) => {
    const { questionModel = "Question", _id, ...payload } = q;

    if (questionModel === "Question") {
      if (_id) {
        await updateQuestion(_id, payload);
        return {
          questionId: _id,
          questionModel: "Question",
        };
      }

      const created = await createQuestion(payload);

      return {
        questionId: created._id,
        questionModel: "Question",
      };
    }

    if (questionModel === "MatrixQuestion") {
      if (_id) {
        await updateMatrixQuestion(_id, payload);
        return {
          questionId: _id,
          questionModel: "MatrixQuestion",
        };
      }

      const created = await createMatrixQuestion(payload);

      return {
        questionId: created._id,
        questionModel: "MatrixQuestion",
      };
    }

    throw new Error(`Unknown question model: ${questionModel}`);
  };

  const handleUpdate = async () => {
    try {
      setSaving(true);
      setError("");

      const questionRefs = await Promise.all(
        questions.map((q) => createOrUpdateQuestionByModel(q))
      );

      const updatedQuiz = {
        title,
        description,
        visibility,
        rotation: Number(rotation) || 0,
        questions: questionRefs,
      };

      await updateQuiz(selectedQuiz._id, updatedQuiz);

      navigate("/quizlist");
    } catch (err) {
      console.error("Error updating quiz:", err);
      setError(err?.message || "Error updating quiz.");
    } finally {
      setSaving(false);
    }
  };

  /* ========================================================
     UI
  ======================================================== */

  return (
    <section className="edit-quiz-container">
      <h2>Edit Quiz</h2>

      {error && <div className="edit-quiz-error">{error}</div>}

      <label>Quiz Title</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} />

      <label>Description</label>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <label>Visibility</label>
      <select
        value={visibility}
        onChange={(e) => setVisibility(e.target.value)}
      >
        <option value="private">Private</option>
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
      </select>

      <label>Rotation</label>
      <input
        type="number"
        min="0"
        value={rotation}
        onChange={(e) => setRotation(Number(e.target.value))}
      />

      <h3>Questions</h3>

      <NewQuestionCard
        quizData={{ questions }}
        updateQuestionField={updateQuestionField}
        updateChoiceText={updateChoiceText}
        setCorrectChoice={setCorrectChoice}
        addChoice={addChoice}
        removeChoice={removeChoice}
        removeQuestion={removeQuestion}
        updateDragItemText={updateDragItemText}
        updateDragItemDropbox={updateDragItemDropbox}
        updateDropBoxTitle={updateDropBoxTitle}
        addDragItem={addDragItem}
        removeDragItem={removeDragItem}
        addDropBox={addDropBox}
        removeDropBox={removeDropBox}
        addRow={addRow}
        removeRow={removeRow}
        addColumn={addColumn}
        removeColumn={removeColumn}
        addMatrix={addMatrix}
        removeMatrix={removeMatrix}
        updateMatrixLabel={updateMatrixLabel}
        getDuplicateMatrixLabels={getDuplicateMatrixLabels}
        addExpectedAnswerMatrix={addExpectedAnswerMatrix}
        removeExpectedAnswerMatrix={removeExpectedAnswerMatrix}
        updateExpectedAnswerLabel={updateExpectedAnswerLabel}
        addAnswerRow={addAnswerRow}
        removeAnswerRow={removeAnswerRow}
        addAnswerColumn={addAnswerColumn}
        removeAnswerColumn={removeAnswerColumn}
      />

      <div className="edit-quiz-actions">
        <button type="button" onClick={() => addQuestion("mcq")}>
          Add MCQ
        </button>

        <button type="button" onClick={() => addQuestion("ddq")}>
          Add DDQ
        </button>

        <button type="button" onClick={() => addQuestion("matrix")}>
          Add Matrix
        </button>

        <button type="button" onClick={handleUpdate} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </button>

        <button type="button" onClick={() => navigate("/quizlist")}>
          Cancel
        </button>
      </div>
    </section>
  );
}