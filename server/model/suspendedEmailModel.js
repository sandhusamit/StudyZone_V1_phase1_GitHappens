import mongoose from "mongoose";

const SuspendedEmailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  attempts: { type: Number, default: 1 },
  lastAttempt: { type: Date, default: Date.now },
  reason: String,

  // TTL field
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 60 * 60 * 1000),
    index: { expires: 0 } // ⬅️ THIS enables auto-delete
  }
});

export default mongoose.model('SusEmail', SuspendedEmailSchema);
