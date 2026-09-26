import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const hasGeminiKey = Boolean(apiKey && apiKey.length > 5);
