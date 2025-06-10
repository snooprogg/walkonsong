const express = require('express');
const { body, validationResult } = require('express-validator');
const { pool } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Helper function to extract YouTube video ID from URL
const extractYouTubeId = (url) => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Get all songs for authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [songs] = await pool.execute(
      `SELECT id, youtube_url, youtube_id, song_name, start_time_seconds, guest_name, created_at, updated_at 
       FROM songs 
       WHERE user_id = ? 
       ORDER BY created_at DESC`,
      [req.user.userId]
    );

    res.json({
      success: true,
      songs
    });
  } catch (error) {
    console.error('Error fetching songs:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching songs'
    });
  }
});

// Get single song by ID (must belong to authenticated user)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [songs] = await pool.execute(
      `SELECT id, youtube_url, youtube_id, song_name, start_time_seconds, guest_name, created_at, updated_at 
       FROM songs 
       WHERE id = ? AND user_id = ?`,
      [id, req.user.userId]
    );

    if (songs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    res.json({
      success: true,
      song: songs[0]
    });
  } catch (error) {
    console.error('Error fetching song:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching song'
    });
  }
});

// Create new song
router.post('/', [
  authenticateToken,
  body('youtubeUrl').isURL().withMessage('Valid YouTube URL is required'),
  body('songName').trim().isLength({ min: 1, max: 200 }).withMessage('Song name is required and must be 200 characters or less'),
  body('startTimeSeconds').optional().isInt({ min: 0 }).withMessage('Start time must be a positive integer'),
  body('guestName').optional().trim().isLength({ max: 100 }).withMessage('Guest name must be 100 characters or less')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { youtubeUrl, songName, startTimeSeconds = 0, guestName = null } = req.body;

    // Extract YouTube video ID
    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid YouTube URL. Please provide a valid YouTube video URL.'
      });
    }

    // Insert song into database
    const [result] = await pool.execute(
      `INSERT INTO songs (user_id, youtube_url, youtube_id, song_name, start_time_seconds, guest_name) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.userId, youtubeUrl, youtubeId, songName, startTimeSeconds, guestName]
    );

    // Get the created song
    const [songs] = await pool.execute(
      `SELECT id, youtube_url, youtube_id, song_name, start_time_seconds, guest_name, created_at, updated_at 
       FROM songs 
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Song added successfully',
      song: songs[0]
    });

  } catch (error) {
    console.error('Error creating song:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating song'
    });
  }
});

// Update existing song
router.put('/:id', [
  authenticateToken,
  body('youtubeUrl').optional().isURL().withMessage('Valid YouTube URL is required'),
  body('songName').optional().trim().isLength({ min: 1, max: 200 }).withMessage('Song name must be 200 characters or less'),
  body('startTimeSeconds').optional().isInt({ min: 0 }).withMessage('Start time must be a positive integer'),
  body('guestName').optional().trim().isLength({ max: 100 }).withMessage('Guest name must be 100 characters or less')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { youtubeUrl, songName, startTimeSeconds, guestName } = req.body;

    // Check if song exists and belongs to user
    const [existingSongs] = await pool.execute(
      'SELECT id FROM songs WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );

    if (existingSongs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues = [];

    if (songName !== undefined) {
      updateFields.push('song_name = ?');
      updateValues.push(songName);
    }

    if (startTimeSeconds !== undefined) {
      updateFields.push('start_time_seconds = ?');
      updateValues.push(startTimeSeconds);
    }

    if (guestName !== undefined) {
      updateFields.push('guest_name = ?');
      updateValues.push(guestName);
    }

    if (youtubeUrl !== undefined) {
      const youtubeId = extractYouTubeId(youtubeUrl);
      if (!youtubeId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid YouTube URL. Please provide a valid YouTube video URL.'
        });
      }
      updateFields.push('youtube_url = ?, youtube_id = ?');
      updateValues.push(youtubeUrl, youtubeId);
    }

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields to update'
      });
    }

    updateValues.push(id, req.user.userId);

    await pool.execute(
      `UPDATE songs SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
      updateValues
    );

    // Get updated song
    const [songs] = await pool.execute(
      `SELECT id, youtube_url, youtube_id, song_name, start_time_seconds, guest_name, created_at, updated_at 
       FROM songs 
       WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: 'Song updated successfully',
      song: songs[0]
    });

  } catch (error) {
    console.error('Error updating song:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating song'
    });
  }
});

// Delete song
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Check if song exists and belongs to user
    const [existingSongs] = await pool.execute(
      'SELECT id FROM songs WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );

    if (existingSongs.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    await pool.execute(
      'DELETE FROM songs WHERE id = ? AND user_id = ?',
      [id, req.user.userId]
    );

    res.json({
      success: true,
      message: 'Song deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting song:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting song'
    });
  }
});

module.exports = router;