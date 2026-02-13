import { request } from './client';

export function joinChat(profile) {
  return request('/chat/join', {
    method: 'POST',
    body: JSON.stringify(profile)
  });
}

export function sendChatMessage(payload) {
  return request('/chat/messages', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function getChatHistory(limit = 100) {
  return request(`/chat/history?limit=${limit}`);
}

export function markDelivered(messageId, profileId) {
  return request('/chat/receipts/delivered', {
    method: 'POST',
    body: JSON.stringify({ messageId, profileId })
  });
}

export function markRead(messageId, profileId) {
  return request('/chat/receipts/read', {
    method: 'POST',
    body: JSON.stringify({ messageId, profileId })
  });
}
