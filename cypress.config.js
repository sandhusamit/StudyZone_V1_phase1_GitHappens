import { defineConfig } from "cypress";
import mongoose from 'mongoose';
import { connect } from 'mongoose';
import dotenv from 'dotenv';
import 'dotenv/config'; // ESM style

// Models
import Quiz from 'C:/Development/Web-Applications/StudyZone_V1_phase1_GitHappens/server/model/quizModel.js';
import Question from 'C:/Development/Web-Applications/StudyZone_V1_phase1_GitHappens/server/model/questionModel.js';

//Connect to mongoDB using mongoose 
mongoose.connect(process.env.MONGODB_URI); //save environment variable 
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});
connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

export default defineConfig({
  e2e: {
      env: {
      email: process.env.CYPRESS_EMAIL,
      password: process.env.CYPRESS_PASSWORD,
    },

    setupNodeEvents(on, config) {

      on('task', {

        async deleteQuiz(quizId) {
          try {
            if (!quizId) {
              throw new Error("No quizId provided");
            }

            // 1. Delete all questions linked to this quiz
            await Question.deleteMany({ quizId: quizId });

            // 2. Delete the quiz itself
            await Quiz.findByIdAndDelete(quizId);

            console.log(`Deleted quiz ${quizId} and its questions`);

            return null; // Cypress requires something returned

          } catch (err) {
            console.error("deleteQuiz failed:", err);
            throw err;
          }
        }

      });

    },
    baseUrl: 'http://localhost:3000',
    experimentalStudio: true,

  },
  });