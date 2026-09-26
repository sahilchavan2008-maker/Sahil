import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import pantryRoutes from './routes/pantryRoutes.js';
import plannerRoutes from './routes/plannerRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { isMockSupabase } from './config/supabase.js';
import { hasGeminiKey } from './config/gemini.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Allow frontend development clients
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    mode: isMockSupabase ? 'demo-fallback' : 'production-supabase',
    geminiActive: hasGeminiKey,
    timestamp: new Date().toISOString()
  });
});

// Protected API routes
app.use('/api/pantry', pantryRoutes);
app.use('/api/planner', plannerRoutes);
app.use('/api/ai', aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint not found: ${req.method} ${req.originalUrl}`
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal server error occurred'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Anti-Fatigue Meal Assistant API running on port ${PORT}`);
  console.log(`📡 Supabase Mode: ${isMockSupabase ? 'Mock / Demo In-Memory' : 'Connected to Supabase'}`);
  console.log(`✨ Gemini AI: ${hasGeminiKey ? 'Active with API Key' : 'Smart Rule-Based Fallback'}`);
});

export default app;
