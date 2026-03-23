export type ConsumerCompetitor = {
  slug: string;
  name: string;
  category: string;
  summary: string;
  audience: string;
  strengths: string[];
  limits: string[];
  emmalineAngle: string;
  reviewTitle?: string;
  reviewSummary?: string;
};

export const consumerCompetitors: ConsumerCompetitor[] = [
  {
    slug: 'chatgpt-voice',
    name: 'ChatGPT Voice',
    category: 'General-purpose voice AI assistant',
    summary:
      'A broad voice AI experience for users who want fast answers, brainstorming help, and natural back-and-forth conversation.',
    audience:
      'People who want a flexible, general assistant that can handle many question types in one interface.',
    strengths: [
      'Strong general knowledge and reasoning coverage',
      'Useful for fast Q&A and idea exploration',
      'Recognizable product with broad awareness',
    ],
    limits: [
      'Not primarily framed as a dedicated phone-number assistant',
      'Broader product scope can make it feel less purpose-built for phone-style routines',
      'Less differentiated around a dedicated assistant identity',
    ],
    emmalineAngle:
      'Emmaline can differentiate by feeling more like a dedicated phone assistant with a persistent voice-first identity and a cleaner phone-call experience.',
  },
  {
    slug: 'gemini-live',
    name: 'Gemini Live',
    category: 'Voice AI assistant tied to the Google ecosystem',
    summary:
      'A live conversational assistant for users who want a voice-first experience connected to a larger assistant ecosystem.',
    audience:
      'People already comfortable with Google products who want a voice interface for everyday help.',
    strengths: [
      'Strong ecosystem awareness through Google products',
      'Good fit for users who already live inside Google tools',
      'High consumer familiarity',
    ],
    limits: [
      'Less room for a distinct standalone assistant identity',
      'Not positioned around a dedicated AI phone number',
      'May feel more like a general assistant layer than a focused phone companion',
    ],
    emmalineAngle:
      'Emmaline can position itself as a standalone AI phone assistant designed around calling, conversation practice, and a more personal assistant relationship.',
  },
  {
    slug: 'replika',
    name: 'Replika',
    category: 'AI companion with voice chat',
    summary:
      'A companion-oriented product centered on personality, emotional connection, and ongoing conversation.',
    audience:
      'Users looking for companionship and a more relational AI experience.',
    strengths: [
      'Strong companion framing',
      'Designed for recurring personal conversation',
      'Clear emotional and social use case',
    ],
    limits: [
      'Less focused on a phone-assistant workflow',
      'Not optimized around everyday task support or phone-style practicality',
      'Companion positioning may not fit users seeking a lighter executive-style assistant',
    ],
    emmalineAngle:
      'Emmaline can stay more useful and practical by emphasizing conversation help, rehearsal, notes, and everyday voice assistance over pure companionship.',
  },
  {
    slug: 'pi',
    name: 'Pi',
    category: 'Conversational AI companion',
    summary:
      'A conversational AI known for a calmer, more supportive tone and a polished chat experience.',
    audience:
      'Users who want thoughtful conversation and a friendly, accessible assistant tone.',
    strengths: [
      'Approachable tone',
      'Comfortable for open-ended conversation',
      'Strong consumer-oriented identity',
    ],
    limits: [
      'Not clearly differentiated around phone-call workflows',
      'Less associated with a dedicated phone-number model',
      'Weaker phone-assistant positioning for search compared with a purpose-built voice product',
    ],
    emmalineAngle:
      'Emmaline can compete by making the phone itself the core interface rather than just another surface for a conversational AI.',
  },
  {
    slug: 'character-ai',
    name: 'Character.AI Voice',
    category: 'Voice conversation built around AI characters',
    summary:
      'A character-driven voice experience that leans into entertainment, roleplay, and personality-led interactions.',
    audience:
      'Users looking for playful, expressive, or character-based AI conversations.',
    strengths: [
      'Strong personality and entertainment angle',
      'Distinctive voice interaction style',
      'Good fit for playful consumer use cases',
    ],
    limits: [
      'Less practical for everyday assistant tasks',
      'Not naturally positioned as a phone assistant',
      'Entertainment framing may not fit users seeking real-world conversation help',
    ],
    emmalineAngle:
      'Emmaline can own the more grounded space: a practical AI phone assistant for real conversations, note taking, and everyday help.',
  },
  {
    slug: 'call-annie',
    name: 'Call Annie',
    category: 'Phone-style AI conversation experience',
    summary:
      'A well-known reference point for people searching specifically for an AI they can call and talk to more directly by voice.',
    audience:
      'Users who want an AI phone-call experience rather than a standard chat app.',
    strengths: [
      'Strong relevance to phone-call AI search intent',
      'Easy mental model for users who want to call an AI',
      'Closer category fit to Emmaline than many general voice assistants',
    ],
    limits: [
      'Availability can be a concern for users comparing current options',
      'Category awareness may be stronger than product continuity',
      'Less room for users to build around a dedicated assistant identity',
    ],
    emmalineAngle:
      'Emmaline can position itself as a modern alternative for users who want a dedicated AI phone assistant and a more expandable long-term setup.',
    reviewTitle: 'Call Annie Review: What To Look For In An AI Phone Assistant Alternative',
    reviewSummary:
      'A review page aimed at people looking for Call Annie alternatives and newer AI phone assistant options.',
  },
];

export const consumerCompetitorSlugs = consumerCompetitors.map(
  (competitor) => competitor.slug,
);

export function getConsumerCompetitor(slug: string) {
  return consumerCompetitors.find((competitor) => competitor.slug === slug);
}