const DEFAULT_PRICING_TIERS = {
  tier1: {
    label: 'Starter',
    markupMultiplier: 1
  },
  tier2: {
    label: 'Growth',
    markupMultiplier: 1.35
  },
  tier3: {
    label: 'Premium',
    markupMultiplier: 1.8
  }
};

const DEFAULT_RATE_CARD = {
  openaiChatInputPer1kTokens: parseFloat(process.env.COST_OPENAI_CHAT_INPUT_PER_1K || '0.00015'),
  openaiChatOutputPer1kTokens: parseFloat(process.env.COST_OPENAI_CHAT_OUTPUT_PER_1K || '0.0006'),
  openaiSummaryInputPer1kTokens: parseFloat(process.env.COST_OPENAI_SUMMARY_INPUT_PER_1K || '0.00015'),
  openaiSummaryOutputPer1kTokens: parseFloat(process.env.COST_OPENAI_SUMMARY_OUTPUT_PER_1K || '0.0006'),
  googleSpeechToTextPerMinute: parseFloat(process.env.COST_GOOGLE_STT_PER_MINUTE || '0.016'),
  googleTextToSpeechPerCharacter: parseFloat(process.env.COST_GOOGLE_TTS_PER_CHARACTER || '0.000016'),
  twilioVoicePerMinute: parseFloat(process.env.COST_TWILIO_VOICE_PER_MINUTE || '0.0085')
};

const roundQuantity = (value) => Math.round(Number(value || 0) * 10000) / 10000;
const roundCost = (value) => Math.round(Number(value || 0) * 1000000) / 1000000;

export const normalizePricingTier = (tier) => {
  const value = String(tier || '').trim().toLowerCase();
  return DEFAULT_PRICING_TIERS[value] ? value : 'tier1';
};

export const getPricingTierConfig = (tier) => {
  const normalizedTier = normalizePricingTier(tier);
  return {
    tier: normalizedTier,
    ...DEFAULT_PRICING_TIERS[normalizedTier]
  };
};

const createCostEntry = ({
  pricingTier,
  provider,
  service,
  quantity,
  unit,
  vendorCostUsd,
  measurementSource = 'estimated',
  costSource = 'rate_card',
  metadata = {}
}) => {
  const tierConfig = getPricingTierConfig(pricingTier);
  const roundedQuantity = roundQuantity(quantity);
  const normalizedVendorCostUsd = roundCost(vendorCostUsd);
  const billableCostUsd = roundCost(normalizedVendorCostUsd * tierConfig.markupMultiplier);

  return {
    pricingTier: tierConfig.tier,
    provider,
    service,
    quantity: roundedQuantity,
    unit,
    vendorCostUsd: normalizedVendorCostUsd,
    billableCostUsd,
    measurementSource,
    costSource,
    metadata: {
      tierLabel: tierConfig.label,
      markupMultiplier: tierConfig.markupMultiplier,
      ...metadata
    }
  };
};

export const buildEstimatedCallCostEntries = ({
  pricingTier,
  callDurationSeconds = 0,
  assistantCharacters = 0,
  chatUsage = {},
  summaryUsage = {},
  twilioCall = null
}) => {
  const minutes = Number(callDurationSeconds || 0) / 60;
  const entries = [];

  if (chatUsage.inputTokens) {
    entries.push(createCostEntry({
      pricingTier,
      provider: 'openai',
      service: 'chat_input_tokens',
      quantity: chatUsage.inputTokens,
      unit: 'tokens',
      vendorCostUsd: (chatUsage.inputTokens / 1000) * DEFAULT_RATE_CARD.openaiChatInputPer1kTokens,
      measurementSource: 'provider_usage',
      metadata: { model: chatUsage.model || process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini' }
    }));
  }

  if (chatUsage.outputTokens) {
    entries.push(createCostEntry({
      pricingTier,
      provider: 'openai',
      service: 'chat_output_tokens',
      quantity: chatUsage.outputTokens,
      unit: 'tokens',
      vendorCostUsd: (chatUsage.outputTokens / 1000) * DEFAULT_RATE_CARD.openaiChatOutputPer1kTokens,
      measurementSource: 'provider_usage',
      metadata: { model: chatUsage.model || process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini' }
    }));
  }

  if (summaryUsage.inputTokens) {
    entries.push(createCostEntry({
      pricingTier,
      provider: 'openai',
      service: 'summary_input_tokens',
      quantity: summaryUsage.inputTokens,
      unit: 'tokens',
      vendorCostUsd: (summaryUsage.inputTokens / 1000) * DEFAULT_RATE_CARD.openaiSummaryInputPer1kTokens,
      measurementSource: 'provider_usage',
      metadata: { model: summaryUsage.model || process.env.OPENAI_SUMMARY_MODEL || process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini' }
    }));
  }

  if (summaryUsage.outputTokens) {
    entries.push(createCostEntry({
      pricingTier,
      provider: 'openai',
      service: 'summary_output_tokens',
      quantity: summaryUsage.outputTokens,
      unit: 'tokens',
      vendorCostUsd: (summaryUsage.outputTokens / 1000) * DEFAULT_RATE_CARD.openaiSummaryOutputPer1kTokens,
      measurementSource: 'provider_usage',
      metadata: { model: summaryUsage.model || process.env.OPENAI_SUMMARY_MODEL || process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini' }
    }));
  }

  if (minutes > 0) {
    entries.push(createCostEntry({
      pricingTier,
      provider: 'google',
      service: 'speech_to_text',
      quantity: minutes,
      unit: 'minutes',
      vendorCostUsd: minutes * DEFAULT_RATE_CARD.googleSpeechToTextPerMinute,
      measurementSource: 'stream_measured'
    }));

    const twilioReportedPrice = Math.abs(Number(twilioCall?.price || 0));

    entries.push(createCostEntry({
      pricingTier,
      provider: 'twilio',
      service: 'voice_minutes',
      quantity: minutes,
      unit: 'minutes',
      vendorCostUsd: twilioReportedPrice > 0 ? twilioReportedPrice : minutes * DEFAULT_RATE_CARD.twilioVoicePerMinute,
      measurementSource: twilioReportedPrice > 0 ? 'vendor_reported' : 'stream_measured',
      costSource: twilioReportedPrice > 0 ? 'vendor_reported' : 'rate_card',
      metadata: {
        twilioPriceUnit: twilioCall?.priceUnit || 'USD',
        twilioStatus: twilioCall?.status || null
      }
    }));
  }

  if (assistantCharacters > 0) {
    entries.push(createCostEntry({
      pricingTier,
      provider: 'google',
      service: 'text_to_speech',
      quantity: assistantCharacters,
      unit: 'characters',
      vendorCostUsd: assistantCharacters * DEFAULT_RATE_CARD.googleTextToSpeechPerCharacter,
      measurementSource: 'request_measured'
    }));
  }

  return entries.filter((entry) => entry.quantity > 0);
};

export const summarizeEstimatedCallCosts = (entries = []) => {
  const normalizedEntries = Array.isArray(entries) ? entries : [];

  return {
    totalVendorCostUsd: roundCost(
      normalizedEntries.reduce((sum, entry) => sum + Number(entry.vendorCostUsd || 0), 0)
    ),
    totalBillableCostUsd: roundCost(
      normalizedEntries.reduce((sum, entry) => sum + Number(entry.billableCostUsd || 0), 0)
    ),
    providerBreakdown: normalizedEntries.reduce((providers, entry) => {
      const provider = entry.provider || 'unknown';
      const nextCost = roundCost((providers[provider] || 0) + Number(entry.vendorCostUsd || 0));
      return {
        ...providers,
        [provider]: nextCost
      };
    }, {})
  };
};

export default {
  buildEstimatedCallCostEntries,
  getPricingTierConfig,
  normalizePricingTier,
  summarizeEstimatedCallCosts
};