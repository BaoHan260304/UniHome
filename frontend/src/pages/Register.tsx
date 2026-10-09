import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api, saveAuth } from '../lib/api';

declare global {
  interface Window {
    google?: any;
    FB?: any;
  }
}

export default function Register() {
  const [role, setRole] = useState<'TENANT' | 'LANDLORD'>('TENANT');
  const [f, setF] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const googleRef = useRef<HTMLDivElement>(null);
  const nav = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';

  // Real-time validation
  const validate = () => {
    const errs: Record<string, string> = {};
    if (!f.fullName.trim()) errs.fullName = 'Họ và tên không được để trống';
    if (!f.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) errs.email = 'Email không đúng định dạng';
    const normPhone = f.phone.trim().replace(/\D/g, '');
    if (!normPhone || normPhone.length !== 10 || !/^0[35789]\d{8}$/.test(normPhone)) {
      errs.phone = 'Số điện thoại Việt Nam không hợp lệ (10 số, ví dụ: 0912345678)';
    }
    if (!f.password || f.password.length < 8) {
      errs.password = 'Mật khẩu tối thiểu 8 ký tự';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(f.password)) {
      errs.password = 'Mật khẩu phải chứa cả chữ cái và số';
    }
    if (f.confirmPassword !== f.password) {
      errs.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }
    if (!agreeTerms) {
      errs.agreeTerms = 'Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFieldChange = (key: string, value: string) => {
    setF(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/register', {
        fullName: f.fullName.trim(),
        email: f.email.trim().toLowerCase(),
        phone: f.phone.trim(),
        password: f.password,
        confirmPassword: f.confirmPassword,
        role,
        agreeTerms
      });

      // Redirect to Verify OTP screen
      nav('/verify-otp', {
        state: {
          userId: res.data.userId,
          email: res.data.email,
          phone: res.data.phone,
          emailVerified: res.data.emailVerified,
          phoneVerified: res.data.phoneVerified,
          from
        }
      });
    } catch (err: any) {
      if (err.response?.data?.fieldErrors) {
        setErrors(err.response.data.fieldErrors);
      } else {
        setServerError(err.response?.data?.message || 'Đăng ký không thành công. Vui lòng kiểm tra lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Google Sign-In setup
  useEffect(() => {
    const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!googleClientId) return;

    const setupGoogle = () => {
      if (!window.google || !googleRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response: any) => {
          try {
            const res = await api.post('/auth/google', { idToken: response.credential });
            if (res.data.status === 'REQUIRE_COMPLETION') {
              nav('/social-complete', { state: { ...res.data, from } });
            } else if (res.data.status === 'PENDING_VERIFICATION') {
              nav('/verify-otp', { state: { ...res.data, from } });
            } else {
              saveAuth(res.data);
              nav(from, { replace: true });
            }
          } catch (err: any) {
            setServerError(err.response?.data?.message || 'Đăng nhập Google không thành công');
          }
        }
      });
      window.google.accounts.id.renderButton(googleRef.current, {
        theme: 'outline',
        size: 'large',
        width: 360,
        text: 'signup_with'
      });
    };

    if (window.google) {
      setupGoogle();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.onload = setupGoogle;
    document.head.appendChild(script);
  }, [from, nav]);

  // Facebook Login
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
            .then(res => {
              if (res.data.status === 'REQUIRE_COMPLETION') {
                nav('/social-complete', { state: { ...res.data, from } });
              } else if (res.data.status === 'PENDING_VERIFICATION') {
                nav('/verify-otp', { state: { ...res.data, from } });
              } else {
                saveAuth(res.data);
                nav(from, { replace: true });
              }
            })
            .catch(err => {
              setServerError(err.response?.data?.message || 'Đăng nhập Facebook không thành công');
            });
        }
      }, { scope: 'email,public_profile' });
    };

    if (window.FB) {
      runFbAuth();
      return;
    }

    // Load SDK
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white py-16 px-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 md:p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-indigo-600 tracking-tight">UniHome</h2>
          <p className="mt-1.5 text-sm text-gray-600">Đăng ký tài khoản sinh viên hoặc chủ trọ</p>
        </div>

        {/* Role toggle */}
        <div className="flex p-1 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setRole('TENANT')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
              role === 'TENANT' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Sinh viên / Người thuê
          </button>
          <button
            type="button"
            onClick={() => setRole('LANDLORD')}
            className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
              role === 'LANDLORD' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Chủ trọ
          </button>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {serverError}
          </div>
        )}

        <form className="space-y-4" onSubmit={submit} noValidate>
          {/* Full name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên</label>
            <input
              type="text"
              value={f.fullName}
              onChange={e => handleFieldChange('fullName', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
              }`}
              placeholder="Nguyễn Văn A"
            />
            {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={f.email}
              onChange={e => handleFieldChange('email', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.email ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
              }`}
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại liên hệ</label>
            <input
              type="tel"
              value={f.phone}
              onChange={e => handleFieldChange('phone', e.target.value)}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.phone ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
              }`}
              placeholder="0912345678"
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={f.password}
                onChange={e => handleFieldChange('password', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 pr-10 ${
                  errors.password ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                }`}
                placeholder="Tối thiểu 8 ký tự, gồm chữ và số"
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

          {/* Confirm Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Nhập lại mật khẩu</label>
            <div className="relative">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={f.confirmPassword}
                onChange={e => handleFieldChange('confirmPassword', e.target.value)}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 pr-10 ${
                  errors.confirmPassword ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                }`}
                placeholder="Nhập lại mật khẩu vừa tạo"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600 font-medium"
              >
                {showConfirmPassword ? 'Ẩn' : 'Hiện'}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Agree Terms */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={e => {
                  setAgreeTerms(e.target.checked);
                  if (errors.agreeTerms) {
                    setErrors(prev => {
                      const copy = { ...prev };
                      delete copy.agreeTerms;
                      return copy;
                    });
                  }
                }}
                className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                Tôi đồng ý với <span className="text-indigo-600 font-medium">Điều khoản dịch vụ</span> và{' '}
                <span className="text-indigo-600 font-medium">Chính sách bảo mật</span> của UniHome.
              </span>
            </label>
            {errors.agreeTerms && <p className="text-xs text-red-600 mt-1">{errors.agreeTerms}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-60 transition-colors"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
          </button>
        </form>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
          <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-gray-400">Hoặc tiếp tục với</span></div>
        </div>

        {/* Social login buttons */}
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
            Đăng ký bằng Facebook
          </button>
        </div>

        <p className="text-center text-xs text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" state={{ from }} className="font-semibold text-indigo-600 hover:underline">
            Đăng nhập
          </Link>
        </p>

        <div className="pt-2 border-t text-center">
          <Link to={from === '/register' ? '/' : from} className="text-xs font-medium text-gray-500 hover:text-indigo-600">
            ← Quay lại trang trước
          </Link>
        </div>
      </div>
    </div>
  );
}
