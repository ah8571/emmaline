/**
 * AI service for responses and summarization
 */

import { OpenAI } from 'openai';

const SYSTEM_PROMPT = [
  'You are Emmaline, a concise voice-first AI phone assistant.',
  'You help users think out loud, organize ideas, and capture actionable notes.',
  'Respond naturally for spoken conversation, keep replies brief, and ask one focused follow-up when useful.',
  'Use plain conversational text only. Never use markdown, asterisks, bullet symbols, numbered lists, or code fences.'
].join(' ');

let openaiClient = null;

const getOpenAIClient = () => {
  if (openaiClient) {
    return openaiClient;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured');
  }

  openaiClient = new OpenAI({ apiKey });
  return openaiClient;
};

const getChatModel = () => process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini';
const getSummaryModel = () => process.env.OPENAI_SUMMARY_MODEL || getChatModel();

const getLanguageInstruction = (languagePreference) => {
  return String(languagePreference || '').toLowerCase().startsWith('es')
    ? 'Respond in Spanish.'
    : 'Respond in English.';
};

export const sanitizeSpokenResponse = (value) => {
  return String(value || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^\s*#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[\*_~]/g, '')
    .replace(/\[(.*?)\]\((.*?)\)/g, '$1')
    .replace(/\s*\n+\s*/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
};

const extractJsonObject = (content) => {
  const text = String(content || '').trim();

  if (!text) {
    throw new Error('Summary response was empty');
  }

  const fencedMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fencedMatch?.[1] || text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1);

  if (!candidate || !candidate.trim().startsWith('{')) {
    throw new Error('Summary response did not contain a JSON object');
  }

  return JSON.parse(candidate);
};

export const generateResponse = async (conversationHistory, options = {}) => {
  const response = await getOpenAIClient().chat.completions.create({
    model: getChatModel(),
    messages: [
      {
        role: 'system',
        content: `${SYSTEM_PROMPT} ${getLanguageInstruction(options.languagePreference)}`
      },
      ...conversationHistory
    ],
    temperature: 0.7
  });

  return {
    text: sanitizeSpokenResponse(response.choices[0].message.content?.trim() || ''),
    usage: {
      model: response.model || getChatModel(),
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0
    }
  };
};

export const summarizeTranscript = async (fullTranscript) => {
  // TODO: Summarize full transcript into key points
  const summaryPrompt = `
Please analyze the following conversation and provide:
1. A concise summary (2-3 sentences)
2. Key points (as bullet points)
3. Any action items mentioned
4. Overall sentiment (positive/neutral/negative)

Conversation:
${fullTranscript}

Return strict JSON only with keys: summary, keyPoints, actionItems, sentiment. Do not wrap the JSON in markdown or code fences.
`;

  const response = await getOpenAIClient().chat.completions.create({
    model: getSummaryModel(),
    messages: [
      {
        role: 'system',
        content: 'You are a helpful assistant that summarizes conversations.'
      },
      {
        role: 'user',
        content: summaryPrompt
      }
    ],
    temperature: 0.5,
    response_format: { type: 'json_object' }
  });

  return {
    ...extractJsonObject(response.choices[0].message.content),
    usage: {
      model: response.model || getSummaryModel(),
      inputTokens: response.usage?.prompt_tokens || 0,
      outputTokens: response.usage?.completion_tokens || 0,
      totalTokens: response.usage?.total_tokens || 0
    }
  };
};

export default {
  generateResponse,
  summarizeTranscript,
  sanitizeSpokenResponse
};
