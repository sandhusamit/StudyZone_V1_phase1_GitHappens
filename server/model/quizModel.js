import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  
  // Reference to User model
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  
  // Array of references to Question model
  questions: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: "questions.questionModel"
      },
      questionModel: {
        type: String,
        required: true,
        enum: ["Question", "MatrixQuestion"]
      }
    }
  ],
  visibility: {
    type: String,
    enum: ["public", "unlisted", "private"],
    default: "private",
    index: true
  },
  rotation: { 
    type: Number,
  }, 
  

});

export default mongoose.model("Quiz", QuizSchema, "quizzes");
