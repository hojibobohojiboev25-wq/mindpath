const { z } = require('zod');
const { ok, fail } = require('../lib/response');
const {
  createThread,
  listThreads,
  listMessages,
  sendMessage
} = require('../services/assistantService');

async function assistantRoutes(app, config) {
  app.get('/assistant/threads', async (req, reply) => {
    const parsed = z.object({ profileId: z.string().min(1) }).safeParse(req.query || {});
    if (!parsed.success) return fail(reply, 400, 'BAD_REQUEST', 'profileId is required');
    const threads = await listThreads(parsed.data.profileId);
    return ok(reply, { threads });
  });

  app.post('/assistant/threads', async (req, reply) => {
    const parsed = z.object({
      profileId: z.string().min(1),
      title: z.string().max(120).optional()
    }).safeParse(req.body || {});
    if (!parsed.success) return fail(reply, 400, 'BAD_REQUEST', 'Invalid thread payload');
    const thread = await createThread(parsed.data.profileId, parsed.data.title);
    return ok(reply, { thread });
  });

  app.get('/assistant/messages', async (req, reply) => {
    const parsed = z.object({ threadId: z.string().min(1) }).safeParse(req.query || {});
    if (!parsed.success) return fail(reply, 400, 'BAD_REQUEST', 'threadId is required');
    const messages = await listMessages(parsed.data.threadId);
    return ok(reply, { messages });
  });

  app.post('/assistant/messages', async (req, reply) => {
    const parsed = z.object({
      profileId: z.string().min(1),
      threadId: z.string().min(1),
      content: z.string().min(1).max(2000)
    }).safeParse(req.body || {});
    if (!parsed.success) return fail(reply, 400, 'BAD_REQUEST', 'Invalid message payload');
    try {
      const message = await sendMessage({ ...parsed.data, openAiApiKey: config.openAiApiKey });
      return ok(reply, { message });
    } catch (error) {
      return fail(reply, 404, 'THREAD_NOT_FOUND', error.message);
    }
  });
}

module.exports = { assistantRoutes };
