import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  getCallLanguagePreference,
  saveCallLanguagePreference
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

const SettingsScreen = () => {
  const [callLanguage, setCallLanguage] = useState('en');

  useEffect(() => {
    const loadPreferences = async () => {
      const savedLanguage = await getCallLanguagePreference();
      setCallLanguage(savedLanguage || 'en');
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