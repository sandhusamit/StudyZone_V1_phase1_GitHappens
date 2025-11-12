import Answer from '../model/answerModel.js';
import express from "express";

// CREATE a new answer
export const createAnswer = async (req, res) => {
  try {
    const { user, question, answer } = req.body;
    const newAnswer = new AnswerSchema({ user, question, answer });
    const savedAnswer = await newAnswer.save();
    res.status(201).json(savedAnswer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ all answers
export const getAllAnswers = async (req, res) => {
  try {
    const answers = await AnswerSchema.find()
      .populate('user', 'name email')
      .populate('question', 'text');
    res.status(200).json(answers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// READ a single answer by ID
export const getAnswerById = async (req, res) => {
  try {
    const answer = await AnswerSchema.findById(req.params.id)
      .populate('user', 'name email')
      .populate('question', 'text');
    if (!answer) return res.status(404).json({ message: 'Answer not found' });
    res.status(200).json(answer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE an answer by ID
export const updateAnswer = async (req, res) => {
  try {
    const { answer } = req.body;
    const updatedAnswer = await AnswerSchema.findByIdAndUpdate(
      req.params.id,
      { answer },
      { new: true, runValidators: true }
    );
    if (!updatedAnswer) return res.status(404).json({ message: 'Answer not found' });
    res.status(200).json(updatedAnswer);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE an answer by ID
export const deleteAnswer = async (req, res) => {
  try {
    const deletedAnswer = await AnswerSchema.findByIdAndDelete(req.params.id);
    if (!deletedAnswer) return res.status(404).json({ message: 'Answer not found' });
    res.status(200).json({ message: 'Answer deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
