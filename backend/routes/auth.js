const express = require('express');
const crypto = require('crypto');
const User = require('../models/User');

const router = express.Router();

// Telegram auth verification
function verifyTelegramAuth(data) {
  const { hash, ...authData } = data;

  // Sort auth data by key
  const dataString = Object.keys(authData)
    .sort()
    .map(key => `${key}=${authData[key]}`)
    .join('\n');

  // Create secret key from bot token
  const secretKey = crypto.createHash('sha256')
    .update(process.env.TELEGRAM_BOT_TOKEN)
    .digest();

  // Create HMAC-SHA256 hash
  const hmac = crypto.createHmac('sha256', secretKey)
    .update(dataString)
    .digest('hex');

  return hmac === hash;
}

// POST /api/auth/telegram
router.post('/telegram', async (req, res) => {
  try {
    const authData = req.body;

    // Verify auth data
    if (!verifyTelegramAuth(authData)) {
      return res.status(401).json({ error: 'Invalid authentication data' });
    }

    // Check if auth data is not too old (within 24 hours)
    const authDate = new Date(authData.auth_date * 1000);
    const now = new Date();
    const hoursDiff = (now - authDate) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return res.status(401).json({ error: 'Authentication data expired' });
    }

    // Find or create user
    const user = await User.findOrCreateFromTelegram(authData);

    // Set session
    req.session.userId = user.id;
    req.session.telegramId = user.telegram_id;

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.first_name,
        lastName: user.last_name,
        avatarUrl: user.avatar_url
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// GET /api/auth/me
router.get('/me', (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  User.findById(req.session.userId)
    .then(user => {
      if (!user) {
        req.session.destroy();
        return res.status(401).json({ error: 'User not found' });
      }

      res.json({
        user: {
          id: user.id,
          username: user.username,
          firstName: user.first_name,
          lastName: user.last_name,
          avatarUrl: user.avatar_url
        }
      });
    })
    .catch(error => {
      console.error('Get user error:', error);
      res.status(500).json({ error: 'Failed to get user data' });
    });
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to logout' });
    }
    res.json({ success: true });
  });
});

module.exports = router;