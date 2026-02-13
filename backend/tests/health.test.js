const test = require('node:test');
const assert = require('node:assert/strict');
const { buildApp } = require('../src/app');

test('GET /api/v1/health returns ok', async (t) => {
  const app = await buildApp({
    corsOrigin: 'http://localhost:3000',
    jwtSecret: 'test-secret',
    openAiApiKey: '',
    stabilityApiKey: '',
    adminUsername: 'admin',
    adminPassword: 'admin'
  });
  await app.ready();
  t.after(async () => app.close());

  const res = await app.inject({
    method: 'GET',
    url: '/api/v1/health'
  });

  assert.equal(res.statusCode, 200);
  const body = res.json();
  assert.equal(body.success, true);
  assert.equal(body.data.status, 'ok');
});
