export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export function buildUrl(path) {
  if (!API_BASE_URL) return path;
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
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
    const err = new Error(data.error || 'Request failed');
    err.status = response.status;
    err.data = data;
    throw err;
  }
  return data;
}
