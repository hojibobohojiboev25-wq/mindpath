async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

// Return safe environment variables for debugging
const safeEnv = {
  // AI APIs
  OPENAI_API_KEY_SET: process.env.OPENAI_API_KEY ? 'YES' : 'NO',
  OPENAI_API_KEY_PREFIX: process.env.OPENAI_API_KEY ? 'sk-' + process.env.OPENAI_API_KEY.substring(3, 10) + '...' : 'NOT_SET',
  STABILITY_API_KEY_SET: process.env.STABILITY_API_KEY ? 'YES' : 'NO',
  STABILITY_API_KEY_PREFIX: process.env.STABILITY_API_KEY ? 'sk-' + process.env.STABILITY_API_KEY.substring(3, 10) + '...' : 'NOT_SET',

  // Admin credentials
  ADMIN_USERNAME_SET: process.env.ADMIN_USERNAME ? 'YES' : 'NO',
  ADMIN_PASSWORD_SET: process.env.ADMIN_PASSWORD ? 'YES' : 'NO',
  JWT_SECRET_SET: process.env.JWT_SECRET ? 'YES' : 'NO',

  // Environment info
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_URL: process.env.VERCEL_URL,

  // All relevant env keys
  ALL_ENV_KEYS: Object.keys(process.env).filter(key =>
    key.includes('OPENAI') ||
    key.includes('STABILITY') ||
    key.includes('ADMIN') ||
    key.includes('JWT') ||
    key.includes('VERCEL')
  )
};

  res.json({
    message: 'Environment variables check',
    variables: safeEnv,
    timestamp: new Date().toISOString()
  });
}

module.exports = handler;