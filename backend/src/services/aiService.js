/**
 * AI service for responses and summarization
 */

import { OpenAI } from 'openai';

const SYSTEM_PROMPT = [
  'You are Emmaline, a concise voice-first AI phone assistant.',
  'You help users think out loud, organize ideas, and capture actionable notes.',
  'Respond naturally for spoken conversation, keep replies brief, and ask one focused follow-up when useful.'
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

export const generateResponse = async (conversationHistory) => {
  const response = await getOpenAIClient().chat.completions.create({
    model: getChatModel(),
    messages: [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      },
      ...conversationHistory
    ],
    temperature: 0.7
  });

  return response.choices[0].message.content?.trim() || '';
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

Please respond in JSON format with keys: summary, keyPoints, actionItems, sentiment
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
    temperature: 0.5
  });

  return JSON.parse(response.choices[0].message.content);
};

export default {
  generateResponse,
  summarizeTranscript
};
