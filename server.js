// server.js
const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const Note     = require('./models/Note');

const app  = express();
const PORT = process.env.PORT || 3000;

// 1) Connect to MongoDB
const mongoUri =
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/notesdb';
console.log('⚙️ Connecting to MongoDB at:', mongoUri);
mongoose
  .connect(mongoUri)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB error:', err);
    process.exit(1);
  });

// 2) CORS middleware — allow both local dev and your Vercel URL
const allowedOrigins = [
  'http://localhost:3000',
  'https://notes-ui.vercel.app'
];

app.use(express.json());
app.use(
  cors({
    origin: function(origin, callback) {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      callback(new Error('CORS policy: This origin is not allowed.'));
    },
    methods: ['GET','POST','PUT','DELETE'],
    allowedHeaders: ['Content-Type']
  })
);

// 3) Routes
app.get('/notes', async (req, res, next) => {
  try {
    const notes = await Note.find().sort('-createdAt');
    res.json(notes);
  } catch (err) {
    next(err);
  }
});

app.post('/notes', async (req, res) => {
  try {
    const { title, content } = req.body;
    const note = await Note.create({ title, content });
    res.status(201).json(note);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/notes/:id', async (req, res, next) => {
  try {
    const updated = await Note.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

app.delete('/notes/:id', async (req, res, next) => {
  try {
    const deleted = await Note.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.sendStatus(204);
  } catch (err) {
    next(err);
  }
});

// 4) Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  // Send CORS errors as 403 rather than 500
  if (err.message && err.message.startsWith('CORS policy')) {
    return res.status(403).json({ error: err.message });
  }
  res.status(500).json({ error: 'Internal server error' });
});

// 5) Start server
app.listen(PORT, () => {
  console.log(`🚀 Notes API listening on port ${PORT}`);
});
