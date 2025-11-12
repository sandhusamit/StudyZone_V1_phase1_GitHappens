const ScoreSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
    score: Number,
    responses: [{ questionId: mongoose.Schema.Types.ObjectId, chosenIndex: Number }],
    createdAt: { type: Date, default: Date.now }
  });
  
  export default mongoose.model("Score", ScoreSchema, "scores");