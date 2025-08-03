const express = require('express');
const Session = require('../models/Session');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/sessions - Get all published sessions (public)
router.get('/', async (req, res) => {
  try {
    const sessions = await Session.find({ status: 'published' })
      .populate('user_id', 'email')
      .sort({ createdAt: -1 });

    res.json({
      sessions: sessions.map(session => ({
        id: session._id,
        title: session.title,
        tags: session.tags,
        json_file_url: session.json_file_url,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        author: session.user_id.email
      }))
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// GET /api/sessions/my-sessions - Get user's own sessions (draft + published)
router.get('/my-sessions', auth, async (req, res) => {
  try {
    const sessions = await Session.find({ user_id: req.user._id })
      .sort({ updatedAt: -1 });

    res.json({
      sessions: sessions.map(session => ({
        id: session._id,
        title: session.title,
        tags: session.tags,
        json_file_url: session.json_file_url,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }))
    });
  } catch (error) {
    console.error('Get my sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch your sessions' });
  }
});

// GET /api/sessions/my-sessions/:id - Get a single user session
router.get('/my-sessions/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOne({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({
      session: {
        id: session._id,
        title: session.title,
        tags: session.tags,
        json_file_url: session.json_file_url,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// POST /api/sessions/save-draft - Save or update a draft session
router.post('/save-draft', auth, async (req, res) => {
  try {
    const { title, tags, json_file_url, sessionId } = req.body;

    // Validation
    if (!title || !json_file_url) {
      return res.status(400).json({ error: 'Title and JSON file URL are required' });
    }

    // Process tags (convert comma-separated string to array)
    const processedTags = tags ? 
      tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0) : 
      [];

    let session;

    if (sessionId) {
      // Update existing session
      session = await Session.findOneAndUpdate(
        { _id: sessionId, user_id: req.user._id },
        {
          title,
          tags: processedTags,
          json_file_url,
          status: 'draft'
        },
        { new: true, runValidators: true }
      );

      if (!session) {
        return res.status(404).json({ error: 'Session not found or you do not have permission to edit it' });
      }
    } else {
      // Create new session
      session = new Session({
        user_id: req.user._id,
        title,
        tags: processedTags,
        json_file_url,
        status: 'draft'
      });
      await session.save();
    }

    res.json({
      message: 'Draft saved successfully',
      session: {
        id: session._id,
        title: session.title,
        tags: session.tags,
        json_file_url: session.json_file_url,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    console.error('Save draft error:', error);
    res.status(500).json({ error: 'Failed to save draft' });
  }
});

// POST /api/sessions/publish - Publish a session
router.post('/publish', auth, async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({ error: 'Session ID is required' });
    }

    const session = await Session.findOneAndUpdate(
      { _id: sessionId, user_id: req.user._id },
      { status: 'published' },
      { new: true, runValidators: true }
    );

    if (!session) {
      return res.status(404).json({ error: 'Session not found or you do not have permission to publish it' });
    }

    res.json({
      message: 'Session published successfully',
      session: {
        id: session._id,
        title: session.title,
        tags: session.tags,
        json_file_url: session.json_file_url,
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt
      }
    });
  } catch (error) {
    console.error('Publish session error:', error);
    res.status(500).json({ error: 'Failed to publish session' });
  }
});

// DELETE /api/sessions/my-sessions/:id - Delete a session
router.delete('/my-sessions/:id', auth, async (req, res) => {
  try {
    const session = await Session.findOneAndDelete({
      _id: req.params.id,
      user_id: req.user._id
    });

    if (!session) {
      return res.status(404).json({ error: 'Session not found or you do not have permission to delete it' });
    }

    res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

module.exports = router; 