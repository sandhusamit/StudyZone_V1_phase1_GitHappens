import QuestionSchema from '../model/questionModel.js';
import MatrixQuestionSchema from '../model/matrixQuestionModel.js';
import express from "express";

// CREATE a new question
export const createQuestion = async (req, res) => {
  try {
    const { text, choices, points, explanation, subject, questionType, dragItems, dropboxes } = req.body;

    const newQuestion = new QuestionSchema({ text, choices, points, explanation, subject, questionType, dragItems, dropboxes });
    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// Create Matrix Question
export const createMatrixQuestion = async (req, res) => {
  try {
    const matrixQuestion = await MatrixQuestionSchema.create(req.body);

    res.status(201).json(matrixQuestion);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// READ all questions (Matrices and regular questions combined)
export const getAllQuestions = async (req, res) => {
  try {
    const [questions, matrixQuestions] = await Promise.all([
      QuestionSchema.find(),
      MatrixQuestionSchema.find(),
    ]);

    const normalizedQuestions = questions.map((q) => ({
      ...q.toObject(),
      questionModel: "Question",
    }));

    const normalizedMatrixQuestions = matrixQuestions.map((q) => ({
      ...q.toObject(),
      questionModel: "MatrixQuestion",
    }));

    const combined = [
      ...normalizedQuestions,
      ...normalizedMatrixQuestions,
    ];
    combined.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.status(200).json(combined);
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
    const { text, choices, points, explanation, subject, dragItems, dropboxes } = req.body;
    const updatedQuestion = await QuestionSchema.findByIdAndUpdate(
      req.params.id,
      { text, choices, points, explanation, subject, dragItems, dropboxes },
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

export const deleteAllQuestions = async (req, res) => {
  try {
    await QuestionSchema.deleteMany({});
    res.status(200).json({ message: 'All questions deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  } 
};


// Enter the Matrix
export const getMatrixQuestionById = async (req, res) => {
  try {
    const matrixQuestion = await MatrixQuestionSchema.findById(req.params.matrixId);
    if (!matrixQuestion) return res.status(404).json({ message: 'Matrix question not found' });
    res.status(200).json(matrixQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



