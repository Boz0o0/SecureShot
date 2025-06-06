const express = require('express');
const multer = require('multer');
const photoController = require('../controllers/photoController');
const { verifyToken } = require('./auth');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Upload photos to session (photographer only)
router.post('/upload/:sessionId', verifyToken, upload.array('photos', 20), photoController.uploadPhotos);

// Get session photos (thumbnails for preview)
router.get('/session/:sessionId', photoController.getSessionPhotos);

// Get full resolution photos (after purchase)
router.get('/session/:sessionId/full', photoController.getFullResolutionPhotos);

module.exports = router;