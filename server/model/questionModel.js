import mongoose from "mongoose";

const ChoiceSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false }
);

const DragItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    dropboxId: { type: String, required: true },
  },
  { _id: false }
);

const DropboxSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true },
  },
  { _id: false }
);

const QuestionSchema = new mongoose.Schema({
  questionType: {
    type: String,
    enum: ["mcq", "ddq"],
    default: "mcq",
    required: true,
    index: true,
  },

  text: { type: String, required: true },

  points: { type: Number, default: 1 },

  explanation: { type: String, default: "" },

  subject: {
    type: String,
    enum: ["Math", "SWE", "Data", "General"],
    default: "General",
    index: true,
  },

  // MCQ
  choices: {
    type: [ChoiceSchema],
    default: undefined,
  },

  // DDQ
  dragItems: {
    type: [DragItemSchema],
    default: undefined,
  },

  dropboxes: {
    type: [DropboxSchema],
    default: undefined,
  },
});

export default mongoose.model("Question", QuestionSchema, "questions");