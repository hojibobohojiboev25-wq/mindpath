async function healthRoutes(app) {
  app.get('/health', async () => ({
    status: 'ok',
    timestamp: new Date().toISOString()
  }));
}

module.exports = { healthRoutes };
