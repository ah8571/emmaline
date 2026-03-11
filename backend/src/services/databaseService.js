/**
 * Supabase database service
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;

// Initialize Supabase only if credentials are provided
if (supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey);
    console.log('✓ Supabase client initialized');
  } catch (error) {
    console.error('Failed to initialize Supabase:', error.message);
    supabase = null;
  }
} else {
  console.warn('⚠ Supabase not configured - database features disabled');
}

export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }
  return supabase;
};

const normalizePhoneNumberForStorage = (rawValue) => {
  const value = String(rawValue || '').trim();

  if (!value) {
    return 'unknown';
  }

  if (/^\+?[0-9]{1,20}$/.test(value)) {
    return value;
  }

  if (value.startsWith('client:') || value.startsWith('user_')) {
    return 'in-app-voip';
  }

  return value.slice(0, 20);
};

export const saveCall = async (userId, callData) => {
  const { data, error } = await supabase
    .from('calls')
    .insert({
      user_id: userId,
      phone_number: normalizePhoneNumberForStorage(callData.phoneNumber),
      call_duration_seconds: callData.duration,
      started_at: callData.startedAt,
      ended_at: callData.endedAt,
      call_status: callData.status,
      twilio_call_sid: callData.twilioCallSid
    })
    .select();

  if (error) {
    console.error('Error saving call:', error);
    throw error;
  }

  return data[0];
};

export const saveTranscript = async (callId, userId, fullText) => {
  const { data, error } = await supabase
    .from('transcripts')
    .insert({
      call_id: callId,
      user_id: userId,
      full_text: fullText
    })
    .select();

  if (error) {
    console.error('Error saving transcript:', error);
    throw error;
  }

  return data[0];
};

export const saveCallMessages = async (callId, userId, messages = []) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('call_messages')
    .insert(
      messages.map((message, index) => ({
        call_id: callId,
        user_id: userId,
        sequence_number: index + 1,
        speaker: message.speaker,
        content: message.text,
        created_at: message.createdAt || new Date().toISOString()
      }))
    )
    .select();

  if (error) {
    console.error('Error saving call messages:', error);
    throw error;
  }

  return data;
};

export const saveCallCosts = async (callId, userId, costEntries = []) => {
  if (!Array.isArray(costEntries) || costEntries.length === 0) {
    return [];
  }

  const { data, error } = await supabase
    .from('call_costs')
    .insert(
      costEntries.map((entry) => ({
        call_id: callId,
        user_id: userId,
        pricing_tier: entry.pricingTier,
        provider: entry.provider,
        service: entry.service,
        quantity: entry.quantity,
        unit: entry.unit,
        vendor_cost_usd: entry.vendorCostUsd,
        billable_cost_usd: entry.billableCostUsd,
        measurement_source: entry.measurementSource,
        cost_source: entry.costSource,
        metadata: entry.metadata || {}
      }))
    )
    .select();

  if (error) {
    console.error('Error saving call costs:', error);
    throw error;
  }

  return data;
};

export const saveSummary = async (callId, userId, summaryData) => {
  const { data, error } = await supabase
    .from('summaries')
    .insert({
      call_id: callId,
      user_id: userId,
      summary_text: summaryData.text,
      key_points: summaryData.keyPoints,
      sentiment: summaryData.sentiment,
      action_items: summaryData.actionItems
    })
    .select();

  if (error) {
    console.error('Error saving summary:', error);
    throw error;
  }

  return data[0];
};

const attachRelatedCallRows = async (calls = [], options = {}) => {
  if (!Array.isArray(calls) || calls.length === 0) {
    return calls;
  }

  const callIds = calls.map((call) => call.id).filter(Boolean);

  if (callIds.length === 0) {
    return calls;
  }

  const includeMessages = options.includeMessages === true;

  const [costsResult, messagesResult] = await Promise.all([
    supabase
      .from('call_costs')
      .select('*')
      .in('call_id', callIds)
      .order('created_at', { ascending: true }),
    includeMessages
      ? supabase
          .from('call_messages')
          .select('*')
          .in('call_id', callIds)
          .order('sequence_number', { ascending: true })
      : Promise.resolve({ data: [], error: null })
  ]);

  if (costsResult.error) {
    console.error('Error fetching call costs:', costsResult.error);
    throw costsResult.error;
  }

  if (messagesResult.error) {
    console.error('Error fetching call messages:', messagesResult.error);
    throw messagesResult.error;
  }

  const costsByCallId = new Map();
  for (const cost of costsResult.data || []) {
    const rows = costsByCallId.get(cost.call_id) || [];
    rows.push(cost);
    costsByCallId.set(cost.call_id, rows);
  }

  const messagesByCallId = new Map();
  for (const message of messagesResult.data || []) {
    const rows = messagesByCallId.get(message.call_id) || [];
    rows.push(message);
    messagesByCallId.set(message.call_id, rows);
  }

  return calls.map((call) => ({
    ...call,
    call_costs: costsByCallId.get(call.id) || [],
    call_messages: messagesByCallId.get(call.id) || []
  }));
};

export const getCallsForUser = async (userId) => {
  const { data, error } = await supabase
    .from('calls')
    .select(`
      *,
      transcripts(*),
      summaries(*)
    `)
    .eq('user_id', userId)
    .order('started_at', { ascending: false });

  if (error) {
    console.error('Error fetching calls:', error);
    throw error;
  }

  return attachRelatedCallRows(data, { includeMessages: false });
};

export const getCallById = async (userId, callId) => {
  const { data, error } = await supabase
    .from('calls')
    .select(`
      *,
      transcripts(*),
      summaries(*)
    `)
    .eq('user_id', userId)
    .eq('id', callId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching call by ID:', error);
    throw error;
  }

  if (!data) {
    return data;
  }

  const [call] = await attachRelatedCallRows([data], { includeMessages: true });
  return call;
};

export const getNotesForUser = async (userId) => {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching notes:', error);
    throw error;
  }

  return data;
};

export const getUserPricingTier = async (userId) => {
  const { data, error } = await supabase
    .from('users')
    .select('privacy_tier')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user pricing tier:', error);
    throw error;
  }

  return data?.privacy_tier || 'tier1';
};

export const getUserPhoneNumber = async (userId) => {
  const { data, error } = await supabase
    .from('user_phone_numbers')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user phone number:', error);
    throw error;
  }

  return data;
};

export const getUserIdByAssignedPhoneNumber = async (phoneNumber) => {
  const { data, error } = await supabase
    .from('user_phone_numbers')
    .select('user_id')
    .eq('phone_number', phoneNumber)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    console.error('Error fetching user by assigned phone number:', error);
    throw error;
  }

  return data?.user_id || null;
};

export const saveUserPhoneNumber = async (userId, phoneNumberData) => {
  const { data, error } = await supabase
    .from('user_phone_numbers')
    .upsert(
      {
        user_id: userId,
        twilio_phone_sid: phoneNumberData.twilioPhoneSid,
        phone_number: phoneNumberData.phoneNumber,
        friendly_name: phoneNumberData.friendlyName,
        status: phoneNumberData.status || 'active',
        provisioned_at: phoneNumberData.provisionedAt || new Date().toISOString(),
        released_at: phoneNumberData.releasedAt || null
      },
      {
        onConflict: 'user_id'
      }
    )
    .select()
    .single();

  if (error) {
    console.error('Error saving user phone number:', error);
    throw error;
  }

  return data;
};

export const markUserPhoneNumberReleased = async (userId) => {
  const { data, error } = await supabase
    .from('user_phone_numbers')
    .update({
      status: 'released',
      released_at: new Date().toISOString()
    })
    .eq('user_id', userId)
    .eq('status', 'active')
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error releasing user phone number:', error);
    throw error;
  }

  return data;
};

export default {
  getSupabaseClient,
  saveCall,
  saveTranscript,
  saveCallMessages,
  saveCallCosts,
  saveSummary,
  getCallsForUser,
  getCallById,
  getNotesForUser,
  getUserPricingTier,
  getUserPhoneNumber,
  getUserIdByAssignedPhoneNumber,
  saveUserPhoneNumber,
  markUserPhoneNumberReleased
};
