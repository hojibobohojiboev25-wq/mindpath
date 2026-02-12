async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Return safe environment variables for debugging
  const safeEnv = {
    NEXT_PUBLIC_TELEGRAM_BOT_USERNAME: process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME || 'NOT_SET',
    TELEGRAM_BOT_TOKEN_SET: process.env.TELEGRAM_BOT_TOKEN ? 'YES' : 'NO',
    OPENAI_API_KEY_SET: process.env.OPENAI_API_KEY ? 'YES' : 'NO',
    STABILITY_API_KEY_SET: process.env.STABILITY_API_KEY ? 'YES' : 'NO',
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    VERCEL_URL: process.env.VERCEL_URL
  };

  res.json({
    message: 'Environment variables check',
    variables: safeEnv,
    timestamp: new Date().toISOString()
  });
}

module.exports = handler;