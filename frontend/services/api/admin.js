import { request } from './client';

export function adminLogin(username, password) {
  return request('/admin/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });
}

export function verifyAdminToken(token) {
  return request('/admin/verify', {
    method: 'POST',
    body: JSON.stringify({ token })
  });
}

export function getAdminUsers(token) {
  return request('/admin/users', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}
