//CRUD USERS
import generateToken from '../utils/jwt.js';
import express from 'express';
import userModel from '../model/userModel.js';

//  READ all users
export const getAllUsers = async (req, res) => {
  try {
    const msg = await userModel.find();
    console.log(msg);
    res.status(200).json(msg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ a single user by ID
export const getUserById = async (req, res) => {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CREATE a new user
export const createUser = async (req, res) => {
  try {
    const newUser = new userModel(req.body);
    const savedUser = await newUser.save();

    const token = generateToken(savedUser);

    res.status(200).json({ message: 'User registered successfully', user: savedUser, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE an existing user by ID
export const updateUserById = async (req, res) => {
  try {
    const user = await userModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//DELETE a user by ID
export const deleteUserById = async (req, res) => {
  try {
    const deletedUser = await userModel.findByIdAndDelete(req.params.id);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Delete all users
export const deleteAllUsers = async (req, res) => {
  try {
    const result = await userModel.deleteMany({});
    res.status(200).json({ message: `${result.deletedCount} users deleted successfully` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Login user
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = generateToken(user); // your JWT function
    return res.status(200).json({ message: 'User logged in successfully', user, token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

