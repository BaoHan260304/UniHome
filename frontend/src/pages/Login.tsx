import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api, saveAuth } from '../lib/api';

declare global { interface Window { google?: any } }

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const location = useLocation();
  const googleRef = useRef<HTMLDivElement>(null);
  const from = (location.state as any)?.from || '/';

  const go = (data: any) => {
    saveAuth(data);
    nav(from, { replace: true, state: { resumeAction: (location.state as any)?.action } });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    api.post('/auth/login', { email, password })
      .then(r => go(r.data))
      .catch(e => alert(e.response?.data?.message || 'Sai email hoặc mật khẩu'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!id) return;
    const setup = () => {
      if (!window.google || !googleRef.current) return;
      window.google.accounts.id.initialize({
        client_id: id,
        callback: (x: any) => api.post('/auth/google', { idToken: x.credential })
          .then(r => go(r.data))
          .catch(() => alert('Google Login thất bại'))
      });
      window.google.accounts.id.renderButton(googleRef.current, { theme: 'outline', size: 'large', width: 360, text: 'signin_with' });
    };
    if (window.google) { setup(); return; }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = setup;
    document.head.appendChild(s);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white py-20 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-2 text-center text-4xl font-extrabold text-indigo-600 tracking-tight">UniHome</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Chào mừng trở lại! Vui lòng đăng nhập.</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={submit}>
          <div className="space-y-3">
            <input type="email" required className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" required className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Mật khẩu" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button disabled={loading} className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-60">{loading ? 'Đang đăng nhập...' : 'Đăng nhập'}</button>
          <div ref={googleRef} className="flex justify-center"></div>
          <div className="flex justify-between text-sm gap-3">
            <Link to="/forgot-password" state={{ from }} className="text-indigo-600">Quên mật khẩu?</Link>
            <span>Chưa có tài khoản? <Link to="/register" state={{ from }} className="font-medium text-indigo-600">Đăng ký ngay</Link></span>
          </div>
          <div className="pt-4 border-t text-center">
            <Link to={from === '/login' ? '/' : from} className="text-sm font-medium text-gray-600 hover:text-indigo-600">← Quay lại trang trước</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
