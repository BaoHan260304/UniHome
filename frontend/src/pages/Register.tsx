import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

export default function Register() {
  const [role, setRole] = useState('tenant');
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', phone: '' });
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    axios.post('http://localhost:8080/api/auth/register', { ...formData, role })
      .then(() => {
        alert("Đăng ký thành công!");
        navigate('/login');
      })
      .catch(err => {
          const data = err.response?.data;
          if (typeof data === 'string') {
              alert(data);
          } else if (data && typeof data === 'object') {
              // Bắt lỗi mặc định của Spring Boot trả về dạng JSON object
              alert(data.message || "Lỗi máy chủ: " + JSON.stringify(data));
          } else {
              alert("Lỗi đăng ký không xác định");
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
          <p className="mt-2 text-center text-sm text-gray-600">Tạo tài khoản mới</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="flex justify-center space-x-4 mb-6">
            <button type="button" onClick={() => setRole('tenant')} className={`px-4 py-2 rounded-lg font-medium text-sm ${role === 'tenant' ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>Người Thuê</button>
            <button type="button" onClick={() => setRole('manager')} className={`px-4 py-2 rounded-lg font-medium text-sm ${role === 'manager' ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-500' : 'bg-gray-50 text-gray-500 border border-gray-200'}`}>Chủ Trọ</button>
          </div>
          
          <div className="space-y-3">
            <input required type="text" className="appearance-none w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 sm:text-sm" placeholder="Họ và tên" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
            <input required type="email" className="appearance-none w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 sm:text-sm" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            <input required type="password" className="appearance-none w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 sm:text-sm" placeholder="Mật khẩu" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
            <input required type="text" className="appearance-none w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-indigo-500 sm:text-sm" placeholder="Số điện thoại liên hệ" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>

          <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm">
            Đăng Ký
          </button>
          <p className="text-center text-sm text-gray-600 mt-4">
            Đã có tài khoản? <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">Đăng nhập</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
