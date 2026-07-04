const express = require('express');
const router = express.Router();
const Signup = require('../models/Signup');
const { sendWelcomeEmail, sendFounderNotification } = require('../services/email');

function isValidEgyptianNumber(num) {
  return /^01[0-2,5]{1}[0-9]{8}$/.test(num);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// POST /api/signup
router.post('/', async (req, res) => {
  const { name, whatsapp, email } = req.body;

  const cleanName = (name || '').trim();
  const cleanWhatsApp = (whatsapp || '').trim().replace(/\s/g, '');
  const cleanEmail = (email || '').trim().toLowerCase() || null;

  // Validation
  if (!cleanName || cleanName.length < 3) {
    return res.status(400).json({ success: false, message: 'من فضلك أدخل اسمك الكامل.' });
  }

  if (!cleanWhatsApp || !isValidEgyptianNumber(cleanWhatsApp)) {
    return res.status(400).json({ success: false, message: 'من فضلك أدخل رقم واتساب مصري صحيح (01xxxxxxxxx).' });
  }

  if (cleanEmail && !isValidEmail(cleanEmail)) {
    return res.status(400).json({ success: false, message: 'الإيميل اللي أدخلته غير صحيح.' });
  }

  try {
    const existing = await Signup.findOne({ whatsapp: cleanWhatsApp });
    if (existing) {
      return res.status(409).json({ success: false, message: 'الرقم ده مسجل بالفعل.' });
    }

    const signup = await Signup.create({
      name: cleanName,
      whatsapp: cleanWhatsApp,
      email: cleanEmail,
    });

    // Send emails non-blocking
    if (cleanEmail) {
      sendWelcomeEmail({ name: cleanName, email: cleanEmail })
        .catch((err) => console.error('Welcome email failed:', err));
    }

    sendFounderNotification({
      name: cleanName,
      whatsapp: cleanWhatsApp,
      email: cleanEmail,
      createdAt: signup.createdAt,
    }).catch((err) => console.error('Founder notification failed:', err));

    return res.status(201).json({ success: true, message: 'تم تسجيلك بنجاح!' });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ success: false, message: 'الرقم ده مسجل بالفعل.' });
    }
    console.error('Signup route error:', err);
    return res.status(500).json({ success: false, message: 'حصلت مشكلة من جانبنا. حاول تاني بعد شوية.' });
  }
});

module.exports = router;
