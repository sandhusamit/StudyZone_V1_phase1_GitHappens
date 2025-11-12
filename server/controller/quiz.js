import QuizSchema from '../model/quizModel.js';
import express from "express";

// CREATE a new quiz
export const createQuiz = async (req, res) => {
  try {
    const { title, description, author, questions } = req.body;
    const newQuiz = new QuizSchema({ title, description, author, questions });
    const savedQuiz = await newQuiz.save();
    res.status(201).json(savedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ all quizzes
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await QuizSchema.find()
      .populate('author', 'name email')
      .populate('questions');
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ a single quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const quiz = await QuizSchema.findById(req.params.id)
      .populate('author', 'name email')
      .populate('questions');
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a quiz by ID
export const updateQuiz = async (req, res) => {
  try {
    const { title, description, questions } = req.body;
    const updatedQuiz = await QuizSchema.findByIdAndUpdate(
      req.params.id,
      { title, description, questions },
      { new: true, runValidators: true }
    );
    if (!updatedQuiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json(updatedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a quiz by ID
export const deleteQuiz = async (req, res) => {
  try {
    const deletedQuiz = await QuizSchema.findByIdAndDelete(req.params.id);
    if (!deletedQuiz) return res.status(404).json({ message: 'Quiz not found' });
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

