import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Keyboard,
  Platform
} from 'react-native';
import { RichEditor, RichToolbar, actions } from 'react-native-pell-rich-editor';
import { createNote, getNote, getTopics, updateNote } from '../services/api.js';
import { useAppTheme } from '../theme/appTheme.js';
import { normalizeNoteContentToHtml, stripNoteContentToPlainText } from '../utils/noteContent.js';

const AUTO_SAVE_DELAY_MS = 900;
const UNTITLED_NOTE_TITLE = 'Untitled note';

/**
 * CreateNoteScreen
 * Create or edit a note
 */
const CreateNoteScreen = ({ route, navigation }) => {
  const { colors } = useAppTheme();
  const existingNote = route?.params?.note || null;
  const [noteId, setNoteId] = useState(existingNote?.id || null);
  const [title, setTitle] = useState(existingNote?.title || '');
  const [content, setContent] = useState(normalizeNoteContentToHtml(existingNote?.content || ''));
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [saveState, setSaveState] = useState(existingNote?.id ? 'Saved' : 'Idle');
  const isEditing = useMemo(() => Boolean(noteId || existingNote?.id), [existingNote?.id, noteId]);
  const richTextRef = useRef(null);
  const pendingContentRef = useRef(content);
  const noteIdRef = useRef(existingNote?.id || null);
  const draftRef = useRef({
    title: existingNote?.title || '',
    content: normalizeNoteContentToHtml(existingNote?.content || ''),
    selectedTopic: existingNote?.topicId || null
  });
  const isHydratingRef = useRef(false);
  const saveInFlightRef = useRef(false);
  const saveQueuedRef = useRef(false);
  const autoSaveTimeoutRef = useRef(null);
  const lastSavedSnapshotRef = useRef('');
  const isMountedRef = useRef(true);

  const updateSaveState = (nextValue) => {
    if (isMountedRef.current) {
      setSaveState(nextValue);
    }
  };

  const clearAutoSaveTimeout = () => {
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
      autoSaveTimeoutRef.current = null;
    }
  };

  const buildDraftPayload = () => {
    const nextTitle = String(draftRef.current.title || '').trim();
    const nextContent = String(draftRef.current.content || '').trim();
    const nextTopicId = draftRef.current.selectedTopic || null;
    const plainTextContent = stripNoteContentToPlainText(nextContent).trim();

    if (!nextTitle && !plainTextContent && !nextTopicId) {
      return null;
    }

    const effectiveTitle = nextTitle || UNTITLED_NOTE_TITLE;
    const normalizedContent = normalizeNoteContentToHtml(nextContent, { title: effectiveTitle });

    return {
      title: effectiveTitle,
      content: normalizedContent,
      topicId: nextTopicId
    };
  };

  const buildSnapshot = ({ noteId: snapshotNoteId = noteIdRef.current, title: snapshotTitle, content: snapshotContent, topicId }) => {
    return JSON.stringify({
      noteId: snapshotNoteId || null,
      title: snapshotTitle || '',
      content: snapshotContent || '',
      topicId: topicId || null
    });
  };

  const flushAutoSave = async (force = false) => {
    clearAutoSaveTimeout();

    if (isHydratingRef.current) {
      return true;
    }

    const payload = buildDraftPayload();

    if (!payload) {
      updateSaveState('Idle');
      return true;
    }

    const snapshot = buildSnapshot(payload);

    if (!force && snapshot === lastSavedSnapshotRef.current) {
      updateSaveState('Saved');
      return true;
    }

    if (saveInFlightRef.current) {
      saveQueuedRef.current = true;
      return true;
    }

    saveInFlightRef.current = true;
    updateSaveState('Saving...');

    try {
      const currentNoteId = noteIdRef.current;
      const response = currentNoteId
        ? await updateNote(currentNoteId, payload.title, payload.content, payload.topicId)
        : await createNote(payload.title, payload.content, payload.topicId);

      if (!response.success) {
        throw new Error(response.error || 'Unable to save note');
      }

      const savedNote = response.note || {};
      const savedNoteId = savedNote.id || currentNoteId || null;
      const savedTitle = savedNote.title || payload.title;
      const savedTopicId = savedNote.topicId ?? payload.topicId ?? null;
      const savedContent = normalizeNoteContentToHtml(savedNote.content || payload.content, {
        title: savedTitle
      });

      noteIdRef.current = savedNoteId;
      if (savedNoteId !== noteId) {
        setNoteId(savedNoteId);
      }

      lastSavedSnapshotRef.current = buildSnapshot({
        noteId: savedNoteId,
        title: savedTitle,
        content: savedContent,
        topicId: savedTopicId
      });

      navigation.setParams?.({
        note: {
          ...(existingNote || {}),
          ...(savedNote || {}),
          id: savedNoteId,
          title: savedTitle,
          content: savedContent,
          topicId: savedTopicId
        }
      });

      updateSaveState('Saved');
      return true;
    } catch (error) {
      updateSaveState('Save failed');
      return false;
    } finally {
      saveInFlightRef.current = false;

      if (saveQueuedRef.current) {
        saveQueuedRef.current = false;
        flushAutoSave();
      }
    }
  };

  const hydrateNote = (noteRecord) => {
    isHydratingRef.current = true;

    const normalizedContent = normalizeNoteContentToHtml(noteRecord?.content || '', {
      title: noteRecord?.title || ''
    });

    const hydratedNoteId = noteRecord?.id || null;

    noteIdRef.current = hydratedNoteId;
    setNoteId(hydratedNoteId);
    setTitle(noteRecord?.title || '');
    setSelectedTopic(noteRecord?.topicId || null);
    setContent(normalizedContent);
    draftRef.current = {
      title: noteRecord?.title || '',
      content: normalizedContent,
      selectedTopic: noteRecord?.topicId || null
    };
    pendingContentRef.current = normalizedContent;
    lastSavedSnapshotRef.current = hydratedNoteId
      ? buildSnapshot({
          noteId: hydratedNoteId,
          title: noteRecord?.title || '',
          content: normalizedContent,
          topicId: noteRecord?.topicId || null
        })
      : '';
    updateSaveState(hydratedNoteId ? 'Saved' : 'Idle');

    requestAnimationFrame(() => {
      richTextRef.current?.setContentHTML?.(normalizedContent || '<p></p>');
      richTextRef.current?.blurContentEditor?.();
      Keyboard.dismiss();
      isHydratingRef.current = false;
    });
  };

  useEffect(() => {
    pendingContentRef.current = content;
    draftRef.current = {
      title,
      content,
      selectedTopic
    };
  }, [content, selectedTopic, title]);

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

  useEffect(() => {
    if (isHydratingRef.current) {
      return undefined;
    }

    const payload = buildDraftPayload();

    if (!payload) {
      clearAutoSaveTimeout();
      updateSaveState('Idle');
      return undefined;
    }

    const nextSnapshot = buildSnapshot(payload);

    if (nextSnapshot === lastSavedSnapshotRef.current) {
      clearAutoSaveTimeout();
      updateSaveState('Saved');
      return undefined;
    }

    updateSaveState('Unsaved');
    clearAutoSaveTimeout();
    autoSaveTimeoutRef.current = setTimeout(() => {
      flushAutoSave();
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      clearAutoSaveTimeout();
    };
  }, [title, content, selectedTopic]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      clearAutoSaveTimeout();
      flushAutoSave(true).catch(() => {
        // Best-effort save when leaving the note screen.
      });
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={[styles.backButton, { color: colors.mutedText }]}>Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{isEditing ? 'Edit Note' : 'New Note'}</Text>
        <Text style={[styles.saveStateText, { color: saveState === 'Save failed' ? colors.mutedText : colors.mutedText }]}>
          {saveState === 'Idle' ? '' : saveState}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        <TextInput
          style={[styles.titleInput, { color: colors.text, borderBottomColor: colors.border }]}
          placeholder="Note Title"
          placeholderTextColor={colors.mutedText}
          value={title}
          onChangeText={setTitle}
          editable
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
              actions.setParagraph,
              actions.removeFormat,
              actions.insertBulletsList,
              actions.insertOrderedList,
              actions.undo,
              actions.redo
            ]}
            iconMap={{
              [actions.setBold]: ({ tintColor }) => <Text style={[styles.toolbarIconText, { color: tintColor }]}>B</Text>,
              [actions.setItalic]: ({ tintColor }) => <Text style={[styles.toolbarIconText, styles.toolbarIconItalic, { color: tintColor }]}>I</Text>,
              [actions.setUnderline]: ({ tintColor }) => <Text style={[styles.toolbarIconText, styles.toolbarIconUnderline, { color: tintColor }]}>U</Text>,
              [actions.heading1]: ({ tintColor }) => <Text style={[styles.toolbarIconText, { color: tintColor }]}>H1</Text>,
              [actions.heading2]: ({ tintColor }) => <Text style={[styles.toolbarIconText, { color: tintColor }]}>H2</Text>,
                [actions.setParagraph]: ({ tintColor }) => <Text style={[styles.toolbarIconText, { color: tintColor }]}>P</Text>,
                [actions.removeFormat]: ({ tintColor }) => <Text style={[styles.toolbarIconText, { color: tintColor }]}>Tx</Text>,
              [actions.insertBulletsList]: ({ tintColor }) => <Text style={[styles.toolbarIconText, { color: tintColor }]}>•</Text>,
                [actions.insertOrderedList]: ({ tintColor }) => <Text style={[styles.toolbarIconText, { color: tintColor }]}>1.</Text>,
                [actions.undo]: ({ tintColor }) => <Text style={[styles.toolbarIconText, { color: tintColor }]}>↶</Text>,
                [actions.redo]: ({ tintColor }) => <Text style={[styles.toolbarIconText, { color: tintColor }]}>↷</Text>
            }}
          />

          <RichEditor
            key={existingNote?.id || 'new-note'}
            ref={richTextRef}
            initialContentHTML={content || '<p></p>'}
            initialFocus={false}
            placeholder="Start typing your note..."
            editorInitializedCallback={() => {
              richTextRef.current?.setContentHTML?.(pendingContentRef.current || '<p></p>');
              richTextRef.current?.blurContentEditor?.();
              Keyboard.dismiss();
            }}
            onChange={(nextContent) => {
              pendingContentRef.current = nextContent || '';
              setContent(nextContent || '');
            }}
            style={styles.richEditor}
            useContainer
            initialHeight={320}
            disabled={false}
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
  backButton: {
    color: '#6c757d',
    fontSize: 14
  },
  saveStateText: {
    minWidth: 72,
    textAlign: 'right',
    fontSize: 13,
    color: '#6c757d'
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
  richEditor: {
    minHeight: 320
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
