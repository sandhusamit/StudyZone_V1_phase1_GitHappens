import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
    text: String,
    choices: [{ text: String, isCorrect: Boolean }],
    points: { type: Number, default: 1 }
  });
  

export default mongoose.model("Question", QuestionSchema, "questions");