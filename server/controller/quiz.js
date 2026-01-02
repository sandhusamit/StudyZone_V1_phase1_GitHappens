import QuizSchema from '../model/quizModel.js';
import QuestionSchema from '../model/questionModel.js';
import mongoose from 'mongoose';
import express from 'express';


// Create Quiz

export const createQuiz = async (req, res) => {
  try {
    const quiz = new QuizSchema(req.body);
    await quiz.save();
    res.status(201).json(quiz);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};


// READ all quizzes
export const getAllQuizzes = async (req, res) => {
  try {
    const quizzes = await QuizSchema.find().populate('author', 'name').populate('questions');
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllPublicQuizzes = async (req, res) => {
  try {
    const quizzes = await QuizSchema.find({ visibility: { $in: ['public'] }
    })
      .populate('author', 'name')
      .populate('questions');
    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

// READ a single quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const quiz = await QuizSchema.findById(req.params.id)
      .populate('author', 'name')
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
      { new: true, runValidators: true },
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
    const userId = req.user.id; // from JWT
    const quizId = req.params.id;

    console.log(`User ${userId} is attempting to delete quiz ${quizId}`);

    const quiz = await QuizSchema.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    console.log("Quiz ownership:", quiz.author.toString());
    // 🔐 Ownership check
    if (quiz.author.toString() !== userId) {
      return res.status(403).json({ message: "Not authorized to delete this quiz" });
    }

    await quiz.deleteOne();

    res.status(200).json({ message: "Quiz deleted successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




export const getAllQuizzesByAuthorId = async (req, res) => {
  try {
    const { authorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(authorId)) {
      return res.status(400).json({ message: 'Invalid author ID' });
    }

    const quizzes = await QuizSchema.find({ author: authorId })
      .populate('author', 'name')
      .populate('questions');

    res.status(200).json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to fetch quizzes' });
  }
};

