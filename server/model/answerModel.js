import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    answer: String
  });
  

export default mongoose.model('Answer', AnswerSchema, 'answers');