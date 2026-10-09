import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';

export default function ForgotPassword() {
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const [success, setSuccess] = useState(false);

  const nav = useNavigate();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    setMessage('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Vui lòng nhập địa chỉ email hợp lệ' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email: email.trim().toLowerCase() });
      setMessage(res.data.message || 'Mã OTP đã được gửi về email của bạn.');
      setStep(2);
    } catch (err: any) {
      if (err.response?.data?.fieldErrors) {
        setErrors(err.response.data.fieldErrors);
      } else {
        setServerError(err.response?.data?.message || 'Không tìm thấy tài khoản với email này');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    const errs: Record<string, string> = {};

    if (!code.trim() || code.length < 6) {
      errs.code = 'Vui lòng nhập đủ 6 chữ số mã OTP';
    }
    if (!newPassword || newPassword.length < 8) {
      errs.newPassword = 'Mật khẩu mới tối thiểu 8 ký tự';
    } else if (!/(?=.*[A-Za-z])(?=.*\d)/.test(newPassword)) {
      errs.newPassword = 'Mật khẩu phải chứa cả chữ cái và số';
    }
    if (confirmPassword !== newPassword) {
      errs.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email: email.trim().toLowerCase(),
        code: code.trim(),
        newPassword,
        confirmPassword
      });
      setMessage(res.data.message || 'Đặt lại mật khẩu thành công!');
      setSuccess(true);
    } catch (err: any) {
      if (err.response?.data?.fieldErrors) {
        setErrors(err.response.data.fieldErrors);
      } else {
        setServerError(err.response?.data?.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white py-16 px-4">
      <div className="max-w-md w-full space-y-6 bg-white p-8 md:p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-indigo-600 tracking-tight">Đặt lại mật khẩu</h2>
          <p className="mt-1.5 text-sm text-gray-600">
            {step === 1 ? 'Nhập email tài khoản để nhận mã OTP' : `Nhập mã OTP đã gửi tới ${email}`}
          </p>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {serverError}
          </div>
        )}

        {message && (
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-700">
            {message}
          </div>
        )}

        {success ? (
          <div className="text-center space-y-4 pt-2">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <p className="text-sm text-gray-700 font-medium">
              Mật khẩu đã được cập nhật thành công. Vui lòng đăng nhập bằng mật khẩu mới.
            </p>
            <button
              onClick={() => nav('/login')}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
            >
              Đăng nhập ngay
            </button>
          </div>
        ) : step === 1 ? (
          <form onSubmit={handleRequestOtp} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Email tài khoản</label>
              <input
                type="email"
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({});
                }}
                className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.email ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                }`}
                placeholder="name@example.com"
              />
              {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-60 transition-colors"
            >
              {loading ? 'Đang gửi mã...' : 'Nhận mã xác thực OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mã xác thực OTP (6 chữ số)</label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={e => {
                  setCode(e.target.value.replace(/\D/g, ''));
                  if (errors.code) setErrors(prev => ({ ...prev, code: '' }));
                }}
                className={`w-full px-4 py-2.5 border rounded-xl text-center text-lg font-mono tracking-widest outline-none focus:ring-2 focus:ring-indigo-500 ${
                  errors.code ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                }`}
                placeholder="000000"
              />
              {errors.code && <p className="text-xs text-red-600 mt-1">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) setErrors(prev => ({ ...prev, newPassword: '' }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 pr-10 ${
                    errors.newPassword ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
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
              {errors.newPassword && <p className="text-xs text-red-600 mt-1">{errors.newPassword}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                  }}
                  className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 pr-10 ${
                    errors.confirmPassword ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
                  }`}
                  placeholder="Nhập lại mật khẩu mới"
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

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50"
              >
                ← Gửi lại mã
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-2.5 text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-60 transition-colors"
              >
                {loading ? 'Đang cập nhật...' : 'Đổi mật khẩu'}
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 border-t text-center">
          <Link to="/login" className="text-xs font-medium text-gray-500 hover:text-indigo-600">
            ← Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
