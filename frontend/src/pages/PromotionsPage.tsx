import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { api, getUser, money } from '../lib/api';

export default function PromotionsPage() {
  const nav = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preSelectedPostId = searchParams.get('postId');
  const preSelectedCategory = searchParams.get('category') || 'ROOM';

  const user = getUser();
  const [plans, setPlans] = useState<any[]>([]);
  const [myPosts, setMyPosts] = useState<any[]>([]);
  const [wallet, setWallet] = useState<any>({ balance: 0 });
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedPost, setSelectedPost] = useState<{ id: number; category: string; title: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // QR Modal state
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [pendingPayment, setPendingPayment] = useState<any>(null);
  const [pollingStatus, setPollingStatus] = useState<string>('');

  useEffect(() => {
    if (!user) {
      nav('/login', { state: { from: location.pathname + location.search } });
      return;
    }
    loadData();
  }, [user?.id]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [plansRes, postsRes, walletRes] = await Promise.all([
        api.get('/payments/plans'),
        api.get('/my-posts').catch(() => ({ data: [] })),
        api.get('/payments/wallet').catch(() => ({ data: { balance: 0 } }))
      ]);
      setPlans(plansRes.data || []);
      setMyPosts(postsRes.data || []);
      setWallet(walletRes.data || { balance: 0 });

      // Handle preselected post if present
      if (preSelectedPostId) {
        const found = (postsRes.data || []).find(
          (p: any) => String(p.id) === String(preSelectedPostId) && p.category === preSelectedCategory
        );
        if (found) {
          setSelectedPost({ id: found.id, category: found.category, title: found.title });
        }
      }
    } catch (e: any) {
      setMsg({ type: 'error', text: 'Không tải được danh sách gói dịch vụ.' });
    } finally {
      setLoading(false);
    }
  };

  // Buy directly with UniHome Wallet
  const handleBuyWithWallet = async () => {
    if (!selectedPlan) {
      setMsg({ type: 'error', text: 'Vui lòng chọn gói dịch vụ bạn muốn đăng ký.' });
      return;
    }
    if (!selectedPost) {
      setMsg({ type: 'error', text: 'Vui lòng chọn bài đăng bạn muốn áp dụng gói này.' });
      return;
    }
    if (wallet.balance < selectedPlan.price) {
      setMsg({ type: 'error', text: 'Số dư ví không đủ. Vui lòng nạp tiền vào ví hoặc thanh toán qua QR bên dưới.' });
      return;
    }

    setSubmitting(true);
    setMsg(null);
    try {
      await api.post('/payments/buy-promotion', {
        packageId: selectedPlan.id,
        category: selectedPost.category,
        targetId: selectedPost.id
      });
      setMsg({ type: 'success', text: `Đã kích hoạt gói "${selectedPlan.name}" cho bài đăng thành công!` });
      loadData();
    } catch (e: any) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Không thể thanh toán gói qua ví.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Create QR Code payment for the package
  const handleBuyWithQr = async () => {
    if (!selectedPlan) {
      setMsg({ type: 'error', text: 'Vui lòng chọn gói dịch vụ.' });
      return;
    }
    if (!selectedPost) {
      setMsg({ type: 'error', text: 'Vui lòng chọn bài đăng bạn muốn áp dụng gói này.' });
      return;
    }

    setSubmitting(true);
    setMsg(null);
    try {
      const res = await api.post('/payments/create', {
        amount: selectedPlan.price,
        paymentMethod: 'VIETQR',
        planId: selectedPlan.id,
        targetType: selectedPost.category,
        targetId: selectedPost.id
      });
      setPendingPayment(res.data);
      setQrModalOpen(true);
      setPollingStatus('Đang chờ giao dịch từ ngân hàng...');
    } catch (e: any) {
      setMsg({ type: 'error', text: e.response?.data?.message || 'Không thể tạo mã QR thanh toán.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Polling payment status every 5 seconds when QR Modal is active
  useEffect(() => {
    if (!qrModalOpen || !pendingPayment?.id) return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/payments/${pendingPayment.id}/status`);
        if (res.data?.status === 'COMPLETED') {
          clearInterval(interval);
          setPollingStatus('✓ Giao dịch thành công!');
          setTimeout(() => {
            setQrModalOpen(false);
            setMsg({ type: 'success', text: `Thanh toán thành công! Gói "${selectedPlan?.name}" đã được kích hoạt.` });
            loadData();
          }, 1500);
        } else if (res.data?.status === 'FAILED') {
          clearInterval(interval);
          setPollingStatus('✕ Giao dịch không thành công hoặc đã bị hủy.');
        }
      } catch (err) {
        // Silent polling error
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [qrModalOpen, pendingPayment?.id]);

  const getTierBadge = (type: string) => {
    if (type?.includes('DIAMOND')) return { bg: 'bg-indigo-600 text-white', icon: '💎', label: 'VIP Kim Cương' };
    if (type?.includes('GOLD')) return { bg: 'bg-amber-500 text-white', icon: '👑', label: 'VIP Vàng' };
    if (type?.includes('SILVER')) return { bg: 'bg-gray-700 text-white', icon: '⭐', label: 'VIP Bạc' };
    if (type?.includes('BOOST')) return { bg: 'bg-emerald-600 text-white', icon: '🚀', label: 'Đẩy tin Top' };
    return { bg: 'bg-blue-600 text-white', icon: '📌', label: 'Gói Tiêu chuẩn' };
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-950 rounded-3xl p-8 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
            Dịch vụ tăng tốc tiếp cận
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-3">
            Bảng giá Gói VIP & Đẩy tin UniHome
          </h1>
          <p className="text-sm sm:text-base text-indigo-200 mt-2 leading-relaxed">
            Nâng tầm bài đăng của bạn lên vị trí đầu trang chủ, tiếp cận hàng chục ngàn sinh viên tìm phòng và đồ cũ mỗi ngày.
          </p>
          <div className="mt-5 flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-300">
              ✓ Tăng 300% lượt xem
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-amber-300">
              ✓ Huy hiệu VIP nổi bật
            </span>
            <span className="flex items-center gap-1.5 font-semibold text-white">
              ✓ Tự động đẩy top mỗi ngày
            </span>
          </div>
        </div>
      </div>

      {msg && (
        <div className={`p-4 rounded-2xl text-sm font-medium border ${msg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
          {msg.text}
        </div>
      )}

      {loading ? (
        <div className="bg-white rounded-3xl p-12 text-center text-xs text-gray-500 border border-gray-200">
          Đang tải danh sách gói dịch vụ & bài đăng...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Package Plans */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-extrabold text-gray-900 flex items-center justify-between">
            <span>1. Chọn gói nâng cấp phù hợp</span>
            <span className="text-xs font-semibold text-gray-500">
              {plans.length} gói khả dụng
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {plans.map((p) => {
              const badge = getTierBadge(p.type || p.code || '');
              const isSelected = selectedPlan?.id === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p)}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/20 shadow-md ring-2 ring-indigo-500/20'
                      : 'border-gray-200 bg-white hover:border-gray-300 shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-lg flex items-center gap-1 ${badge.bg}`}>
                        <span>{badge.icon}</span> {badge.label}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        {p.durationDays} ngày
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mt-2">{p.name}</h3>
                    <div className="text-xl font-extrabold text-indigo-600 mt-1 font-mono">
                      {money(p.price)}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                      {p.description || 'Hiển thị ưu tiên trên trang tìm kiếm và đề xuất sinh viên phù hợp.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-xs font-semibold">
                    <span className={isSelected ? 'text-indigo-600' : 'text-gray-400'}>
                      {isSelected ? '✓ Đang chọn' : 'Nhấn để chọn'}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {p.appliesTo ? `Áp dụng: ${p.appliesTo}` : 'Mọi tin đăng'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Target Post Selection & Checkout */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-xs space-y-5">
            <h2 className="text-lg font-extrabold text-gray-900">
              2. Chọn bài đăng áp dụng
            </h2>

            {/* Post Selector */}
            {myPosts.length > 0 ? (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                  Bài đăng của bạn ({myPosts.length}):
                </label>
                <select
                  className="w-full text-xs border border-gray-300 rounded-xl p-3 outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  value={selectedPost?.id || ''}
                  onChange={(e) => {
                    const post = myPosts.find((x) => String(x.id) === e.target.value);
                    if (post) {
                      setSelectedPost({ id: post.id, category: post.category, title: post.title });
                    } else {
                      setSelectedPost(null);
                    }
                  }}
                >
                  <option value="">-- Chọn bài đăng cần đẩy / mua VIP --</option>
                  {myPosts.map((p) => (
                    <option key={`${p.category}-${p.id}`} value={p.id}>
                      [{p.category}] {p.title} ({money(p.price)})
                    </option>
                  ))}
                </select>

                {selectedPost && (
                  <div className="mt-2 p-2.5 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                    <span className="font-semibold text-gray-700 block">Đã chọn:</span>
                    <span className="text-indigo-600 font-medium line-clamp-1">{selectedPost.title}</span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800">
                Bạn chưa có bài đăng nào. Vui lòng đăng tin phòng trọ hoặc đồ cũ trước khi mua gói quảng cáo.
              </div>
            )}

            {/* Wallet summary */}
            <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
              <span className="text-gray-600">Số dư ví UniHome:</span>
              <span className="font-bold text-gray-900 font-mono text-sm">
                {money(wallet.balance || 0)}
              </span>
            </div>

            {/* Order Checkout Details */}
            {selectedPlan && (
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Gói đã chọn:</span>
                  <span className="font-bold text-gray-900">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Thời hạn:</span>
                  <span className="font-bold text-gray-900">{selectedPlan.durationDays} ngày</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold pt-2 border-t border-indigo-200">
                  <span>Tổng thanh toán:</span>
                  <span className="text-indigo-700 font-mono">{money(selectedPlan.price)}</span>
                </div>
              </div>
            )}

            {/* Payment buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                disabled={submitting || !selectedPlan || !selectedPost || wallet.balance < (selectedPlan?.price || 0)}
                onClick={handleBuyWithWallet}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-1.5 ${
                  submitting || !selectedPlan || !selectedPost || wallet.balance < (selectedPlan?.price || 0)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 active:scale-98'
                }`}
              >
                <span>💳</span> Thanh toán bằng Ví ({money(wallet.balance || 0)})
              </button>

              <button
                type="button"
                disabled={submitting || !selectedPlan || !selectedPost}
                onClick={handleBuyWithQr}
                className={`w-full py-3 rounded-xl font-bold text-xs transition-all border flex items-center justify-center gap-1.5 ${
                  submitting || !selectedPlan || !selectedPost
                    ? 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white border-indigo-600 text-indigo-700 hover:bg-indigo-50 active:scale-98'
                }`}
              >
                <span>📱</span> Quét mã VietQR / Ngân hàng tức thì
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

      {/* QR Payment Modal */}
      {qrModalOpen && pendingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-gray-100 p-6 space-y-5 animate-fade-in text-center">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-base">Thanh toán qua VietQR</h3>
              <button
                type="button"
                onClick={() => setQrModalOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Mở ứng dụng ngân hàng hoặc ví điện tử bất kỳ để quét mã QR thanh toán gói:
            </p>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 inline-block mx-auto">
              {pendingPayment.qrCodeUrl ? (
                <img
                  src={pendingPayment.qrCodeUrl}
                  alt="VietQR"
                  className="w-48 h-48 mx-auto object-contain rounded-xl shadow-xs"
                />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center font-mono text-xs text-gray-500">
                  Đang khởi tạo mã QR...
                </div>
              )}
            </div>

            <div className="text-left bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-500">Số tiền:</span>
                <span className="font-bold text-indigo-600 font-mono text-sm">{money(pendingPayment.amount || selectedPlan?.price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Nội dung chuyển khoản:</span>
                <span className="font-bold text-gray-900 font-mono">{pendingPayment.transferCode || `UH${pendingPayment.id}`}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-semibold text-indigo-800 flex items-center justify-center gap-2">
              <span className="animate-spin text-sm">⏳</span> {pollingStatus}
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
