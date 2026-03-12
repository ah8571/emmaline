import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { getCalls } from '../services/api.js';
import {
  getCallLanguagePreference,
  getNoteTextScalePreference,
  getCallResponseDelayPreference,
  getSpeechRatePreference,
  saveCallResponseDelayPreference,
  saveCallLanguagePreference,
  saveNoteTextScalePreference,
  saveSpeechRatePreference
} from '../utils/secureStorage.js';
import { useAppTheme } from '../theme/appTheme.js';

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

const NOTE_TEXT_SIZE_OPTIONS = [
  {
    value: 0.95,
    title: 'Compact',
    description: 'Fit a bit more text into each note card and note screen.'
  },
  {
    value: 1,
    title: 'Standard',
    description: 'Default note text size.'
  },
  {
    value: 1.15,
    title: 'Larger',
    description: 'Increase note readability without making the layout feel oversized.'
  },
  {
    value: 1.3,
    title: 'Largest',
    description: 'Use the largest note text for easier reading.'
  }
];

const areRatesEqual = (left, right) => Math.abs(Number(left) - Number(right)) < 0.001;
const areDelayValuesEqual = (left, right) => Number(left) === Number(right);
const estimateCreditsFromUsd = (value) => {
  const usd = Number(value || 0);

  if (usd <= 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(usd * 100));
};

const SettingsScreen = ({ onLogout }) => {
  const { colors, isDarkMode, toggleTheme } = useAppTheme();
  const [callLanguage, setCallLanguage] = useState('en');
  const [speechRate, setSpeechRate] = useState(1);
  const [callResponseDelayMs, setCallResponseDelayMs] = useState(1600);
  const [noteTextScale, setNoteTextScale] = useState(1);
  const [usageSummary, setUsageSummary] = useState({
    loading: true,
    estimatedCredits: 0,
    callCount: 0
  });

  useEffect(() => {
    const loadPreferences = async () => {
      const [savedLanguage, savedSpeechRate, savedResponseDelayMs, savedNoteTextScale] = await Promise.all([
        getCallLanguagePreference(),
        getSpeechRatePreference(),
        getCallResponseDelayPreference(),
        getNoteTextScalePreference()
      ]);

      setCallLanguage(savedLanguage || 'en');
      setSpeechRate(savedSpeechRate || 1);
      setCallResponseDelayMs(savedResponseDelayMs || 1600);
      setNoteTextScale(savedNoteTextScale || 1);
    };

    loadPreferences();
  }, []);

  useEffect(() => {
    const loadUsageSummary = async () => {
      try {
        const limit = 100;
        let offset = 0;
        let allCalls = [];

        while (true) {
          const response = await getCalls(limit, offset);

          if (!response.success) {
            throw new Error(response.error || 'Unable to load usage totals');
          }

          const nextCalls = response.calls || [];
          allCalls = allCalls.concat(nextCalls);

          if (allCalls.length >= Number(response.total || 0) || nextCalls.length < limit) {
            break;
          }

          offset += limit;
        }

        const totalBillableCostUsd = allCalls.reduce(
          (sum, call) => sum + Number(call.totalBillableCostUsd || 0),
          0
        );

        setUsageSummary({
          loading: false,
          estimatedCredits: estimateCreditsFromUsd(totalBillableCostUsd),
          callCount: allCalls.length
        });
      } catch (error) {
        setUsageSummary({
          loading: false,
          estimatedCredits: 0,
          callCount: 0
        });
      }
    };

    loadUsageSummary();
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

  const handleSelectNoteTextScale = async (value) => {
    setNoteTextScale(value);
    const saved = await saveNoteTextScalePreference(value);

    if (!saved) {
      Alert.alert('Settings error', 'Unable to save your note text size preference.');
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log out',
      'Log out of Emmaline on this device?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Log out',
          style: 'destructive',
          onPress: () => onLogout?.()
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.headerBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Settings</Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <Text style={[styles.sectionDescription, { color: colors.mutedText }]}>Keep the quick theme icon in the header, or switch modes here with a little more context.</Text>

        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.infoCardCopy}>
            <Text style={[styles.infoCardTitle, { color: colors.text }]}>{isDarkMode ? 'Dark mode' : 'Light mode'}</Text>
            <Text style={[styles.infoCardDescription, { color: colors.mutedText }]}>
              {isDarkMode
                ? 'Use the darker palette for a quieter look and less glare.'
                : 'Use the lighter palette for maximum contrast in bright settings.'}
            </Text>
          </View>
          <Switch
            value={isDarkMode}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.accent }}
            thumbColor={colors.surface}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Estimated usage</Text>
        <Text style={[styles.sectionDescription, { color: colors.mutedText }]}>A simple internal estimate of your usage so far across all saved calls.</Text>

        <View style={[styles.speedometerCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Text style={[styles.speedometerLabel, { color: colors.mutedText }]}>Estimated credits used</Text>
          <Text style={[styles.speedometerValue, { color: colors.text }]}>
            {usageSummary.loading ? '...' : usageSummary.estimatedCredits}
          </Text>
        </View>

        <Text style={[styles.usageFootnote, { color: colors.mutedText }]}>
          {usageSummary.loading
            ? 'Loading your total usage.'
            : `Across ${usageSummary.callCount} call${usageSummary.callCount === 1 ? '' : 's'} so far.`}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Call language</Text>
        <Text style={[styles.sectionDescription, { color: colors.mutedText }]}>
          Choose the language Emmaline should expect on voice calls.
        </Text>

        {LANGUAGE_OPTIONS.map((option) => {
          const selected = callLanguage === option.value;

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selected && [styles.optionCardSelected, { borderColor: colors.accent, backgroundColor: colors.surfaceAlt }]
              ]}
              onPress={() => handleSelectLanguage(option.value)}
              activeOpacity={0.85}
            >
              <View style={[styles.radio, { borderColor: colors.mutedText }, selected && [styles.radioSelected, { borderColor: colors.accent }]]}>
                {selected ? <View style={[styles.radioInner, { backgroundColor: colors.accent }]} /> : null}
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                <Text style={[styles.optionDescription, { color: colors.mutedText }]}>{option.description}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Speech speed</Text>
        <Text style={[styles.sectionDescription, { color: colors.mutedText }]}>
          Slow Emmaline down if the spoken responses feel too dense to follow in real time.
        </Text>

        <View style={[styles.speedometerCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Text style={[styles.speedometerLabel, { color: colors.mutedText }]}>Current pace</Text>
          <Text style={[styles.speedometerValue, { color: colors.text }]}>{speechRate.toFixed(2)}x</Text>
        </View>

        {SPEECH_RATE_OPTIONS.map((option) => {
          const selected = areRatesEqual(speechRate, option.value);

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selected && [styles.optionCardSelected, { borderColor: colors.accent, backgroundColor: colors.surfaceAlt }]
              ]}
              onPress={() => handleSelectSpeechRate(option.value)}
              activeOpacity={0.85}
            >
              <View style={[styles.radio, { borderColor: colors.mutedText }, selected && [styles.radioSelected, { borderColor: colors.accent }]]}>
                {selected ? <View style={[styles.radioInner, { backgroundColor: colors.accent }]} /> : null}
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                <Text style={[styles.optionDescription, { color: colors.mutedText }]}>{option.description}</Text>
              </View>
              <Text style={[styles.rateBadge, { color: colors.mutedText }]}>{option.value.toFixed(2)}x</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Note text size</Text>
        <Text style={[styles.sectionDescription, { color: colors.mutedText }]}>Make note previews and note content easier to read if you want larger text.</Text>

        {NOTE_TEXT_SIZE_OPTIONS.map((option) => {
          const selected = areRatesEqual(noteTextScale, option.value);

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selected && [styles.optionCardSelected, { borderColor: colors.accent, backgroundColor: colors.surfaceAlt }]
              ]}
              onPress={() => handleSelectNoteTextScale(option.value)}
              activeOpacity={0.85}
            >
              <View style={[styles.radio, { borderColor: colors.mutedText }, selected && [styles.radioSelected, { borderColor: colors.accent }]]}>
                {selected ? <View style={[styles.radioInner, { backgroundColor: colors.accent }]} /> : null}
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                <Text style={[styles.optionDescription, { color: colors.mutedText }]}>{option.description}</Text>
              </View>
              <Text style={[styles.rateBadge, { color: colors.mutedText }]}>{option.value.toFixed(2)}x</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Response timing</Text>
        <Text style={[styles.sectionDescription, { color: colors.mutedText }]}>
          Adjust how long Emmaline waits after you stop speaking before it responds.
        </Text>

        <View style={[styles.speedometerCard, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
          <Text style={[styles.speedometerLabel, { color: colors.mutedText }]}>Current wait</Text>
          <Text style={[styles.speedometerValue, { color: colors.text }]}>{(callResponseDelayMs / 1000).toFixed(1)}s</Text>
        </View>

        {RESPONSE_DELAY_OPTIONS.map((option) => {
          const selected = areDelayValuesEqual(callResponseDelayMs, option.value);

          return (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionCard,
                { backgroundColor: colors.surface, borderColor: colors.border },
                selected && [styles.optionCardSelected, { borderColor: colors.accent, backgroundColor: colors.surfaceAlt }]
              ]}
              onPress={() => handleSelectResponseDelay(option.value)}
              activeOpacity={0.85}
            >
              <View style={[styles.radio, { borderColor: colors.mutedText }, selected && [styles.radioSelected, { borderColor: colors.accent }]]}>
                {selected ? <View style={[styles.radioInner, { backgroundColor: colors.accent }]} /> : null}
              </View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                <Text style={[styles.optionDescription, { color: colors.mutedText }]}>{option.description}</Text>
              </View>
              <Text style={[styles.rateBadge, { color: colors.mutedText }]}>{(option.value / 1000).toFixed(1)}s</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <Text style={[styles.sectionDescription, { color: colors.mutedText }]}>End your current session on this device.</Text>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={handleLogout}
          activeOpacity={0.85}
        >
          <Text style={[styles.logoutButtonText, { color: colors.text }]}>Log out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  contentContainer: {
    paddingBottom: 40
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
  infoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#dee2e6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16
  },
  infoCardCopy: {
    flex: 1
  },
  infoCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4
  },
  infoCardDescription: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18
  },
  usageFootnote: {
    fontSize: 13,
    lineHeight: 18
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
  },
  logoutButton: {
    minHeight: 54,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#212529'
  }
});

export default SettingsScreen;