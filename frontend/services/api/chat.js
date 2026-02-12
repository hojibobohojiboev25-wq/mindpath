import { request } from './client';

export function joinChat(profile) {
  return request('/api/chat/join', {
    method: 'POST',
    body: JSON.stringify(profile)
  });
}

export function sendChatMessage(payload) {
  return request('/api/chat/messages', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getChatHistory(limit = 100) {
  return request(`/api/chat/history?limit=${limit}`);
}

export function markDelivered(messageId, profileId) {
  return request('/api/chat/receipts/delivered', {
    method: 'POST',
    body: JSON.stringify({ messageId, profileId })
  });
}

export function markRead(messageId, profileId) {
  return request('/api/chat/receipts/read', {
    method: 'POST',
    body: JSON.stringify({ messageId, profileId })
  });
}
