import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function VoucherVerifyPage() {
  const { token } = useParams<{ token: string }>();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    void api.post(`/rewards/verify/${token}`)
      .then((res) => {
        setResult(res.data);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Mã xác thực không hợp lệ hoặc đã hết hạn');
      })
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-3xl mx-auto">
          🎟
        </div>

        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Xác thực Voucher UniHome</h1>
          <p className="text-xs text-gray-500 mt-1">Cổng kiểm tra dành cho đối tác & nhân viên thu ngân</p>
        </div>

        {loading ? (
          <div className="py-8 text-sm text-gray-400">Đang kiểm tra mã ưu đãi...</div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs space-y-2">
            <span className="text-2xl block">⚠️</span>
            <p className="font-bold">{error}</p>
          </div>
        ) : result ? (
          <div className="space-y-4">
            <div className={`p-4 rounded-2xl border ${
              result.valid
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}>
              <span className="text-3xl block mb-1">{result.valid ? '✅' : 'ℹ️'}</span>
              <p className="font-extrabold text-sm">{result.message}</p>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-2 text-xs border border-gray-100">
              <div className="flex justify-between">
                <span className="text-gray-500">Đối tác:</span>
                <span className="font-bold text-gray-900">{result.partnerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Ưu đãi:</span>
                <span className="font-bold text-gray-900">{result.voucherTitle}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mã voucher:</span>
                <span className="font-mono font-black text-indigo-700 text-sm">{result.voucherCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Trạng thái:</span>
                <span className="font-bold text-gray-900">{result.status}</span>
              </div>
              {result.usedAt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Thời gian dùng:</span>
                  <span className="text-gray-700">{new Date(result.usedAt).toLocaleString('vi-VN')}</span>
                </div>
              )}
            </div>
          </div>
        ) : null}

        <div className="pt-2">
          <Link
            to="/"
            className="inline-block text-xs font-bold text-indigo-600 hover:text-indigo-800"
          >
            ← Về trang chủ UniHome
          </Link>
        </div>
      </div>
    </div>
  );
}
