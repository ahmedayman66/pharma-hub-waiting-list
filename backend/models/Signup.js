const mongoose = require('mongoose');

const signupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'الاسم مطلوب'],
    trim: true,
    minlength: [3, 'الاسم قصير جدًا'],
  },
  whatsapp: {
    type: String,
    required: [true, 'رقم الواتساب مطلوب'],
    unique: true,
    trim: true,
    match: [/^01[0-2,5]{1}[0-9]{8}$/, 'رقم واتساب غير صحيح'],
  },
  email: {
    type: String,
    required: false,
    trim: true,
    lowercase: true,
    default: null,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'إيميل غير صحيح'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Signup', signupSchema);
