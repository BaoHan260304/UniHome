import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = axios.create({ baseURL: `${API_URL}/api` });

api.interceptors.request.use((config) => {
  if (config.url && /(?:^|\/)(?:undefined|null|NaN)(?:$|\/|\?|#)/i.test(config.url)) {
    console.warn(`[api] Request cancelled due to invalid URL segment: ${config.url}`);
    return Promise.reject(new Error(`Invalid URL parameter: ${config.url}`));
  }
  const token = localStorage.getItem('authToken');
  if (token) config.headers['X-Auth-Token'] = token;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('authChange'));
    }
    return Promise.reject(err);
  }
);

export function getUser() {
  const raw = localStorage.getItem('user');
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function saveAuth(data: any) {
  if (data?.token) localStorage.setItem('authToken', data.token);
  if (data?.user) localStorage.setItem('user', JSON.stringify(data.user));
  window.dispatchEvent(new Event('authChange'));
}

export function updateUser(userData: any) {
  if (userData) {
    localStorage.setItem('user', JSON.stringify(userData));
    window.dispatchEvent(new Event('authChange'));
  }
}

export function clearAuth() {
  const token = localStorage.getItem('authToken');
  if (token) {
    void api.post('/auth/logout').catch(() => {});
  }
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.dispatchEvent(new Event('authChange'));
}

export function money(value?: number | null) {
  if (value == null) return '—';
  return `${Number(value).toLocaleString('vi-VN')} ₫`;
}

export function mediaList(value?: string | null): string[] {
  if (!value) return [];
  try {
    if (value.startsWith('[')) return JSON.parse(value);
    return [value];
  } catch { return [value]; }
}

export function resolveMediaUrl(url?: string | null): string {
  if (!url) return '';
  if (url.startsWith('/uploads/')) return `${API_URL}${url}`;
  return url;
}
