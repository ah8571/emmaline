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

/**
 * CreateNoteScreen
 * Create or edit a note
 */
const CreateNoteScreen = ({ route, navigation }) => {
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
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{isEditing ? 'Edit Note' : 'New Note'}</Text>
        <TouchableOpacity onPress={handleSave} disabled={loading}>
          <Text style={[styles.saveButton, loading && styles.disabledButton]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          style={styles.titleInput}
          placeholder="Note Title"
          placeholderTextColor="#adb5bd"
          value={title}
          onChangeText={setTitle}
          editable={!loading}
        />

        <TextInput
          style={styles.contentInput}
          placeholder="Start typing your note... Markdown headings are okay."
          placeholderTextColor="#adb5bd"
          value={content}
          onChangeText={setContent}
          multiline
          editable={!loading}
          textAlignVertical="top"
        />

        {topics.length > 0 ? (
          <View style={styles.topicSelector}>
            <Text style={styles.topicSelectorLabel}>Topic</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.topicTag, selectedTopic === null && styles.topicTagActive]}
                onPress={() => setSelectedTopic(null)}
              >
                <Text style={[styles.topicTagText, selectedTopic === null && styles.topicTagTextActive]}>None</Text>
              </TouchableOpacity>
              {topics.map((topic) => (
                <TouchableOpacity
                  key={topic.id}
                  style={[styles.topicTag, selectedTopic === topic.id && styles.topicTagActive]}
                  onPress={() => setSelectedTopic(topic.id)}
                >
                  <Text style={[styles.topicTagText, selectedTopic === topic.id && styles.topicTagTextActive]}>{topic.name}</Text>
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
    paddingVertical: 8
  },
  contentInput: {
    fontSize: 14,
    color: '#212529',
    minHeight: 300,
    backgroundColor: '#fff',
    borderRadius: 8,
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
