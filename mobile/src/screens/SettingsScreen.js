import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  getCallLanguagePreference,
  getCallResponseDelayPreference,
  getSpeechRatePreference,
  saveCallResponseDelayPreference,
  saveCallLanguagePreference,
  saveSpeechRatePreference
} from '../utils/secureStorage.js';

const LANGUAGE_OPTIONS = [
  {
    value: 'en',
    title: 'English',
    description: 'Use English for speech recognition and spoken replies.'
  },
  {
    value: 'es',
    title: 'Spanish',
    description: 'Use Spanish for speech recognition and spoken replies.'
  }
];

const SPEECH_RATE_OPTIONS = [
  {
    value: 0.82,
    title: 'Slower',
    description: 'More breathing room when Emmaline is giving a lot of detail.'
  },
  {
    value: 0.92,
    title: 'Relaxed',
    description: 'A little slower than normal without sounding stretched.'
  },
  {
    value: 1,
    title: 'Normal',
    description: 'Default speaking speed.'
  }
];

const RESPONSE_DELAY_OPTIONS = [
  {
    value: 900,
    title: 'Faster',
    description: 'Emmaline responds sooner after you stop talking. Best for quick back-and-forth.'
  },
  {
    value: 1600,
    title: 'Balanced',
    description: 'A middle ground that works well for most conversations.'
  },
  {
    value: 2300,
    title: 'Patient',
    description: 'Wait longer before replying if you tend to pause while thinking out loud.'
  }
];

const areRatesEqual = (left, right) => Math.abs(Number(left) - Number(right)) < 0.001;
const areDelayValuesEqual = (left, right) => Number(left) === Number(right);

const SettingsScreen = () => {
  const [callLanguage, setCallLanguage] = useState('en');
  const [speechRate, setSpeechRate] = useState(1);
  const [callResponseDelayMs, setCallResponseDelayMs] = useState(1600);

  useEffect(() => {
    const loadPreferences = async () => {
      const [savedLanguage, savedSpeechRate, savedResponseDelayMs] = await Promise.all([
        getCallLanguagePreference(),
        getSpeechRatePreference(),
        getCallResponseDelayPreference()
      ]);

      setCallLanguage(savedLanguage || 'en');
      setSpeechRate(savedSpeechRate || 1);
      setCallResponseDelayMs(savedResponseDelayMs || 1600);
    };

    loadPreferences();
  }, []);

  const handleSelectLanguage = async (value) => {
    setCallLanguage(value);
    const saved = await saveCallLanguagePreference(value);

    if (!saved) {
      Alert.alert('Settings error', 'Unable to save your call language preference.');
    }
  };

  const handleSelectSpeechRate = async (value) => {
    setSpeechRate(value);
    const saved = await saveSpeechRatePreference(value);

    if (!saved) {
      Alert.alert('Settings error', 'Unable to save your speech speed preference.');
    }
  };

  const handleSelectResponseDelay = async (value) => {
    setCallResponseDelayMs(value);
    const saved = await saveCallResponseDelayPreference(value);

    if (!saved) {
      Alert.alert('Settings error', 'Unable to save your response timing preference.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerBar}>
        <Text style={styles.pageTitle}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Call language</Text>
        <Text style={styles.sectionDescription}>
          Choose the language Emmaline should expect on voice calls.
        </Text>

        {LANGUAGE_OPTIONS.map((option) => {
          const selected = callLanguage === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionCard, selected && styles.optionCardSelected]}
              onPress={() => handleSelectLanguage(option.value)}
              activeOpacity={0.85}
            >
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioInner} /> : null}
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Speech speed</Text>
        <Text style={styles.sectionDescription}>
          Slow Emmaline down if the spoken responses feel too dense to follow in real time.
        </Text>

        <View style={styles.speedometerCard}>
          <Text style={styles.speedometerLabel}>Current pace</Text>
          <Text style={styles.speedometerValue}>{speechRate.toFixed(2)}x</Text>
        </View>

        {SPEECH_RATE_OPTIONS.map((option) => {
          const selected = areRatesEqual(speechRate, option.value);

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionCard, selected && styles.optionCardSelected]}
              onPress={() => handleSelectSpeechRate(option.value)}
              activeOpacity={0.85}
            >
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioInner} /> : null}
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Text style={styles.rateBadge}>{option.value.toFixed(2)}x</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Response timing</Text>
        <Text style={styles.sectionDescription}>
          Adjust how long Emmaline waits after you stop speaking before it responds.
        </Text>

        <View style={styles.speedometerCard}>
          <Text style={styles.speedometerLabel}>Current wait</Text>
          <Text style={styles.speedometerValue}>{(callResponseDelayMs / 1000).toFixed(1)}s</Text>
        </View>

        {RESPONSE_DELAY_OPTIONS.map((option) => {
          const selected = areDelayValuesEqual(callResponseDelayMs, option.value);

          return (
            <TouchableOpacity
              key={option.value}
              style={[styles.optionCard, selected && styles.optionCardSelected]}
              onPress={() => handleSelectResponseDelay(option.value)}
              activeOpacity={0.85}
            >
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected ? <View style={styles.radioInner} /> : null}
              </View>
              <View style={styles.optionContent}>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionDescription}>{option.description}</Text>
              </View>
              <Text style={styles.rateBadge}>{(option.value / 1000).toFixed(1)}s</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  headerBar: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212529'
  },
  section: {
    padding: 16,
    gap: 12
  },
  speedometerCard: {
    backgroundColor: '#fff7e6',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#f1d6a8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  speedometerLabel: {
    fontSize: 14,
    color: '#8a5a00',
    fontWeight: '600'
  },
  speedometerValue: {
    fontSize: 24,
    color: '#5c3b00',
    fontWeight: '700'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529'
  },
  sectionDescription: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 20
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#dee2e6'
  },
  optionCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f2f7ff'
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#adb5bd',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    marginRight: 12
  },
  radioSelected: {
    borderColor: '#007AFF'
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF'
  },
  optionContent: {
    flex: 1
  },
  rateBadge: {
    marginLeft: 12,
    fontSize: 13,
    fontWeight: '700',
    color: '#495057'
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4
  },
  optionDescription: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18
  }
});

export default SettingsScreen;