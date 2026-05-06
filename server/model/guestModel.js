import mongoose from "mongoose";

const guestModel = new mongoose.Schema({

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
  },

  referredBy: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    default: null 
  },
  

});

export default mongoose.model("Guest", guestModel);