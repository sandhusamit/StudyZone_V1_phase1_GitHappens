import mongoose from "mongoose";

const guestModel = new mongoose.Schema({

   guestId: {
    type: String,
    unique: true,
    required: true,
    },

  name: {
    type: String,
    required: true
  },

  permissions: {
    type: [String],
    default: []
  },

  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  }
});

export default mongoose.model("Guest", guestModel);