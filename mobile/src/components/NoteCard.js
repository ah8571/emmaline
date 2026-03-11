import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useAppTheme } from '../theme/appTheme.js';
import { stripNoteContentToPlainText } from '../utils/noteContent.js';

/**
 * NoteCard component
 * Displays a note preview
 */
const NoteCard = ({ note, onPress }) => {
  const { colors } = useAppTheme();
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const previewText = stripNoteContentToPlainText(note.content || '');

  return (
    <TouchableOpacity style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>{note.title}</Text>
        <Text style={[styles.cardDate, { color: colors.mutedText }]}>{formatDate(note.updatedAt || note.createdAt)}</Text>
      </View>
      
      <Text style={[styles.cardContent, { color: colors.mutedText }]} numberOfLines={2}>
        {previewText}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#dee2e6'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212529',
    flex: 1
  },
  cardDate: {
    fontSize: 12,
    color: '#6c757d',
    marginLeft: 8
  },
  cardContent: {
    fontSize: 13,
    color: '#495057',
    lineHeight: 18
  }
});

export default NoteCard;
