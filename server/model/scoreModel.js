import mongoose from "mongoose";

const ScoreSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    guest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Guest",
    },

    // store as decimal (0.85 = 85%)
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // only createdAt
  }
);

export default mongoose.model("Score", ScoreSchema, "scores");