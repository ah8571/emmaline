import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { getCallDetail } from '../services/api.js';
import { useAppTheme } from '../theme/appTheme.js';

const estimateCreditsFromUsd = (value) => {
  const usd = Number(value || 0);

  if (usd <= 0) {
    return 0;
  }

  return Math.max(1, Math.ceil(usd * 100));
};

const CallDetailScreen = ({ route }) => {
  const { colors } = useAppTheme();
  const { callId } = route.params;
  const [call, setCall] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCallDetail();
  }, [callId]);

  const loadCallDetail = async () => {
    setLoading(true);
    try {
      const response = await getCallDetail(callId);

      if (!response.success) {
        throw new Error(response.error || 'Unable to load call details');
      }

      setCall(response.call);
    } catch (error) {
      console.error('Error loading call:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />;
  }

  if (!call) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }] }>
        <Text style={[styles.errorText, { color: colors.danger }]}>Call not found</Text>
      </View>
    );
  }

  const formatUsd = (value) => {
    return `$${Number(value || 0).toFixed(4)}`;
  };

  const estimatedCredits = estimateCreditsFromUsd(call.totalBillableCostUsd);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
        <Text style={[styles.summaryText, { color: colors.mutedText }]}>{call.summary}</Text>
      </View>

      {call.keyPoints && (
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Points</Text>
          {call.keyPoints.map((point, idx) => (
            <Text key={idx} style={[styles.bulletPoint, { color: colors.mutedText }]}>• {point}</Text>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Estimated Usage</Text>
        {Number(call.totalBillableCostUsd || 0) > 0 ? (
          <>
            <Text style={[styles.usageValue, { color: colors.text }]}>{estimatedCredits} credit{estimatedCredits === 1 ? '' : 's'}</Text>
            <Text style={[styles.usageMeta, { color: colors.mutedText }]}>Estimated from the current billable usage total of {formatUsd(call.totalBillableCostUsd)}.</Text>
          </>
        ) : (
          <Text style={[styles.transcriptText, { color: colors.mutedText }]}>No estimated cost data recorded for this call yet.</Text>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Transcript</Text>
        {Array.isArray(call.messages) && call.messages.length > 0 ? (
          call.messages.map((message) => (
            <View key={message.id || `${message.sequenceNumber}-${message.speaker}`} style={styles.messageRow}>
              <Text style={[styles.messageSpeaker, { color: colors.text }]}>
                {message.speaker === 'assistant' ? 'Emmaline' : message.speaker === 'system' ? 'System' : 'You'}
              </Text>
              <Text style={[styles.transcriptText, { color: colors.mutedText }]}>{message.text}</Text>
            </View>
          ))
        ) : (
          <Text style={[styles.transcriptText, { color: colors.mutedText }]}>{call.fullTranscript}</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 32
  },
  loader: {
    flex: 1,
    justifyContent: 'center'
  },
  section: {
    marginBottom: 28
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12
  },
  summaryText: {
    fontSize: 14,
    color: '#495057',
    lineHeight: 20
  },
  bulletPoint: {
    fontSize: 14,
    color: '#495057',
    marginBottom: 8
  },
  usageValue: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 6
  },
  usageMeta: {
    fontSize: 14,
    lineHeight: 20
  },
  messageRow: {
    marginBottom: 14
  },
  messageSpeaker: {
    fontSize: 12,
    fontWeight: '700',
    color: '#495057',
    marginBottom: 4,
    textTransform: 'uppercase'
  },
  transcriptText: {
    fontSize: 14,
    color: '#6c757d',
    lineHeight: 22,
    fontStyle: 'normal'
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 24
  }
});

export default CallDetailScreen;
