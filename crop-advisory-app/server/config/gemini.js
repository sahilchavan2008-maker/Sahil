import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

let ai = null;

if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your-gemini-api-key') {
  ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log('✅ Google GenAI SDK initialized successfully.');
} else {
  console.warn('⚠️ GEMINI_API_KEY is missing or using default placeholder. AI calls will fall back to agronomic heuristic simulator.');
}

export default ai;
