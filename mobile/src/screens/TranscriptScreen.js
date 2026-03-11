import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SectionList
} from 'react-native';
import { getCalls } from '../services/api.js';
import { useAppTheme } from '../theme/appTheme.js';

/**
 * TranscriptScreen
 * View all call transcripts organized chronologically
 */
const TranscriptScreen = ({ navigation }) => {
  const { colors } = useAppTheme();
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    loadTranscripts();
  }, []);

  const loadTranscripts = async () => {
    setLoading(true);
    try {
      const response = await getCalls();

      if (!response.success) {
        throw new Error(response.error || 'Unable to load transcripts');
      }

      setTranscripts(response.calls || []);
    } catch (error) {
      console.error('Error loading transcripts:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  };

  const groupedTranscripts = transcripts.reduce((groups, transcript) => {
    const dateKey = formatDate(transcript.startedAt);
    const existingGroup = groups.find(g => g.title === dateKey);

    if (existingGroup) {
      existingGroup.data.push(transcript);
    } else {
      groups.push({
        title: dateKey,
        data: [transcript]
      });
    }

    return groups;
  }, []);

  const renderTranscript = ({ item }) => (
    <TouchableOpacity
      style={[styles.transcriptCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
      onPress={() => navigation.navigate('CallDetail', { callId: item.id })}
    >
      <View style={styles.transcriptHeader}>
        <Text style={[styles.time, { color: colors.text }]}>
          {new Date(item.startedAt).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </Text>
        <Text style={[styles.duration, { color: colors.mutedText }]}>{item.callDurationSeconds}s</Text>
      </View>
      <Text style={[styles.preview, { color: colors.mutedText }]} numberOfLines={2}>
        {item.summary || item.fullTranscript?.substring(0, 100) || 'No transcript'}
      </Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: 'transparent' }]}>
      <Text style={[styles.sectionTitle, { color: colors.mutedText }]}>{title}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <View style={[styles.headerBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Transcripts</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
      ) : transcripts.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.text }]}>No transcripts yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>
            Make a call to see your conversation history
          </Text>
        </View>
      ) : (
        <SectionList
          sections={groupedTranscripts}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderTranscript}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
        />
      )}
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
  loader: {
    marginTop: 50
  },
  listContent: {
    padding: 12
  },
  sectionHeader: {
    paddingHorizontal: 4,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa'
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    textTransform: 'uppercase'
  },
  transcriptCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dee2e6'
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  time: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529'
  },
  duration: {
    fontSize: 12,
    color: '#6c757d'
  },
  preview: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6c757d',
    textAlign: 'center'
  }
});

export default TranscriptScreen;
