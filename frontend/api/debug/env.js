async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

// Return safe environment variables for debugging
const safeEnv = {
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'NOT_SET',
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME_TYPE: typeof process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME,
  NEXT_PUBLIC_TELEGRAM_BOT_USERNAME_VALUE: `"${process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME}"`,
  TELEGRAM_BOT_TOKEN_SET: process.env.TELEGRAM_BOT_TOKEN ? 'YES' : 'NO',
  TELEGRAM_BOT_TOKEN_PREFIX: process.env.TELEGRAM_BOT_TOKEN ? process.env.TELEGRAM_BOT_TOKEN.substring(0, 10) + '...' : 'NOT_SET',
  OPENAI_API_KEY_SET: process.env.OPENAI_API_KEY ? 'YES' : 'NO',
  STABILITY_API_KEY_SET: process.env.STABILITY_API_KEY ? 'YES' : 'NO',
  NODE_ENV: process.env.NODE_ENV,
  VERCEL_ENV: process.env.VERCEL_ENV,
  VERCEL_URL: process.env.VERCEL_URL,
  ALL_ENV_KEYS: Object.keys(process.env).filter(key => key.includes('TELEGRAM') || key.includes('NEXT_PUBLIC') || key.includes('VERCEL'))
};

  res.json({
    message: 'Environment variables check',
    variables: safeEnv,
    timestamp: new Date().toISOString()
  });
}

module.exports = handler;