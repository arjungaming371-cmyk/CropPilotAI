import { supabase } from './supabaseClient';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

async function getAuthHeader() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.access_token) {
      return { Authorization: `Bearer ${session.access_token}` };
    }
  } catch (e) {
    console.warn('Session retrieval error:', e);
  }
  return { Authorization: 'Bearer demo-token' };
}

export async function fetchWithAuth(endpoint, options = {}) {
  const authHeader = await getAuthHeader();
  const headers = {
    'Content-Type': 'application/json',
    ...authHeader,
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Server error occurred');
  }
  return data;
}

export const api = {
  // Farms
  getFarms: () => fetchWithAuth('/api/farms'),
  createFarm: (farm) => fetchWithAuth('/api/farms', { method: 'POST', body: JSON.stringify(farm) }),
  createField: (field) => fetchWithAuth('/api/farms/fields', { method: 'POST', body: JSON.stringify(field) }),
  createCrop: (crop) => fetchWithAuth('/api/farms/crops', { method: 'POST', body: JSON.stringify(crop) }),

  // Advisories
  analyzeCrop: (payload) => fetchWithAuth('/api/advisories/analyze', { method: 'POST', body: JSON.stringify(payload) }),
  getAdvisories: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetchWithAuth(`/api/advisories${query ? `?${query}` : ''}`);
  },
  getAdvisoryById: (id) => fetchWithAuth(`/api/advisories/${id}`),
  updateAdvisoryStatus: (id, payload) => fetchWithAuth(`/api/advisories/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  }),

  // Health
  checkHealth: () => fetchWithAuth('/api/health')
};
