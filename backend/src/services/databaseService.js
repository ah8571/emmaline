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
  saveSummary,
  getCallsForUser,
  getNotesForUser,
  getUserPhoneNumber,
  getUserIdByAssignedPhoneNumber,
  saveUserPhoneNumber,
  markUserPhoneNumberReleased
};
