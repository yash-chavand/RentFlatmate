const { GoogleGenerativeAI } = require('@google/generative-ai');
const env = require('../config/env');
const logger = require('../utils/logger');

let model = null;

if (env.GEMINI_API_KEY) {
  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  model = genAI.getGenerativeModel({ model: env.GEMINI_MODEL });
  logger.info(`Gemini AI Client initialized successfully using model: ${env.GEMINI_MODEL}`);
} else {
  logger.warn('GEMINI_API_KEY is not set. AI compatibility matching will default to fallback engine.');
}

module.exports = model;
