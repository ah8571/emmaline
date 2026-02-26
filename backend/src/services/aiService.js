/**
 * AI service for responses and summarization
 */

import { OpenAI } from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateResponse = async (conversationHistory) => {
  // TODO: Generate AI response based on conversation history
  // - Convert speech-to-text transcript to message
  // - Send to OpenAI with system prompt
  // - Return streamed response
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: conversationHistory,
    temperature: 0.7
  });

  return response.choices[0].message.content;
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

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
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
