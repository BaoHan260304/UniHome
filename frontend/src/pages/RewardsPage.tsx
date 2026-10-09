import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';

export default function RewardsPage() {
  const [account, setAccount] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [category, setCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkinMsg, setCheckinMsg] = useState<string | null>(null);

  const [dailyStatus, setDailyStatus] = useState<any>(null);

  // Redeem modal state
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState<any>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [accRes, tasksRes, vouchersRes, statusRes] = await Promise.all([
        api.get('/rewards/account').catch(() => ({ data: null })),
        api.get('/rewards/tasks').catch(() => ({ data: [] })),
        api.get(`/rewards/vouchers${category !== 'ALL' ? `?category=${category}` : ''}`).catch(() => ({ data: [] })),
        api.get('/rewards/daily-status').catch(() => ({ data: null })),
      ]);
      setAccount(accRes.data);
      setTasks(tasksRes.data || []);
      setVouchers(vouchersRes.data || []);
      setDailyStatus(statusRes.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [category]);

  const handleCheckin = async () => {
    if (!account?.canCheckinToday || checkinLoading) return;
    setCheckinLoading(true);
    setCheckinMsg(null);
    try {
      const res = await api.post('/rewards/checkin');
      setCheckinMsg(res.data?.message || 'Điểm danh thành công!');
      fetchData();
    } catch (err: any) {
      setCheckinMsg(err?.response?.data?.message || 'Không thể điểm danh lúc này');
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleClaimTask = async (taskCode: string) => {
    try {
      const res = await api.post('/rewards/claim-task', { taskCode });
      alert(res.data?.message || 'Nhận thưởng thành công!');
      fetchData();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Chưa đủ điều kiện nhận thưởng nhiệm vụ');
    }
  };

  const handleConfirmRedeem = async () => {
    if (!selectedVoucher) return;
    setRedeemLoading(true);
    setRedeemError(null);
    try {
      const res = await api.post('/rewards/redeem', { voucherId: selectedVoucher.id });
      setRedeemSuccess(res.data?.redemption);
      fetchData();
    } catch (err: any) {
      setRedeemError(err?.response?.data?.message || 'Đổi voucher thất bại');
    } finally {
      setRedeemLoading(false);
    }
  };

  const streakRewards = account?.streakRewards || [20, 20, 20, 20, 20, 20, 50];
  const currentStreak = account?.currentStreak || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Evening Streak Warning or Daily Reminder */}
      {dailyStatus?.streakWarning && (
        <div className="bg-amber-500 text-amber-950 p-4 rounded-2xl font-bold text-xs flex items-center justify-between shadow-sm animate-pulse">
          <span className="flex items-center gap-2">
            <span>⚠️</span> {dailyStatus.reminderMessage || 'Bạn chưa điểm danh hôm nay! Điểm danh ngay để duy trì chuỗi nhận thưởng.'}
          </span>
          <button
            type="button"
            onClick={handleCheckin}
            className="px-3 py-1 bg-amber-950 text-white rounded-xl text-xs hover:bg-black"
          >
            Điểm danh ngay
          </button>
        </div>
      )}

      {/* 1. HERO REWARD BANNER & 7-DAY STREAK */}
      <div className="bg-linear-to-r from-indigo-700 via-indigo-600 to-purple-700 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl select-none">💎</div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold mb-3 border border-white/20">
              <span>💎</span> UniHome Loyalty & Rewards
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Điểm thưởng UniHome & Ưu đãi đối tác
            </h1>
            <p className="text-indigo-100 text-xs sm:text-sm mt-1 max-w-xl leading-relaxed">
              Tích lũy Điểm UniHome qua hoạt động hàng ngày để đổi voucher Highlands, Phúc Long, Ahamove, FPT và hàng chục đối tác sinh viên.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 w-full sm:w-auto min-w-64 text-center sm:text-left">
            <span className="text-xs text-indigo-200 font-semibold block">Số dư hiện tại</span>
            <div className="text-3xl font-black mt-0.5 text-white flex items-center justify-center sm:justify-start gap-2">
              <span>💎</span> {account?.balance ?? 0} <span className="text-sm font-bold text-indigo-200">Điểm</span>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-indigo-100 border-t border-white/10 pt-2">
              <span>Đã tích lũy: {account?.lifetimeEarned ?? 0}</span>
              <Link to="/rewards/my-vouchers" className="font-bold underline hover:text-white">
                Voucher của tôi →
              </Link>
            </div>
          </div>
        </div>

        {/* 7-Day Daily Check-in Streak Track */}
        <div className="mt-8 pt-6 border-t border-white/15">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <span>🔥</span> Chuỗi điểm danh 7 ngày liên tiếp
                <span className="bg-amber-400 text-amber-950 text-[11px] font-black px-2 py-0.5 rounded-full">
                  Ngày {currentStreak}/7
                </span>
              </h3>
              <p className="text-xs text-indigo-200 mt-0.5">
                Điểm danh đều đặn mỗi ngày nhận điểm tăng dần lên đến +50 điểm ở ngày thứ 7!
              </p>
            </div>

            <button
              type="button"
              disabled={!account?.canCheckinToday || checkinLoading}
              onClick={handleCheckin}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md active:scale-95 ${
                account?.canCheckinToday
                  ? 'bg-amber-400 text-amber-950 hover:bg-amber-300 ring-2 ring-amber-300'
                  : 'bg-white/20 text-indigo-200 cursor-not-allowed'
              }`}
            >
              {checkinLoading
                ? 'Đang nhận...'
                : account?.canCheckinToday
                ? `Điểm danh ngay (+${streakRewards[(account?.streakDay || 1) - 1]} điểm)`
                : '✓ Đã điểm danh hôm nay'}
            </button>
          </div>

          {/* 7 Days Grid */}
          <div className="grid grid-cols-7 gap-2 sm:gap-3">
            {streakRewards.map((pts: number, idx: number) => {
              const dayNum = idx + 1;
              const isPassed = dayNum <= currentStreak;
              const isToday = dayNum === (account?.streakDay || 1) && account?.canCheckinToday;

              return (
                <div
                  key={dayNum}
                  className={`rounded-2xl p-2.5 sm:p-3 text-center border transition-all ${
                    isPassed
                      ? 'bg-emerald-500/30 border-emerald-300/50 text-white'
                      : isToday
                      ? 'bg-amber-400 text-amber-950 border-amber-300 font-bold scale-105 shadow-md'
                      : 'bg-white/10 border-white/15 text-indigo-200'
                  }`}
                >
                  <span className="text-[10px] sm:text-xs block font-bold opacity-80">Ngày {dayNum}</span>
                  <span className="text-xs sm:text-base font-black mt-1 block">+{pts}</span>
                  <span className="text-[10px] block mt-0.5">{isPassed ? '✓' : isToday ? 'Hôm nay' : '💎'}</span>
                </div>
              );
            })}
          </div>

          {checkinMsg && (
            <p className="text-xs bg-white/20 backdrop-blur-md p-2 rounded-xl text-center mt-3 font-semibold text-white">
              {checkinMsg}
            </p>
          )}
        </div>
      </div>

      {/* 2. TASK CENTER (NHIỆM VỤ NHẬN ĐIỂM) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>🎯</span> Trung tâm Nhiệm vụ
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Hoàn thành các hoạt động đơn giản để tích lũy hàng trăm Điểm UniHome</p>
          </div>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            {tasks.filter((t) => t.isClaimed).length}/{tasks.length} Hoàn thành
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => (
            <div
              key={task.taskCode}
              className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                task.isClaimed
                  ? 'bg-gray-50/70 border-gray-100 opacity-60'
                  : task.isCompleted
                  ? 'bg-indigo-50/40 border-indigo-200 shadow-2xs'
                  : 'bg-white border-gray-200'
              }`}
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 truncate">{task.title}</h4>
                  <span className="text-[11px] font-extrabold text-indigo-600 bg-indigo-100/60 px-2 py-0.5 rounded-full shrink-0">
                    +{task.points} 💎
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{task.description}</p>
              </div>

              <div className="shrink-0">
                {task.isClaimed ? (
                  <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl block">
                    Đã nhận
                  </span>
                ) : task.isCompleted ? (
                  <button
                    type="button"
                    onClick={() => handleClaimTask(task.taskCode)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-xs transition-transform active:scale-95"
                  >
                    Nhận điểm
                  </button>
                ) : (
                  <Link
                    to={task.actionUrl || '/'}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-xl transition-colors block text-center"
                  >
                    Thực hiện →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. VOUCHER CATALOG (KHO VOUCHER ĐỐI TÁC) */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span>🎁</span> Kho Voucher Ưu Đãi Đối Tác
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Đổi Điểm UniHome lấy mã giảm giá đồ uống, chuyển trọ, giáo trình và mạng Internet</p>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'Tất cả' },
              { id: 'FOOD', label: 'Ăn uống' },
              { id: 'MOVING', label: 'Chuyển trọ' },
              { id: 'INTERNET', label: 'Internet' },
              { id: 'OTHER', label: 'Khác' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  category === cat.id
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Vouchers Grid */}
        {loading && vouchers.length === 0 ? (
          <div className="p-12 text-center text-sm text-gray-400">Đang tải danh sách voucher ưu đãi...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {vouchers.map((v) => {
              const canAfford = (account?.balance ?? 0) >= v.pointsCost;
              return (
                <div
                  key={v.id}
                  className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
                >
                  {/* Image */}
                  <div className="relative h-44 bg-gray-100 overflow-hidden">
                    <img
                      src={v.imageUrl || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500'}
                      alt={v.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-800 shadow-xs flex items-center gap-1.5">
                      {v.partnerLogo && <img src={v.partnerLogo} alt="" className="w-4 h-4 rounded-full object-cover" />}
                      <span>{v.partnerName}</span>
                    </div>
                    <div className="absolute top-3 right-3 bg-indigo-600 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
                      {v.discountType === 'PERCENT'
                        ? `Giảm ${v.discountValue}%`
                        : `Giảm ${(v.discountValue / 1000).toLocaleString()}k`}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">{v.title}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{v.description}</p>
                      {v.minOrder > 0 && (
                        <span className="text-[11px] text-gray-400 mt-2 block">
                          Đơn tối thiểu: {Number(v.minOrder).toLocaleString('vi-VN')}đ
                        </span>
                      )}
                    </div>

                    {/* Redeem Action Row */}
                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-gray-400 block font-semibold">Cần tích lũy</span>
                        <span className="text-base font-black text-indigo-600 flex items-center gap-1">
                          <span>💎</span> {v.pointsCost} <span className="text-xs font-bold text-gray-500">điểm</span>
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVoucher(v);
                          setRedeemSuccess(null);
                          setRedeemError(null);
                        }}
                        className={`text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-transform active:scale-95 ${
                          canAfford
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                        }`}
                      >
                        {canAfford ? 'Đổi ngay' : 'Chưa đủ điểm'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REDEEM CONFIRMATION MODAL */}
      {selectedVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-fade-in space-y-4">
            {!redeemSuccess ? (
              <>
                <div className="text-center">
                  <span className="text-4xl block mb-2">🎁</span>
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">Xác nhận đổi voucher</h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Bạn chuẩn bị dùng Điểm UniHome để đổi mã ưu đãi này
                  </p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Voucher:</span>
                    <span className="font-bold text-gray-900 text-right">{selectedVoucher.title}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Đối tác:</span>
                    <span className="font-semibold text-gray-900">{selectedVoucher.partnerName}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 border-t border-gray-200/60 pt-2">
                    <span>Điểm trừ:</span>
                    <span className="font-bold text-red-600">-{selectedVoucher.pointsCost} 💎</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Số dư hiện tại:</span>
                    <span className="font-bold text-indigo-600">{account?.balance ?? 0} 💎</span>
                  </div>
                </div>

                {redeemError && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-xl text-center font-semibold">
                    {redeemError}
                  </p>
                )}

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVoucher(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    disabled={redeemLoading || (account?.balance ?? 0) < selectedVoucher.pointsCost}
                    onClick={handleConfirmRedeem}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                  >
                    {redeemLoading ? 'Đang xử lý...' : 'Xác nhận đổi'}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center space-y-4">
                <span className="text-5xl block">🎉</span>
                <h3 className="text-lg font-extrabold text-emerald-600">Đổi voucher thành công!</h3>
                <p className="text-xs text-gray-500">Mã ưu đãi của bạn đã sẵn sàng sử dụng:</p>

                <div className="bg-indigo-50 border-2 border-dashed border-indigo-300 rounded-2xl p-4 text-center">
                  <span className="text-xs font-semibold text-indigo-700 block mb-1">MÃ ƯU ĐÃI</span>
                  <div className="text-xl font-black text-indigo-900 font-mono tracking-wider select-all">
                    {redeemSuccess.voucherCode}
                  </div>
                  <span className="text-[11px] text-gray-500 block mt-2">
                    Hạn dùng: {redeemSuccess.expiresAt ? new Date(redeemSuccess.expiresAt).toLocaleDateString('vi-VN') : '30 ngày'}
                  </span>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVoucher(null)}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600"
                  >
                    Đóng
                  </button>
                  <Link
                    to="/rewards/my-vouchers"
                    onClick={() => setSelectedVoucher(null)}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold text-center"
                  >
                    Xem voucher của tôi →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
