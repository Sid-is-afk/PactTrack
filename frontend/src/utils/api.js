import { auth } from '../firebase';

const API_BASE = 'https://pacttrack.onrender.com/api';

/**
 * Get the current Firebase ID token from the logged-in user.
 * Returns null if no user is signed in.
 */
const getToken = async () => {
  const user = auth.currentUser;
  if (!user) return null;
  return user.getIdToken();
};

/**
 * Make an authenticated API request.
 * Automatically attaches the Firebase Bearer token.
 */
const apiRequest = async (endpoint, options = {}) => {
  const token = await getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) return null;
  return response.json();
};

export const apiGet = (endpoint) => apiRequest(endpoint);

export const apiPost = (endpoint, data) =>
  apiRequest(endpoint, { method: 'POST', body: JSON.stringify(data) });

export const apiPut = (endpoint, data) =>
  apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(data) });

export const apiDelete = (endpoint) =>
  apiRequest(endpoint, { method: 'DELETE' });
