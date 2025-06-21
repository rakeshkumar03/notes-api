// server.js
require('dotenv').config();              // if you have a local .env in dev
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const Note     = require('./models/Note');

const app  = express();
const PORT = process.env.PORT || 3000;

// 1) Build the Mongo URI from env or fallback
const mongoUri =
  process.env.MONGODB_URI ||            // Railway’s or Atlas URI
  process.env.MONGO_URL   ||            // alternative name, if set
  'mongodb://localhost:27017/notesdb';  // local dev fallback

console.log('⚙️  Connecting to MongoDB at:', mongoUri);
mongoose
  .connect(mongoUri)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  });

// 2) Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',      // your React dev server
    methods: ['GET','POST','PUT','DELETE'],
    allowedHeaders: ['Content-Type']
  })
);

// 3) Routes

// GET /notes
app.get('/notes', async (req, res, next) => {
  try {
    const notes = await Note.find().sort('-createdAt');
    res.json(notes);
  } catch (err) {
    next(err);
  }
});

// POST /notes
app.post('/notes', async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.create({ title, content });
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /notes/:id
app.put('/notes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const updated = await Note.findByIdAndUpdate(
      id,
      { title, content },
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /notes/:id
app.delete('/notes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleted = await Note.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// 4) Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// 5) Start the server
app.listen(PORT, () => {
  console.log(`🚀 Notes API listening on port ${PORT}`);
});
