import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api, saveAuth } from '../lib/api';

export default function VerifyOtp() {
  const nav = useNavigate();
  const location = useLocation();
  const state = (location.state as any) || {};

  const [userId, setUserId] = useState<number | null>(state.userId || null);
  const [email, setEmail] = useState<string>(state.email || '');
  const [phone, setPhone] = useState<string>(state.phone || '');
  const [emailVerified, setEmailVerified] = useState<boolean>(state.emailVerified || false);
  const [phoneVerified, setPhoneVerified] = useState<boolean>(state.phoneVerified || false);

  const [emailCode, setEmailCode] = useState('');
  const [phoneCode, setPhoneCode] = useState('');

  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [phoneMsg, setPhoneMsg] = useState('');

  const [emailTimer, setEmailTimer] = useState(60);
  const [phoneTimer, setPhoneTimer] = useState(60);
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const [verifyingPhone, setVerifyingPhone] = useState(false);
  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [sendingPhoneOtp, setSendingPhoneOtp] = useState(false);

  const from = state.from || '/';

  // Check state or lookup if user navigated with email parameter
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailParam = params.get('email');
    if (emailParam && !email) {
      setEmail(emailParam);
      void api.post('/auth/continue-verification', { email: emailParam })
        .then(r => {
          setUserId(r.data.userId);
          setPhone(r.data.phone || '');
          setEmailVerified(r.data.emailVerified || false);
          setPhoneVerified(r.data.phoneVerified || false);
        })
        .catch(() => {});
    }
  }, [location.search]);

  // Timers countdown
  useEffect(() => {
    const t = setInterval(() => {
      setEmailTimer(prev => (prev > 0 ? prev - 1 : 0));
      setPhoneTimer(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const sendEmailOtp = async () => {
    if (emailTimer > 0) return;
    setSendingEmailOtp(true);
    setEmailError('');
    setEmailMsg('');
    try {
      const res = await api.post('/auth/send-otp', {
        userId,
        email,
        channel: 'EMAIL',
        purpose: 'REGISTER'
      });
      setEmailMsg(res.data.message || 'Đã gửi mã xác nhận qua Email');
      setEmailTimer(60);
    } catch (err: any) {
      setEmailError(err.response?.data?.message || 'Không thể gửi mã xác nhận qua Email');
    } finally {
      setSendingEmailOtp(false);
    }
  };

  const sendPhoneOtp = async () => {
    if (phoneTimer > 0) return;
    setSendingPhoneOtp(true);
    setPhoneError('');
    setPhoneMsg('');
    try {
      const res = await api.post('/auth/send-otp', {
        userId,
        email,
        channel: 'PHONE',
        purpose: 'REGISTER'
      });
      setPhoneMsg(res.data.message || 'Đã gửi mã xác nhận qua SMS');
      setPhoneTimer(60);
    } catch (err: any) {
      setPhoneError(err.response?.data?.message || 'Không thể gửi mã xác nhận qua SMS');
    } finally {
      setSendingPhoneOtp(false);
    }
  };

  const verifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailCode.trim() || emailCode.length < 6) {
      setEmailError('Vui lòng nhập đủ 6 chữ số mã xác thực');
      return;
    }
    setVerifyingEmail(true);
    setEmailError('');
    setEmailMsg('');
    try {
      const res = await api.post('/auth/verify-otp', {
        userId,
        email,
        channel: 'EMAIL',
        purpose: 'REGISTER',
        code: emailCode.trim()
      });
      setEmailVerified(true);
      setEmailMsg(res.data.message || 'Xác minh email thành công!');
      if (res.data.isComplete && res.data.auth) {
        saveAuth(res.data.auth);
        setTimeout(() => nav(from, { replace: true }), 1000);
      }
    } catch (err: any) {
      setEmailError(err.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn');
    } finally {
      setVerifyingEmail(false);
    }
  };

  const verifyPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneCode.trim() || phoneCode.length < 6) {
      setPhoneError('Vui lòng nhập đủ 6 chữ số mã xác thực');
      return;
    }
    setVerifyingPhone(true);
    setPhoneError('');
    setPhoneMsg('');
    try {
      const res = await api.post('/auth/verify-otp', {
        userId,
        email,
        channel: 'PHONE',
        purpose: 'REGISTER',
        code: phoneCode.trim()
      });
      setPhoneVerified(true);
      setPhoneMsg(res.data.message || 'Xác minh số điện thoại thành công!');
      if (res.data.isComplete && res.data.auth) {
        saveAuth(res.data.auth);
        setTimeout(() => nav(from, { replace: true }), 1000);
      }
    } catch (err: any) {
      setPhoneError(err.response?.data?.message || 'Mã xác thực không đúng hoặc đã hết hạn');
    } finally {
      setVerifyingPhone(false);
    }
  };

  const allVerified = emailVerified && phoneVerified;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white py-16 px-4">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 md:p-10 rounded-2xl shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-indigo-600 tracking-tight">Xác thực tài khoản</h2>
          <p className="mt-2 text-sm text-gray-600">
            Để bảo vệ cộng đồng UniHome, cả người thuê và chủ trọ đều cần xác thực Email và Số điện thoại.
          </p>
        </div>

        {allVerified ? (
          <div className="bg-green-50 border border-green-200 p-6 rounded-2xl text-center space-y-4">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ✓
            </div>
            <h3 className="text-lg font-bold text-green-800">Tài khoản đã kích hoạt thành công!</h3>
            <p className="text-sm text-green-700">Bạn đang được chuyển hướng về trang UniHome...</p>
            <button
              onClick={() => nav(from, { replace: true })}
              className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
            >
              Tiếp tục ngay
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Step 1: Email Verification */}
            <div className={`p-5 rounded-2xl border transition-all ${emailVerified ? 'bg-green-50/60 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${emailVerified ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white'}`}>
                    {emailVerified ? '✓' : '1'}
                  </span>
                  <span className="font-bold text-gray-900 text-sm">Xác thực Email</span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${emailVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Mã OTP 6 số đã được gửi tới: <strong className="text-gray-700">{email || 'email của bạn'}</strong>
              </p>

              {!emailVerified ? (
                <form onSubmit={verifyEmail} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Mã 6 chữ số"
                      value={emailCode}
                      onChange={e => setEmailCode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-center text-lg font-mono tracking-widest outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={verifyingEmail || emailCode.length < 6}
                      className="px-4 py-2 bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      {verifyingEmail ? 'Kiểm tra...' : 'Xác nhận'}
                    </button>
                  </div>
                  {emailError && <p className="text-xs text-red-600 font-medium">{emailError}</p>}
                  {emailMsg && <p className="text-xs text-green-600 font-medium">{emailMsg}</p>}
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-gray-400">Không nhận được mã?</span>
                    <button
                      type="button"
                      onClick={sendEmailOtp}
                      disabled={emailTimer > 0 || sendingEmailOtp}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold disabled:text-gray-400"
                    >
                      {sendingEmailOtp ? 'Đang gửi...' : emailTimer > 0 ? `Gửi lại sau (${emailTimer}s)` : 'Gửi lại mã'}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-green-700 font-medium">✓ Email đã được xác thực an toàn.</p>
              )}
            </div>

            {/* Step 2: Phone Verification */}
            <div className={`p-5 rounded-2xl border transition-all ${phoneVerified ? 'bg-green-50/60 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${phoneVerified ? 'bg-green-600 text-white' : 'bg-indigo-600 text-white'}`}>
                    {phoneVerified ? '✓' : '2'}
                  </span>
                  <span className="font-bold text-gray-900 text-sm">Xác thực Số điện thoại</span>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${phoneVerified ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                  {phoneVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                Mã OTP 6 số qua SMS tới: <strong className="text-gray-700">{phone || 'số điện thoại của bạn'}</strong>
              </p>

              {!phoneVerified ? (
                <form onSubmit={verifyPhone} className="space-y-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="Mã 6 chữ số"
                      value={phoneCode}
                      onChange={e => setPhoneCode(e.target.value.replace(/\D/g, ''))}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-xl text-center text-lg font-mono tracking-widest outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="submit"
                      disabled={verifyingPhone || phoneCode.length < 6}
                      className="px-4 py-2 bg-indigo-600 disabled:opacity-50 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      {verifyingPhone ? 'Kiểm tra...' : 'Xác nhận'}
                    </button>
                  </div>
                  {phoneError && <p className="text-xs text-red-600 font-medium">{phoneError}</p>}
                  {phoneMsg && <p className="text-xs text-green-600 font-medium">{phoneMsg}</p>}
                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-gray-400">Chưa nhận được SMS?</span>
                    <button
                      type="button"
                      onClick={sendPhoneOtp}
                      disabled={phoneTimer > 0 || sendingPhoneOtp}
                      className="text-indigo-600 hover:text-indigo-800 font-semibold disabled:text-gray-400"
                    >
                      {sendingPhoneOtp ? 'Đang gửi...' : phoneTimer > 0 ? `Gửi lại sau (${phoneTimer}s)` : 'Gửi lại mã'}
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-xs text-green-700 font-medium">✓ Số điện thoại đã được xác thực.</p>
              )}
            </div>

            <div className="pt-4 border-t text-center">
              <Link to="/login" className="text-sm font-medium text-gray-500 hover:text-indigo-600">
                ← Quay lại trang Đăng nhập
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
