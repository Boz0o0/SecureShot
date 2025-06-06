const express = require('express');
const supabase = require('../services/supabaseClient');
const router = express.Router();

// Middleware to verify JWT token
async function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token verification failed' });
  }
}

// Get current user
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = { router, verifyToken };