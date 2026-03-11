import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { createNote, getTopics, updateNote } from '../services/api.js';
import { useAppTheme } from '../theme/appTheme.js';

/**
 * CreateNoteScreen
 * Create or edit a note
 */
const CreateNoteScreen = ({ route, navigation }) => {
  const { colors } = useAppTheme();
  const existingNote = route?.params?.note || null;
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(existingNote?.content || '');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const isEditing = useMemo(() => Boolean(existingNote?.id), [existingNote?.id]);

  useEffect(() => {
    setSelectedTopic(existingNote?.topicId || null);
  }, [existingNote?.topicId]);

  useEffect(() => {
    const loadTopics = async () => {
      const response = await getTopics();
      if (response.success) {
        setTopics(response.topics || []);
      }
    };

    loadTopics();
  }, []);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Please add a title');
      return;
    }

    setLoading(true);
    try {
      const response = isEditing
        ? await updateNote(existingNote.id, title.trim(), content.trim(), selectedTopic)
        : await createNote(title.trim(), content.trim(), selectedTopic);

      if (!response.success) {
        throw new Error(response.error || 'Unable to save note');
      }

      navigation.goBack();
    } catch (error) {
      alert(error.message || 'Error saving note');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.cancelButton, { color: colors.mutedText }]}>Cancel</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{isEditing ? 'Edit Note' : 'New Note'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveButton, { color: colors.accent }, loading && styles.disabledButton]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          style={[styles.titleInput, { color: colors.text, borderBottomColor: colors.border }]}
          placeholder="Note Title"
          placeholderTextColor={colors.mutedText}
          value={title}
          onChangeText={setTitle}
          editable={!loading}
        />

        <TextInput
          style={[styles.contentInput, { color: colors.text, backgroundColor: colors.input, borderColor: colors.border }]}
          placeholder="Start typing your note... Markdown headings are okay."
          placeholderTextColor={colors.mutedText}
          value={content}
          onChangeText={setContent}
          multiline
          editable={!loading}
          textAlignVertical="top"
        />

        {topics.length > 0 ? (
          <View style={styles.topicSelector}>
            <Text style={[styles.topicSelectorLabel, { color: colors.text }]}>Topic</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.topicTag,
                  { backgroundColor: colors.surfaceAlt },
                  selectedTopic === null && [styles.topicTagActive, { backgroundColor: colors.accent }]
                ]}
                onPress={() => setSelectedTopic(null)}
              >
                <Text style={[styles.topicTagText, { color: colors.mutedText }, selectedTopic === null && styles.topicTagTextActive]}>None</Text>
              </TouchableOpacity>
              {topics.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={[
                    styles.topicTag,
                    { backgroundColor: colors.surfaceAlt },
                    selectedTopic === topic.id && [styles.topicTagActive, { backgroundColor: colors.accent }]
                  ]}
                  onPress={() => setSelectedTopic(topic.id)}
                >
                  <Text style={[styles.topicTagText, { color: colors.mutedText }, selectedTopic === topic.id && styles.topicTagTextActive]}>{topic.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529'
  },
  cancelButton: {
    color: '#6c757d',
    fontSize: 14
  },
  saveButton: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600'
  },
  disabledButton: {
    opacity: 0.5
  },
  content: {
    flex: 1,
    padding: 16
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 16,
    paddingVertical: 8,
    borderBottomWidth: 1
  },
  contentInput: {
    fontSize: 14,
    color: '#212529',
    minHeight: 300,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    paddingTop: 12
  },
  topicSelector: {
    marginTop: 16
  },
  topicSelectorLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 8
  },
  topicTag: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: '#e9ecef',
    marginRight: 8
  },
  topicTagActive: {
    backgroundColor: '#007AFF'
  },
  topicTagText: {
    fontSize: 13,
    color: '#495057'
  },
  topicTagTextActive: {
    color: '#fff'
  }
});

export default CreateNoteScreen;
