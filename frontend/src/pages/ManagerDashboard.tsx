import { useEffect, useState } from 'react';
import { api, getUser, mediaList, money, resolveMediaUrl } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import ProfileSettings from '../components/ProfileSettings';

const emptyForm: any = {
  name: '',
  title: '',
  province: '',
  district: '',
  ward: '',
  street: '',
  latitude: '',
  longitude: '',
  price: '',
  deposit: '',
  area: '',
  electricityPrice: '',
  waterPrice: '',
  internetPrice: '',
  parkingFee: '',
  otherFees: '',
  furniture: 'basic',
  propertyType: 'Phòng trọ',
  postType: 'single',
  totalRooms: '',
  totalFloors: '',
  floorText: '',
  maxOccupants: '',
  nearestSchool: '',
  nearestSchoolDistanceKm: '',
  amenities: '',
  rules: '',
  contactPhone: '',
  contactZalo: '',
  description: '',
  imageUrl: '',
  availability: 'AVAILABLE'
};

const COMMON_AMENITIES = [
  'Điều hòa', 'Nóng lạnh', 'Máy giặt', 'Tủ lạnh', 'Khép kín',
  'Ban công', 'Thang máy', 'Khóa vân tay', 'Giờ tự do', 'Bếp nấu ăn',
  'PCCC đạt chuẩn', 'Chỗ để xe', 'Camera an ninh', 'Wifi tốc độ cao'
];

export default function ManagerDashboard({ view }: { view: 'posts' | 'notifications' | 'profile' }) {
  const user = getUser();
  const nav = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [noti, setNoti] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(user || {});

  // Form state
  const [form, setForm] = useState<any>(emptyForm);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [filterTab, setFilterTab] = useState('ALL');
  const [actionMsg, setActionMsg] = useState('');

  const load = () => {
    if (!user) {
      nav('/login');
      return;
    }
    void api.get('/listings/mine').then(r => setList(r.data || [])).catch(() => setList([]));
    void api.get('/payments/plans').then(r => setPlans(r.data || [])).catch(() => setPlans([]));
    void api.get('/notifications/mine').then(r => setNoti(r.data || [])).catch(() => setNoti([]));
  };

  useEffect(() => {
    load();
  }, [view]);

  // Handle image upload into form
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 8);
    if (!files.length) return;
    Promise.all(
      files.map(f => new Promise<string>(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.readAsDataURL(f);
      }))
    ).then(arr => {
      const existing = mediaList(form.imageUrl);
      setForm({ ...form, imageUrl: JSON.stringify([...existing, ...arr]) });
    });
  };

  const removeImage = (index: number) => {
    const arr = mediaList(form.imageUrl);
    arr.splice(index, 1);
    setForm({ ...form, imageUrl: JSON.stringify(arr) });
  };

  const toggleAmenity = (name: string) => {
    const cur = (form.amenities || '').split('|').filter(Boolean);
    const next = cur.includes(name) ? cur.filter((x: string) => x !== name) : [...cur, name];
    setForm({ ...form, amenities: next.join('|') });
  };

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return alert('Trình duyệt không hỗ trợ định vị.');
    navigator.geolocation.getCurrentPosition(
      p => {
        setForm({
          ...form,
          latitude: Number(p.coords.latitude.toFixed(6)),
          longitude: Number(p.coords.longitude.toFixed(6))
        });
      },
      () => alert('Không lấy được vị trí GPS')
    );
  };

  const openCreateModal = () => {
    setForm({
      ...emptyForm,
      contactPhone: user?.phone || '',
      title: '',
      name: ''
    });
    setEditingId(null);
    setActiveStep(1);
    setOpenModal(true);
  };

  const editListing = async (l: any) => {
    try {
      const d = (await api.get(`/marketplace/listings/${l.id}`)).data;
      if (d) {
        setForm({ ...emptyForm, ...d, title: d.title, name: d.name });
        setEditingId(l.id);
        setActiveStep(1);
        setOpenModal(true);
      }
    } catch {
      alert('Không thể tải thông tin tin đăng');
    }
  };

  const submitForm = async (draft = false) => {
    const payload = { ...form, listingStatus: draft ? 'DRAFT' : 'PENDING_REVIEW' };
    try {
      let savedListingId = editingId;
      if (editingId) {
        await api.put(`/listings/${editingId}`, payload);
      } else {
        const res = await api.post('/listings', payload);
        savedListingId = res.data.listing?.id;
      }

      if (!draft && savedListingId) {
        await api.post(`/listings/${savedListingId}/submit`);
      }

      setActionMsg(draft ? 'Đã lưu bản nháp thành công.' : 'Đã gửi duyệt tin thành công! Tin sẽ hiển thị sau khi Admin duyệt.');
      setOpenModal(false);
      setEditingId(null);
      setForm(emptyForm);
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể lưu tin đăng');
    }
  };

  // Listing actions
  const cancelReview = async (id: number) => {
    if (!window.confirm('Hủy gửi duyệt tin này về trạng thái Bản nháp?')) return;
    try {
      await api.post(`/listings/${id}/cancel-review`);
      setActionMsg('Đã rút lại tin về trạng thái Bản nháp.');
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể thao tác');
    }
  };

  const setAvailability = async (id: number, avail: string) => {
    try {
      await api.post(`/listings/${id}/availability`, { availability: avail });
      setActionMsg(avail === 'AVAILABLE' ? 'Đã đánh dấu còn phòng.' : 'Đã đánh dấu hết phòng.');
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể cập nhật tình trạng');
    }
  };

  const confirmAvailability = async (id: number) => {
    try {
      await api.post(`/listings/${id}/confirm-availability`, { availability: 'AVAILABLE' });
      setActionMsg('Đã gia hạn và xác nhận còn phòng thành công (+15 ngày).');
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể xác nhận');
    }
  };

  const archiveListing = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn lưu trữ tin này? Tin sẽ ngừng hiển thị công khai.')) return;
    try {
      await api.post(`/listings/${id}/archive`);
      setActionMsg('Đã lưu trữ tin thành công.');
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể lưu trữ');
    }
  };

  const deleteDraft = async (id: number) => {
    if (!window.confirm('Xóa bản nháp này?')) return;
    try {
      await api.delete(`/listings/${id}`);
      setActionMsg('Đã xóa bản nháp.');
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể xóa');
    }
  };

  const buyPlan = (listingId: number, plan: any) => {
    if (plan.price === 0) return;
    const useWallet = window.confirm(
      `Mua ${plan.name} (${money(plan.price)}) bằng số dư ví UniHome?\nBấm OK để thanh toán bằng ví, hoặc Cancel để tạo mã QR thanh toán ngân hàng.`
    );
    if (useWallet) {
      api.post(`/payments/listing/${listingId}/wallet`, { planId: plan.id })
        .then(() => {
          alert('Đã kích hoạt gói thành công!');
          load();
        })
        .catch(e => alert(e.response?.data?.message || 'Thanh toán qua ví thất bại. Vui lòng kiểm tra số dư.'));
    } else {
      api.post(`/payments/listing/${listingId}/direct`, { planId: plan.id })
        .then(r => {
          window.open(r.data.qrUrl, '_blank');
          alert(`Đã tạo mã thanh toán ${r.data.code}. Sau khi chuyển khoản, gói sẽ tự động kích hoạt.`);
        })
        .catch(e => alert(e.response?.data?.message || 'Không thể tạo mã thanh toán'));
    }
  };

  // Filter listings
  const filteredList = list.filter(l => {
    if (filterTab === 'ACTIVE') return l.status === 'ACTIVE' && l.availability === 'AVAILABLE';
    if (filterTab === 'PENDING') return l.status === 'PENDING_REVIEW';
    if (filterTab === 'REVISION') return l.status === 'NEED_REVISION';
    if (filterTab === 'FULL') return l.availability === 'FULL' || l.availability === 'RENTED';
    if (filterTab === 'ARCHIVED') return l.status === 'ARCHIVED';
    return true;
  });

  // Calculate statistics
  const totalCount = list.length;
  const activeCount = list.filter(l => l.status === 'ACTIVE').length;
  const pendingCount = list.filter(l => l.status === 'PENDING_REVIEW' || l.status === 'NEED_REVISION').length;
  const totalInterests = list.reduce((acc, cur) => acc + (cur.interestCount || 0), 0);
  const totalFavorites = list.reduce((acc, cur) => acc + (cur.favoriteCount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top navigation tabs */}
      <div className="flex flex-wrap gap-2.5 border-b border-gray-200 pb-4">
        <button
          onClick={() => nav('/manager/posts')}
          className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
            view === 'posts' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Quản lý Bài đăng
        </button>
        <button
          onClick={() => nav('/manager/profile')}
          className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
            view === 'profile' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Trang cá nhân
        </button>
        <button
          onClick={() => nav('/manager/notifications')}
          className={`px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all ${
            view === 'notifications' ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          Thông báo
        </button>
        <button
          onClick={() => nav('/tenant/wallet')}
          className="px-4 py-2.5 rounded-xl border text-sm font-semibold bg-white text-gray-700 hover:bg-gray-50"
        >
          Ví & Giao dịch
        </button>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-sm text-indigo-700 flex justify-between items-center">
          <span>✓ {actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="text-indigo-500 font-bold hover:text-indigo-800">×</button>
        </div>
      )}

      {view === 'posts' && (
        <>
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Quản lý Bài đăng & Phòng trọ</h1>
              <p className="mt-1 text-sm text-gray-600">
                Đăng tin miễn phí, kiểm duyệt minh bạch. Đẩy tin VIP và theo dõi tương tác khách thuê.
              </p>
            </div>
            <button
              onClick={openCreateModal}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-colors"
            >
              + Đăng tin phòng mới
            </button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="bg-white border rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-gray-500 font-medium">Tổng tin đăng</span>
              <div className="text-2xl font-extrabold text-gray-900 mt-1">{totalCount}</div>
            </div>
            <div className="bg-white border rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-green-600 font-medium">Đang hiển thị</span>
              <div className="text-2xl font-extrabold text-green-700 mt-1">{activeCount}</div>
            </div>
            <div className="bg-white border rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-amber-600 font-medium">Chờ duyệt / Cần sửa</span>
              <div className="text-2xl font-extrabold text-amber-700 mt-1">{pendingCount}</div>
            </div>
            <div className="bg-white border rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-purple-600 font-medium">Khách quan tâm</span>
              <div className="text-2xl font-extrabold text-purple-700 mt-1">{totalInterests}</div>
            </div>
            <div className="bg-white border rounded-2xl p-4 shadow-xs">
              <span className="text-xs text-pink-600 font-medium">Lượt lưu yêu thích</span>
              <div className="text-2xl font-extrabold text-pink-700 mt-1">{totalFavorites}</div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 border-b pb-3 text-xs font-semibold">
            {[
              ['ALL', `Tất cả (${list.length})`],
              ['ACTIVE', `Đang hiển thị (${list.filter(x => x.status === 'ACTIVE' && x.availability === 'AVAILABLE').length})`],
              ['PENDING', `Chờ duyệt (${list.filter(x => x.status === 'PENDING_REVIEW').length})`],
              ['REVISION', `Cần sửa (${list.filter(x => x.status === 'NEED_REVISION').length})`],
              ['FULL', `Hết phòng (${list.filter(x => x.availability === 'FULL' || x.availability === 'RENTED').length})`],
              ['ARCHIVED', `Đã lưu trữ (${list.filter(x => x.status === 'ARCHIVED').length})`]
            ].map(([tab, label]) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  filterTab === tab ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Table of listings */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 text-left">Bài đăng / Khu trọ</th>
                    <th className="px-4 py-3.5 text-left">Giá thuê</th>
                    <th className="px-4 py-3.5 text-left">Trạng thái duyệt</th>
                    <th className="px-4 py-3.5 text-left">Tình trạng</th>
                    <th className="px-4 py-3.5 text-left">Gói VIP</th>
                    <th className="px-5 py-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 bg-white">
                  {filteredList.map(l => {
                    const cover = l.imageUrl ? mediaList(l.imageUrl)[0] : '';
                    const isFull = l.availability === 'FULL' || l.availability === 'RENTED';
                    return (
                      <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {cover && (
                              <img
                                src={resolveMediaUrl(cover)}
                                alt=""
                                className="w-12 h-12 rounded-xl object-cover shrink-0 border"
                              />
                            )}
                            <div className="min-w-0">
                              <button
                                onClick={() => nav(`/property/${l.id}`)}
                                className="font-bold text-gray-900 hover:text-indigo-600 text-left line-clamp-1 text-sm"
                              >
                                {l.title}
                              </button>
                              <div className="text-xs text-gray-500 mt-0.5 truncate">{l.address || 'Chưa cập nhật địa chỉ'}</div>
                              {l.revisionNote && (
                                <div className="text-xs text-red-600 font-semibold mt-1">
                                  ⚠ Admin phản hồi: {l.revisionNote}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap font-bold text-indigo-600">
                          {money(l.price)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                              l.status === 'ACTIVE'
                                ? 'bg-green-100 text-green-700'
                                : l.status === 'PENDING_REVIEW'
                                ? 'bg-amber-100 text-amber-700'
                                : l.status === 'NEED_REVISION'
                                ? 'bg-red-100 text-red-700'
                                : l.status === 'DRAFT'
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {l.status === 'ACTIVE'
                              ? 'Đang hiển thị'
                              : l.status === 'PENDING_REVIEW'
                              ? 'Chờ duyệt'
                              : l.status === 'NEED_REVISION'
                              ? 'Cần chỉnh sửa'
                              : l.status === 'DRAFT'
                              ? 'Bản nháp'
                              : l.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                              !isFull ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                            }`}
                          >
                            {!isFull ? 'Còn phòng' : 'Hết phòng'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className="text-xs font-bold text-amber-600">
                            {l.packageTier !== 'FREE' ? `★ ${l.packageTier}` : 'FREE'}
                          </span>
                        </td>
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => editListing(l)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1 bg-indigo-50 rounded-lg"
                            >
                              Sửa
                            </button>

                            {/* Availability toggle */}
                            <button
                              onClick={() => setAvailability(l.id, isFull ? 'AVAILABLE' : 'FULL')}
                              className="text-xs font-semibold text-gray-700 hover:bg-gray-100 px-2 py-1 border rounded-lg"
                            >
                              {isFull ? 'Đánh dấu còn' : 'Báo hết'}
                            </button>

                            {/* Confirm availability */}
                            {l.status === 'ACTIVE' && (
                              <button
                                onClick={() => confirmAvailability(l.id)}
                                className="text-xs font-semibold text-green-700 hover:bg-green-50 px-2 py-1 border border-green-200 rounded-lg"
                                title="Gia hạn xác nhận phòng còn trống"
                              >
                                Gia hạn
                              </button>
                            )}

                            {/* Cancel review if pending */}
                            {l.status === 'PENDING_REVIEW' && (
                              <button
                                onClick={() => cancelReview(l.id)}
                                className="text-xs font-semibold text-amber-700 hover:bg-amber-50 px-2 py-1 border border-amber-200 rounded-lg"
                              >
                                Hủy gửi
                              </button>
                            )}

                            {/* Delete draft or archive */}
                            {l.status === 'DRAFT' ? (
                              <button
                                onClick={() => deleteDraft(l.id)}
                                className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg"
                              >
                                Xóa
                              </button>
                            ) : l.status !== 'ARCHIVED' ? (
                              <button
                                onClick={() => archiveListing(l.id)}
                                className="text-xs font-semibold text-gray-500 hover:bg-gray-100 px-2 py-1 rounded-lg"
                              >
                                Lưu trữ
                              </button>
                            ) : null}

                            {/* Plan upgrade */}
                            <select
                              className="border border-gray-200 rounded-lg text-xs px-2 py-1 text-gray-700 bg-white"
                              onChange={e => {
                                const p = plans.find(x => String(x.id) === e.target.value);
                                if (p) buyPlan(l.id, p);
                              }}
                              defaultValue=""
                            >
                              <option value="">Gói VIP</option>
                              {plans.filter(p => p.price > 0).map(p => (
                                <option key={p.id} value={p.id}>
                                  {p.name} - {money(p.price)}
                                </option>
                              ))}
                            </select>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredList.length === 0 && (
                <div className="p-12 text-center text-sm text-gray-400">
                  Không có tin đăng nào trong mục này.
                </div>
              )}
            </div>
          </div>

          {/* 8-Step Wizard Modal for Creating / Editing Listing */}
          {openModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white rounded-3xl max-w-3xl w-full p-6 md:p-8 space-y-6 max-h-[90vh] overflow-y-auto shadow-2xl">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                      {editingId ? 'Chỉnh sửa thông tin phòng trọ' : 'Đăng tin phòng trọ mới'}
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Bước {activeStep}/8: {
                        [
                          '',
                          'Thông tin chung & Loại phòng',
                          'Địa chỉ & Tọa độ bản đồ',
                          'Giá thuê & Chi phí minh bạch',
                          'Diện tích & Sức chứa',
                          'Tiện ích & Nội thất',
                          'Nội quy phòng trọ',
                          'Hình ảnh & Video thực tế',
                          'Mô tả chi tiết & Liên hệ'
                        ][activeStep]
                      }
                    </p>
                  </div>
                  <button
                    onClick={() => setOpenModal(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 flex items-center justify-center font-bold"
                  >
                    ✕
                  </button>
                </div>

                {/* Step indicator bar */}
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                    <button
                      key={s}
                      onClick={() => setActiveStep(s)}
                      className={`flex-1 py-1 rounded-full text-[11px] font-bold transition-colors ${
                        activeStep === s
                          ? 'bg-indigo-600 text-white'
                          : activeStep > s
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-gray-100 text-gray-400'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Step 1: General info */}
                {activeStep === 1 && (
                  <div className="space-y-4">
                    <label className="block text-xs font-semibold text-gray-700">
                      Tiêu đề bài đăng
                      <input
                        className="input"
                        placeholder="VD: Phòng khép kín đầy đủ đồ gần ĐH FPT Hòa Lạc"
                        value={form.title || ''}
                        onChange={e => setForm({ ...form, title: e.target.value })}
                      />
                    </label>

                    <label className="block text-xs font-semibold text-gray-700">
                      Tên khu trọ / Tòa nhà
                      <input
                        className="input"
                        placeholder="VD: Nhà trọ UniHome Tân Xã"
                        value={form.name || ''}
                        onChange={e => setForm({ ...form, name: e.target.value })}
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="block text-xs font-semibold text-gray-700">
                        Loại hình phòng
                        <select
                          className="input"
                          value={form.propertyType}
                          onChange={e => setForm({ ...form, propertyType: e.target.value })}
                        >
                          <option>Phòng trọ</option>
                          <option>Chung cư mini</option>
                          <option>Ở ghép</option>
                          <option>Căn hộ dịch vụ</option>
                        </select>
                      </label>

                      <label className="block text-xs font-semibold text-gray-700">
                        Hình thức cho thuê
                        <select
                          className="input"
                          value={form.postType}
                          onChange={e => setForm({ ...form, postType: e.target.value })}
                        >
                          <option value="single">Thuê nguyên phòng</option>
                          <option value="shared">Tìm bạn ở ghép</option>
                        </select>
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 2: Location */}
                {activeStep === 2 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <label className="block text-xs font-semibold text-gray-700">
                        Tỉnh / Thành phố
                        <input
                          className="input"
                          placeholder="Hà Nội"
                          value={form.province || ''}
                          onChange={e => setForm({ ...form, province: e.target.value })}
                        />
                      </label>
                      <label className="block text-xs font-semibold text-gray-700">
                        Quận / Huyện
                        <input
                          className="input"
                          placeholder="Thạch Thất"
                          value={form.district || ''}
                          onChange={e => setForm({ ...form, district: e.target.value })}
                        />
                      </label>
                      <label className="block text-xs font-semibold text-gray-700">
                        Phường / Xã
                        <input
                          className="input"
                          placeholder="Tân Xã"
                          value={form.ward || ''}
                          onChange={e => setForm({ ...form, ward: e.target.value })}
                        />
                      </label>
                    </div>

                    <label className="block text-xs font-semibold text-gray-700">
                      Địa chỉ cụ thể (Số nhà, ngõ/ngách, đường)
                      <input
                        className="input"
                        placeholder="Số 10 ngõ 2 đường Tân Xã"
                        value={form.street || ''}
                        onChange={e => setForm({ ...form, street: e.target.value })}
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      <label className="block text-xs font-semibold text-gray-700">
                        Trường đại học gần nhất
                        <input
                          className="input"
                          placeholder="ĐH FPT Hà Nội"
                          value={form.nearestSchool || ''}
                          onChange={e => setForm({ ...form, nearestSchool: e.target.value })}
                        />
                      </label>
                      <label className="block text-xs font-semibold text-gray-700">
                        Khoảng cách tới trường (km)
                        <input
                          type="number"
                          step="0.1"
                          className="input"
                          placeholder="0.8"
                          value={form.nearestSchoolDistanceKm || ''}
                          onChange={e => setForm({ ...form, nearestSchoolDistanceKm: e.target.value })}
                        />
                      </label>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-2xl border space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-700">Tọa độ định vị GPS</span>
                        <button
                          type="button"
                          onClick={useCurrentLocation}
                          className="text-xs font-bold text-indigo-600 hover:underline"
                        >
                          📍 Lấy vị trí GPS hiện tại
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="number"
                          step="any"
                          className="input"
                          placeholder="Vĩ độ (Latitude)"
                          value={form.latitude || ''}
                          onChange={e => setForm({ ...form, latitude: e.target.value })}
                        />
                        <input
                          type="number"
                          step="any"
                          className="input"
                          placeholder="Kinh độ (Longitude)"
                          value={form.longitude || ''}
                          onChange={e => setForm({ ...form, longitude: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Prices & Fees */}
                {activeStep === 3 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block text-xs font-semibold text-gray-700">
                        Giá thuê / tháng (VNĐ) *
                        <input
                          type="number"
                          className="input font-bold text-indigo-600"
                          placeholder="3000000"
                          value={form.price || ''}
                          onChange={e => setForm({ ...form, price: e.target.value })}
                        />
                      </label>
                      <label className="block text-xs font-semibold text-gray-700">
                        Tiền đặt cọc (VNĐ)
                        <input
                          type="number"
                          className="input"
                          placeholder="3000000"
                          value={form.deposit || ''}
                          onChange={e => setForm({ ...form, deposit: e.target.value })}
                        />
                      </label>
                    </div>

                    <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider pt-2">Chi phí dịch vụ</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <label className="block text-xs font-semibold text-gray-600">
                        Giá điện (VNĐ/kWh hoặc tháng)
                        <input
                          type="number"
                          className="input"
                          placeholder="3500"
                          value={form.electricityPrice || ''}
                          onChange={e => setForm({ ...form, electricityPrice: e.target.value })}
                        />
                      </label>
                      <label className="block text-xs font-semibold text-gray-600">
                        Giá nước (VNĐ/khối hoặc người)
                        <input
                          type="number"
                          className="input"
                          placeholder="100000"
                          value={form.waterPrice || ''}
                          onChange={e => setForm({ ...form, waterPrice: e.target.value })}
                        />
                      </label>
                      <label className="block text-xs font-semibold text-gray-600">
                        Internet / Wifi (VNĐ/phòng/tháng)
                        <input
                          type="number"
                          className="input"
                          placeholder="100000"
                          value={form.internetPrice || ''}
                          onChange={e => setForm({ ...form, internetPrice: e.target.value })}
                        />
                      </label>
                      <label className="block text-xs font-semibold text-gray-600">
                        Phí gửi xe (VNĐ/xe/tháng)
                        <input
                          type="number"
                          className="input"
                          placeholder="0 (Miễn phí)"
                          value={form.parkingFee || ''}
                          onChange={e => setForm({ ...form, parkingFee: e.target.value })}
                        />
                      </label>
                      <label className="block text-xs font-semibold text-gray-600 md:col-span-2">
                        Phí dịch vụ khác (vệ sinh, thang máy...)
                        <input
                          type="number"
                          className="input"
                          placeholder="50000"
                          value={form.otherFees || ''}
                          onChange={e => setForm({ ...form, otherFees: e.target.value })}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 4: Area & Specs */}
                {activeStep === 4 && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <label className="block text-xs font-semibold text-gray-700">
                        Diện tích phòng (m²)
                        <input
                          type="number"
                          step="0.5"
                          className="input"
                          placeholder="25"
                          value={form.area || ''}
                          onChange={e => setForm({ ...form, area: e.target.value })}
                        />
                      </label>
                      <label className="block text-xs font-semibold text-gray-700">
                        Số người ở tối đa
                        <input
                          type="number"
                          className="input"
                          placeholder="2"
                          value={form.maxOccupants || ''}
                          onChange={e => setForm({ ...form, maxOccupants: e.target.value })}
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="block text-xs font-semibold text-gray-700">
                        Tầng có phòng
                        <input
                          className="input"
                          placeholder="Tầng 2"
                          value={form.floorText || ''}
                          onChange={e => setForm({ ...form, floorText: e.target.value })}
                        />
                      </label>
                      <label className="block text-xs font-semibold text-gray-700">
                        Tổng số tầng của tòa nhà
                        <input
                          type="number"
                          className="input"
                          placeholder="5"
                          value={form.totalFloors || ''}
                          onChange={e => setForm({ ...form, totalFloors: e.target.value })}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Step 5: Amenities & Furniture */}
                {activeStep === 5 && (
                  <div className="space-y-4">
                    <label className="block text-xs font-semibold text-gray-700">
                      Mức độ trang bị nội thất
                      <select
                        className="input"
                        value={form.furniture}
                        onChange={e => setForm({ ...form, furniture: e.target.value })}
                      >
                        <option value="full">Đầy đủ nội thất (Giường, tủ, bàn ghế, điều hòa, nóng lạnh...)</option>
                        <option value="basic">Nội thất cơ bản (Nóng lạnh, điều hòa, kệ bếp)</option>
                        <option value="none">Phòng trống không đồ</option>
                      </select>
                    </label>

                    <div>
                      <span className="block text-xs font-semibold text-gray-700 mb-2">Tiện ích đi kèm (chọn áp dụng):</span>
                      <div className="flex flex-wrap gap-2">
                        {COMMON_AMENITIES.map(amenity => {
                          const active = (form.amenities || '').split('|').includes(amenity);
                          return (
                            <button
                              key={amenity}
                              type="button"
                              onClick={() => toggleAmenity(amenity)}
                              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                                active
                                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                              }`}
                            >
                              {active ? '✓ ' : '+ '} {amenity}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 6: Rules */}
                {activeStep === 6 && (
                  <div className="space-y-4">
                    <label className="block text-xs font-semibold text-gray-700">
                      Nội quy khu trọ
                      <textarea
                        rows={6}
                        className="input text-sm leading-relaxed"
                        placeholder="VD: Không làm ồn sau 23h, giữ gìn vệ sinh chung, không hút thuốc trong phòng..."
                        value={form.rules || ''}
                        onChange={e => setForm({ ...form, rules: e.target.value })}
                      />
                    </label>
                  </div>
                )}

                {/* Step 7: Media Upload */}
                {activeStep === 7 && (
                  <div className="space-y-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Ảnh & Video thực tế phòng trọ (Tối đa 8 tệp)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center bg-gray-50">
                      <input
                        type="file"
                        multiple
                        accept="image/*,video/*"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="wizard-media-upload"
                      />
                      <label
                        htmlFor="wizard-media-upload"
                        className="cursor-pointer bg-white px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-indigo-600 hover:bg-gray-50 inline-block shadow-xs"
                      >
                        + Chọn ảnh/video tải lên
                      </label>
                      <p className="text-[11px] text-gray-400 mt-2">Định dạng JPG, PNG, WEBP hoặc MP4 ngắn</p>
                    </div>

                    <div className="flex gap-3 overflow-x-auto py-2">
                      {mediaList(form.imageUrl).map((u, i) => (
                        <div key={i} className="relative w-24 h-24 border rounded-xl overflow-hidden shrink-0 group">
                          {u.startsWith('data:video') ? (
                            <video src={u} className="w-full h-full object-cover" />
                          ) : (
                            <img src={resolveMediaUrl(u)} alt="" className="w-full h-full object-cover" />
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-[10px] font-bold"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Step 8: Description & Contact */}
                {activeStep === 8 && (
                  <div className="space-y-4">
                    <label className="block text-xs font-semibold text-gray-700">
                      Mô tả chi tiết phòng trọ
                      <textarea
                        rows={5}
                        className="input text-sm leading-relaxed"
                        placeholder="Mô tả kỹ tình trạng phòng, ánh sáng, cửa sổ, ban công, an ninh xung quanh..."
                        value={form.description || ''}
                        onChange={e => setForm({ ...form, description: e.target.value })}
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-4">
                      <label className="block text-xs font-semibold text-gray-700">
                        Số điện thoại liên hệ *
                        <input
                          type="tel"
                          className="input"
                          placeholder="0912345678"
                          value={form.contactPhone || ''}
                          onChange={e => setForm({ ...form, contactPhone: e.target.value })}
                        />
                      </label>
                      <label className="block text-xs font-semibold text-gray-700">
                        Số Zalo hoặc link Zalo
                        <input
                          className="input"
                          placeholder="0912345678 hoặc https://zalo.me/..."
                          value={form.contactZalo || ''}
                          onChange={e => setForm({ ...form, contactZalo: e.target.value })}
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* Modal Navigation Buttons */}
                <div className="flex justify-between items-center pt-4 border-t">
                  <button
                    type="button"
                    disabled={activeStep === 1}
                    onClick={() => setActiveStep(prev => prev - 1)}
                    className="px-4 py-2 text-xs font-semibold text-gray-600 disabled:opacity-30 hover:bg-gray-100 rounded-xl"
                  >
                    ← Quay lại
                  </button>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => submitForm(true)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl text-xs font-bold"
                    >
                      Lưu nháp
                    </button>

                    {activeStep < 8 ? (
                      <button
                        type="button"
                        onClick={() => setActiveStep(prev => prev + 1)}
                        className="px-6 py-2 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold"
                      >
                        Tiếp theo →
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => submitForm(false)}
                        className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-xl text-xs font-bold shadow-sm"
                      >
                        ✓ Gửi kiểm duyệt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {view === 'notifications' && (
        <>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Thông báo</h1>
          <div className="space-y-3">
            {noti.map(n => (
              <div key={n.id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-start gap-4">
                <div>
                  <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700">
                    {n.type || 'THÔNG BÁO'}
                  </span>
                  <div className="text-sm font-medium text-gray-800 mt-2">{n.message}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {n.createdAt ? new Date(n.createdAt).toLocaleString('vi-VN') : ''}
                  </div>
                </div>
                {n.status === 'UNREAD' && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 shrink-0 mt-2" />
                )}
              </div>
            ))}
            {noti.length === 0 && (
              <div className="bg-white border rounded-2xl p-12 text-center text-gray-400 text-sm">
                Chưa có thông báo nào.
              </div>
            )}
          </div>
        </>
      )}

      {view === 'profile' && (
        <>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Trang cá nhân & Cài đặt</h1>
            <p className="mt-1 text-sm text-gray-600">
              Quản lý thông tin chủ trọ, liên hệ công khai, vị trí và bảo mật tài khoản.
            </p>
          </div>
          <ProfileSettings
            profile={profile}
            setProfile={setProfile}
            onSaved={setProfile}
            showMatching={false}
          />
        </>
      )}

      <style>{`.input{margin-top:.25rem;width:100%;border:1px solid #d1d5db;border-radius:.75rem;padding:.6rem .85rem;font-size:.875rem;outline:none;transition:border-color .15s}.input:focus{border-color:#6366f1;box-shadow:0 0 0 2px rgba(99,102,241,.1)}`}</style>
    </div>
  );
}
