import { request } from './client';

export function listAssistantThreads(profileId) {
  return request(`/assistant/threads?profileId=${encodeURIComponent(profileId)}`);
}

export function createAssistantThread(profileId, title) {
  return request('/assistant/threads', {
    method: 'POST',
    body: JSON.stringify({ profileId, title })
  });
}

export function listAssistantMessages(threadId) {
  return request(`/assistant/messages?threadId=${encodeURIComponent(threadId)}`);
}

export function sendAssistantMessage(profileId, threadId, content) {
  return request('/assistant/messages', {
    method: 'POST',
    body: JSON.stringify({ profileId, threadId, content })
  });
}
