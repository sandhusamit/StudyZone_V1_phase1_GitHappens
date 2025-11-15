import QuestionSchema from '../model/questionModel.js';
import express from "express";

// CREATE a new question
export const createQuestion = async (req, res) => {
  try {
    const { text, choices, points } = req.body;
    const newQuestion = new QuestionSchema({ text, choices, points });
    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ all questions
export const getAllQuestions = async (req, res) => {
  try {
    const questions = await QuestionSchema.find();
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ a single question by ID
export const getQuestionById = async (req, res) => {
  try {
    const question = await QuestionSchema.findById(req.params.id);
    if (!question) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE a question by ID
export const updateQuestion = async (req, res) => {
  try {
    const { text, choices, points } = req.body;
    const updatedQuestion = await QuestionSchema.findByIdAndUpdate(
      req.params.id,
      { text, choices, points },
      { new: true, runValidators: true }
    );
    if (!updatedQuestion) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE a question by ID
export const deleteQuestion = async (req, res) => {
  try {
    const deletedQuestion = await QuestionSchema.findByIdAndDelete(req.params.id);
    if (!deletedQuestion) return res.status(404).json({ message: 'Question not found' });
    res.status(200).json({ message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
