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

export const saveCall = async (userId, callData) => {
  const { data, error } = await supabase
    .from('calls')
    .insert({
      user_id: userId,
      phone_number: callData.phoneNumber,
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

  return data;
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

export default {
  getSupabaseClient,
  saveCall,
  saveTranscript,
  saveSummary,
  getCallsForUser,
  getNotesForUser
};
