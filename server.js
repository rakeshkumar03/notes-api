// server.js
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const Note     = require('./models/Note');

const app  = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose
  .connect('mongodb://localhost:27017/notesdb')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Middleware
app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',      // React runs on 3001
    methods: ['GET','POST','PUT','DELETE'],
    allowedHeaders: ['Content-Type']
  })
);

// Routes

// GET /notes
app.get('/notes', async (req, res, next) => {
  try {
    const notes = await Note.find().sort('-createdAt').lean();
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

// DELETE /notes/:id
app.delete('/notes/:id', async (req, res, next) => {
  try {
    const deleted = await Note.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Notes API listening on port ${PORT}`);
});
