import { OpenAI } from 'openai';
import 'dotenv/config';

export const interfaze = new OpenAI({
  apiKey: process.env.INTERFAZE_API_KEY,
  baseURL: 'https://api.interfaze.ai/v1',
});


export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: 'https://api.openai.com/v1',
});