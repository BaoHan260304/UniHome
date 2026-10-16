import { useEffect, useState } from 'react';
import { api, money } from '../lib/api';

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];

export default function WalletPage() {
  const [data, setData] = useState<any>({ balance: 0, transactions: [] });
  const [amount, setAmount] = useState('100000');
  const [payments, setPayments] = useState<any[]>([]);
  const [txFilter, setTxFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');
  const [searchTx, setSearchTx] = useState('');
  const [loading, setLoading] = useState(true);

  // QR Modal & Polling state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activePayment, setActivePayment] = useState<any>(null);
  const [pollingStatus, setPollingStatus] = useState<string>('');
  const [topupSuccess, setTopupSuccess] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [walletRes, histRes] = await Promise.all([
        api.get('/payments/wallet'),
        api.get('/payments/history')
      ]);
      setData(walletRes.data || { balance: 0, transactions: [] });
      setPayments(histRes.data || []);
    } catch {}
    finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreateTopup = async () => {
    const num = Number(amount);
    if (!num || num < 10000) {
      alert('Số tiền nạp tối thiểu là 10.000 VNĐ');
      return;
    }

    try {
      const res = await api.post('/payments/topup', { amount: num });
      setActivePayment(res.data);
      setQrModalOpen(true);
      setTopupSuccess(false);
      setPollingStatus('Đang chờ giao dịch từ ngân hàng...');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể tạo yêu cầu nạp tiền');
    }
  };

  // 5-second polling for QR payment completion
  useEffect(() => {
    if (!qrModalOpen || !activePayment?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/payments/${activePayment.id}/status`);
        if (res.data?.status === 'COMPLETED') {
          clearInterval(interval);
          setTopupSuccess(true);
          setPollingStatus('✓ Nạp tiền thành công! Số dư đã được cộng vào ví.');
          void load();
          setTimeout(() => {
            setQrModalOpen(false);
          }, 2500);
        } else if (res.data?.status === 'FAILED') {
          clearInterval(interval);
          setPollingStatus('✕ Giao dịch không thành công hoặc đã bị hủy.');
        }
      } catch {}
    }, 5000);

    return () => clearInterval(interval);
  }, [qrModalOpen, activePayment?.id]);

  const filteredTransactions = (data.transactions || []).filter((t: any) => {
    if (txFilter === 'IN' && t.amount < 0) return false;
    if (txFilter === 'OUT' && t.amount >= 0) return false;
    if (searchTx.trim()) {
      return (t.description || '').toLowerCase().includes(searchTx.toLowerCase());
    }
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Ví UniHome</h1>
        <p className="mt-1 text-sm text-gray-500">
          Ví thanh toán nội bộ dùng để mua gói VIP, Đẩy tin nổi bật và các tiện ích trên hệ thống UniHome.
        </p>
      </div>

      {/* Financial Disclaimer Banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 leading-relaxed flex items-start gap-3">
        <span className="text-base shrink-0">🛡️</span>
        <div>
          <span className="font-bold">Lưu ý quan trọng về tài chính:</span> Ví UniHome là ví trả trước chỉ dùng để thanh toán các dịch vụ công nghệ trên nền tảng (gói VIP, phí đẩy tin, quảng cáo banner). UniHome <b>tuyệt đối không thu hộ</b> tiền thuê nhà, tiền cọc, tiền điện nước hay phí dịch vụ giữa người thuê và chủ nhà.
        </div>
      </div>

      {/* Balance & Topup Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Balance Card */}
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold text-indigo-200 uppercase tracking-wide">
              Số dư khả dụng
            </div>
            <div className="text-3xl font-extrabold mt-3 font-mono">
              {money(data.balance || 0)}
            </div>
          </div>
          <div className="pt-6 border-t border-indigo-500/40 text-xs text-indigo-100 flex items-center justify-between">
            <span>Tài khoản chính</span>
            <span className="px-2 py-0.5 rounded-full bg-white/20 font-bold">Kích hoạt</span>
          </div>
        </div>

        {/* Top-up Card */}
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-gray-900 flex items-center justify-between">
            <span>Nạp tiền vào ví qua VietQR</span>
            <span className="text-xs font-normal text-gray-500">Tự động cộng sau 30s</span>
          </h2>

          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2">
            {PRESET_AMOUNTS.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setAmount(String(amt))}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                  amount === String(amt)
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-700 shadow-2xs'
                    : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
                }`}
              >
                {money(amt)}
              </button>
            ))}
          </div>

          {/* Amount input & Action */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <div className="relative flex-1">
              <input
                type="text"
                value={Number(amount).toLocaleString('vi-VN')}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ''))}
                placeholder="Nhập số tiền..."
                className="w-full border border-gray-300 rounded-2xl px-4 py-3 text-sm font-bold font-mono outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-gray-400">VNĐ</span>
            </div>
            <button
              type="button"
              onClick={handleCreateTopup}
              className="bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white px-6 py-3 rounded-2xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <span>📱</span> Tạo mã VietQR
            </button>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-gray-900">Lịch sử biến động số dư</h3>
            <p className="text-xs text-gray-400 mt-0.5">Các khoản nạp và chi tiêu dịch vụ</p>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={searchTx}
              onChange={(e) => setSearchTx(e.target.value)}
              placeholder="Tìm giao dịch..."
              className="text-xs border border-gray-300 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="flex p-0.5 bg-gray-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setTxFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg ${txFilter === 'ALL' ? 'bg-white shadow-2xs text-gray-900' : 'text-gray-500'}`}
              >
                Tất cả
              </button>
              <button
                type="button"
                onClick={() => setTxFilter('IN')}
                className={`px-2.5 py-1 rounded-lg ${txFilter === 'IN' ? 'bg-white shadow-2xs text-emerald-600' : 'text-gray-500'}`}
              >
                Cộng
              </button>
              <button
                type="button"
                onClick={() => setTxFilter('OUT')}
                className={`px-2.5 py-1 rounded-lg ${txFilter === 'OUT' ? 'bg-white shadow-2xs text-red-600' : 'text-gray-500'}`}
              >
                Trừ
              </button>
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center text-xs text-gray-400">Đang tải lịch sử giao dịch...</div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">Chưa có giao dịch nào phù hợp</div>
          ) : (
            filteredTransactions.map((t: any) => (
              <div key={t.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div>
                  <div className="font-semibold text-sm text-gray-900">{t.description || 'Giao dịch ví'}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {t.createdAt ? new Date(t.createdAt).toLocaleString('vi-VN') : 'Gần đây'}
                  </div>
                </div>
                <div className={`font-bold font-mono text-sm ${t.amount >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {t.amount >= 0 ? `+${money(t.amount)}` : money(t.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent QR / Payments List */}
      <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-bold text-base text-gray-900">Yêu cầu thanh toán / QR gần đây</h3>
          <p className="text-xs text-gray-400 mt-0.5">Theo dõi trạng thái các hóa đơn nạp và thanh toán</p>
        </div>
        <div className="divide-y divide-gray-100">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-400">Chưa có mã QR nào được tạo</div>
          ) : (
            payments.slice(0, 10).map((p: any) => (
              <div key={p.id} className="p-4 sm:px-6 flex items-center justify-between hover:bg-gray-50/50">
                <div>
                  <div className="font-mono font-bold text-xs text-gray-800">{p.code || `UH${p.id}`}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                    <span>{p.type || 'Nạp ví'}</span>
                    <span>•</span>
                    <span className={`font-semibold ${p.status === 'COMPLETED' ? 'text-emerald-600' : p.status === 'PENDING' ? 'text-amber-600' : 'text-gray-500'}`}>
                      {p.status === 'COMPLETED' ? 'Thành công' : p.status === 'PENDING' ? 'Chờ thanh toán' : p.status}
                    </span>
                  </div>
                </div>
                <div className="font-bold font-mono text-sm text-gray-900">
                  {money(p.amount)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* QR Modal with Polling */}
      {qrModalOpen && activePayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 p-6 space-y-5 animate-fade-in text-center">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Quét mã VietQR Nạp tiền</h3>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Mở ứng dụng ngân hàng hoặc ví điện tử bất kỳ để quét mã QR và thanh toán chính xác:
            </p>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 inline-block mx-auto">
              {activePayment.qrCodeUrl || activePayment.qrUrl ? (
                <img
                  src={activePayment.qrCodeUrl || activePayment.qrUrl}
                  alt="VietQR"
                  className="w-48 h-48 mx-auto object-contain rounded-xl shadow-xs"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center font-mono text-xs text-gray-500">
                  Đang tải mã QR...
                </div>
              )}
            </div>

            <div className="text-left bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Số tiền:</span>
                <span className="font-bold text-indigo-600 font-mono text-sm">{money(activePayment.amount || amount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Mã chuyển khoản:</span>
                <span className="font-bold text-gray-900 font-mono">{activePayment.transferCode || activePayment.code}</span>
              </div>
            </div>

            <div className={`p-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 ${
              topupSuccess
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-indigo-50 text-indigo-800 border border-indigo-100'
            }`}>
              {!topupSuccess && <span className="animate-spin text-sm">⏳</span>} {pollingStatus}
            </div>

            <button
              type="button"
              onClick={() => setQrModalOpen(false)}
              className="w-full py-2.5 rounded-xl font-semibold text-xs text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Đóng cửa sổ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
