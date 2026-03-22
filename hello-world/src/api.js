import { getCurrentToken } from './auth';

const API_BASE = process.env.REACT_APP_API_GATEWAY_URL;

const MOCK_DATA = {
  '/items': [
    { id: 1, name: 'Monitor', description: 'Dell 27 inch 4K', created_at: '2026-03-20 16:45:20.982363' },
    { id: 2, name: 'Keyboard', description: 'Mechanical wireless', created_at: '2026-03-20 16:45:21.132014' },
    { id: 3, name: 'Demo Item', description: 'Created during demo', created_at: '2026-03-20 16:50:02.896560' },
  ],
};

export async function apiFetch(path, options = {}) {
  if (process.env.REACT_APP_USE_MOCK === 'true') {
    return MOCK_DATA[path] ?? [];
  }
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (process.env.REACT_APP_USE_AUTH === 'true') {
    headers.Authorization = `Bearer ${await getCurrentToken()}`;
  }
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}
