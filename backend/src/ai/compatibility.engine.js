const geminiModel = require('./gemini.client');
const { generatePrompt } = require('./prompts/compatibility.prompt');
const logger = require('../utils/logger');

async function computeAICompatibility(tenant, listing) {
  if (!geminiModel) {
    throw new Error('Gemini model is not initialized (GEMINI_API_KEY missing)');
  }

  const promptText = generatePrompt(tenant, listing);
  
  logger.info(`Sending compatibility request to Gemini model for Listing: ${listing.id} & Tenant: ${tenant.id}`);
  
  const result = await geminiModel.generateContent({
    contents: [{ role: 'user', parts: [{ text: promptText }] }],
    generationConfig: {
      responseMimeType: 'application/json',
    }
  });
  const responseText = result.response.text();

  if (!responseText) {
    throw new Error('Empty response received from Gemini API');
  }

  // Clean markdown tags (like ```json ... ```) to extract the pure JSON string
  let cleanedJsonText = responseText.trim();
  
  // Strip opening codeblock markdown
  if (cleanedJsonText.startsWith('```')) {
    cleanedJsonText = cleanedJsonText.replace(/^```[a-zA-Z]*\s*/, '');
  }
  // Strip closing codeblock markdown
  if (cleanedJsonText.endsWith('```')) {
    cleanedJsonText = cleanedJsonText.replace(/\s*```$/, '');
  }

  cleanedJsonText = cleanedJsonText.trim();

  // Find the first '{' and last '}' to strip any external text
  const startBraceIndex = cleanedJsonText.indexOf('{');
  const endBraceIndex = cleanedJsonText.lastIndexOf('}');
  
  if (startBraceIndex !== -1 && endBraceIndex !== -1 && endBraceIndex > startBraceIndex) {
    cleanedJsonText = cleanedJsonText.slice(startBraceIndex, endBraceIndex + 1);
  }

  const parsedData = JSON.parse(cleanedJsonText);

  // Validate parsed data structure
  const score = parseInt(parsedData.score, 10);
  if (isNaN(score) || score < 0 || score > 100) {
    throw new Error(`Invalid compatibility score parsed: ${parsedData.score}`);
  }

  return {
    score,
    explanation: parsedData.explanation || 'Analyzed matching parameters using artificial intelligence.',
    pros: Array.isArray(parsedData.pros) ? parsedData.pros : [],
    cons: Array.isArray(parsedData.cons) ? parsedData.cons : [],
  };
}

module.exports = { computeAICompatibility };
