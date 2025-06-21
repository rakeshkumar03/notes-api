// models/Note.js
const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema(
  {
    title:   { type: String, required: true, trim: true },
    content: { type: String, required: true, trim: true }
  },
  { timestamps: false }
);

// Expose `id` as a virtual (optional)
noteSchema.set('toJSON', {
  virtuals: true,
  transform(doc, ret) {
    ret.id = ret._id;        // add `id`
    delete ret._id;          // remove `_id`
    delete ret.__v;
    // keep createdAt/updatedAt or remove:
    delete ret.createdAt;
    delete ret.updatedAt;
  }
});

module.exports = mongoose.model('Note', noteSchema);
