/**
 * Secure storage utility using expo-secure-store
 * Handles JWT token storage and retrieval securely
 */

import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'emmaline_auth_token';
const USER_KEY = 'emmaline_user';
const PREFERENCES_KEY = 'emmaline_preferences';
const DEFAULT_PREFERENCES = {
  callLanguage: 'en',
  speechRate: 1,
  callResponseDelayMs: 1600
};

/**
 * Save authentication token securely
 */
export const saveToken = async (token) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error('Error saving token:', error);
    return false;
  }
};

/**
 * Retrieve authentication token
 */
export const getToken = async () => {
  try {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    return token;
  } catch (error) {
    console.error('Error retrieving token:', error);
    return null;
  }
};

/**
 * Delete authentication token
 */
export const deleteToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    return true;
  } catch (error) {
    console.error('Error deleting token:', error);
    return false;
  }
};

/**
 * Save user information
 */
export const saveUser = async (user) => {
  try {
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));
    return true;
  } catch (error) {
    console.error('Error saving user:', error);
    return false;
  }
};

/**
 * Retrieve user information
 */
export const getUser = async () => {
  try {
    const userStr = await SecureStore.getItemAsync(USER_KEY);
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  } catch (error) {
    console.error('Error retrieving user:', error);
    return null;
  }
};

/**
 * Delete user information
 */
export const deleteUser = async () => {
  try {
    await SecureStore.deleteItemAsync(USER_KEY);
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

export const getPreferences = async () => {
  try {
    const preferenceStr = await SecureStore.getItemAsync(PREFERENCES_KEY);

    if (!preferenceStr) {
      return { ...DEFAULT_PREFERENCES };
    }

    return {
      ...DEFAULT_PREFERENCES,
      ...JSON.parse(preferenceStr)
    };
  } catch (error) {
    console.error('Error retrieving preferences:', error);
    return { ...DEFAULT_PREFERENCES };
  }
};

export const savePreferences = async (preferences) => {
  try {
    const nextPreferences = {
      ...DEFAULT_PREFERENCES,
      ...(await getPreferences()),
      ...preferences
    };

    await SecureStore.setItemAsync(PREFERENCES_KEY, JSON.stringify(nextPreferences));
    return true;
  } catch (error) {
    console.error('Error saving preferences:', error);
    return false;
  }
};

export const getCallLanguagePreference = async () => {
  const preferences = await getPreferences();
  return preferences.callLanguage || 'en';
};

export const saveCallLanguagePreference = async (callLanguage) => {
  return savePreferences({ callLanguage });
};

export const getSpeechRatePreference = async () => {
  const preferences = await getPreferences();
  const speechRate = Number(preferences.speechRate);

  if (!Number.isFinite(speechRate)) {
    return DEFAULT_PREFERENCES.speechRate;
  }

  return speechRate;
};

export const saveSpeechRatePreference = async (speechRate) => {
  return savePreferences({ speechRate: Number(speechRate) });
};

export const getCallResponseDelayPreference = async () => {
  const preferences = await getPreferences();
  const responseDelayMs = Number(preferences.callResponseDelayMs);

  if (!Number.isFinite(responseDelayMs)) {
    return DEFAULT_PREFERENCES.callResponseDelayMs;
  }

  return responseDelayMs;
};

export const saveCallResponseDelayPreference = async (callResponseDelayMs) => {
  return savePreferences({ callResponseDelayMs: Number(callResponseDelayMs) });
};

/**
 * Logout - clear all auth data
 */
export const logout = async () => {
  try {
    await deleteToken();
    await deleteUser();
    return true;
  } catch (error) {
    console.error('Error during logout:', error);
    return false;
  }
};

export default {
  saveToken,
  getToken,
  deleteToken,
  saveUser,
  getUser,
  deleteUser,
  isAuthenticated,
  getPreferences,
  savePreferences,
  getCallLanguagePreference,
  saveCallLanguagePreference,
  getSpeechRatePreference,
  saveSpeechRatePreference,
  getCallResponseDelayPreference,
  saveCallResponseDelayPreference,
  logout
};
