const crypto = require('crypto');

// Telegram auth verification
function verifyTelegramAuth(data) {
  const { hash, ...authData } = data;

  // Filter out undefined/null values and sort auth data by key
  const filteredData = Object.keys(authData)
    .filter(key => authData[key] !== undefined && authData[key] !== null)
    .sort()
    .reduce((obj, key) => {
      obj[key] = authData[key];
      return obj;
    }, {});

  // Create data string for verification
  const dataString = Object.keys(filteredData)
    .map(key => `${key}=${filteredData[key]}`)
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const authData = req.body;

    console.log('Received Telegram auth data:', {
      id: authData.id,
      username: authData.username,
      first_name: authData.first_name,
      last_name: authData.last_name,
      hasPhoto: !!authData.photo_url,
      auth_date: authData.auth_date
    });

    // Check if bot token is configured
    if (!process.env.TELEGRAM_BOT_TOKEN) {
      console.error('TELEGRAM_BOT_TOKEN not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Verify auth data
    if (!verifyTelegramAuth(authData)) {
      console.error('Telegram auth verification failed');
      return res.status(401).json({ error: 'Invalid authentication data' });
    }

    // Check if auth data is not too old (within 24 hours)
    const authDate = new Date(authData.auth_date * 1000);
    const now = new Date();
    const hoursDiff = (now - authDate) / (1000 * 60 * 60);

    if (hoursDiff > 24) {
      return res.status(401).json({ error: 'Authentication data expired' });
    }

    // Create user object with proper fallbacks
    const user = {
      id: authData.id,
      telegram_id: authData.id,
      username: authData.username || `user_${authData.id}`, // Fallback if no username
      firstName: authData.first_name || 'Пользователь',
      lastName: authData.last_name || '',
      avatarUrl: authData.photo_url || null
    };

    console.log('✅ Telegram auth successful for user:', {
      id: user.id,
      username: user.username,
      firstName: user.firstName
    });

    const responseData = {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl
      }
    };

    console.log('📤 Sending auth response:', responseData);
    res.json(responseData);

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}

module.exports = handler;