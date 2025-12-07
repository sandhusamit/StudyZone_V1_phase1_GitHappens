import mongoose from 'mongoose';
import bcrypt from 'bcrypt';


const userModel = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  otpSecret: {
    type: String,
    default: null,
  },
  is2FAEnabled: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving
userModel.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    this.password = await bcrypt.hash(this.password, 10); // Hashing
  }
  next();
});

// Method to compare password
userModel.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

export default mongoose.model('User', userModel, 'users');
