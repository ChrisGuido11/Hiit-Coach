// API configuration for both web and mobile
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

export async function apiRequest(
  path: string,
  options?: RequestInit
): Promise<Response> {
  const url = getApiUrl(path);
  return fetch(url, {
    ...options,
    credentials: 'include',
  });
}
