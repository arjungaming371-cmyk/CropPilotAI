import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY || '';

if (!apiKey) {
  console.warn('⚠️ Warning: GEMINI_API_KEY is not configured yet in server/.env');
}

export const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;
export const GEMINI_MODEL = 'gemini-2.5-flash';
