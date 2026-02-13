export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';
const API_PREFIX = '/api/v1';

export function buildUrl(path) {
  if (!API_BASE_URL) return `${API_PREFIX}${path}`;
  return `${API_BASE_URL.replace(/\/$/, '')}${API_PREFIX}${path}`;
}

export async function request(path, options = {}) {
  const response = await fetch(buildUrl(path), {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const err = new Error(data?.error?.message || data?.message || 'Request failed');
    err.status = response.status;
    err.data = data;
    throw err;
  }
  if (data && typeof data === 'object' && 'success' in data) {
    return data.data;
  }
  return data;
}
