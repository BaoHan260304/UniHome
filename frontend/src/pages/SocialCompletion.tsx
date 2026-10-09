import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function SocialCompletion() {
  const nav = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};

  const [role, setRole] = useState<'TENANT' | 'LANDLORD'>('TENANT');
  const [email, setEmail] = useState<string>(state.email || '');
  const [fullName, setFullName] = useState<string>(state.fullName || '');
  const [phone, setPhone] = useState<string>('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');

  const authProvider = state.authProvider || 'GOOGLE';
  const sub = state.googleSub || state.facebookSub || '';
  const avatarUrl = state.avatarUrl || '';
  const requireEmail = state.requireEmail || !email;
  const from = state.from || '/';

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!fullName.trim()) errs.fullName = 'Họ và tên không được để trống';
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email không hợp lệ';
    const normPhone = phone.trim().replace(/\D/g, '');
    if (!normPhone || normPhone.length !== 10 || !/^0[35789]\d{8}$/.test(normPhone)) {
      errs.phone = 'Số điện thoại Việt Nam không hợp lệ (10 số, ví dụ 0912345678)';
    }
    if (!agreeTerms) errs.agreeTerms = 'Bạn cần đồng ý với Điều khoản dịch vụ và Chính sách bảo mật';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await api.post('/auth/social-complete', {
        authProvider,
        sub,
        email: email.trim().toLowerCase(),
        fullName: fullName.trim(),
        avatarUrl,
        role,
        phone: phone.trim()
      });

      // Redirect to VerifyOtp for phone OTP verification
      nav('/verify-otp', {
        state: {
          userId: res.data.userId,
          email: res.data.email,
          phone: res.data.phone,
          emailVerified: true,
          phoneVerified: false,
          from
        }
      });
    } catch (err: any) {
      if (err.response?.data?.fieldErrors) {
        setErrors(err.response.data.fieldErrors);
      } else {
        setServerError(err.response?.data?.message || 'Không thể hoàn thiện tài khoản. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white py-16 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          {avatarUrl ? (
            <img src={avatarUrl} alt={fullName} className="w-20 h-20 rounded-full mx-auto object-cover border-4 border-indigo-100 shadow-sm mb-3" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold mx-auto mb-3">
              {authProvider === 'FACEBOOK' ? 'FB' : 'G'}
            </div>
          )}
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Hoàn tất thiết lập tài khoản</h2>
          <p className="mt-1.5 text-xs text-gray-500">
            Đăng nhập qua {authProvider === 'FACEBOOK' ? 'Facebook' : 'Google'}. Vui lòng chọn vai trò và cung cấp số điện thoại liên hệ để kích hoạt.
          </p>
        </div>

        {serverError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
            {serverError}
          </div>
        )}

        <form onSubmit={submit} className="space-y-5">
          {/* Role selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">Bạn tham gia UniHome với tư cách:</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('TENANT')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  role === 'TENANT'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Sinh viên / Người thuê
              </button>
              <button
                type="button"
                onClick={() => setRole('LANDLORD')}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all border ${
                  role === 'LANDLORD'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                Chủ trọ
              </button>
            </div>
          </div>

          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên</label>
            <input
              type="text"
              value={fullName}
              onChange={e => { setFullName(e.target.value); if (errors.fullName) setErrors({ ...errors, fullName: '' }); }}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.fullName ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
              }`}
              placeholder="VD: Nguyễn Văn A"
            />
            {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              disabled={!requireEmail}
              value={email}
              onChange={e => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                !requireEmail ? 'bg-gray-50 text-gray-500 cursor-not-allowed border-gray-200' : errors.email ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
              }`}
              placeholder="name@example.com"
            />
            {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại liên hệ</label>
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); if (errors.phone) setErrors({ ...errors, phone: '' }); }}
              className={`w-full px-4 py-2.5 border rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                errors.phone ? 'border-red-400 bg-red-50/20' : 'border-gray-300'
              }`}
              placeholder="0912345678"
            />
            {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
            <p className="text-[11px] text-gray-400 mt-1">Hệ thống sẽ gửi mã xác thực SMS tới số này</p>
          </div>

          {/* Terms checkbox */}
          <div>
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-gray-600">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={e => { setAgreeTerms(e.target.checked); if (errors.agreeTerms) setErrors({ ...errors, agreeTerms: '' }); }}
                className="mt-0.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span>
                Tôi đồng ý với <span className="text-indigo-600 font-medium">Điều khoản sử dụng</span> và{' '}
                <span className="text-indigo-600 font-medium">Chính sách bảo mật</span> của UniHome.
              </span>
            </label>
            {errors.agreeTerms && <p className="text-xs text-red-600 mt-1">{errors.agreeTerms}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 text-sm font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-60 transition-colors"
          >
            {loading ? 'Đang hoàn tất...' : 'Tiếp tục xác thực'}
          </button>

          <div className="pt-2 text-center">
            <Link to="/login" className="text-xs text-gray-500 hover:text-indigo-600">
              ← Hủy và quay lại đăng nhập
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
