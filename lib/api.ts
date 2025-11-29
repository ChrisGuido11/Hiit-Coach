import { API_URL } from './config';

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

// Profile API
export const profileApi = {
  get: () => apiRequest<any>('/api/profile'),
  create: (data: any) => apiRequest<any>('/api/profile', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (data: any) => apiRequest<any>('/api/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};

// Workout API
export const workoutApi = {
  generate: () => apiRequest<any>('/api/workout/generate'),
  saveSession: (data: any) => apiRequest<any>('/api/workout/session', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  getHistory: () => apiRequest<any[]>('/api/workout/history'),
};
