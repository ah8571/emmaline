/**
 * Routes for note management
 * TODO: Implement endpoints
 */

import express from 'express';

const router = express.Router();

// Get all notes for authenticated user
router.get('/', (req, res) => {
  // TODO: GET /api/notes - Return user's notes
  res.status(200).json({ message: 'TODO: Get notes' });
});

// Create a new note
router.post('/', (req, res) => {
  // TODO: POST /api/notes - Create note
  res.status(201).json({ message: 'TODO: Create note' });
});

// Update a note
router.put('/:noteId', (req, res) => {
  // TODO: PUT /api/notes/:noteId - Update note
  res.status(200).json({ message: 'TODO: Update note' });
});

// Delete a note
router.delete('/:noteId', (req, res) => {
  // TODO: DELETE /api/notes/:noteId - Delete note
  res.status(200).json({ message: 'TODO: Delete note' });
});

export default router;
