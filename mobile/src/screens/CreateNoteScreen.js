import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { createNote, getNote, getTopics, updateNote } from '../services/api.js';
import { useAppTheme } from '../theme/appTheme.js';
import { normalizeNoteContentToHtml } from '../utils/noteContent.js';

/**
 * CreateNoteScreen
 * Create or edit a note
 */
const CreateNoteScreen = ({ route, navigation }) => {
  const { colors } = useAppTheme();
  const existingNote = route?.params?.note || null;
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(normalizeNoteContentToHtml(existingNote?.content || ''));
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const isEditing = useMemo(() => Boolean(existingNote?.id), [existingNote?.id]);
  const richTextRef = useRef(null);
  const pendingContentRef = useRef(content);

  const hydrateNote = (noteRecord) => {
    const normalizedContent = normalizeNoteContentToHtml(noteRecord?.content || '');

    setTitle(noteRecord?.title || '');
    setSelectedTopic(noteRecord?.topicId || null);
    setContent(normalizedContent);
    pendingContentRef.current = normalizedContent;

    requestAnimationFrame(() => {
      richTextRef.current?.setContentHTML?.(normalizedContent || '<p></p>');
    });
  };

  useEffect(() => {
    pendingContentRef.current = content;
  }, [content]);

  useEffect(() => {
    hydrateNote(existingNote);
  }, [existingNote?.id, existingNote?.title, existingNote?.content, existingNote?.topicId]);

  useEffect(() => {
    let isActive = true;

    const loadFullNote = async () => {
      if (!existingNote?.id) {
        return;
      }

      const response = await getNote(existingNote.id);

      if (isActive && response.success && response.note) {
        hydrateNote(response.note);
      }
    };

    loadFullNote();

    return () => {
      isActive = false;
    };
  }, [existingNote?.id]);

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

        <View style={styles.editorShell}>
          <RichToolbar
            editor={richTextRef}
            style={[styles.toolbar, { backgroundColor: colors.background }]}
            selectedIconTint={colors.accent}
            iconTint={colors.text}
            disabledIconTint={colors.mutedText}
            actions={[
              actions.setBold,
              actions.setItalic,
              actions.setUnderline,
              actions.heading1,
              actions.heading2,
              actions.insertBulletsList,
              actions.insertOrderedList
            ]}
            iconMap={{
              [actions.setBold]: ({ tintColor }) => <Text style={[styles.toolbarIconText, { color: tintColor }]}>B</Text>,
              [actions.setItalic]: ({ tintColor }) => <Text style={[styles.toolbarIconText, styles.toolbarIconItalic, { color: tintColor }]}>I</Text>,
              [actions.setUnderline]: ({ tintColor }) => <Text style={[styles.toolbarIconText, styles.toolbarIconUnderline, { color: tintColor }]}>U</Text>,
              [actions.heading1]: ({ tintColor }) => <Text style={[styles.toolbarIconText, { color: tintColor }]}>H1</Text>,
              [actions.heading2]: ({ tintColor }) => <Text style={[styles.toolbarIconText, { color: tintColor }]}>H2</Text>,
              [actions.insertBulletsList]: ({ tintColor }) => <Text style={[styles.toolbarIconText, { color: tintColor }]}>•</Text>,
              [actions.insertOrderedList]: ({ tintColor }) => <Text style={[styles.toolbarIconText, { color: tintColor }]}>1.</Text>
            }}
          />

          <RichEditor
            key={existingNote?.id || 'new-note'}
            ref={richTextRef}
            initialContentHTML={content || '<p></p>'}
            placeholder="Start typing your note..."
            editorInitializedCallback={() => {
              richTextRef.current?.setContentHTML?.(pendingContentRef.current || '<p></p>');
            }}
            onChange={(nextContent) => {
              pendingContentRef.current = nextContent || '';
              setContent(nextContent || '');
            }}
            useContainer={false}
            initialHeight={320}
            disabled={loading}
            editorStyle={{
              backgroundColor: colors.background,
              color: colors.text,
              contentCSSText: `font-size: 16px; line-height: 1.7; color: ${colors.text}; padding: 0; background-color: ${colors.background};`,
              placeholderColor: colors.mutedText,
              cssText: `body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background-color: ${colors.background}; color: ${colors.text}; margin: 0; padding: 0; } p { margin: 0 0 12px 0; } ul, ol { padding-left: 22px; margin: 0 0 12px 0; } h1, h2, h3 { margin: 0 0 12px 0; }`
            }}
          />
        </View>

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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32
  },
  titleInput: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 12,
    paddingVertical: 8,
    borderBottomWidth: 0
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
  editorShell: {
    marginTop: 4
  },
  toolbar: {
    borderBottomWidth: 0,
    paddingHorizontal: 0,
    minHeight: 46
  },
  toolbarIconText: {
    fontSize: 15,
    fontWeight: '700'
  },
  toolbarIconItalic: {
    fontStyle: 'italic'
  },
  toolbarIconUnderline: {
    textDecorationLine: 'underline'
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
