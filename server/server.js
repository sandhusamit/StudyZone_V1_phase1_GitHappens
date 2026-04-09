//Libraries used
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import 'dotenv/config'; // ESM style

import path from 'path';
import { fileURLToPath } from "url";
import app from './middleware/express.js';
import assetRouter from './routes/assets-router.js';
import router from './routes/collections-router.js';
import { connect } from 'mongoose';
dotenv.config({ path: path.resolve('./.env') }); //load environment variables from .env file
import cors from 'cors';

//Navigation helpers
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Allow all origins (for testing)
app.use(cors());

// OR, allow only your frontend origin:
app.use(cors({ origin: 'http://localhost:5173' }));

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


// Serve frontend
const clientPath = path.join(__dirname, "../client/dist");
app.use(express.static(clientPath));

// Catch-all for frontend routes (SPA)
app.get(/^(?!\/api).*$/, (req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});


app.use('/api/data', (req, res) => {
  res.json({ message: 'Hello from the backend!' });
});

app.listen(3000);
console.log('Server running at http://localhost:3000/');

export default app;
