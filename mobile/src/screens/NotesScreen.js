import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  SectionList
} from 'react-native';
import { getNotes, getTopics } from '../services/api.js';
import NoteCard from '../components/NoteCard';
import { useAppTheme } from '../theme/appTheme.js';

/**
 * NotesScreen
 * View notes organized by topic with ability to create new notes
 */
const NotesScreen = ({ navigation }) => {
  const { colors } = useAppTheme();
  const actionCircleBackgroundColor = colors.surface;
  const actionCircleBorderColor = colors.text;
  const actionCircleIconColor = colors.text;
  const [notes, setNotes] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const loadNotes = useCallback(async (topicOverride = selectedTopic, options = {}) => {
    if (!options.silent) {
      setLoading(true);
    }
    try {
      const response = await getNotes(topicOverride, 100, 0);

      if (!response.success) {
        throw new Error(response.error || 'Unable to load notes');
      }

      setNotes(response.notes || []);
      setErrorMessage('');
    } catch (error) {
      console.error('Error loading notes:', error);
      setErrorMessage(error.message || 'Unable to load notes');
    } finally {
      if (!options.silent) {
        setLoading(false);
      }
    }
  }, [selectedTopic]);

  const loadTopics = useCallback(async () => {
    try {
      const response = await getTopics();

      if (!response.success) {
        throw new Error(response.error || 'Unable to load topics');
      }

      setTopics(response.topics || []);
    } catch (error) {
      console.error('Error loading topics:', error);
      setTopics([]);
    }
  }, []);

  useEffect(() => {
    loadNotes(selectedTopic);
  }, [loadNotes, selectedTopic]);

  useEffect(() => {
    loadTopics();
  }, [loadTopics]);

  useEffect(() => {
    const unsubscribeFocus = navigation.addListener('focus', () => {
      loadNotes(selectedTopic, { silent: true });
      loadTopics();
    });

    const pollId = setInterval(() => {
      loadNotes(selectedTopic, { silent: true });
    }, 4000);

    return () => {
      clearInterval(pollId);
      unsubscribeFocus();
    };
  }, [loadNotes, loadTopics, navigation, selectedTopic]);

  const handleCreateNote = () => {
    navigation.navigate('CreateNote');
  };

  // Group notes by topic
  const groupedNotes = topics
    .filter(topic => selectedTopic === null || topic.id === selectedTopic)
    .map(topic => ({
      title: topic.name,
      data: notes.filter(note => note.topicId === topic.id),
      topicId: topic.id
    }))
    .filter(group => group.data.length > 0 || selectedTopic === null);

  // Add "Unorganized" section if there are notes without a topic
  const unorganizedNotes = notes.filter(note => !note.topicId);
  if (unorganizedNotes.length > 0 && (selectedTopic === null)) {
    groupedNotes.unshift({
      title: 'Unorganized',
      data: unorganizedNotes,
      topicId: null
    });
  }

  const handleEditNote = (note) => {
    navigation.navigate('CreateNote', { note });
  };

  const renderNote = ({ item }) => <NoteCard note={item} onPress={() => handleEditNote(item)} />;

  const renderSectionHeader = ({ section: { title } }) => (
    <View style={[styles.sectionHeader, { backgroundColor: 'transparent' }]}>
      <Text style={[styles.sectionTitle, { color: colors.mutedText }]}>{title}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }] }>
      <View style={[styles.headerBar, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Notes</Text>
        <TouchableOpacity
          style={[
            styles.createButton,
            {
              backgroundColor: actionCircleBackgroundColor,
              borderColor: actionCircleBorderColor
            }
          ]}
          onPress={handleCreateNote}
        >
          <Text style={[styles.createButtonText, { color: actionCircleIconColor }]}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Topic Filter Scroll View */}
      {topics.length > 0 && (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={[styles.topicScroll, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
          contentContainerStyle={styles.topicContent}
        >
          <TouchableOpacity
            style={[
              styles.topicTag,
              { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
              selectedTopic === null && [styles.topicTagActive, { backgroundColor: colors.accent, borderColor: colors.accent }]
            ]}
            onPress={() => setSelectedTopic(null)}
          >
            <Text
              style={[
                styles.topicTagText,
                { color: colors.mutedText },
                selectedTopic === null && styles.topicTagTextActive
              ]}
            >
              All
            </Text>
          </TouchableOpacity>

          {topics.map(topic => (
            <TouchableOpacity
              key={topic.id}
              style={[
                styles.topicTag,
                { backgroundColor: colors.surfaceAlt, borderColor: colors.border },
                selectedTopic === topic.id && [styles.topicTagActive, { backgroundColor: colors.accent, borderColor: colors.accent }]
              ]}
              onPress={() => setSelectedTopic(topic.id)}
            >
              <Text
                style={[
                  styles.topicTagText,
                  { color: colors.mutedText },
                  selectedTopic === topic.id && styles.topicTagTextActive
                ]}
              >
                {topic.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {loading ? (
        <ActivityIndicator size="large" color={colors.accent} style={styles.loader} />
      ) : errorMessage ? (
        <View style={styles.emptyState}>
          <Text style={[styles.emptyText, { color: colors.text }]}>Unable to load notes</Text>
          <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>{errorMessage}</Text>
        </View>
      ) : notes.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📝</Text>
          <Text style={[styles.emptyText, { color: colors.text }]}>No notes yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.mutedText }]}>
            Create a note or extract from a call
          </Text>
        </View>
      ) : (
        <SectionList
          sections={groupedNotes}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderNote}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.notesList}
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
    borderBottomColor: '#e9ecef',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212529'
  },
  createButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center'
  },
  createButtonText: {
    fontSize: 28,
    color: '#111111',
    fontWeight: '300',
    lineHeight: 28
  },
  topicScroll: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  topicContent: {
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  topicTag: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#e9ecef',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#dee2e6'
  },
  topicTagActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF'
  },
  topicTagText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#495057'
  },
  topicTagTextActive: {
    color: '#fff'
  },
  loader: {
    marginTop: 50
  },
  sectionHeader: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f8f9fa'
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6c757d',
    textTransform: 'uppercase'
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16
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
  },
  notesList: {
    padding: 12
  }
});

export default NotesScreen;
