import { useEffect, useState } from 'react';
import { api, getUser, money, resolveMediaUrl } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const tabs = [
  'Tổng quan',
  'Thống kê & Analytics',
  'Kiểm duyệt',
  'Quảng cáo',
  'Voucher & Đối tác',
  'Xác minh',
  'Tài khoản',
  'Tài chính',
  'Gói VIP',
  'Báo cáo',
  'Dịch vụ',
  'Đồ cũ',
  'Q&A',
  'Đánh giá',
  'Blog',
  'Audit'
];

export default function AdminDashboard() {
  const user = getUser();
  const nav = useNavigate();
  const [tab, setTab] = useState('Tổng quan');
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [analyticsDays, setAnalyticsDays] = useState(30);

  // Partner & Voucher form states
  const [voucherForm, setVoucherForm] = useState<any>({
    partnerId: '',
    title: '',
    category: 'FOOD',
    description: '',
    imageUrl: '',
    discountType: 'PERCENT',
    discountValue: 15,
    minOrder: 50000,
    pointsCost: 100,
    totalStock: 50,
    codeMode: 'UNIQUE_POOL',
    sharedCode: '',
    status: 'ACTIVE'
  });
  const [partnerForm, setPartnerForm] = useState<any>({
    name: '',
    category: 'F&B',
    logoUrl: '',
    phone: '',
    website: '',
    status: 'ACTIVE'
  });
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [importVoucherId, setImportVoucherId] = useState<number | null>(null);
  const [importCodesText, setImportCodesText] = useState('');

  // Blog state
  const [blog, setBlog] = useState<any>({
    title: '',
    category: 'PCCC',
    summary: '',
    content: '',
    coverImage: '',
    status: 'DRAFT',
    readingMinutes: 5
  });

  // Advertisement state
  const [ad, setAd] = useState<any>({
    title: '',
    campaignName: '',
    advertiserName: '',
    bannerImage: '',
    destinationUrl: '',
    placement: 'RIGHT_SIDEBAR',
    targetType: 'ALL',
    priority: 0,
    status: 'ACTIVE',
    startAt: '',
    endAt: '',
    note: ''
  });
  const [adUploading, setAdUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      if (tab === 'Tổng quan') setData((await api.get('/admin/dashboard')).data);
      if (tab === 'Thống kê & Analytics') setData((await api.get('/admin/analytics/dashboard', { params: { days: analyticsDays } })).data);
      if (tab === 'Kiểm duyệt') setData({ items: (await api.get('/admin/moderation')).data });
      if (tab === 'Quảng cáo') setData({ items: (await api.get('/admin/ads')).data });
      if (tab === 'Voucher & Đối tác') {
        const [vRes, pRes] = await Promise.all([
          api.get('/rewards/vouchers'),
          api.get('/rewards/partners')
        ]);
        setData({ vouchers: vRes.data || [], partners: pRes.data || [] });
      }
      if (tab === 'Xác minh') setData({ items: (await api.get('/admin/verifications')).data });
      if (tab === 'Tài khoản') setData({ items: (await api.get('/admin/users')).data });
      if (tab === 'Tài chính') setData((await api.get('/admin/finance')).data);
      if (tab === 'Gói VIP') setData({ items: (await api.get('/admin/plans')).data });
      if (tab === 'Báo cáo') setData({ items: (await api.get('/admin/reports')).data });
      if (tab === 'Dịch vụ') setData({ items: (await api.get('/admin/services')).data });
      if (tab === 'Đồ cũ') setData({ items: (await api.get('/admin/secondhand')).data });
      if (tab === 'Q&A') setData({ items: (await api.get('/admin/questions')).data });
      if (tab === 'Đánh giá') setData({ items: (await api.get('/admin/reviews')).data });
      if (tab === 'Blog') setData({ items: (await api.get('/admin/blogs')).data });
      if (tab === 'Audit') setData({ items: (await api.get('/admin/audit')).data });
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không có quyền truy cập');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      nav('/login');
      return;
    }
    load();
  }, [tab, analyticsDays]);

  // Moderation
  const moderate = (id: number, action: string) => {
    const reason = action === 'APPROVE' ? '' : prompt('Nhập lý do / yêu cầu chỉnh sửa gửi tới chủ trọ:') || '';
    if (action !== 'APPROVE' && !reason.trim()) return;
    api.post(`/admin/listings/${id}/moderate`, { action, reason }).then(load);
  };

  // User management
  const changeRole = (id: number, r: string) => api.put(`/admin/users/${id}`, { role: r }).then(load);
  const toggleStatus = (id: number, currentStatus: string) =>
    api.put(`/admin/users/${id}`, { status: currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE' }).then(load);

  // Verification
  const verifyListing = (l: any) => {
    const listingId = Number(prompt('Listing ID cần xác minh', l.listingId || '') || 0);
    const propertyId = Number(prompt('Property ID', l.propertyId || '') || 0);
    const level = prompt('Level: REMOTE_VERIFIED hoặc ON_SITE_VERIFIED', 'ON_SITE_VERIFIED') || 'ON_SITE_VERIFIED';
    api.post('/admin/verifications', {
      listingId,
      propertyId,
      level,
      roomExists: true,
      locationVerified: true,
      mediaVerified: true,
      priceVerified: true,
      utilityVerified: true,
      amenityVerified: true,
      availabilityVerified: true,
      note: 'Đã kiểm tra thực địa theo checklist đầy đủ'
    }).then(load);
  };

  const confirmPayment = (id: number) => api.post(`/admin/payments/${id}/confirm`).then(load);
  const resolveReport = (id: number) =>
    api.post(`/admin/reports/${id}/resolve`, { resolution: prompt('Kết quả xử lý báo cáo:') || 'Đã xử lý' }).then(load);

  const saveBlog = () =>
    api.post('/admin/blogs', blog).then(() => {
      alert('Đã lưu bài viết thành công');
      setBlog({ ...blog, title: '', summary: '', content: '' });
      load();
    });

  // Advertisement management
  const uploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.post('/content/ads/banner', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAd({ ...ad, bannerImage: res.data.bannerUrl });
      alert('Tải banner lên thành công!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Không thể tải ảnh banner');
    } finally {
      setAdUploading(false);
    }
  };

  const saveAd = () => {
    if (!ad.title.trim()) return alert('Vui lòng nhập tên/tiêu đề quảng cáo');
    api.post('/admin/ads', {
      ...ad,
      priority: Number(ad.priority || 0),
      startAt: ad.startAt || null,
      endAt: ad.endAt || null
    }).then(() => {
      alert('Đã lưu chiến dịch quảng cáo thành công');
      setAd({
        title: '',
        campaignName: '',
        advertiserName: '',
        bannerImage: '',
        destinationUrl: '',
        placement: 'RIGHT_SIDEBAR',
        targetType: 'ALL',
        priority: 0,
        status: 'ACTIVE',
        startAt: '',
        endAt: '',
        note: ''
      });
      load();
    }).catch(e => alert(e.response?.data?.message || 'Không thể lưu quảng cáo'));
  };

  const toggleAdStatus = (a: any) => {
    const nextStatus = a.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    api.put(`/admin/ads/${a.id}`, { ...a, status: nextStatus }).then(load);
  };

  // Partner & Voucher handlers
  const savePartner = async () => {
    if (!partnerForm.name.trim()) return alert('Vui lòng nhập tên đối tác');
    try {
      await api.post('/rewards/admin/partners', partnerForm);
      setShowPartnerModal(false);
      setPartnerForm({ name: '', category: 'F&B', logoUrl: '', phone: '', website: '', status: 'ACTIVE' });
      alert('Đã thêm đối tác thành công!');
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể tạo đối tác');
    }
  };

  const saveVoucher = async () => {
    if (!voucherForm.title.trim()) return alert('Vui lòng nhập tiêu đề voucher');
    if (!voucherForm.partnerId) return alert('Vui lòng chọn đối tác liên kết');
    try {
      await api.post('/rewards/admin/vouchers', voucherForm);
      setShowVoucherModal(false);
      alert('Đã tạo voucher thành công!');
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể tạo voucher');
    }
  };

  const handleImportCodes = async () => {
    if (!importVoucherId) return;
    const lines = importCodesText.split('\n').map(s => s.trim()).filter(Boolean);
    if (!lines.length) return alert('Vui lòng nhập ít nhất một mã code');
    try {
      const res = await api.post(`/rewards/admin/vouchers/${importVoucherId}/codes`, { codes: lines });
      alert(`Đã nạp thành công ${res.data.importedCount} mã voucher vào kho!`);
      setImportVoucherId(null);
      setImportCodesText('');
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể nạp mã code');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Console</h1>
        <p className="mt-1 text-sm text-gray-600">
          Quản trị toàn diện: tài khoản, kiểm duyệt tin đăng, quảng cáo đối tác, tài chính và xác minh thực địa.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border text-gray-700 hover:bg-gray-50'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      )}

      {/* Tổng quan */}
      {!loading && tab === 'Tổng quan' && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(data).map(([k, v]) => (
            <div key={k} className="bg-white border rounded-2xl p-5 shadow-xs">
              <div className="text-xs text-gray-500 font-medium">{k}</div>
              <div className="text-2xl font-extrabold mt-1 text-gray-900">
                {typeof v === 'number' && k.toLowerCase().includes('cash') ? money(v) : String(v)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Thống kê & Analytics */}
      {!loading && tab === 'Thống kê & Analytics' && (
        <div className="space-y-6">
          {/* Days filter & Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Báo cáo Phân tích & Tăng trưởng UniHome</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Chỉ số lưu lượng người dùng, phễu chuyển đổi và doanh thu thực tế được ghi nhận minh bạch.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Khoảng thời gian:</span>
              <button
                onClick={() => setAnalyticsDays(30)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  analyticsDays === 30 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                30 ngày qua
              </button>
              <button
                onClick={() => setAnalyticsDays(90)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  analyticsDays === 90 ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                90 ngày qua
              </button>
            </div>
          </div>

          {/* Financial KPIs with Revenue Recognition Rule */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-purple-50/70 border border-indigo-100 p-6 rounded-3xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
              <div>
                <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  Chỉ số tài chính nền tảng
                </span>
                <h3 className="text-xl font-extrabold text-gray-900 mt-0.5">
                  Doanh thu Thực tế vs. Dòng tiền Nạp ví
                </h3>
              </div>
              <div className="px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold">
                Quy tắc: Nạp ví ≠ Doanh thu
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs text-gray-500 font-medium">Tiền nạp vào ví (Wallet Inflow)</span>
                <div className="text-2xl font-extrabold text-gray-900 mt-1">{money(data.walletInflow || 0)}</div>
                <div className="text-[11px] text-gray-400 mt-1">Tiền gửi/ký quỹ của người dùng</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-indigo-300 shadow-xs ring-2 ring-indigo-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-indigo-700 font-bold">Doanh thu ĐÃ GHI NHẬN</span>
                  <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.2 rounded">Chính xác</span>
                </div>
                <div className="text-2xl font-extrabold text-indigo-700 mt-1">{money(data.recognizedRevenue || 0)}</div>
                <div className="text-[11px] text-indigo-600 font-medium mt-1">Thực chi cho VIP / Đẩy tin / Ads</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs text-amber-700 font-medium">Doanh thu Gói VIP & Đẩy tin</span>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">{money(data.packageRevenue || 0)}</div>
                <div className="text-[11px] text-gray-400 mt-1">Chủ trọ thanh toán dịch vụ bài đăng</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs text-emerald-700 font-medium">Doanh thu Quảng cáo đối tác</span>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">{money(data.adRevenue || 0)}</div>
                <div className="text-[11px] text-gray-400 mt-1">CPC/CPM từ banner quảng cáo</div>
              </div>
            </div>

            <div className="text-xs text-indigo-900/80 bg-indigo-100/50 p-3 rounded-xl border border-indigo-200/50 flex items-start gap-2">
              <span>💡</span>
              <div>
                <b>Nguyên tắc ghi nhận doanh thu kế toán:</b> Số tiền khách nạp vào ví UniHome (Wallet Inflow) được hạch toán là nghĩa vụ phải trả (tiền đặt cọc/tiền gửi của khách). Doanh thu thực tế (Recognized Revenue) chỉ được ghi nhận tương ứng khi người dùng thực hiện giao dịch khấu trừ số dư ví để mua Gói VIP, Đẩy tin hoặc chi trả phí quảng cáo theo lượt xem/click.
              </div>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border shadow-xs">
              <span className="text-xs text-gray-500 font-medium">Tổng người dùng</span>
              <div className="text-xl font-extrabold text-gray-900 mt-1">{data.totalUsers || 0}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                {data.landlordsCount || 0} chủ trọ • {data.tenantsCount || 0} người thuê
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border shadow-xs">
              <span className="text-xs text-gray-500 font-medium">Tin đăng đang hiển thị</span>
              <div className="text-xl font-extrabold text-green-700 mt-1">{data.activeListings || 0}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                Chờ duyệt: {data.pendingListings || 0}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border shadow-xs">
              <span className="text-xs text-gray-500 font-medium">Lượt hiển thị Quảng cáo</span>
              <div className="text-xl font-extrabold text-purple-700 mt-1">
                {Number(data.adImpressions || 0).toLocaleString()}
              </div>
              <div className="text-[11px] text-purple-600 mt-0.5">
                {data.adClicks || 0} clicks (CTR: {(data.adCtr || 0).toFixed(2)}%)
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border shadow-xs">
              <span className="text-xs text-gray-500 font-medium">Hồ sơ Roommate Matching</span>
              <div className="text-xl font-extrabold text-indigo-600 mt-1">{data.matchingProfiles || 0}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">Đã đổi {data.totalRedemptions || 0} voucher</div>
            </div>
          </div>

          {/* Charts Row 1: Traffic Line Chart & Daily Recognized Revenue Bar Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-3xl border shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="font-extrabold text-gray-900 text-sm">Lưu lượng truy cập hệ thống</h4>
                  <p className="text-[11px] text-gray-500">Xem trang, xem phòng và lượt tìm kiếm hàng ngày</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailySeries || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line type="monotone" dataKey="pageViews" name="Lượt xem trang" stroke="#6366F1" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="roomViews" name="Lượt xem phòng" stroke="#10B981" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="searches" name="Tìm kiếm" stroke="#F59E0B" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="font-extrabold text-gray-900 text-sm">Doanh thu ghi nhận hàng ngày</h4>
                  <p className="text-[11px] text-gray-500">Doanh thu thực tế phát sinh (VNĐ)</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.dailySeries || []} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(val: number) => `${val / 1000}k`} />
                    <Tooltip formatter={(val: any) => money(val)} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Bar dataKey="recognizedRevenue" name="Doanh thu thực" fill="#6366F1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Charts Row 2: Donut Chart for Listing Statuses & Conversion Funnel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-5 rounded-3xl border shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="font-extrabold text-gray-900 text-sm">Cơ cấu Trạng thái Tin đăng</h4>
                  <p className="text-[11px] text-gray-500">Phân bố phòng theo trạng thái hiện tại</p>
                </div>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.listingStatusDistribution || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={3}
                      label={({ name, percent }: any) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {(data.listingStatusDistribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#6366F1'} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border shadow-xs space-y-3">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h4 className="font-extrabold text-gray-900 text-sm">Phễu chuyển đổi Thuê phòng</h4>
                  <p className="text-[11px] text-gray-500">Từ lượt xem đến hoàn tất kết nối thuê trọ</p>
                </div>
              </div>
              <div className="space-y-4 pt-2">
                {(data.conversionFunnel || []).map((step: any, idx: number) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-800">{step.stage}</span>
                      <span className="font-extrabold text-indigo-700">
                        {Number(step.count).toLocaleString()} lượt ({step.pct}%)
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(5, step.pct)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Kiểm duyệt tin đăng */}
      {!loading && tab === 'Kiểm duyệt' && (
        <div className="space-y-3">
          {(data.items || []).map((x: any) => (
            <div key={x.id} className="bg-white border rounded-2xl p-5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center shadow-xs">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-gray-900 text-base">{x.title}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    x.status === 'PENDING_REVIEW' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    #{x.id} • {x.status}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Chủ trọ ID: #{x.landlordId} • Giá: {money(x.price)} • Địa chỉ: {x.address || '—'}
                </div>
                {x.revisionNote && (
                  <div className="text-xs text-red-600 font-semibold mt-1">Ghi chú hiện tại: {x.revisionNote}</div>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => moderate(x.id, 'APPROVE')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  ✓ Duyệt công khai
                </button>
                <button
                  onClick={() => moderate(x.id, 'NEED_REVISION')}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Yêu cầu sửa
                </button>
                <button
                  onClick={() => moderate(x.id, 'REJECT')}
                  className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Từ chối
                </button>
                <button
                  onClick={() => moderate(x.id, 'SUSPEND')}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-xl text-xs font-bold transition-colors"
                >
                  Khóa
                </button>
              </div>
            </div>
          ))}
          {!(data.items || []).length && (
            <div className="bg-white border rounded-2xl p-12 text-center text-gray-400 text-sm">
              Không có tin nào đang chờ kiểm duyệt.
            </div>
          )}
        </div>
      )}

      {/* Quảng cáo Management */}
      {!loading && tab === 'Quảng cáo' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-2xl p-6 space-y-4 shadow-xs">
            <h2 className="font-bold text-lg text-gray-900 border-b pb-3">Tạo / Chỉnh sửa Chiến dịch Quảng cáo</h2>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-gray-700">
                Tiêu đề quảng cáo *
                <input
                  className="input"
                  placeholder="VD: Dịch vụ dọn nhà sinh viên UniMove"
                  value={ad.title}
                  onChange={e => setAd({ ...ad, title: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-gray-700">
                Tên chiến dịch
                <input
                  className="input"
                  placeholder="VD: Campaign Back to School Q3"
                  value={ad.campaignName}
                  onChange={e => setAd({ ...ad, campaignName: e.target.value })}
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <label className="block text-xs font-semibold text-gray-700">
                Tên đối tác / Nhà quảng cáo
                <input
                  className="input"
                  placeholder="VD: Cty TNHH UniMove"
                  value={ad.advertiserName}
                  onChange={e => setAd({ ...ad, advertiserName: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-gray-700">
                Vị trí hiển thị (Placement)
                <select
                  className="input"
                  value={ad.placement}
                  onChange={e => setAd({ ...ad, placement: e.target.value })}
                >
                  <option value="RIGHT_SIDEBAR">RIGHT_SIDEBAR (Cột bên phải Marketplace)</option>
                  <option value="TOP_BANNER">TOP_BANNER (Banner đầu trang)</option>
                  <option value="ROOM_DETAIL">ROOM_DETAIL (Chi tiết phòng trọ)</option>
                  <option value="SERVICE_CATEGORY">SERVICE_CATEGORY (Trang dịch vụ)</option>
                </select>
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Ảnh banner</label>
              <div className="flex gap-2">
                <input
                  className="input flex-1"
                  placeholder="URL ảnh hoặc tải file bên cạnh"
                  value={ad.bannerImage}
                  onChange={e => setAd({ ...ad, bannerImage: e.target.value })}
                />
                <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 border px-3 py-2 rounded-xl text-xs font-semibold text-gray-700 shrink-0 flex items-center">
                  {adUploading ? 'Đang tải...' : 'Upload ảnh'}
                  <input type="file" accept="image/*" onChange={uploadBanner} className="hidden" />
                </label>
              </div>
              {ad.bannerImage && (
                <div className="mt-2 h-24 rounded-xl border overflow-hidden bg-gray-50">
                  <img src={resolveMediaUrl(ad.bannerImage)} alt="" className="w-full h-full object-cover" />
                </div>
              )}
            </div>

            <label className="block text-xs font-semibold text-gray-700">
              Đường dẫn chuyển tiếp (Destination URL)
              <input
                className="input"
                placeholder="https://facebook.com/... hoặc https://unimove.vn"
                value={ad.destinationUrl}
                onChange={e => setAd({ ...ad, destinationUrl: e.target.value })}
              />
            </label>

            <div className="grid grid-cols-3 gap-3">
              <label className="block text-xs font-semibold text-gray-700">
                Độ ưu tiên (Priority)
                <input
                  type="number"
                  className="input"
                  placeholder="0"
                  value={ad.priority}
                  onChange={e => setAd({ ...ad, priority: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-gray-700">
                Trạng thái
                <select
                  className="input"
                  value={ad.status}
                  onChange={e => setAd({ ...ad, status: e.target.value })}
                >
                  <option value="ACTIVE">ACTIVE (Hiển thị ngay)</option>
                  <option value="PAUSED">PAUSED (Tạm dừng)</option>
                  <option value="DRAFT">DRAFT (Bản nháp)</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-gray-700">
                Đối tượng đích
                <select
                  className="input"
                  value={ad.targetType}
                  onChange={e => setAd({ ...ad, targetType: e.target.value })}
                >
                  <option value="ALL">Tất cả người dùng</option>
                  <option value="TENANT">Chỉ Sinh viên/Người thuê</option>
                  <option value="LANDLORD">Chỉ Chủ trọ</option>
                </select>
              </label>
            </div>

            <button
              onClick={saveAd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white w-full py-3 rounded-xl font-bold text-xs transition-colors shadow-sm"
            >
              Lưu chiến dịch quảng cáo
            </button>
          </div>

          {/* List of Ads */}
          <div className="space-y-3">
            <h2 className="font-bold text-lg text-gray-900">Danh sách Quảng cáo đang có ({(data.items || []).length})</h2>
            {(data.items || []).map((a: any) => (
              <div key={a.id} className="bg-white border rounded-2xl p-4 flex gap-4 items-center shadow-xs">
                {a.bannerImage ? (
                  <img
                    src={resolveMediaUrl(a.bannerImage)}
                    alt=""
                    className="w-20 h-16 rounded-xl object-cover border shrink-0 bg-gray-50"
                  />
                ) : (
                  <div className="w-20 h-16 rounded-xl bg-gray-100 border flex items-center justify-center text-xs text-gray-400 shrink-0">
                    No banner
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-gray-900 truncate">{a.title}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      a.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5 truncate">
                    Vị trí: <b>{a.placement}</b> • Ưu tiên: {a.priority || 0}
                  </div>
                  <div className="text-[11px] text-gray-400 mt-1 flex gap-3">
                    <span>Lượt xem: <b>{a.impressions || 0}</b></span>
                    <span>Lượt click: <b>{a.clickCount || 0}</b></span>
                  </div>
                </div>
                <button
                  onClick={() => toggleAdStatus(a)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    a.status === 'ACTIVE'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100'
                      : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                  }`}
                >
                  {a.status === 'ACTIVE' ? 'Tạm dừng' : 'Bật chạy'}
                </button>
              </div>
            ))}
            {!(data.items || []).length && (
              <div className="bg-white border rounded-2xl p-12 text-center text-gray-400 text-sm">
                Chưa có chiến dịch quảng cáo nào được tạo.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Voucher & Đối tác */}
      {!loading && tab === 'Voucher & Đối tác' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl border">
            <div>
              <h2 className="text-lg font-extrabold text-gray-900">Quản lý Đối tác & Voucher Đổi thưởng</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Cấu hình đối tác liên kết F&B, dịch vụ sinh viên, voucher đổi thưởng bằng Điểm UniHome.
              </p>
            </div>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowPartnerModal(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                + Thêm Đối tác
              </button>
              <button
                onClick={() => setShowVoucherModal(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                + Tạo Voucher mới
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Partners List */}
            <div className="bg-white border rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-extrabold text-gray-900 text-sm">Đối tác liên kết ({data.partners?.length || 0})</h3>
              </div>
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {(data.partners || []).map((p: any) => (
                  <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {p.logoUrl ? (
                        <img src={resolveMediaUrl(p.logoUrl)} alt="" className="w-10 h-10 rounded-xl object-contain border p-1" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-extrabold flex items-center justify-center text-sm border border-indigo-200">
                          {p.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <b className="text-sm text-gray-900">{p.name}</b>
                        <div className="text-xs text-gray-500">{p.category} • {p.phone || 'Chưa có SĐT'}</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 bg-green-50 text-green-700 rounded-md">
                      {p.status || 'ACTIVE'}
                    </span>
                  </div>
                ))}
                {!(data.partners || []).length && (
                  <div className="p-8 text-center text-xs text-gray-400">Chưa có đối tác nào.</div>
                )}
              </div>
            </div>

            {/* Vouchers List */}
            <div className="bg-white border rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex justify-between items-center border-b pb-3">
                <h3 className="font-extrabold text-gray-900 text-sm">Kho Voucher ({data.vouchers?.length || 0})</h3>
              </div>
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {(data.vouchers || []).map((v: any) => (
                  <div key={v.id} className="py-3 flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <b className="text-sm text-gray-900">{v.title}</b>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-purple-100 text-purple-700 rounded">
                          {v.pointsCost} Điểm
                        </span>
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-gray-100 text-gray-600 rounded">
                          {v.codeMode === 'UNIQUE_POOL' ? 'Mã độc nhất (Pool)' : 'Mã chung'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Đối tác: <b>{v.partnerName}</b> • Còn lại: <b className="text-emerald-700">{v.remainingStock}</b>/{v.totalStock}
                      </div>
                    </div>
                    {v.codeMode === 'UNIQUE_POOL' && (
                      <button
                        onClick={() => {
                          setImportVoucherId(v.id);
                          setImportCodesText('');
                        }}
                        className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1 rounded-lg shrink-0"
                      >
                        + Nạp mã pool
                      </button>
                    )}
                  </div>
                ))}
                {!(data.vouchers || []).length && (
                  <div className="p-8 text-center text-xs text-gray-400">Chưa có voucher nào.</div>
                )}
              </div>
            </div>
          </div>

          {/* Modal: Thêm Đối tác */}
          {showPartnerModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-extrabold text-base text-gray-900">Thêm Đối tác liên kết</h3>
                  <button onClick={() => setShowPartnerModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-700">
                    Tên đối tác / Thương hiệu *
                    <input
                      className="input"
                      placeholder="VD: Highland Coffee FPT Campus"
                      value={partnerForm.name}
                      onChange={e => setPartnerForm({ ...partnerForm, name: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs font-semibold text-gray-700">
                    Lĩnh vực / Danh mục
                    <select
                      className="input"
                      value={partnerForm.category}
                      onChange={e => setPartnerForm({ ...partnerForm, category: e.target.value })}
                    >
                      <option value="F&B">F&B (Ăn uống, Cafe)</option>
                      <option value="Học tập">Học tập & Giáo dục</option>
                      <option value="Dịch vụ">Dịch vụ đời sống</option>
                      <option value="Tiện ích">Tiện ích sinh viên</option>
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-gray-700">
                    URL Logo đối tác
                    <input
                      className="input"
                      placeholder="https://... hoặc /uploads/..."
                      value={partnerForm.logoUrl}
                      onChange={e => setPartnerForm({ ...partnerForm, logoUrl: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs font-semibold text-gray-700">
                    Số điện thoại
                    <input
                      className="input"
                      placeholder="0912345678"
                      value={partnerForm.phone}
                      onChange={e => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                    />
                  </label>
                  <label className="block text-xs font-semibold text-gray-700">
                    Website / Fanpage
                    <input
                      className="input"
                      placeholder="https://facebook.com/..."
                      value={partnerForm.website}
                      onChange={e => setPartnerForm({ ...partnerForm, website: e.target.value })}
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    onClick={() => setShowPartnerModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={savePartner}
                    className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl"
                  >
                    Lưu đối tác
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Tạo Voucher mới */}
          {showVoucherModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-extrabold text-base text-gray-900">Tạo Voucher Đổi thưởng mới</h3>
                  <button onClick={() => setShowVoucherModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                </div>
                <div className="space-y-3">
                  <label className="block text-xs font-semibold text-gray-700">
                    Đối tác phát hành *
                    <select
                      className="input"
                      value={voucherForm.partnerId}
                      onChange={e => setVoucherForm({ ...voucherForm, partnerId: e.target.value })}
                    >
                      <option value="">-- Chọn đối tác --</option>
                      {(data.partners || []).map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name} ({p.category})</option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-xs font-semibold text-gray-700">
                    Tiêu đề Voucher *
                    <input
                      className="input"
                      placeholder="VD: Giảm 20.000đ cho hóa đơn từ 50.000đ"
                      value={voucherForm.title}
                      onChange={e => setVoucherForm({ ...voucherForm, title: e.target.value })}
                    />
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs font-semibold text-gray-700">
                      Danh mục
                      <select
                        className="input"
                        value={voucherForm.category}
                        onChange={e => setVoucherForm({ ...voucherForm, category: e.target.value })}
                      >
                        <option value="FOOD">Ẩm thực & Cafe</option>
                        <option value="SERVICES">Dịch vụ dọn nhà / Giặt là</option>
                        <option value="STUDY">Học tập & Giáo trình</option>
                        <option value="UTILITY">Tiện ích sinh hoạt</option>
                      </select>
                    </label>
                    <label className="block text-xs font-semibold text-gray-700">
                      Số Điểm UniHome để đổi *
                      <input
                        type="number"
                        className="input font-bold text-indigo-600"
                        placeholder="100"
                        value={voucherForm.pointsCost}
                        onChange={e => setVoucherForm({ ...voucherForm, pointsCost: Number(e.target.value) })}
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs font-semibold text-gray-700">
                      Loại giảm giá
                      <select
                        className="input"
                        value={voucherForm.discountType}
                        onChange={e => setVoucherForm({ ...voucherForm, discountType: e.target.value })}
                      >
                        <option value="PERCENT">Giảm phần trăm (%)</option>
                        <option value="FIXED_AMOUNT">Giảm số tiền cố định (VNĐ)</option>
                      </select>
                    </label>
                    <label className="block text-xs font-semibold text-gray-700">
                      Giá trị giảm
                      <input
                        type="number"
                        className="input"
                        placeholder="15 hoặc 20000"
                        value={voucherForm.discountValue}
                        onChange={e => setVoucherForm({ ...voucherForm, discountValue: Number(e.target.value) })}
                      />
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block text-xs font-semibold text-gray-700">
                      Đơn tối thiểu (VNĐ)
                      <input
                        type="number"
                        className="input"
                        placeholder="50000"
                        value={voucherForm.minOrder}
                        onChange={e => setVoucherForm({ ...voucherForm, minOrder: Number(e.target.value) })}
                      />
                    </label>
                    <label className="block text-xs font-semibold text-gray-700">
                      Tổng số lượng phát hành *
                      <input
                        type="number"
                        className="input"
                        placeholder="50"
                        value={voucherForm.totalStock}
                        onChange={e => setVoucherForm({ ...voucherForm, totalStock: Number(e.target.value) })}
                      />
                    </label>
                  </div>
                  <label className="block text-xs font-semibold text-gray-700">
                    Cơ chế sinh mã code
                    <select
                      className="input"
                      value={voucherForm.codeMode}
                      onChange={e => setVoucherForm({ ...voucherForm, codeMode: e.target.value })}
                    >
                      <option value="UNIQUE_POOL">Mã độc nhất từng người (nạp từ kho code pool)</option>
                      <option value="SINGLE_CODE">Dùng chung 1 mã code cho tất cả</option>
                    </select>
                  </label>
                  {voucherForm.codeMode === 'SINGLE_CODE' && (
                    <label className="block text-xs font-semibold text-gray-700">
                      Mã dùng chung
                      <input
                        className="input font-mono uppercase"
                        placeholder="UNIHOME2026"
                        value={voucherForm.sharedCode}
                        onChange={e => setVoucherForm({ ...voucherForm, sharedCode: e.target.value })}
                      />
                    </label>
                  )}
                  <label className="block text-xs font-semibold text-gray-700">
                    Mô tả / Điều kiện áp dụng
                    <textarea
                      rows={3}
                      className="input text-xs"
                      placeholder="Áp dụng tại tất cả cơ sở... Không cộng dồn khuyến mãi..."
                      value={voucherForm.description}
                      onChange={e => setVoucherForm({ ...voucherForm, description: e.target.value })}
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    onClick={() => setShowVoucherModal(false)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={saveVoucher}
                    className="px-5 py-2 text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl"
                  >
                    Tạo Voucher
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Modal: Nạp mã Voucher Code Pool */}
          {importVoucherId && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-extrabold text-base text-gray-900">Nạp mã code vào kho Voucher #{importVoucherId}</h3>
                  <button onClick={() => setImportVoucherId(null)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
                </div>
                <p className="text-xs text-gray-500">
                  Dán danh sách mã code độc nhất từ đối tác (mỗi dòng 1 mã code):
                </p>
                <textarea
                  rows={8}
                  className="input font-mono text-xs uppercase"
                  placeholder="HIGHLAND-A123&#10;HIGHLAND-B456&#10;HIGHLAND-C789"
                  value={importCodesText}
                  onChange={e => setImportCodesText(e.target.value)}
                />
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    onClick={() => setImportVoucherId(null)}
                    className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={handleImportCodes}
                    className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl"
                  >
                    Nạp vào kho
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      {!loading && tab === 'Xác minh' && (
        <>
          <button
            onClick={() => verifyListing({})}
            className="mb-4 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-sm"
          >
            + Ghi nhận biên bản xác minh thực địa
          </button>
          <div className="overflow-x-auto bg-white border rounded-2xl shadow-xs">
            <table className="min-w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase">
                <tr>
                  <th className="p-4 text-left">ID</th>
                  <th className="p-4 text-left">Listing ID</th>
                  <th className="p-4 text-left">Cấp độ</th>
                  <th className="p-4 text-left">Trạng thái</th>
                  <th className="p-4 text-left">Checklist kiểm định</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data.items || []).map((x: any) => (
                  <tr key={x.id} className="hover:bg-gray-50">
                    <td className="p-4 font-bold">{x.id}</td>
                    <td className="p-4">#{x.listingId}</td>
                    <td className="p-4 font-bold text-indigo-600">{x.level}</td>
                    <td className="p-4">{x.status}</td>
                    <td className="p-4 text-green-700 font-medium">
                      {x.roomExists ? '✓ phòng ' : ''}
                      {x.locationVerified ? '✓ vị trí ' : ''}
                      {x.priceVerified ? '✓ giá ' : ''}
                      {x.utilityVerified ? '✓ điện nước ' : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Tài khoản người dùng */}
      {!loading && tab === 'Tài khoản' && (
        <div className="overflow-x-auto bg-white border rounded-2xl shadow-xs">
          <table className="min-w-full text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase">
              <tr>
                <th className="p-4 text-left">Người dùng</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">SĐT</th>
                <th className="p-4 text-left">Vai trò</th>
                <th className="p-4 text-left">Trạng thái</th>
                <th className="p-4 text-left">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(data.items || []).map((u: any) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="p-4 font-bold text-gray-900">
                    {u.fullName} <span className="text-gray-400 font-normal">#{u.id}</span>
                  </td>
                  <td className="p-4">{u.email}</td>
                  <td className="p-4">{u.phone || '—'}</td>
                  <td className="p-4">
                    <select
                      className="border rounded-lg p-1.5 text-xs bg-white"
                      value={u.role}
                      onChange={e => changeRole(u.id, e.target.value)}
                    >
                      {[
                        'TENANT',
                        'LANDLORD',
                        'SERVICE_PROVIDER',
                        'MODERATOR',
                        'VERIFIER',
                        'CONTENT_ADMIN',
                        'FINANCE_ADMIN',
                        'ADMIN',
                        'SUPER_ADMIN'
                      ].map(r => (
                        <option key={r}>{r}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-full font-bold ${
                      u.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => toggleStatus(u.id, u.status)}
                      className="text-xs font-bold text-red-600 hover:underline"
                    >
                      {u.status === 'ACTIVE' ? 'Khóa' : 'Mở khóa'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tài chính */}
      {!loading && tab === 'Tài chính' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {['cashIn', 'walletTopup', 'directPurchase', 'walletPackageSpend', 'expenses', 'netCashFlow'].map(k => (
              <div key={k} className="bg-white border rounded-2xl p-5 shadow-xs">
                <div className="text-xs text-gray-500 font-medium">{k}</div>
                <div className="text-xl font-extrabold mt-1 text-gray-900">{money(data[k] || 0)}</div>
              </div>
            ))}
          </div>
          <div className="bg-white border rounded-2xl overflow-hidden shadow-xs">
            <div className="p-4 font-bold text-sm text-gray-800 border-b">Giao dịch nạp tiền & Thanh toán</div>
            <div className="divide-y divide-gray-100">
              {(data.payments || []).map((p: any) => (
                <div key={p.id} className="p-4 flex justify-between items-center text-xs">
                  <div>
                    <b className="text-gray-900">{p.code}</b>
                    <div className="text-gray-400 mt-0.5">{p.type} • {p.status}</div>
                  </div>
                  <div className="flex gap-3 items-center">
                    <b className="text-sm font-extrabold text-indigo-600">{money(p.amount)}</b>
                    {p.status === 'PENDING' && (
                      <button
                        onClick={() => confirmPayment(p.id)}
                        className="bg-green-600 text-white px-3 py-1.5 rounded-lg font-bold"
                      >
                        Xác nhận
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Gói VIP */}
      {!loading && tab === 'Gói VIP' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {(data.items || []).map((p: any) => (
            <div key={p.id} className="bg-white border rounded-2xl p-5 shadow-xs">
              <div className="text-xs text-indigo-600 font-bold">{p.code}</div>
              <h3 className="text-lg font-bold mt-1 text-gray-900">{p.name}</h3>
              <div className="text-indigo-600 font-extrabold text-lg mt-1">{money(p.price)}</div>
              <div className="text-xs text-gray-500 mt-1">{p.durationDays} ngày • priority {p.priority}</div>
              <p className="text-xs text-gray-600 mt-3 leading-relaxed">{p.benefits}</p>
            </div>
          ))}
        </div>
      )}

      {/* Báo cáo vi phạm */}
      {!loading && tab === 'Báo cáo' && (
        <div className="space-y-3">
          {(data.items || []).map((x: any) => (
            <div key={x.id} className="bg-white border rounded-2xl p-5 flex justify-between items-center shadow-xs">
              <div>
                <b className="text-gray-900 text-sm">{x.targetType} #{x.targetId}</b>
                <div className="text-xs text-red-600 font-semibold mt-0.5">{x.reasonCode}</div>
                <div className="text-xs text-gray-600 mt-1">{x.details}</div>
              </div>
              {x.status === 'OPEN' ? (
                <button
                  onClick={() => resolveReport(x.id)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold"
                >
                  Xử lý
                </button>
              ) : (
                <span className="text-xs text-green-600 font-bold">{x.status}</span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Blog */}
      {!loading && tab === 'Blog' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border rounded-2xl p-6 space-y-3 shadow-xs">
            <h2 className="font-bold text-lg text-gray-900">Soạn bài viết Blog UniHome</h2>
            <input
              className="input"
              placeholder="Tiêu đề bài viết"
              value={blog.title}
              onChange={e => setBlog({ ...blog, title: e.target.value })}
            />
            <input
              className="input"
              placeholder="Danh mục: PCCC, Mẹo thuê trọ, Pháp lý..."
              value={blog.category}
              onChange={e => setBlog({ ...blog, category: e.target.value })}
            />
            <input
              className="input"
              placeholder="URL ảnh bìa"
              value={blog.coverImage}
              onChange={e => setBlog({ ...blog, coverImage: e.target.value })}
            />
            <textarea
              rows={3}
              className="input text-xs"
              placeholder="Đoạn mở đầu / Sapo tóm tắt"
              value={blog.summary}
              onChange={e => setBlog({ ...blog, summary: e.target.value })}
            />
            <textarea
              rows={10}
              className="input text-xs"
              placeholder="Nội dung bài viết chi tiết..."
              value={blog.content}
              onChange={e => setBlog({ ...blog, content: e.target.value })}
            />
            <button
              onClick={saveBlog}
              className="bg-indigo-600 text-white w-full py-3 rounded-xl font-bold text-xs"
            >
              Lưu và đăng bài
            </button>
          </div>
          <div className="space-y-3">
            {(data.items || []).map((b: any) => (
              <div key={b.id} className="bg-white border rounded-2xl p-4 shadow-xs">
                <b className="text-gray-900 text-sm">{b.title}</b>
                <div className="text-xs text-gray-500 mt-1">{b.category} • {b.status}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audit Log */}
      {!loading && tab === 'Audit' && (
        <div className="bg-white border rounded-2xl divide-y shadow-xs">
          {(data.items || []).map((x: any) => (
            <div key={x.id} className="p-4 text-xs">
              <b className="text-gray-900">{x.action}</b> • {x.targetType} #{x.targetId}
              <div className="text-[11px] text-gray-400 mt-1">
                Actor #{x.actorId} • {x.createdAt ? new Date(x.createdAt).toLocaleString('vi-VN') : ''} • {x.details}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`.input{margin-top:.25rem;width:100%;border:1px solid #d1d5db;border-radius:.75rem;padding:.55rem .8rem;font-size:.875rem;outline:none}.input:focus{border-color:#6366f1}`}</style>
    </div>
  );
}
