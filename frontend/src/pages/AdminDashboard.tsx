import { useEffect, useState } from 'react';
import { api, getUser, money, resolveMediaUrl } from '../lib/api';
import { useNavigate } from 'react-router-dom';

const tabs = [
  'Tổng quan',
  'Kiểm duyệt',
  'Quảng cáo',
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
      if (tab === 'Kiểm duyệt') setData({ items: (await api.get('/admin/moderation')).data });
      if (tab === 'Quảng cáo') setData({ items: (await api.get('/admin/ads')).data });
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
  }, [tab]);

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

      {/* Xác minh thực địa */}
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
