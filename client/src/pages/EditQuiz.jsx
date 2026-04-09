import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import "./styles/EditQuiz.css";
import NewQuestionCard from "client/src/components/CreateQuiz/Steps/Step2/NewQuestionCard.jsx";

export default function EditQuiz() {
  const { state } = useLocation();  
  const navigate = useNavigate();
  const { updateQuiz, createQuestion, updateQuestion } = useAuth();

  const selectedQuiz = state?.quiz;

  const [title, setTitle] = useState(selectedQuiz?.title || "");
  const [description, setDesc] = useState(selectedQuiz?.description || "");
  const [visibility, setVisibility] = useState(selectedQuiz?.visibility || "private");

  const makeId = (prefix) =>
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const [questions, setQuestions] = useState(
    (selectedQuiz?.questions || []).map((q) => {
      if (q.questionType === "ddq") {
        return {
          ...q,
          dragItems: q.dragItems || [
            { id: makeId("item"), text: "", dropboxId: "" }
          ],
          dropboxes: q.dropboxes || [
            { id: makeId("box"), title: "" }
          ]
        };
      }

      return {
        ...q,
        questionType: "mcq",
        choices: q.choices || [{ text: "", isCorrect: false }]
      };
    })
  );

  if (!selectedQuiz) return <p>No quiz found.</p>;

  /* ========================================================
     HANDLERS (REQUIRED FOR NewQuestionCard)
  ======================================================== */

  const updateQuestionField = (qIndex, field, value) => {
    const updated = [...questions];
    updated[qIndex][field] = value;
    setQuestions(updated);
  };

  const handleChoiceChange = (qIndex, cIndex, newText) => {
    const updated = [...questions];
    updated[qIndex].choices[cIndex].text = newText;
    setQuestions(updated);
  };

  const handleCorrectChoice = (qIndex, cIndex) => {
    const updated = [...questions];
    updated[qIndex].choices = updated[qIndex].choices.map((c, i) => ({
      ...c,
      isCorrect: i === cIndex
    }));
    setQuestions(updated);
  };

  const addChoice = (qIndex) => {
    const updated = [...questions];
    updated[qIndex].choices.push({ text: "", isCorrect: false });
    setQuestions(updated);
  };

  const removeChoice = (qIndex, cIndex) => {
    const updated = [...questions];
    if (updated[qIndex].choices.length > 1) {
      updated[qIndex].choices.splice(cIndex, 1);
      setQuestions(updated);
    }
  };
    /* ================= DDQ ================= */

  const addDragItem = (qIndex) => {
    const updated = [...questions];
    const question = updated[qIndex];
    const defaultBoxId = question.dropboxes[0]?.id || "";

    question.dragItems.push({
      id: makeId("item"),
      text: "",
      dropboxId: defaultBoxId,
    });

    setQuestions(updated);
  };

  const removeDragItem = (qIndex, itemIndex) => {
    const updated = [...questions];
    updated[qIndex].dragItems.splice(itemIndex, 1);
    setQuestions(updated);
  };

  const updateDragItemText = (qIndex, itemIndex, value) => {
    const updated = [...questions];
    updated[qIndex].dragItems[itemIndex].text = value;
    setQuestions(updated);
  };

  const updateDragItemDropbox = (qIndex, itemIndex, dropboxId) => {
    const updated = [...questions];
    updated[qIndex].dragItems[itemIndex].dropboxId = dropboxId;
    setQuestions(updated);
  };

  const addDropBox = (qIndex) => {
    const updated = [...questions];

    updated[qIndex].dropboxes.push({
      id: makeId("box"),
      title: "",
    });

    setQuestions(updated);
  };

  const removeDropBox = (qIndex, boxIndex) => {
    const updated = [...questions];
    const question = updated[qIndex];

    if (question.dropboxes.length <= 1) return;

    const removedBoxId = question.dropboxes[boxIndex].id;

    question.dropboxes.splice(boxIndex, 1);

    const fallbackId = question.dropboxes[0]?.id || "";

    question.dragItems = question.dragItems.map((item) => ({
      ...item,
      dropboxId:
        item.dropboxId === removedBoxId ? fallbackId : item.dropboxId,
    }));

    setQuestions(updated);
  };

  const updateDropBoxTitle = (qIndex, boxIndex, value) => {
    const updated = [...questions];
    updated[qIndex].dropboxes[boxIndex].title = value;
    setQuestions(updated);
  };

  

  const removeQuestion = (qIndex) => {
    const updated = [...questions];
    updated.splice(qIndex, 1);
    setQuestions(updated);
  };

  const addQuestion = (type = "mcq") => {
    if (type === "ddq") {
      const box1 = makeId("box");
      const box2 = makeId("box");

      setQuestions([
        ...questions,
        {
          questionType: "ddq",
          text: "",
          points: 1,
          explanation: "",
          dragItems: [
            { id: makeId("item"), text: "", dropboxId: box1 }
          ],
          dropboxes: [
            { id: box1, title: "" },
            { id: box2, title: "" }
          ]
        }
      ]);
    } else {
      setQuestions([
        ...questions,
        {
          questionType: "mcq",
          text: "",
          points: 1,
          choices: [{ text: "", isCorrect: false }]
        }
      ]);
    }
  };

  /* ========================================================
     SAVE
  ======================================================== */
  const handleUpdate = async () => {
    try {
      const questionIds = await Promise.all(
        questions.map(async (q) => {
          if (q._id) {
            await updateQuestion(q._id, q);
            return q._id;
          } else {
            const created = await createQuestion(q);
            return created._id;
          }
        })
      );

      const updatedQuiz = {
        title,
        description,
        visibility,
        questions: questionIds,
      };

      await updateQuiz(selectedQuiz._id, updatedQuiz);
      navigate("/quizlist");

    } catch (err) {
      console.error("Error updating quiz:", err);
    }
  };

  /* ========================================================
     UI
  ======================================================== */
  return (
    <section className="edit-quiz-container">
      <h2>Edit Quiz</h2>

      <label>Quiz Title</label>
      <input value={title} onChange={e => setTitle(e.target.value)} />

      <label>Description</label>
      <textarea value={description} onChange={e => setDesc(e.target.value)} />

      <label>Visibility</label>
      <select value={visibility} onChange={(e) => setVisibility(e.target.value)}>
        <option value="private">Private</option>
        <option value="public">Public</option>
        <option value="unlisted">Unlisted</option>
      </select>

      <h3>Questions</h3>

      {/* ✅ REUSED COMPONENT */}
      <NewQuestionCard
        quizData={{ questions }}

        updateQuestionField={updateQuestionField}

        updateChoiceText={(qIndex, cIndex, text) =>
          handleChoiceChange(qIndex, cIndex, text)
        }

        setCorrectChoice={handleCorrectChoice}

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
      />

      <button onClick={() => addQuestion("mcq")}>Add MCQ</button>
      <button onClick={() => addQuestion("ddq")}>Add DDQ</button>      
      <button onClick={handleUpdate}>Save Changes</button>
      <button onClick={() => navigate("/quizlist")}>Cancel</button>
    </section>
  );
}