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

export function getVipCosmeticStyle(style?: string | null): { textClass: string; badgeClass: string; glowClass: string } {
  switch (style?.toUpperCase()) {
    case 'NEON_VIOLET':
      return {
        textClass: 'text-purple-600 font-black drop-shadow-[0_0_8px_rgba(168,85,247,0.7)]',
        badgeClass: 'bg-purple-600 text-white font-black shadow-[0_0_10px_rgba(168,85,247,0.5)]',
        glowClass: 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.4)]'
      };
    case 'AURORA':
      return {
        textClass: 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500 bg-clip-text text-transparent font-black',
        badgeClass: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-black shadow-xs',
        glowClass: 'border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]'
      };
    case 'SUNSET_GOLD':
    case 'GOLD':
      return {
        textClass: 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 bg-clip-text text-transparent font-black',
        badgeClass: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-950 font-black shadow-xs',
        glowClass: 'border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
      };
    case 'CRIMSON_EDGE':
      return {
        textClass: 'text-rose-600 font-black drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]',
        badgeClass: 'bg-rose-600 text-white font-black shadow-xs',
        glowClass: 'border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.4)]'
      };
    case 'ICE_BLUE':
      return {
        textClass: 'text-cyan-500 font-black drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]',
        badgeClass: 'bg-cyan-500 text-white font-black shadow-xs',
        glowClass: 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
      };
    case 'HOLOGRAPHIC':
      return {
        textClass: 'bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-500 bg-clip-text text-transparent font-black',
        badgeClass: 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white font-black shadow-xs',
        glowClass: 'border-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.4)]'
      };
    default:
      return {
        textClass: 'text-gray-900 font-bold',
        badgeClass: 'bg-gray-100 text-gray-700 font-semibold',
        glowClass: 'border-gray-200'
      };
  }
}
