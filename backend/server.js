require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const signupRouter = require('./routes/signup');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Body parsing ──────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ── CORS ──────────────────────────────────────────────
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:3000',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin}`));
      }
    },
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type'],
  }),
);

// ── Basic security headers ────────────────────────────
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ── Rate limiting (simple in-memory) ─────────────────
const rateLimitMap = new Map();
function rateLimit(windowMs, max) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record || now - record.start > windowMs) {
      rateLimitMap.set(ip, { count: 1, start: now });
      return next();
    }

    record.count++;
    if (record.count > max) {
      return res.status(429).json({
        success: false,
        message: 'محاولات كتير. استنى شوية وحاول تاني.',
      });
    }
    next();
  };
}

// ── Routes ────────────────────────────────────────────
app.use('/api/signup', rateLimit(15 * 60 * 1000, 5), signupRouter);

// Stats endpoint
app.get('/api/stats', async (req, res) => {
  try {
    const Signup = require('./models/Signup');
    const totalSignups = await Signup.countDocuments();
    const totalSeats = 500;
    const remainingSeats = Math.max(0, totalSeats - totalSignups);
    const percent = Math.floor((totalSignups / totalSeats) * 100);

    res.json({
      success: true,
      totalSignups,
      totalSeats,
      remainingSeats,
      percent,
    });
  } catch (err) {
    console.error('Stats error:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime(),
  });
});

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

// ── Connect & Start ───────────────────────────────────
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`   Health: http://localhost:${PORT}/health`);
      console.log(`   Stats:  http://localhost:${PORT}/api/stats`);
    });
  })
  .catch((err) => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });
