import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post('http://localhost:8080/api/auth/login', { email, password })
      .then(res => {
        const user = res.data;
        localStorage.setItem('user', JSON.stringify(user));
        if (user.role === 'manager') {
          navigate('/manager/posts');
        } else {
          navigate('/tenant/profile');
        }
      })
      .catch((err) => {
          const data = err.response?.data;
          if (typeof data === 'string') {
              alert(data);
          } else if (data && typeof data === 'object') {
              alert(data.message || "Lỗi đăng nhập: " + JSON.stringify(data));
          } else {
              alert("Sai email hoặc mật khẩu!");
          }
      });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl">
        <div>
          <h2 className="mt-2 text-center text-4xl font-extrabold text-indigo-600 tracking-tight">
            UniHome
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Chào mừng trở lại! Vui lòng đăng nhập.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm space-y-3">
            <input
              type="email" required
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Email (vd: chutro@unihome.vn, binh@unihome.vn)"
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password" required
              className="appearance-none relative block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Mật khẩu (vd: 123)"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm">
            Đăng nhập
          </button>
          <p className="text-center text-sm text-gray-600 mt-4">
            Chưa có tài khoản? <Link to="/register" className="font-medium text-indigo-600 hover:text-indigo-500">Đăng ký ngay</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
