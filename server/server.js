//Libraries used
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import app from './middleware/express.js';
import assetRouter from './routes/assets-router.js';
import router from './routes/collections-router.js';
import { connect } from 'mongoose';
dotenv.config({ path: path.resolve('./.env') }); //load environment variables from .env file

//Connect to mongoDB using mongoose 
mongoose.connect(process.env.MONGODB_URI); //save environment variable 
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});
connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

//const assetsRouter = require("./server/assets-router");
app.use('/src', router);
app.use('/', router);
app.use('/api/data', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});
app.listen(3000);
console.log('Server running at http://localhost:3000/');

export default app;
