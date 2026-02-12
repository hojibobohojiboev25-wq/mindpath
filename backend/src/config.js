const REQUIRED_ENV = ['DATABASE_URL', 'JWT_SECRET'];

function getConfig() {
  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
  if (missing.length) {
    throw new Error(`Missing required env vars: ${missing.join(', ')}`);
  }

  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: Number(process.env.PORT || 3001),
    host: process.env.HOST || '0.0.0.0',
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET,
    openAiApiKey: process.env.OPENAI_API_KEY || '',
    stabilityApiKey: process.env.STABILITY_API_KEY || '',
    adminUsername: process.env.ADMIN_USERNAME || 'admin',
    adminPassword: process.env.ADMIN_PASSWORD || 'change-me'
  };
}

module.exports = { getConfig };
