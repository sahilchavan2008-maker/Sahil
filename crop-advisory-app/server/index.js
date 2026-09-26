import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import farmRoutes from './routes/farmRoutes.js';
import advisoryRoutes from './routes/advisoryRoutes.js';
import { isLiveSupabase } from './config/supabase.js';
import ai from './config/gemini.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// CORS Configuration
app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:3000', 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// General Rate Limiter
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api', generalLimiter);

// Specific Rate Limiter for AI Advisory creation to prevent abuse
const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 30, // 30 diagnoses per 10 mins
  message: { error: 'Crop diagnosis rate limit reached. Please wait a few minutes before submitting another case.' }
});
app.use('/api/advisories', (req, res, next) => {
  if (req.method === 'POST') {
    return aiLimiter(req, res, next);
  }
  next();
});

// JSON and URL-encoded parsers
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'operational',
    service: 'AI Crop Advisory Assistant API',
    supabaseConnected: isLiveSupabase,
    geminiInitialized: Boolean(ai),
    activeModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/farms', farmRoutes);
app.use('/api/advisories', advisoryRoutes);

// 404 Route Handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint Not Found', path: req.originalUrl });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.name || 'InternalServerError',
    message: err.message || 'An unexpected error occurred on the server.'
  });
});

app.listen(PORT, () => {
  console.log(`🌾 AI Crop Advisory Server running on http://localhost:${PORT}`);
  console.log(`📡 Ready to accept requests from ${CLIENT_URL}`);
});
