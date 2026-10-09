import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { api, saveAuth } from '../lib/api';

export default function Register() {
  const [role, setRole] = useState('TENANT');
  const [f, setF] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || '/';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    api.post('/auth/register', { ...f, role })
      .then(r => { saveAuth(r.data); nav(from, { replace: true }); })
      .catch(e => alert(e.response?.data?.message || 'Đăng ký thất bại'))
      .finally(() => setLoading(false));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white py-20 px-4">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-2 text-center text-4xl font-extrabold text-indigo-600 tracking-tight">UniHome</h2>
          <p className="mt-2 text-center text-sm text-gray-600">Tạo tài khoản mới</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={submit}>
          <div className="flex justify-center space-x-4 mb-6">
            <button type="button" onClick={() => setRole('TENANT')} className={`px-4 py-2 rounded-lg font-medium text-sm ${role === 'TENANT' ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>Sinh viên / Người thuê</button>
            <button type="button" onClick={() => setRole('LANDLORD')} className={`px-4 py-2 rounded-lg font-medium text-sm ${role === 'LANDLORD' ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>Chủ trọ</button>
          </div>
          <div className="space-y-3">
            {Object.entries(f).map(([k, v]) => <input key={k} required type={k === 'password' ? 'password' : k === 'email' ? 'email' : 'text'} className="appearance-none w-full px-4 py-3 border border-gray-300 rounded-lg sm:text-sm" placeholder={{ fullName: 'Họ và tên', email: 'Email', password: 'Mật khẩu', phone: 'Số điện thoại liên hệ' }[k as keyof typeof f]} value={v} onChange={e => setF({ ...f, [k]: e.target.value })} />)}
          </div>
          <button disabled={loading} className="w-full flex justify-center py-3 px-4 text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm disabled:opacity-60">{loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}</button>
          <p className="text-center text-sm text-gray-600">Đã có tài khoản? <Link to="/login" state={{ from }} className="font-medium text-indigo-600">Đăng nhập</Link></p>
          <div className="pt-4 border-t text-center"><Link to={from === '/register' ? '/' : from} className="text-sm font-medium text-gray-600 hover:text-indigo-600">← Quay lại trang trước</Link></div>
        </form>
      </div>
    </div>
  );
}
