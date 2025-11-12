import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema({
    title: String,
    description: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
    createdAt: { type: Date, default: Date.now }
  });
  
    export default mongoose.model("Quiz", QuizSchema, "quizzes");