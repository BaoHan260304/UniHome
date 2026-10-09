import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api, saveAuth } from '../lib/api';

declare global {
  interface Window {
    google?: any;
    FB?: any;
  }
}

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const nav = useNavigate();
  const location = useLocation();
  const googleRef = useRef<HTMLDivElement>(null);
  const from = (location.state as any)?.from || '/';

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Vui lòng nhập email hợp lệ';
    }
    if (!password) {
      errs.password = 'Vui lòng nhập mật khẩu';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const go = (data: any) => {
    if (data.status === 'REQUIRE_COMPLETION') {
      nav('/social-complete', { state: { ...data, from } });
      return;
    }
    if (data.status === 'PENDING_VERIFICATION') {
      nav('/verify-otp', {
        state: {
          userId: data.userId,
          email: data.email,
          phone: data.phone,
          emailVerified: data.emailVerified,
          phoneVerified: data.phoneVerified,
          from
        }
      });
      return;
    }
    saveAuth(data);
    nav(from, { replace: true, state: { resumeAction: (location.state as any)?.action } });
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    api.post('/auth/login', { email: email.trim().toLowerCase(), password })
      .then(r => go(r.data))
      .catch(e => {
        if (e.response?.data?.fieldErrors) {
          setErrors(e.response.data.fieldErrors);
        } else {
          setServerError(e.response?.data?.message || 'Email hoặc mật khẩu không chính xác');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const id = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!id) return;
    const setup = () => {
      if (!window.google || !googleRef.current) return;
      window.google.accounts.id.initialize({
        client_id: id,
        callback: (x: any) =>
          api.post('/auth/google', { idToken: x.credential })
            .then(r => go(r.data))
            .catch(err => setServerError(err.response?.data?.message || 'Đăng nhập Google thất bại'))
      });
      window.google.accounts.id.renderButton(googleRef.current, {
        theme: 'outline',
        size: 'large',
        width: 360,
        text: 'signin_with'
      });
    };
    if (window.google) {
      setup();
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://accounts.google.com/gsi/client';
    s.async = true;
    s.onload = setup;
    document.head.appendChild(s);
  }, [from]);

  const handleFacebookLogin = () => {
    const fbAppId = import.meta.env.VITE_FACEBOOK_APP_ID;
    if (!fbAppId) {
      alert('Chưa cấu hình VITE_FACEBOOK_APP_ID trong file môi trường .env');
      return;
    }

    const runFbAuth = () => {
      if (!window.FB) {
        alert('Không thể kết nối tới Facebook SDK. Vui lòng thử lại sau.');
        return;
      }
      window.FB.login((response: any) => {
        if (response.authResponse?.accessToken) {
          api.post('/auth/facebook', { accessToken: response.authResponse.accessToken })
            .then(res => go(res.data))
            .catch(err => setServerError(err.response?.data?.message || 'Đăng nhập Facebook không thành công'));
        }
      }, { scope: 'email,public_profile' });
    };

    if (window.FB) {
      runFbAuth();
      return;
    }

    (window as any).fbAsyncInit = function () {
      window.FB.init({
        appId: fbAppId,
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      });
      runFbAuth();
    };
    const s = document.createElement('script');
    s.src = 'https://connect.facebook.net/vi_VN/sdk.js';
    s.async = true;
    document.head.appendChild(s);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white py-20 px-4">
      <div className="max-w-md w-full space-y-7 bg-white p-8 md:p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-indigo-600 tracking-tight">UniHome</h2>
          <p className="mt-1.5 text-sm text-gray-600">Chào mừng trở lại! Vui lòng đăng nhập.</p>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {serverError}
          </div>
        )}

        <form className="space-y-4" onSubmit={submit} noValidate>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
              }}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.email ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
              }`}
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-gray-700">Mật khẩu</label>
              <Link to="/forgot-password" state={{ from }} className="text-xs text-indigo-600 hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors(prev => ({ ...prev, password: '' }));
                }}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 pr-10 ${
                  errors.password ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                }`}
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600 font-medium"
              >
                {showPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-60 transition-colors"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Hoặc</span></div>
        </div>

        <div className="space-y-2.5">
          <div ref={googleRef} className="flex justify-center" />
          <button
            type="button"
            onClick={handleFacebookLogin}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
            </svg>
            Đăng nhập bằng Facebook
          </button>
        </div>

        <p className="text-center text-xs text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" state={{ from }} className="font-semibold text-indigo-600 hover:underline">
            Đăng ký ngay
          </Link>
        </p>

        <div className="pt-2 border-t text-center">
          <Link to={from === '/login' ? '/' : from} className="text-xs font-medium text-gray-500 hover:text-indigo-600">
            ← Quay lại trang trước
          </Link>
        </div>
      </div>
    </div>
  );
}
