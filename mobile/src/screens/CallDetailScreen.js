import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { getCallDetail } from '../services/api.js';
import { useAppTheme } from '../theme/appTheme.js';

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

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }] }>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Summary</Text>
        <Text style={[styles.summaryText, { color: colors.mutedText }]}>{call.summary}</Text>
      </View>

      {call.keyPoints && (
        <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }] }>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Key Points</Text>
          {call.keyPoints.map((point, idx) => (
            <Text key={idx} style={[styles.bulletPoint, { color: colors.mutedText }]}>• {point}</Text>
          ))}
        </View>
      )}

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }] }>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Usage and Cost</Text>
        <Text style={[styles.summaryText, { color: colors.mutedText }]}>
          Tier: {call.pricingTier || 'tier1'}
        </Text>
        <Text style={[styles.summaryText, { color: colors.mutedText }]}>
          Provider cost: {formatUsd(call.totalVendorCostUsd)}
        </Text>
        <Text style={[styles.summaryText, { color: colors.mutedText }]}>
          Tier-adjusted billable cost: {formatUsd(call.totalBillableCostUsd)}
        </Text>

        {Array.isArray(call.costs) && call.costs.length > 0 ? (
          call.costs.map((cost) => (
            <View key={cost.id || `${cost.provider}-${cost.service}`} style={[styles.costRow, { borderBottomColor: colors.border }]}>
              <Text style={[styles.costLabel, { color: colors.text }]}>
                {cost.provider} / {cost.service}
              </Text>
              <Text style={[styles.costMeta, { color: colors.mutedText }]}>
                {cost.quantity} {cost.unit} · {cost.measurementSource} · {cost.costSource}
              </Text>
              <Text style={[styles.costValue, { color: colors.accent }]}>Provider: {formatUsd(cost.vendorCostUsd)}</Text>
              <Text style={[styles.costMeta, { color: colors.mutedText }]}>Billable: {formatUsd(cost.billableCostUsd)}</Text>
            </View>
          ))
        ) : (
          <Text style={[styles.transcriptText, { color: colors.mutedText }]}>No estimated cost data recorded for this call yet.</Text>
        )}
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.border }] }>
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
    padding: 16
  },
  loader: {
    flex: 1,
    justifyContent: 'center'
  },
  section: {
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderRadius: 16,
    borderColor: '#e9ecef'
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
  costRow: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f3f5'
  },
  costLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212529',
    textTransform: 'capitalize'
  },
  costMeta: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 2
  },
  costValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 4
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
