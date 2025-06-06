const express = require('express');
const sessionController = require('../controllers/sessionController');
const { verifyToken } = require('./auth');
const verifySessionCode = require('../middlewares/verifySessionCode');

const router = express.Router();

// Create new session (photographer only)
router.post('/', verifyToken, sessionController.createSession);

// Get session by code (public)
router.get('/code/:code', sessionController.getSessionByCode);

// Get photographer's sessions
router.get('/my-sessions', verifyToken, sessionController.getPhotographerSessions);

// Delete session
router.delete('/:id', verifyToken, sessionController.deleteSession);

module.exports = router;