import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function MyVouchersPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedForQr, setSelectedForQr] = useState<any>(null);
  const [filter, setFilter] = useState<'ALL' | 'AVAILABLE' | 'USED'>('ALL');

  useEffect(() => {
    setLoading(true);
    void api.get('/rewards/my-vouchers')
      .then((r) => setVouchers(r.data || []))
      .catch(() => setVouchers([]))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (id: number, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredList = vouchers.filter((v) => {
    if (filter === 'AVAILABLE') return v.status === 'AVAILABLE';
    if (filter === 'USED') return v.status === 'USED';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/rewards" className="text-xs font-bold text-indigo-600 hover:underline">
              ← Kho ưu đãi
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-1">
            Voucher của tôi
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Quản lý mã ưu đãi đã đổi từ Điểm UniHome. Xuất trình mã hoặc QR cho thu ngân khi thanh toán.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-2xl text-xs font-bold">
          {(['ALL', 'AVAILABLE', 'USED'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                filter === mode ? 'bg-white text-gray-900 shadow-xs' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {mode === 'ALL' ? 'Tất cả' : mode === 'AVAILABLE' ? 'Chưa dùng' : 'Đã dùng'}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Đang tải danh sách voucher...</div>
      ) : filteredList.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-xs space-y-3">
          <span className="text-5xl block">🎟</span>
          <h3 className="text-base font-bold text-gray-800">Chưa có voucher nào trong mục này</h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Hãy tích lũy Điểm UniHome qua điểm danh và làm nhiệm vụ để đổi các voucher giảm giá hấp dẫn!
          </p>
          <Link
            to="/rewards"
            className="inline-block mt-2 bg-indigo-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl hover:bg-indigo-700 transition-colors"
          >
            Đến Kho Voucher đổi điểm →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredList.map((item) => {
            const isUsed = item.status === 'USED';
            const isExpired = item.status === 'EXPIRED';

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-5 border transition-all flex flex-col justify-between shadow-xs ${
                  isUsed
                    ? 'border-gray-200 opacity-60 bg-gray-50/50'
                    : 'border-indigo-100 hover:border-indigo-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                        {item.partnerName || 'Đối tác UniHome'}
                      </span>
                      <h3 className="text-sm font-bold text-gray-900 mt-2 line-clamp-2">
                        {item.voucherTitle}
                      </h3>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full shrink-0 ${
                        isUsed
                          ? 'bg-gray-200 text-gray-600'
                          : isExpired
                          ? 'bg-red-100 text-red-600'
                          : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {isUsed ? 'ĐÃ SỬ DỤNG' : isExpired ? 'HẾT HẠN' : 'KHẢ DỤNG'}
                    </span>
                  </div>

                  {/* Code Card */}
                  <div className="mt-4 bg-gray-50 rounded-2xl p-3 border border-gray-200/60 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-semibold">MÃ ƯU ĐÃI</span>
                      <span className="font-mono text-base font-black text-gray-900 select-all">
                        {item.voucherCode}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.voucherCode)}
                        className="p-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Sao chép mã"
                      >
                        {copiedId === item.id ? '✓ Đã chép' : '📋 Chép'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedForQr(item)}
                        className="p-1.5 text-xs font-bold text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Xem mã QR"
                      >
                        📱 QR
                      </button>
                    </div>
                  </div>
                </div>

                {/* Footer Info */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                  <span>HSD: {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString('vi-VN') : 'Không giới hạn'}</span>
                  <span>Đổi lúc: {item.createdAt ? new Date(item.createdAt).toLocaleDateString('vi-VN') : ''}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* QR MODAL */}
      {selectedForQr && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-gray-100 text-center animate-fade-in space-y-4">
            <h3 className="font-bold text-gray-900 text-base">{selectedForQr.voucherTitle}</h3>
            <p className="text-xs text-gray-500">Đưa mã QR này cho nhân viên thu ngân quét để áp dụng ưu đãi</p>

            <div className="bg-gray-50 p-4 rounded-2xl inline-block border border-gray-200">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  `${window.location.origin}/voucher/verify/${selectedForQr.redemptionToken}`
                )}`}
                alt="QR Code"
                className="w-48 h-48 mx-auto object-contain rounded-xl"
              />
            </div>

            <div className="font-mono text-lg font-black text-indigo-900 tracking-wider">
              {selectedForQr.voucherCode}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedForQr(null)}
                className="w-full py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
