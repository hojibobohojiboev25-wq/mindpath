import crypto from 'crypto';

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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    // Mock user creation (in production, save to database)
    const user = {
      id: authData.id,
      telegram_id: authData.id,
      username: authData.username,
      firstName: authData.first_name,
      lastName: authData.last_name,
      avatarUrl: authData.photo_url
    };

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatarUrl: user.avatarUrl
      }
    });

  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}