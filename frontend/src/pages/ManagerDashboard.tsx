import { useEffect, useState } from 'react';
import { api, getUser, mediaList, money, resolveMediaUrl } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import ProfileSettings from '../components/ProfileSettings';
import PanoramaViewer from '../components/PanoramaViewer';

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

  // Form & Filter state
  const [form, setForm] = useState<any>(emptyForm);
  const [openModal, setOpenModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState(1);
  const [filterTab, setFilterTab] = useState('ALL');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  // Media states (separating normal photos, 360 panorama, videos, and private verification evidence)
  const [images, setImages] = useState<{ url: string; isCover?: boolean }[]>([]);
  const [panoramas, setPanoramas] = useState<{ url: string; title?: string }[]>([]);
  const [videos, setVideos] = useState<{ url: string; title?: string }[]>([]);
  const [evidences, setEvidences] = useState<{ url: string; note?: string }[]>([]);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [preview360Url, setPreview360Url] = useState<string | null>(null);

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

  // Handle uploading media files via backend API /api/listings/media
  const handleUploadMedia = async (
    e: React.ChangeEvent<HTMLInputElement>,
    mediaType: 'IMAGE' | 'PANORAMA_360' | 'VIDEO' | 'VERIFICATION_EVIDENCE'
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (mediaType === 'IMAGE' && images.length + files.length > 20) {
      alert(`Chỉ được tải lên tối đa 20 ảnh thường (hiện có ${images.length} ảnh).`);
      return;
    }
    if (mediaType === 'PANORAMA_360' && panoramas.length + files.length > 3) {
      alert(`Chỉ được tải lên tối đa 3 ảnh 360 panorama (hiện có ${panoramas.length} ảnh).`);
      return;
    }
    if (mediaType === 'VIDEO' && videos.length + files.length > 2) {
      alert(`Chỉ được tải lên tối đa 2 video thực tế (hiện có ${videos.length} video).`);
      return;
    }

    setUploadingMedia(true);
    try {
      for (const file of files) {
        if (mediaType === 'IMAGE' && file.size > 8 * 1024 * 1024) {
          alert(`File ảnh "${file.name}" vượt quá 8MB. Vui lòng chọn ảnh nhỏ hơn.`);
          continue;
        }
        if (mediaType === 'PANORAMA_360' && file.size > 15 * 1024 * 1024) {
          alert(`File 360 "${file.name}" vượt quá 15MB. Vui lòng chọn ảnh nhỏ hơn.`);
          continue;
        }
        if (mediaType === 'VIDEO' && file.size > 100 * 1024 * 1024) {
          alert(`Video "${file.name}" vượt quá 100MB.`);
          continue;
        }

        const fd = new FormData();
        fd.append('file', file);
        fd.append('mediaType', mediaType);
        const res = await api.post('/listings/media', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const data = res.data;

        if (mediaType === 'IMAGE') {
          setImages(prev => {
            const isFirst = prev.length === 0;
            return [...prev, { url: data.url, isCover: isFirst }];
          });
        } else if (mediaType === 'PANORAMA_360') {
          setPanoramas(prev => [...prev, { url: data.url, title: file.name }]);
        } else if (mediaType === 'VIDEO') {
          setVideos(prev => [...prev, { url: data.url, title: file.name }]);
        } else if (mediaType === 'VERIFICATION_EVIDENCE') {
          setEvidences(prev => [...prev, { url: data.url, note: file.name }]);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Tải tệp tin lên thất bại. Vui lòng kiểm tra định dạng và dung lượng.');
    } finally {
      setUploadingMedia(false);
      e.target.value = '';
    }
  };

  const removeNormalImage = (index: number) => {
    const wasCover = images[index]?.isCover;
    const next = images.filter((_, i) => i !== index);
    if (wasCover && next.length > 0) {
      next[0].isCover = true;
    }
    setImages(next);
  };

  const setCoverImage = (index: number) => {
    setImages(images.map((img, i) => ({ ...img, isCover: i === index })));
  };

  const moveImage = (index: number, direction: 'left' | 'right') => {
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= images.length) return;
    const next = [...images];
    const [moved] = next.splice(index, 1);
    next.splice(target, 0, moved);
    setImages(next);
  };

  const removePanorama = (index: number) => {
    setPanoramas(prev => prev.filter((_, i) => i !== index));
  };

  const removeVideo = (index: number) => {
    setVideos(prev => prev.filter((_, i) => i !== index));
  };

  const removeEvidence = (index: number) => {
    setEvidences(prev => prev.filter((_, i) => i !== index));
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
    setImages([]);
    setPanoramas([]);
    setVideos([]);
    setEvidences([]);
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
        let parsedImages: { url: string; isCover?: boolean }[] = [];
        let parsedPanoramas: { url: string; title?: string }[] = [];
        let parsedVideos: { url: string; title?: string }[] = [];
        let parsedEvidences: { url: string; note?: string }[] = [];

        if (d.mediaJson) {
          try {
            const list = JSON.parse(d.mediaJson);
            if (Array.isArray(list)) {
              list.forEach((item: any) => {
                if (item.mediaType === 'PANORAMA_360') {
                  parsedPanoramas.push({ url: item.url, title: item.title });
                } else if (item.mediaType === 'VIDEO') {
                  parsedVideos.push({ url: item.url, title: item.title });
                } else {
                  parsedImages.push({ url: item.url, isCover: !!item.isCover });
                }
              });
            }
          } catch {}
        }

        if (parsedImages.length === 0 && d.imageUrl) {
          const urls = mediaList(d.imageUrl);
          parsedImages = urls.map((u, i) => ({ url: u, isCover: i === 0 }));
        }

        if (d.verificationEvidenceJson) {
          try {
            const evs = JSON.parse(d.verificationEvidenceJson);
            if (Array.isArray(evs)) parsedEvidences = evs;
          } catch {}
        }

        setImages(parsedImages);
        setPanoramas(parsedPanoramas);
        setVideos(parsedVideos);
        setEvidences(parsedEvidences);

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
    if (!draft) {
      if (images.length < 4) {
        alert('Vui lòng tải lên tối thiểu 4 hình ảnh phòng trọ (toàn cảnh, lối vào, WC, bếp,...) trước khi gửi duyệt.');
        setActiveStep(7);
        return;
      }
      if (!form.price || !form.title) {
        alert('Vui lòng điền đầy đủ tiêu đề và giá thuê phòng.');
        return;
      }
    }

    const sortedImages = [...images].sort((a, b) => (b.isCover ? 1 : 0) - (a.isCover ? 1 : 0));
    const imageUrlArray = sortedImages.map(img => img.url);

    const combinedMedia = [
      ...sortedImages.map((img, idx) => ({
        url: img.url,
        mediaType: 'IMAGE',
        isCover: idx === 0
      })),
      ...panoramas.map(p => ({
        url: p.url,
        mediaType: 'PANORAMA_360',
        title: p.title
      })),
      ...videos.map(v => ({
        url: v.url,
        mediaType: 'VIDEO',
        title: v.title
      }))
    ];

    const payload = {
      ...form,
      listingStatus: draft ? 'DRAFT' : 'PENDING_REVIEW',
      imageUrl: JSON.stringify(imageUrlArray),
      mediaJson: JSON.stringify(combinedMedia),
      verificationEvidenceJson: JSON.stringify(evidences),
      panoramaCount: panoramas.length,
      videoCount: videos.length
    };

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
      setImages([]);
      setPanoramas([]);
      setVideos([]);
      setEvidences([]);
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể lưu tin đăng');
    }
  };

  // Action handlers
  const setAvailability = async (id: number, availability: string) => {
    try {
      await api.post(`/listings/${id}/availability`, { availability });
      setActionMsg(availability === 'FULL' ? 'Đã đánh dấu hết phòng' : 'Đã đánh dấu còn phòng');
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể cập nhật tình trạng phòng');
    }
  };

  const confirmAvailability = async (id: number) => {
    try {
      await api.post(`/listings/${id}/confirm-availability`);
      setActionMsg('Đã xác nhận phòng còn trống và làm mới hạn tin');
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể xác nhận tình trạng');
    }
  };

  const cancelReview = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn hủy gửi duyệt để quay về bản nháp?')) return;
    try {
      await api.post(`/listings/${id}/cancel-review`);
      setActionMsg('Đã hủy gửi duyệt tin, chuyển về Bản nháp');
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể hủy gửi duyệt');
    }
  };

  const archiveListing = async (id: number) => {
    if (!window.confirm('Lưu trữ tin này? Tin sẽ ngừng hiển thị trên hệ thống.')) return;
    try {
      await api.post(`/listings/${id}/archive`);
      setActionMsg('Đã chuyển tin vào mục Lưu trữ');
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể lưu trữ tin');
    }
  };

  const restoreListing = async (id: number) => {
    try {
      await api.post(`/listings/${id}/restore`);
      setActionMsg('Đã khôi phục tin về Bản nháp');
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể khôi phục tin');
    }
  };

  const deleteDraft = async (id: number) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa tin này vĩnh viễn?')) return;
    try {
      await api.delete(`/listings/${id}`);
      setActionMsg('Đã xóa tin đăng');
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể xóa tin');
    }
  };

  const buyPlan = async (listingId: number, plan: any) => {
    if (!window.confirm(`Xác nhận mua gói ${plan.name} với giá ${plan.price.toLocaleString('vi-VN')} đ?`)) return;
    try {
      await api.post('/payments/buy-plan', { listingId, planId: plan.id });
      setActionMsg(`Đã nâng cấp gói ${plan.name} thành công!`);
      load();
    } catch (e: any) {
      alert(e.response?.data?.message || 'Không thể nâng cấp gói. Vui lòng nạp thêm tiền vào ví.');
    }
  };

  // Filtered listing items
  const filteredList = list.filter((l: any) => {
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase();
      const match =
        (l.title && l.title.toLowerCase().includes(q)) ||
        (l.address && l.address.toLowerCase().includes(q)) ||
        (l.contactPhone && l.contactPhone.toLowerCase().includes(q));
      if (!match) return false;
    }

    if (filterTab === 'ALL') return true;
    if (filterTab === 'ACTIVE') return l.status === 'ACTIVE' && l.availability !== 'FULL' && l.availability !== 'RENTED';
    if (filterTab === 'PENDING_REVIEW') return l.status === 'PENDING_REVIEW';
    if (filterTab === 'NEED_REVISION') return l.status === 'NEED_REVISION';
    if (filterTab === 'REJECTED') return l.status === 'REJECTED';
    if (filterTab === 'DRAFT') return l.status === 'DRAFT';
    if (filterTab === 'PENDING_PAYMENT') return l.status === 'PENDING_PAYMENT';
    if (filterTab === 'EXPIRED') return l.status === 'EXPIRED' || l.status === 'HIDDEN_STALE';
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

          {/* Search bar & Filter Tabs */}
          <div className="space-y-3 border-b pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
              <div className="relative flex-1 max-w-md">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  🔍
                </span>
                <input
                  type="text"
                  placeholder="Tìm theo tiêu đề, địa chỉ, số điện thoại..."
                  value={searchKeyword}
                  onChange={e => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:border-indigo-600 bg-white"
                />
                {searchKeyword && (
                  <button
                    onClick={() => setSearchKeyword('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                )}
              </div>
              <div className="text-xs text-gray-500 font-medium self-end sm:self-center">
                Hiển thị <b className="text-gray-800">{filteredList.length}</b> / {list.length} tin đăng
              </div>
            </div>

            {/* 8 Status Filter Tabs */}
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              {[
                ['ALL', `Tất cả (${list.length})`],
                ['ACTIVE', `Đang hiển thị (${list.filter(x => x.status === 'ACTIVE' && x.availability !== 'FULL' && x.availability !== 'RENTED').length})`],
                ['PENDING_REVIEW', `Chờ duyệt (${list.filter(x => x.status === 'PENDING_REVIEW').length})`],
                ['NEED_REVISION', `Cần sửa (${list.filter(x => x.status === 'NEED_REVISION').length})`],
                ['REJECTED', `Bị từ chối (${list.filter(x => x.status === 'REJECTED').length})`],
                ['DRAFT', `Bản nháp (${list.filter(x => x.status === 'DRAFT').length})`],
                ['PENDING_PAYMENT', `Chờ thanh toán (${list.filter(x => x.status === 'PENDING_PAYMENT').length})`],
                ['EXPIRED', `Hết hạn (${list.filter(x => x.status === 'EXPIRED' || x.status === 'HIDDEN_STALE').length})`],
                ['ARCHIVED', `Đã lưu trữ (${list.filter(x => x.status === 'ARCHIVED').length})`]
              ].map(([tab, label]) => (
                <button
                  key={tab}
                  onClick={() => setFilterTab(tab)}
                  className={`px-3 py-1.5 rounded-lg transition-colors ${
                    filterTab === tab ? 'bg-indigo-600 text-white shadow-xs' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
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
                    const has360 = (l.panoramaCount && l.panoramaCount > 0) || (l.mediaJson && l.mediaJson.includes('PANORAMA_360'));
                    const hasVideo = (l.videoCount && l.videoCount > 0) || (l.mediaJson && l.mediaJson.includes('VIDEO'));
                    const imgCount = mediaList(l.imageUrl).length;

                    return (
                      <tr key={l.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              {cover ? (
                                <img
                                  src={resolveMediaUrl(cover)}
                                  alt=""
                                  className="w-14 h-14 rounded-xl object-cover border"
                                />
                              ) : (
                                <div className="w-14 h-14 rounded-xl bg-gray-100 border flex items-center justify-center text-xs text-gray-400">
                                  No img
                                </div>
                              )}
                              {has360 && (
                                <span className="absolute bottom-0 right-0 bg-indigo-600 text-white text-[9px] font-bold px-1 rounded-sm shadow-xs">
                                  360°
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <button
                                  onClick={() => nav(`/property/${l.id}`)}
                                  className="font-bold text-gray-900 hover:text-indigo-600 text-left line-clamp-1 text-sm"
                                >
                                  {l.title}
                                </button>
                                {hasVideo && (
                                  <span className="text-[10px] bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded-md font-semibold border border-purple-200">
                                    Video
                                  </span>
                                )}
                                {imgCount > 0 && (
                                  <span className="text-[10px] text-gray-400 font-medium">
                                    📷 {imgCount}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-500 mt-0.5 truncate">{l.address || 'Chưa cập nhật địa chỉ'}</div>
                              {l.revisionNote && (
                                <div className="text-xs text-red-600 font-semibold mt-1 bg-red-50 p-1.5 rounded-lg border border-red-200">
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
                                : l.status === 'REJECTED'
                                ? 'bg-rose-100 text-rose-700'
                                : l.status === 'DRAFT'
                                ? 'bg-gray-100 text-gray-600'
                                : l.status === 'PENDING_PAYMENT'
                                ? 'bg-blue-100 text-blue-700'
                                : l.status === 'EXPIRED' || l.status === 'HIDDEN_STALE'
                                ? 'bg-orange-100 text-orange-700'
                                : 'bg-gray-200 text-gray-700'
                            }`}
                          >
                            {l.status === 'ACTIVE'
                              ? 'Đang hiển thị'
                              : l.status === 'PENDING_REVIEW'
                              ? 'Chờ duyệt'
                              : l.status === 'NEED_REVISION'
                              ? 'Cần chỉnh sửa'
                              : l.status === 'REJECTED'
                              ? 'Bị từ chối'
                              : l.status === 'DRAFT'
                              ? 'Bản nháp'
                              : l.status === 'PENDING_PAYMENT'
                              ? 'Chờ thanh toán'
                              : l.status === 'EXPIRED' || l.status === 'HIDDEN_STALE'
                              ? 'Hết hạn'
                              : l.status === 'ARCHIVED'
                              ? 'Đã lưu trữ'
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
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Edit button */}
                            <button
                              onClick={() => editListing(l)}
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-2.5 py-1 bg-indigo-50 rounded-lg"
                            >
                              Sửa
                            </button>

                            {/* ACTIVE actions */}
                            {l.status === 'ACTIVE' && (
                              <>
                                <button
                                  onClick={() => setAvailability(l.id, isFull ? 'AVAILABLE' : 'FULL')}
                                  className="text-xs font-semibold text-gray-700 hover:bg-gray-100 px-2 py-1 border rounded-lg"
                                >
                                  {isFull ? 'Đánh dấu còn' : 'Báo hết'}
                                </button>
                                <button
                                  onClick={() => confirmAvailability(l.id)}
                                  className="text-xs font-semibold text-green-700 hover:bg-green-50 px-2 py-1 border border-green-200 rounded-lg"
                                  title="Gia hạn xác nhận phòng còn trống"
                                >
                                  Gia hạn
                                </button>
                              </>
                            )}

                            {/* DRAFT actions: Submit review or delete */}
                            {l.status === 'DRAFT' && (
                              <button
                                onClick={async () => {
                                  try {
                                    await api.post(`/listings/${l.id}/submit`);
                                    setActionMsg('Đã gửi duyệt tin thành công!');
                                    load();
                                  } catch (err: any) {
                                    alert(err.response?.data?.message || 'Không thể gửi duyệt. Tin cần tối thiểu 4 hình ảnh.');
                                  }
                                }}
                                className="text-xs font-bold text-green-700 hover:bg-green-50 px-2 py-1 border border-green-200 rounded-lg"
                              >
                                Gửi duyệt
                              </button>
                            )}

                            {/* PENDING_REVIEW: Cancel review */}
                            {l.status === 'PENDING_REVIEW' && (
                              <button
                                onClick={() => cancelReview(l.id)}
                                className="text-xs font-semibold text-amber-700 hover:bg-amber-50 px-2 py-1 border border-amber-200 rounded-lg"
                              >
                                Hủy gửi
                              </button>
                            )}

                            {/* EXPIRED: Reactivate / confirm */}
                            {(l.status === 'EXPIRED' || l.status === 'HIDDEN_STALE') && (
                              <button
                                onClick={() => confirmAvailability(l.id)}
                                className="text-xs font-semibold text-indigo-700 hover:bg-indigo-50 px-2 py-1 border border-indigo-200 rounded-lg"
                              >
                                Tái kích hoạt
                              </button>
                            )}

                            {/* ARCHIVED: Restore or Delete */}
                            {l.status === 'ARCHIVED' ? (
                              <>
                                <button
                                  onClick={() => restoreListing(l.id)}
                                  className="text-xs font-semibold text-blue-700 hover:bg-blue-50 px-2 py-1 border border-blue-200 rounded-lg"
                                >
                                  Khôi phục
                                </button>
                                <button
                                  onClick={() => deleteDraft(l.id)}
                                  className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg"
                                >
                                  Xóa
                                </button>
                              </>
                            ) : l.status === 'DRAFT' || l.status === 'REJECTED' ? (
                              <button
                                onClick={() => deleteDraft(l.id)}
                                className="text-xs font-semibold text-red-600 hover:bg-red-50 px-2 py-1 rounded-lg"
                              >
                                Xóa
                              </button>
                            ) : (
                              <button
                                onClick={() => archiveListing(l.id)}
                                className="text-xs font-semibold text-gray-500 hover:bg-gray-100 px-2 py-1 rounded-lg"
                              >
                                Lưu trữ
                              </button>
                            )}

                            {/* Plan upgrade dropdown */}
                            {l.status === 'ACTIVE' && (
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
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredList.length === 0 && (
                <div className="p-12 text-center text-sm text-gray-400">
                  Không tìm thấy bài đăng nào phù hợp với bộ lọc.
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

                {/* Step 7: Media Upload (Normal images, 360 Panorama, Video, and Verification Evidence) */}
                {activeStep === 7 && (
                  <div className="space-y-6">
                    {uploadingMedia && (
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs font-semibold text-indigo-700 flex items-center gap-2 animate-pulse">
                        <span className="animate-spin">⏳</span> Đang tải tệp tin lên máy chủ và xử lý... Vui lòng chờ trong giây lát.
                      </div>
                    )}

                    {/* Section 1: Standard Photos */}
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-800">
                          1. Ảnh thực tế phòng trọ *
                          <span className="text-[11px] font-normal text-gray-500 ml-1">
                            (Tối thiểu 4 ảnh, tối đa 20 ảnh. Chọn ảnh bìa & sắp xếp thứ tự)
                          </span>
                        </label>
                        <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${
                          images.length >= 4 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {images.length}/20 ảnh {images.length < 4 ? `(Thiếu ${4 - images.length} ảnh)` : '✓'}
                        </span>
                      </div>

                      {/* Photo Checklist Suggestions */}
                      <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 space-y-1.5">
                        <span className="text-[11px] font-bold text-blue-800">
                          💡 Gợi ý góc chụp giúp tin đăng thu hút và được duyệt nhanh:
                        </span>
                        <div className="flex flex-wrap gap-1.5 text-[11px]">
                          {[
                            'Toàn cảnh phòng',
                            'Lối vào / Cửa phòng',
                            'Nhà vệ sinh',
                            'Khu bếp nấu',
                            'Cửa sổ / Ban công',
                            'Nội thất & Tiện nghi',
                            'Chỗ để xe',
                            'Khu vực chung'
                          ].map(tip => (
                            <span key={tip} className="px-2 py-0.5 bg-white text-blue-700 rounded-md border border-blue-200 font-medium">
                              • {tip}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Upload Box */}
                      <div className="border-2 border-dashed border-gray-300 rounded-2xl p-5 text-center bg-gray-50 hover:bg-gray-100/50 transition-colors">
                        <input
                          type="file"
                          multiple
                          accept="image/jpeg,image/png,image/webp"
                          disabled={uploadingMedia || images.length >= 20}
                          onChange={e => handleUploadMedia(e, 'IMAGE')}
                          className="hidden"
                          id="upload-normal-images"
                        />
                        <label
                          htmlFor="upload-normal-images"
                          className="cursor-pointer bg-white px-5 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-indigo-600 hover:bg-gray-50 inline-block shadow-xs"
                        >
                          + Chọn ảnh phòng tải lên (Tối đa 8MB/ảnh)
                        </label>
                        <p className="text-[11px] text-gray-400 mt-2">
                          Hỗ trợ JPG, PNG, WEBP. Khuyến nghị tối thiểu 1280x720 để ảnh rõ nét.
                        </p>
                      </div>

                      {/* Normal Images Grid with Cover & Reorder */}
                      {images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {images.map((img, idx) => (
                            <div
                              key={idx}
                              className={`relative rounded-xl overflow-hidden border-2 group bg-gray-100 ${
                                img.isCover ? 'border-amber-500 ring-2 ring-amber-200' : 'border-gray-200'
                              }`}
                            >
                              <img
                                src={resolveMediaUrl(img.url)}
                                alt=""
                                className="w-full h-28 object-cover"
                              />

                              {/* Cover Badge */}
                              {img.isCover && (
                                <span className="absolute top-1 left-1 bg-amber-500 text-white text-[10px] font-extrabold px-1.5 py-0.5 rounded-md shadow-xs">
                                  ★ Ảnh bìa
                                </span>
                              )}

                              {/* Controls */}
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-1.5">
                                <div className="flex justify-between items-center">
                                  {!img.isCover && (
                                    <button
                                      type="button"
                                      onClick={() => setCoverImage(idx)}
                                      className="text-[10px] bg-white/90 hover:bg-white text-gray-800 font-bold px-1.5 py-0.5 rounded"
                                    >
                                      Đặt làm bìa
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => removeNormalImage(idx)}
                                    className="ml-auto w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold shadow-xs"
                                  >
                                    ✕
                                  </button>
                                </div>
                                <div className="flex justify-center gap-2">
                                  {idx > 0 && (
                                    <button
                                      type="button"
                                      onClick={() => moveImage(idx, 'left')}
                                      className="px-2 py-0.5 bg-white/90 hover:bg-white text-gray-800 rounded text-xs font-bold"
                                      title="Di chuyển sang trái"
                                    >
                                      ←
                                    </button>
                                  )}
                                  {idx < images.length - 1 && (
                                    <button
                                      type="button"
                                      onClick={() => moveImage(idx, 'right')}
                                      className="px-2 py-0.5 bg-white/90 hover:bg-white text-gray-800 rounded text-xs font-bold"
                                      title="Di chuyển sang phải"
                                    >
                                      →
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Section 2: 360 Panorama (Optional) */}
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-[10px] font-extrabold rounded-md">
                            360°
                          </span>
                          2. Ảnh 360° Panorama
                          <span className="text-[11px] font-normal text-gray-500">
                            (Tùy chọn, tối đa 3 ảnh, tỷ lệ 2:1 equirectangular, max 15MB)
                          </span>
                        </label>
                        <span className="text-xs font-semibold text-gray-500">
                          {panoramas.length}/3 ảnh
                        </span>
                      </div>

                      <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center bg-gray-50 flex items-center justify-between">
                        <div className="text-left text-[11px] text-gray-500">
                          Chụp từ smartphone (chế độ Pano) hoặc camera 360, định dạng JPG/WEBP.
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            disabled={uploadingMedia || panoramas.length >= 3}
                            onChange={e => handleUploadMedia(e, 'PANORAMA_360')}
                            className="hidden"
                            id="upload-panorama-file"
                          />
                          <label
                            htmlFor="upload-panorama-file"
                            className="cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-indigo-600 hover:bg-gray-50 inline-block shadow-xs"
                          >
                            + Thêm ảnh 360°
                          </label>
                        </div>
                      </div>

                      {panoramas.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          {panoramas.map((pano, i) => (
                            <div key={i} className="relative rounded-xl overflow-hidden border border-gray-200 bg-gray-100 p-2 space-y-2">
                              <div className="h-24 rounded-lg overflow-hidden relative">
                                <img src={resolveMediaUrl(pano.url)} alt="" className="w-full h-full object-cover" />
                                <span className="absolute top-1 left-1 bg-indigo-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                                  360°
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <button
                                  type="button"
                                  onClick={() => setPreview360Url(pano.url)}
                                  className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
                                >
                                  👁 Xem thử 360°
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removePanorama(i)}
                                  className="text-xs text-red-600 hover:underline font-semibold"
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Section 3: Video (Optional) */}
                    <div className="space-y-3 pt-3 border-t">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-gray-800">
                          3. Video quay thực tế phòng
                          <span className="text-[11px] font-normal text-gray-500 ml-1">
                            (Tùy chọn, tối đa 2 video, MP4/WEBM, tối đa 100MB, thời lượng ≤ 120s)
                          </span>
                        </label>
                        <span className="text-xs font-semibold text-gray-500">
                          {videos.length}/2 video
                        </span>
                      </div>

                      <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center bg-gray-50 flex items-center justify-between">
                        <div className="text-left text-[11px] text-gray-500">
                          Video quay thực tế giúp người thuê tin tưởng gấp 3 lần.
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="video/mp4,video/webm"
                            disabled={uploadingMedia || videos.length >= 2}
                            onChange={e => handleUploadMedia(e, 'VIDEO')}
                            className="hidden"
                            id="upload-video-file"
                          />
                          <label
                            htmlFor="upload-video-file"
                            className="cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-indigo-600 hover:bg-gray-50 inline-block shadow-xs"
                          >
                            + Thêm video
                          </label>
                        </div>
                      </div>

                      {videos.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {videos.map((vid, i) => (
                            <div key={i} className="rounded-xl border border-gray-200 p-2 space-y-2 bg-gray-50">
                              <video
                                src={resolveMediaUrl(vid.url)}
                                controls
                                muted
                                playsInline
                                preload="metadata"
                                className="w-full h-36 object-cover rounded-lg bg-black"
                              />
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-gray-600 truncate max-w-[200px]">
                                  {vid.title || `Video ${i + 1}`}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeVideo(i)}
                                  className="text-xs text-red-600 hover:underline font-semibold"
                                >
                                  Xóa video
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Section 4: Private Verification Evidence */}
                    <div className="space-y-3 pt-3 border-t bg-amber-50/40 p-4 rounded-2xl border border-amber-200">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                          🔒 4. Hồ sơ minh chứng xác thực chính chủ
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                            Chỉ Admin & Kiểm duyệt viên xem
                          </span>
                        </label>
                      </div>
                      <p className="text-[11px] text-amber-800 leading-relaxed">
                        Tải ảnh biển số nhà, hợp đồng sở hữu/quản lý, hoặc ảnh chụp thực tế có bạn trong phòng để nhận huy hiệu <b>Xác minh chính chủ</b>. Những tệp này <b>hoàn toàn bảo mật</b> và không hiển thị công khai cho khách thuê.
                      </p>

                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          multiple
                          accept="image/*,video/*,application/pdf"
                          disabled={uploadingMedia}
                          onChange={e => handleUploadMedia(e, 'VERIFICATION_EVIDENCE')}
                          className="hidden"
                          id="upload-evidence-files"
                        />
                        <label
                          htmlFor="upload-evidence-files"
                          className="cursor-pointer bg-white px-4 py-2 rounded-xl border border-amber-300 text-xs font-bold text-amber-800 hover:bg-amber-50 inline-block shadow-xs"
                        >
                          + Tải tệp minh chứng xác minh
                        </label>
                        <span className="text-xs text-amber-800">
                          {evidences.length} tệp đã tải
                        </span>
                      </div>

                      {evidences.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-1">
                          {evidences.map((ev, i) => (
                            <div key={i} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200 text-xs text-amber-900">
                              <span>📄 {ev.note || `Minh chứng ${i + 1}`}</span>
                              <button
                                type="button"
                                onClick={() => removeEvidence(i)}
                                className="text-red-500 font-bold hover:text-red-700"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
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

          {/* 360 Panorama Interactive Preview Modal */}
          {preview360Url && (
            <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl max-w-4xl w-full p-6 space-y-4 shadow-2xl relative">
                <div className="flex justify-between items-center border-b pb-3">
                  <h3 className="font-extrabold text-base sm:text-lg text-gray-900 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-full">360°</span>
                    Xem trước ảnh Panorama 360° UniHome
                  </h3>
                  <button
                    onClick={() => setPreview360Url(null)}
                    className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold flex items-center justify-center text-sm"
                  >
                    ✕
                  </button>
                </div>
                <PanoramaViewer src={resolveMediaUrl(preview360Url)} />
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
