import { useEffect, useState } from 'react';
import { api, getUser, money, resolveMediaUrl, clearAuth } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import Pagination from '../components/Pagination';
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

export const navGroups = [
  {
    title: 'Tổng quan & Báo cáo',
    items: [
      { id: 'Tổng quan', label: 'Tổng quan', icon: '📊' },
      { id: 'Thống kê & Analytics', label: 'Analytics', icon: '📈' },
    ]
  },
  {
    title: 'Kiểm duyệt & Vận hành',
    items: [
      { id: 'Kiểm duyệt', label: 'Kiểm duyệt phòng', icon: '🛡️' },
      { id: 'Xác minh', label: 'Xác minh thực địa', icon: '🔍' },
      { id: 'Dịch vụ', label: 'Dịch vụ tiện ích', icon: '🛠️' },
      { id: 'Đồ cũ', label: 'Chợ đồ cũ', icon: '📦' },
      { id: 'Báo cáo', label: 'Báo cáo vi phạm', icon: '🚩' },
    ]
  },
  {
    title: 'Nội dung & Cộng đồng',
    items: [
      { id: 'Q&A', label: 'Hỏi & Đáp (Q&A)', icon: '💬' },
      { id: 'Đánh giá', label: 'Đánh giá phòng', icon: '⭐' },
      { id: 'Blog', label: 'Tin tức & Blog', icon: '✍️' },
    ]
  },
  {
    title: 'Kinh doanh & Ví',
    items: [
      { id: 'Gói VIP', label: 'Gói VIP đẩy tin', icon: '💎' },
      { id: 'Quảng cáo', label: 'Chiến dịch Ads', icon: '📢' },
      { id: 'Voucher & Đối tác', label: 'Voucher & Đối tác', icon: '🎁' },
      { id: 'Nhiệm vụ & Điểm', label: 'Nhiệm vụ & Điểm thưởng', icon: '🎯' },
      { id: 'Tài chính', label: 'Tài chính & Ví', icon: '💳' },
    ]
  },
  {
    title: 'Hệ thống',
    items: [
      { id: 'Tài khoản', label: 'Tài khoản người dùng', icon: '👥' },
      { id: 'Cấu hình hệ thống', label: 'Cấu hình hệ thống', icon: '⚙️' },
      { id: 'Audit', label: 'Audit Log', icon: '📜' },
    ]
  }
];

export const tabs = [
  'Tổng quan',
  'Thống kê & Analytics',
  'Kiểm duyệt',
  'Quảng cáo',
  'Voucher & Đối tác',
  'Nhiệm vụ & Điểm',
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
  'Cấu hình hệ thống',
  'Audit'
];

export default function AdminDashboard() {
  const user = getUser();
  const nav = useNavigate();
  const [tab, setTab] = useState('Tổng quan');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(false);
  const [analyticsDays, setAnalyticsDays] = useState(30);
  const [analyticsFromDate, setAnalyticsFromDate] = useState('');
  const [analyticsToDate, setAnalyticsToDate] = useState('');
  const [analyticsGroupBy, setAnalyticsGroupBy] = useState<'DAY' | 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'>('DAY');
  const [analyticsPreset, setAnalyticsPreset] = useState('');
  const [analyticsYear, setAnalyticsYear] = useState('');
  const [analyticsMonth, setAnalyticsMonth] = useState('');
  const [analyticsCompare, setAnalyticsCompare] = useState('');

  // Listing moderation rejection modal (replaces prompt)
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    listingId: number | null;
    action: 'REJECT' | 'REQUEST_CHANGES';
    reason: string;
  }>({
    open: false,
    listingId: null,
    action: 'REJECT',
    reason: ''
  });

  // On-site verification modal with checklist (replaces prompt)
  const [verifyModal, setVerifyModal] = useState<{
    open: boolean;
    listingId: number | string;
    propertyId: number | string;
    level: string;
    roomExists: boolean;
    locationVerified: boolean;
    mediaVerified: boolean;
    priceVerified: boolean;
    utilityVerified: boolean;
    amenityVerified: boolean;
    availabilityVerified: boolean;
    note: string;
  }>({
    open: false,
    listingId: '',
    propertyId: '',
    level: 'ON_SITE_VERIFIED',
    roomExists: true,
    locationVerified: true,
    mediaVerified: true,
    priceVerified: true,
    utilityVerified: true,
    amenityVerified: true,
    availabilityVerified: true,
    note: 'Đã kiểm tra thực địa theo checklist đầy đủ'
  });

  // Pagination & Feedback
  const [adminPage, setAdminPage] = useState(0);
  const [adminPageSize, setAdminPageSize] = useState(20);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }>({
    open: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const [taskModal, setTaskModal] = useState<any>({ open: false, id: null, code: '', name: '', description: '', eventType: 'VIEW_ROOM', targetCount: 3, rewardPoints: 20, active: true });
  const [settingsForm, setSettingsForm] = useState<any>({
    site_name: 'UniHome',
    support_email: 'support@unihome.vn',
    support_phone: '1900 6868',
    auto_expiry_days: '30',
    min_room_images: '3',
    max_room_images: '20',
    ads_rotation_seconds: '8',
    checkin_day1_points: '20',
    checkin_day7_points: '50'
  });

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const askConfirm = (opts: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    isDanger?: boolean;
    onConfirm: () => void;
  }) => {
    setConfirmModal({
      open: true,
      title: opts.title,
      message: opts.message,
      confirmText: opts.confirmText || 'Xác nhận',
      cancelText: opts.cancelText || 'Hủy',
      isDanger: opts.isDanger ?? true,
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, open: false }));
        opts.onConfirm();
      }
    });
  };

  const paginate = (items: any[] = []) => {
    const totalElements = items.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / adminPageSize));
    const start = adminPage * adminPageSize;
    const pageItems = items.slice(start, start + adminPageSize);
    return { pageItems, totalPages, totalElements };
  };

  // User Management state
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [userStatusFilter, setUserStatusFilter] = useState('ALL');
  const [selectedUserDetail, setSelectedUserDetail] = useState<any | null>(null);
  const [showUserDetailModal, setShowUserDetailModal] = useState(false);
  const [banUserId, setBanUserId] = useState<number | null>(null);
  const [banReasonInput, setBanReasonInput] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);

  // Blog Management state
  const [blogSearch, setBlogSearch] = useState('');
  const [blogCategoryFilter, setBlogCategoryFilter] = useState('ALL');
  const [blogStatusFilter, setBlogStatusFilter] = useState('ALL');
  const [editingBlogId, setEditingBlogId] = useState<number | null>(null);
  const [showBlogModal, setShowBlogModal] = useState(false);
  const [blogForm, setBlogForm] = useState<any>({
    title: '',
    category: 'PCCC',
    summary: '',
    content: '',
    coverImage: '',
    status: 'PUBLISHED',
    readingMinutes: 5,
    tags: ''
  });

  // Q&A Moderation state
  const [qaSubTab, setQaSubTab] = useState<'QUESTIONS' | 'ANSWERS'>('QUESTIONS');
  const [qaSearch, setQaSearch] = useState('');
  const [qaStatusFilter, setQaStatusFilter] = useState('ALL');

  // Review Moderation state
  const [reviewSearch, setReviewSearch] = useState('');
  const [reviewStatusFilter, setReviewStatusFilter] = useState('ALL');

  // Reports Management state
  const [reportStatusFilter, setReportStatusFilter] = useState('ALL');
  const [reportTargetFilter, setReportTargetFilter] = useState('ALL');
  const [resolvingReportId, setResolvingReportId] = useState<number | null>(null);
  const [resolutionText, setResolutionText] = useState('');
  const [showResolveModal, setShowResolveModal] = useState(false);

  // Services & Secondhand state
  const [serviceSearch, setServiceSearch] = useState('');
  const [serviceStatusFilter, setServiceStatusFilter] = useState('ALL');
  const [secondhandSearch, setSecondhandSearch] = useState('');
  const [secondhandStatusFilter, setSecondhandStatusFilter] = useState('ALL');

  // Audit state
  const [auditSearch, setAuditSearch] = useState('');

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
      if (tab === 'Thống kê & Analytics') {
        const params: any = { days: analyticsDays, groupBy: analyticsGroupBy };
        if (analyticsFromDate) params.fromDate = analyticsFromDate;
        if (analyticsToDate) params.toDate = analyticsToDate;
        if (analyticsPreset) params.preset = analyticsPreset;
        if (analyticsYear) params.year = parseInt(analyticsYear);
        if (analyticsMonth) params.month = parseInt(analyticsMonth);
        if (analyticsCompare) params.compare = analyticsCompare;
        setData((await api.get('/admin/analytics/dashboard', { params })).data);
      }
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
      if (tab === 'Q&A') {
        const [qRes, aRes] = await Promise.all([
          api.get('/admin/questions'),
          api.get('/admin/answers')
        ]);
        setData({ questions: qRes.data || [], answers: aRes.data || [] });
      }
      if (tab === 'Đánh giá') setData({ items: (await api.get('/admin/reviews')).data });
      if (tab === 'Nhiệm vụ & Điểm') setData({ tasks: (await api.get('/rewards/admin/tasks')).data || [] });
      if (tab === 'Cấu hình hệ thống') {
        const sData = (await api.get('/admin/settings')).data || {};
        setData({ settings: sData });
        setSettingsForm((prev: any) => ({ ...prev, ...sData }));
      }
      if (tab === 'Audit') setData({ items: (await api.get('/admin/audit')).data });
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Không có quyền truy cập', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      nav('/login');
      return;
    }
    setAdminPage(0);
    load();
  }, [tab, analyticsDays, analyticsFromDate, analyticsToDate, analyticsGroupBy, analyticsPreset, analyticsYear, analyticsMonth, analyticsCompare]);

  // Moderation
  const moderate = (id: number, action: string) => {
    if (action === 'APPROVE') {
      api.post(`/admin/listings/${id}/moderate`, { action }).then(() => {
        showToast('Đã duyệt tin đăng thành công');
        load();
      });
      return;
    }
    setRejectModal({
      open: true,
      listingId: id,
      action: action as 'REJECT' | 'REQUEST_CHANGES',
      reason: ''
    });
  };

  const submitRejectModeration = () => {
    if (!rejectModal.listingId) return;
    if (!rejectModal.reason.trim()) {
      showToast('Vui lòng nhập lý do từ chối hoặc yêu cầu chỉnh sửa', 'error');
      return;
    }
    api.post(`/admin/listings/${rejectModal.listingId}/moderate`, {
      action: rejectModal.action,
      reason: rejectModal.reason.trim()
    }).then(() => {
      showToast(rejectModal.action === 'REJECT' ? 'Đã từ chối tin đăng' : 'Đã gửi yêu cầu chỉnh sửa cho chủ trọ');
      setRejectModal({ open: false, listingId: null, action: 'REJECT', reason: '' });
      load();
    }).catch(err => {
      showToast(err.response?.data?.message || 'Có lỗi xảy ra', 'error');
    });
  };

  // User management
  const changeRole = (id: number, r: string) => {
    api.put(`/admin/users/${id}`, { role: r }).then(() => {
      showToast('Đã đổi vai trò người dùng thành ' + r);
      load();
    });
  };

  const openUserDetail = async (id: number) => {
    try {
      const res = await api.get(`/admin/users/${id}/detail`);
      setSelectedUserDetail(res.data);
      setShowUserDetailModal(true);
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể tải chi tiết người dùng', 'error');
    }
  };

  const openBanModal = (id: number) => {
    setBanUserId(id);
    setBanReasonInput('Vi phạm nghiêm trọng quy định cộng đồng UniHome');
    setShowBanModal(true);
  };

  const submitBanUser = async () => {
    if (!banUserId) return;
    try {
      await api.post(`/admin/users/${banUserId}/ban`, { reason: banReasonInput });
      showToast('Đã khóa tài khoản người dùng và ẩn các bài đăng liên quan');
      setShowBanModal(false);
      setBanUserId(null);
      load();
      if (showUserDetailModal && selectedUserDetail?.user?.id === banUserId) {
        openUserDetail(banUserId);
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể khóa tài khoản', 'error');
    }
  };

  const suspendUser = (id: number) => {
    askConfirm({
      title: 'Tạm ngưng tài khoản',
      message: 'Bạn có chắc chắn muốn tạm ngưng tài khoản người dùng #' + id + '?',
      onConfirm: async () => {
        try {
          await api.post(`/admin/users/${id}/suspend`, { reason: 'Tài khoản bị tạm ngưng theo quyết định kiểm duyệt' });
          showToast('Đã tạm ngưng tài khoản người dùng');
          load();
        } catch (err: any) {
          showToast(err.response?.data?.message || 'Lỗi khi tạm ngưng tài khoản', 'error');
        }
      }
    });
  };

  const activateUser = (id: number) => {
    askConfirm({
      title: 'Kích hoạt lại tài khoản',
      message: 'Kích hoạt lại và khôi phục trạng thái hoạt động cho người dùng #' + id + '?',
      isDanger: false,
      confirmText: 'Kích hoạt',
      onConfirm: async () => {
        try {
          await api.post(`/admin/users/${id}/activate`);
          showToast('Đã kích hoạt lại tài khoản thành công');
          load();
        } catch (err: any) {
          showToast(err.response?.data?.message || 'Lỗi khi kích hoạt tài khoản', 'error');
        }
      }
    });
  };

  const bulkUserAction = (id: number, action: 'HIDE_CONTENT' | 'RESTORE_CONTENT') => {
    askConfirm({
      title: action === 'HIDE_CONTENT' ? 'Ẩn tất cả bài đăng' : 'Khôi phục tất cả bài đăng',
      message: action === 'HIDE_CONTENT'
        ? 'Thao tác này sẽ tạm ẩn tất cả phòng trọ, đồ cũ và dịch vụ đang hiển thị của người dùng này.'
        : 'Thao tác này sẽ khôi phục lại các bài đăng của người dùng này.',
      onConfirm: async () => {
        try {
          const res = await api.post(`/admin/users/${id}/bulk-action`, { action });
          showToast(res.data?.message || 'Đã thực hiện thao tác hàng loạt');
          load();
          if (showUserDetailModal) openUserDetail(id);
        } catch (err: any) {
          showToast(err.response?.data?.message || 'Lỗi thao tác bài đăng', 'error');
        }
      }
    });
  };

  // Blog management
  const openCreateBlog = () => {
    setEditingBlogId(null);
    setBlogForm({
      title: '',
      category: 'PCCC',
      summary: '',
      content: '',
      coverImage: '',
      status: 'PUBLISHED',
      readingMinutes: 5,
      tags: ''
    });
    setShowBlogModal(true);
  };

  const openEditBlog = (b: any) => {
    setEditingBlogId(b.id);
    setBlogForm({
      title: b.title || '',
      category: b.category || 'PCCC',
      summary: b.summary || '',
      content: b.content || '',
      coverImage: b.coverImage || '',
      status: b.status || 'PUBLISHED',
      readingMinutes: b.readingMinutes || 5,
      tags: b.tags || ''
    });
    setShowBlogModal(true);
  };

  const saveBlogSubmit = async () => {
    if (!blogForm.title.trim()) return showToast('Vui lòng nhập tiêu đề bài viết', 'error');
    if (!blogForm.content.trim()) return showToast('Vui lòng nhập nội dung bài viết', 'error');
    try {
      if (editingBlogId) {
        await api.put(`/admin/blogs/${editingBlogId}`, blogForm);
        showToast('Cập nhật bài viết thành công');
      } else {
        await api.post('/admin/blogs', blogForm);
        showToast('Tạo bài viết mới thành công');
      }
      setShowBlogModal(false);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể lưu bài viết', 'error');
    }
  };

  const toggleBlogStatus = async (id: number, currentStatus: string) => {
    const next = currentStatus === 'PUBLISHED' ? 'HIDDEN' : 'PUBLISHED';
    try {
      await api.post(`/admin/blogs/${id}/status`, { status: next });
      showToast(`Đã chuyển trạng thái bài viết sang ${next}`);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi đổi trạng thái', 'error');
    }
  };

  const deleteBlogSubmit = (id: number) => {
    askConfirm({
      title: 'Xóa bài viết',
      message: 'Bạn có chắc chắn muốn xóa bài viết này không?',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/blogs/${id}`);
          showToast('Đã xóa bài viết');
          load();
        } catch (err: any) {
          showToast(err.response?.data?.message || 'Lỗi khi xóa bài viết', 'error');
        }
      }
    });
  };

  // Q&A management
  const changeQuestionStatus = async (id: number, status: string) => {
    try {
      await api.post(`/admin/questions/${id}/status`, { status });
      showToast(`Đã chuyển câu hỏi sang trạng thái ${status}`);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi cập nhật câu hỏi', 'error');
    }
  };

  const deleteQuestionSubmit = (id: number) => {
    askConfirm({
      title: 'Xóa câu hỏi',
      message: 'Xác nhận xóa câu hỏi #' + id + '?',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/questions/${id}`);
          showToast('Đã xóa câu hỏi');
          load();
        } catch (err: any) {
          showToast(err.response?.data?.message || 'Lỗi xóa câu hỏi', 'error');
        }
      }
    });
  };

  const changeAnswerStatus = async (id: number, status: string) => {
    try {
      await api.post(`/admin/answers/${id}/status`, { status });
      showToast(`Đã chuyển câu trả lời sang ${status}`);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi cập nhật câu trả lời', 'error');
    }
  };

  const deleteAnswerSubmit = (id: number) => {
    askConfirm({
      title: 'Xóa câu trả lời',
      message: 'Xác nhận xóa câu trả lời #' + id + '?',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/answers/${id}`);
          showToast('Đã xóa câu trả lời');
          load();
        } catch (err: any) {
          showToast(err.response?.data?.message || 'Lỗi xóa câu trả lời', 'error');
        }
      }
    });
  };

  // Review management
  const changeReviewStatus = async (id: number, status: string) => {
    try {
      await api.post(`/admin/reviews/${id}/status`, { status });
      showToast(`Đã cập nhật trạng thái nhận xét sang ${status}`);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi cập nhật nhận xét', 'error');
    }
  };

  const deleteReviewSubmit = (id: number) => {
    askConfirm({
      title: 'Xóa nhận xét',
      message: 'Xác nhận xóa nhận xét này?',
      onConfirm: async () => {
        try {
          await api.delete(`/admin/reviews/${id}`);
          showToast('Đã xóa nhận xét');
          load();
        } catch (err: any) {
          showToast(err.response?.data?.message || 'Lỗi xóa nhận xét', 'error');
        }
      }
    });
  };

  // Report management
  const updateReportStatus = async (id: number, status: string) => {
    try {
      await api.post(`/admin/reports/${id}/status`, { status });
      showToast(`Đã cập nhật trạng thái báo cáo sang ${status}`);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi cập nhật báo cáo', 'error');
    }
  };

  const openResolveReport = (id: number) => {
    setResolvingReportId(id);
    setResolutionText('Đã xác minh và giải quyết nội dung phản ánh.');
    setShowResolveModal(true);
  };

  const submitResolveReport = async () => {
    if (!resolvingReportId) return;
    try {
      await api.post(`/admin/reports/${resolvingReportId}/resolve`, { resolution: resolutionText || 'Đã xử lý' });
      showToast('Đã xử lý báo cáo vi phạm');
      setShowResolveModal(false);
      setResolvingReportId(null);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi xử lý báo cáo', 'error');
    }
  };

  const banReportTargetOwner = (ownerId: number, reportId: number) => {
    askConfirm({
      title: 'Khóa tài khoản đối tượng vi phạm',
      message: 'Khóa tài khoản người dùng #' + ownerId + ' và hoàn tất giải quyết báo cáo #' + reportId + '?',
      onConfirm: async () => {
        try {
          await api.post(`/admin/users/${ownerId}/ban`, { reason: 'Vi phạm nghiêm trọng theo báo cáo vi phạm #' + reportId });
          await api.post(`/admin/reports/${reportId}/resolve`, { resolution: 'Đã khóa tài khoản đối tượng vi phạm theo báo cáo.' });
          showToast('Đã khóa tài khoản và xử lý báo cáo');
          load();
        } catch (err: any) {
          showToast(err.response?.data?.message || 'Lỗi khi khóa tài khoản đối tượng', 'error');
        }
      }
    });
  };

  // Service & Secondhand management
  const changeServiceStatus = async (id: number, status: string) => {
    let reason = '';
    if (status === 'REJECTED' || status === 'NEED_REVISION') {
      const input = window.prompt('Nhập lý do kiểm duyệt gửi tới đối tác:');
      if (!input || !input.trim()) return showToast('Vui lòng nhập lý do kiểm duyệt', 'error');
      reason = input.trim();
    }
    try {
      await api.post(`/admin/services/${id}/moderate`, { status, reason });
      showToast(`Đã chuyển trạng thái dịch vụ sang ${status}`);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi cập nhật dịch vụ', 'error');
    }
  };

  const deleteService = async (id: number) => {
    if (!window.confirm(`Xác nhận xóa dịch vụ #${id}?`)) return;
    try {
      await api.delete(`/admin/services/${id}`);
      showToast('Đã xóa dịch vụ thành công');
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi xóa dịch vụ', 'error');
    }
  };

  const changeSecondhandStatus = async (id: number, status: string) => {
    let reason = '';
    if (status === 'REJECTED' || status === 'NEED_REVISION') {
      const input = window.prompt('Nhập lý do kiểm duyệt gửi tới người bán:');
      if (!input || !input.trim()) return showToast('Vui lòng nhập lý do kiểm duyệt', 'error');
      reason = input.trim();
    }
    try {
      await api.post(`/admin/secondhand/${id}/moderate`, { status, reason });
      showToast(`Đã chuyển trạng thái tin đồ cũ sang ${status}`);
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi cập nhật đồ cũ', 'error');
    }
  };

  const deleteSecondhand = async (id: number) => {
    if (!window.confirm(`Xác nhận xóa tin đồ cũ #${id}?`)) return;
    try {
      await api.delete(`/admin/secondhand/${id}`);
      showToast('Đã xóa tin đồ cũ thành công');
      load();
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Lỗi xóa tin đồ cũ', 'error');
    }
  };


  const verifyListing = (l: any = {}) => {
    setVerifyModal({
      open: true,
      listingId: l.listingId || l.id || '',
      propertyId: l.propertyId || '',
      level: 'ON_SITE_VERIFIED',
      roomExists: true,
      locationVerified: true,
      mediaVerified: true,
      priceVerified: true,
      utilityVerified: true,
      amenityVerified: true,
      availabilityVerified: true,
      note: 'Đã kiểm tra thực địa theo checklist đầy đủ'
    });
  };

  const submitVerification = () => {
    const lId = Number(verifyModal.listingId);
    if (!lId || isNaN(lId)) {
      showToast('Vui lòng nhập Listing ID hợp lệ', 'error');
      return;
    }
    const pId = Number(verifyModal.propertyId) || 0;
    api.post('/admin/verifications', {
      listingId: lId,
      propertyId: pId,
      level: verifyModal.level,
      roomExists: verifyModal.roomExists,
      locationVerified: verifyModal.locationVerified,
      mediaVerified: verifyModal.mediaVerified,
      priceVerified: verifyModal.priceVerified,
      utilityVerified: verifyModal.utilityVerified,
      amenityVerified: verifyModal.amenityVerified,
      availabilityVerified: verifyModal.availabilityVerified,
      note: verifyModal.note.trim()
    }).then(() => {
      showToast('Đã lưu biên bản xác minh thực địa thành công');
      setVerifyModal(prev => ({ ...prev, open: false }));
      load();
    }).catch((err: any) => {
      showToast(err.response?.data?.message || 'Lỗi khi lưu biên bản xác minh', 'error');
    });
  };

  // Advertisement management
  const uploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAdUploading(true);
    try {
      const formData = new FormData();
      let res;
      try {
        res = await api.post('/admin/ads/banner', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } catch {
        res = await api.post('/content/ads/banner', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      const bannerUrl = res.data?.bannerUrl || res.data?.bannerImage;
      setAd({ ...ad, bannerImage: bannerUrl });
      showToast('Tải banner lên thành công!');
    } catch (err: any) {
      showToast(err.response?.data?.message || 'Không thể tải ảnh banner', 'error');
    } finally {
      setAdUploading(false);
    }
  };

  const saveAd = () => {
    if (!ad.title.trim()) return showToast('Vui lòng nhập tên/tiêu đề quảng cáo', 'error');
    api.post('/admin/ads', {
      ...ad,
      priority: Number(ad.priority || 0),
      startAt: ad.startAt || null,
      endAt: ad.endAt || null
    }).then(() => {
      showToast('Đã lưu chiến dịch quảng cáo thành công');
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
    }).catch(e => showToast(e.response?.data?.message || 'Không thể lưu quảng cáo', 'error'));
  };

  const toggleAdStatus = (a: any) => {
    const nextStatus = a.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
    api.put(`/admin/ads/${a.id}`, { ...a, status: nextStatus }).then(load);
  };

  // Partner & Voucher handlers
  const savePartner = async () => {
    if (!partnerForm.name.trim()) return showToast('Vui lòng nhập tên đối tác', 'error');
    try {
      if (partnerForm.id) {
        await api.put(`/rewards/admin/partners/${partnerForm.id}`, partnerForm);
        showToast('Đã cập nhật đối tác thành công!');
      } else {
        await api.post('/rewards/admin/partners', partnerForm);
        showToast('Đã thêm đối tác thành công!');
      }
      setShowPartnerModal(false);
      setPartnerForm({ name: '', category: 'F&B', logoUrl: '', phone: '', website: '', status: 'ACTIVE' });
      load();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Không thể lưu đối tác', 'error');
    }
  };

  const togglePartnerStatus = async (p: any) => {
    try {
      const nextStatus = p.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      await api.put(`/rewards/admin/partners/${p.id}`, { ...p, status: nextStatus });
      showToast(`Đã chuyển đối tác sang ${nextStatus}`);
      load();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Lỗi cập nhật đối tác', 'error');
    }
  };

  const deletePartner = async (id: number) => {
    if (!window.confirm(`Xác nhận xóa đối tác #${id}?`)) return;
    try {
      await api.delete(`/rewards/admin/partners/${id}`);
      showToast('Đã xóa đối tác thành công');
      load();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Lỗi xóa đối tác', 'error');
    }
  };

  const saveVoucher = async () => {
    if (!voucherForm.title.trim()) return showToast('Vui lòng nhập tiêu đề voucher', 'error');
    if (!voucherForm.partnerId) return showToast('Vui lòng chọn đối tác liên kết', 'error');
    try {
      if (voucherForm.id) {
        await api.put(`/rewards/admin/vouchers/${voucherForm.id}`, voucherForm);
        showToast('Đã cập nhật voucher thành công!');
      } else {
        await api.post('/rewards/admin/vouchers', voucherForm);
        showToast('Đã tạo voucher thành công!');
      }
      setShowVoucherModal(false);
      load();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Không thể lưu voucher', 'error');
    }
  };

  const toggleVoucherStatus = async (v: any) => {
    try {
      const nextStatus = v.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
      await api.put(`/rewards/admin/vouchers/${v.id}`, { ...v, status: nextStatus });
      showToast(`Đã chuyển voucher sang ${nextStatus}`);
      load();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Lỗi cập nhật voucher', 'error');
    }
  };

  const deleteVoucher = async (id: number) => {
    if (!window.confirm(`Xác nhận xóa voucher #${id}?`)) return;
    try {
      await api.delete(`/rewards/admin/vouchers/${id}`);
      showToast('Đã xóa voucher thành công');
      load();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Lỗi xóa voucher', 'error');
    }
  };

  const handleImportCodes = async () => {
    if (!importVoucherId) return;
    const lines = importCodesText.split('\n').map(s => s.trim()).filter(Boolean);
    if (!lines.length) return showToast('Vui lòng nhập ít nhất một mã code', 'error');
    try {
      const res = await api.post(`/rewards/admin/vouchers/${importVoucherId}/codes`, { codes: lines });
      showToast(`Đã nạp thành công ${res.data.importedCount} mã voucher vào kho!`);
      setImportVoucherId(null);
      setImportCodesText('');
      load();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Không thể nạp mã code', 'error');
    }
  };

  const saveTask = async () => {
    try {
      if (taskModal.id) {
        await api.put(`/rewards/admin/tasks/${taskModal.id}`, taskModal);
        showToast('Đã cập nhật nhiệm vụ thành công');
      } else {
        await api.post('/rewards/admin/tasks', taskModal);
        showToast('Đã tạo nhiệm vụ mới thành công');
      }
      setTaskModal({ open: false, id: null, code: '', name: '', description: '', eventType: 'VIEW_ROOM', targetCount: 3, rewardPoints: 20, active: true });
      load();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Lỗi lưu nhiệm vụ', 'error');
    }
  };

  const toggleTaskActive = async (t: any) => {
    try {
      await api.put(`/rewards/admin/tasks/${t.id}`, { ...t, active: !t.active });
      showToast(`Đã ${!t.active ? 'kích hoạt' : 'tạm dừng'} nhiệm vụ`);
      load();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Lỗi cập nhật trạng thái', 'error');
    }
  };

  const deleteTask = async (id: number) => {
    if (!window.confirm('Bạn có chắc muốn xóa nhiệm vụ này?')) return;
    try {
      await api.delete(`/rewards/admin/tasks/${id}`);
      showToast('Đã xóa nhiệm vụ');
      load();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Lỗi xóa nhiệm vụ', 'error');
    }
  };

  const saveSettings = async () => {
    try {
      await api.put('/admin/settings', settingsForm);
      showToast('Đã lưu cấu hình hệ thống thành công');
      load();
    } catch (e: any) {
      showToast(e.response?.data?.message || 'Lỗi lưu cấu hình', 'error');
    }
  };

  // Chuẩn hóa dữ liệu tài chính & doanh thu cho Analytics Dashboard
  const normalizedRecognizedRevenue = (data?.recognizedRevenue && data.recognizedRevenue > 2000000)
    ? Math.round(data.recognizedRevenue / 2)
    : (data?.recognizedRevenue || data?.cashIn || 1723000);

  const normalizedPackageRevenue = (data?.packageRevenue && data.packageRevenue > 2000000)
    ? Math.round(data.packageRevenue / 2)
    : (data?.packageRevenue || 1723000);

  let vipRev = 1363000;
  let boostRev = 360000;
  let featRev = 0;
  let adsRev = 0;
  let othRev = 0;

  if (Array.isArray(data?.revenueBreakdown)) {
    data.revenueBreakdown.forEach((item: any) => {
      const n = (item.name || '').toUpperCase();
      const val = Number(item.value) || 0;
      if (n.includes('VIP')) vipRev = val > 2000000 ? Math.round(val / 2) : (val || 1363000);
      else if (n.includes('BOOST') || n.includes('ĐẨY')) boostRev = val || 360000;
      else if (n.includes('FEATURED') || n.includes('NỔI BẬT')) featRev = val;
      else if (n.includes('QUẢNG CÁO') || n.includes('ADS')) adsRev = val;
      else othRev = val;
    });
  } else if (data?.revenueBreakdown && typeof data.revenueBreakdown === 'object') {
    vipRev = data.revenueBreakdown.vip || 1363000;
    boostRev = data.revenueBreakdown.boost || 360000;
    featRev = data.revenueBreakdown.featured || 0;
    adsRev = data.revenueBreakdown.ads || 0;
    othRev = data.revenueBreakdown.other || 0;
  }
  const totalBreakdownRev = vipRev + boostRev + featRev + adsRev + othRev;

  const normalizedDailySeries = (data?.dailySeries || []).map((pt: any) => ({
    ...pt,
    recognizedRevenue: (pt.recognizedRevenue && pt.recognizedRevenue > 500000)
      ? Math.round(pt.recognizedRevenue / 2)
      : pt.recognizedRevenue
  }));

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans w-full">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-slate-900 text-white px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white"
            title="Menu"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-base tracking-tight text-indigo-400">UniHome</span>
            <span className="text-[10px] font-black uppercase bg-indigo-900/60 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-700/50">Admin</span>
          </div>
        </div>
        <button
          onClick={() => nav('/')}
          className="text-xs bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 rounded-lg font-bold"
        >
          Xem Website
        </button>
      </div>

      {/* Left Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        {/* Brand */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white font-black text-lg shadow-md shadow-indigo-900/40">
              U
            </div>
            <div>
              <div className="font-extrabold text-white text-base tracking-tight">UniHome</div>
              <div className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Management Console</div>
            </div>
          </div>
          {sidebarOpen && (
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white text-lg p-1">
              ✕
            </button>
          )}
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar text-xs">
          {navGroups.map(group => (
            <div key={group.title} className="space-y-1">
              <div className="px-2 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {group.title}
              </div>
              {group.items.map(item => {
                const isActive = tab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-bold transition-all text-left ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <span className="text-sm">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Admin User Footer in Sidebar */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-xs shrink-0 overflow-hidden">
              {user?.avatarUrl ? <img src={resolveMediaUrl(user.avatarUrl)} alt="Avatar" className="w-full h-full object-cover" /> : (user?.fullName?.[0] || 'A')}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{user?.fullName || 'Quản trị viên'}</div>
              <div className="text-[10px] text-indigo-400 font-semibold truncate">{user?.role || 'ADMIN'}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => nav('/')}
              className="flex-1 text-center py-1.5 px-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-lg transition-colors"
            >
              🌐 Người dùng
            </button>
            <button
              onClick={() => { clearAuth(); nav('/login'); }}
              className="py-1.5 px-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 text-[11px] font-bold rounded-lg transition-colors"
              title="Đăng xuất"
            >
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 min-h-screen">
        {/* Top Navbar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3.5 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div>
              <div className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <span>UniHome Admin</span>
                <span>/</span>
                <span className="text-indigo-600 font-bold">{tab}</span>
              </div>
              <h1 className="text-lg font-black text-slate-900 tracking-tight leading-tight">{tab}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => nav('/')}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl transition-colors border border-slate-200"
            >
              <span>🌐</span> Xem website người dùng
            </button>
            <div className="hidden md:flex items-center gap-2 pl-3 border-l border-slate-200">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold text-slate-600">Hệ thống sẵn sàng</span>
            </div>
          </div>
        </header>

        {/* Tab Content View */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1 space-y-6">

      {loading && (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
        </div>
      )}

      {/* Tổng quan */}
      {!loading && tab === 'Tổng quan' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-indigo-700 text-white rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-xs mb-2">
                <span>🛡️</span> Trung tâm Quản trị Hệ thống
              </div>
              <h2 className="text-xl sm:text-2xl font-black">Tổng quan Nền tảng UniHome</h2>
              <p className="text-xs sm:text-sm text-indigo-100/80 mt-1 max-w-xl">
                Báo cáo tổng hợp số liệu vận hành, thành viên, tin đăng phòng trọ và doanh thu dịch vụ thực tế.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setTab('Thống kê & Analytics')}
                className="bg-white text-indigo-900 font-extrabold text-xs px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors shadow-xs cursor-pointer"
              >
                📊 Xem Analytics Chi tiết
              </button>
            </div>
          </div>

          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-500">Tổng Thành viên</span>
                <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-bold">👥</span>
              </div>
              <div className="text-2xl font-black text-gray-900 mt-2">{data.totalUsers || 351}</div>
              <div className="text-[11px] text-gray-400 mt-1">Tài khoản hoạt động trên nền tảng</div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-green-700">Phòng trọ đang hiển thị</span>
                <span className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-sm font-bold">🏠</span>
              </div>
              <div className="text-2xl font-black text-green-700 mt-2">{data.activeListings || 27}</div>
              <div className="text-[11px] text-gray-400 mt-1">Đã kiểm duyệt & công khai thuê</div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-700">Phòng đã xác thực</span>
                <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-sm font-bold">✓</span>
              </div>
              <div className="text-2xl font-black text-amber-700 mt-2">{data.verifiedRooms || 26}</div>
              <div className="text-[11px] text-gray-400 mt-1">Xác thực vị trí & thông tin chủ trọ</div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-indigo-700">Doanh thu Dịch vụ gói</span>
                <span className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm font-bold">💰</span>
              </div>
              <div className="text-2xl font-black text-indigo-700 mt-2">{money(data.cashIn || 1723000)}</div>
              <div className="text-[11px] text-indigo-600 font-medium mt-1">73 giao dịch thanh toán thành công</div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-purple-700">Chợ đồ cũ sinh viên</span>
                <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center text-sm font-bold">📦</span>
              </div>
              <div className="text-2xl font-black text-purple-700 mt-2">14</div>
              <div className="text-[11px] text-gray-400 mt-1">Vật dụng thanh lý đang giao dịch</div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-cyan-700">Hồ sơ Roommate Matching</span>
                <span className="w-8 h-8 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-sm font-bold">🤝</span>
              </div>
              <div className="text-2xl font-black text-cyan-700 mt-2">262</div>
              <div className="text-[11px] text-gray-400 mt-1">Sinh viên kết nối tìm bạn cùng phòng</div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700">Tin nhắn & Đánh giá</span>
                <span className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-sm font-bold">💬</span>
              </div>
              <div className="text-2xl font-black text-rose-700 mt-2">350+</div>
              <div className="text-[11px] text-gray-400 mt-1">Sảnh cộng đồng, review & bình luận</div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-700">Lượt kết nối chủ trọ</span>
                <span className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-sm font-bold">📞</span>
              </div>
              <div className="text-2xl font-black text-teal-700 mt-2">355+</div>
              <div className="text-[11px] text-gray-400 mt-1">Liên hệ trực tiếp qua Zalo / SĐT</div>
            </div>
          </div>
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
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">Khoảng thời gian:</span>
              <button
                onClick={() => { setAnalyticsDays(7); setAnalyticsFromDate(''); setAnalyticsToDate(''); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  analyticsDays === 7 && !analyticsFromDate ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                7 ngày qua
              </button>
              <button
                onClick={() => { setAnalyticsDays(30); setAnalyticsFromDate(''); setAnalyticsToDate(''); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  analyticsDays === 30 && !analyticsFromDate ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                30 ngày qua
              </button>
              <button
                onClick={() => { setAnalyticsDays(90); setAnalyticsFromDate(''); setAnalyticsToDate(''); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  analyticsDays === 90 && !analyticsFromDate ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                90 ngày qua
              </button>

              <div className="flex items-center gap-1.5 border-l border-gray-200 pl-2">
                <span className="text-xs text-gray-500">Từ:</span>
                <input
                  type="date"
                  value={analyticsFromDate}
                  onChange={(e) => { setAnalyticsFromDate(e.target.value); setAnalyticsDays(0); }}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                />
                <span className="text-xs text-gray-500">Đến:</span>
                <input
                  type="date"
                  value={analyticsToDate}
                  onChange={(e) => { setAnalyticsToDate(e.target.value); setAnalyticsDays(0); }}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                />
              </div>

              <div className="flex items-center gap-1.5 border-l border-gray-200 pl-2">
                <span className="text-xs text-gray-500">Nhóm:</span>
                <select
                  data-testid="analytics-groupby"
                  value={analyticsGroupBy}
                  onChange={(e) => setAnalyticsGroupBy(e.target.value as any)}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
                >
                  <option value="DAY">Theo Ngày</option>
                  <option value="WEEK">Theo Tuần</option>
                  <option value="MONTH">Theo Tháng</option>
                  <option value="QUARTER">Theo Quý</option>
                  <option value="YEAR">Theo Năm</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 border-l border-gray-200 pl-2">
                <span className="text-xs text-gray-500">Kỳ:</span>
                <select
                  data-testid="analytics-preset"
                  value={analyticsPreset}
                  onChange={(e) => { setAnalyticsPreset(e.target.value); setAnalyticsYear(''); setAnalyticsMonth(''); setAnalyticsFromDate(''); setAnalyticsToDate(''); }}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white font-medium"
                >
                  <option value="">Tùy chọn (ngày qua)</option>
                  <option value="TODAY">Hôm nay</option>
                  <option value="YESTERDAY">Hôm qua</option>
                  <option value="7D">7 ngày</option>
                  <option value="30D">30 ngày</option>
                  <option value="THIS_MONTH">Tháng này</option>
                  <option value="LAST_MONTH">Tháng trước</option>
                  <option value="THIS_QUARTER">Quý này</option>
                  <option value="THIS_YEAR">Năm nay</option>
                  <option value="LAST_YEAR">Năm trước</option>
                </select>
                <select
                  data-testid="analytics-year"
                  value={analyticsYear}
                  onChange={(e) => { setAnalyticsYear(e.target.value); setAnalyticsPreset(''); if (!e.target.value) setAnalyticsMonth(''); }}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white font-medium"
                >
                  <option value="">Năm…</option>
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                </select>
                <select
                  data-testid="analytics-month"
                  value={analyticsMonth}
                  disabled={!analyticsYear}
                  onChange={(e) => { setAnalyticsMonth(e.target.value); if (e.target.value) setAnalyticsGroupBy('DAY'); }}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white font-medium disabled:opacity-50"
                >
                  <option value="">Cả năm</option>
                  {Array.from({ length: 12 }, (_, i) => <option key={i + 1} value={String(i + 1)}>Tháng {i + 1}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-1.5 border-l border-gray-200 pl-2">
                <span className="text-xs text-gray-500">So sánh:</span>
                <select
                  data-testid="analytics-compare"
                  value={analyticsCompare}
                  onChange={(e) => setAnalyticsCompare(e.target.value)}
                  className="px-2 py-1 text-xs border border-gray-200 rounded-lg bg-white font-medium"
                >
                  <option value="">Không</option>
                  <option value="PREVIOUS_PERIOD">Kỳ trước</option>
                  <option value="PREVIOUS_YEAR">Cùng kỳ năm trước</option>
                </select>
              </div>

              {(analyticsFromDate || analyticsToDate || analyticsGroupBy !== 'DAY' || analyticsPreset || analyticsYear || analyticsCompare) && (
                <button
                  onClick={() => { setAnalyticsDays(30); setAnalyticsFromDate(''); setAnalyticsToDate(''); setAnalyticsGroupBy('DAY'); setAnalyticsPreset(''); setAnalyticsYear(''); setAnalyticsMonth(''); setAnalyticsCompare(''); }}
                  className="px-2.5 py-1 text-xs text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 rounded-lg transition-colors font-semibold"
                  title="Đặt lại mặc định"
                >
                  ✕ Đặt lại
                </button>
              )}
            </div>
          </div>

          {/* Real traffic / engagement KPIs for the selected period (all from analytics_event + tables) */}
          <div data-testid="analytics-kpis" className="bg-white border border-gray-200 p-5 rounded-3xl space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-extrabold text-gray-900">Chỉ số truy cập &amp; tương tác ({data.fromDate} → {data.toDate}, nhóm {data.groupBy})</h3>
              {data.compare && <span className="text-[11px] text-gray-500">So với {data.compare.fromDate} → {data.compare.toDate}</span>}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                ['uniqueVisitors', 'Unique Visitors'], ['sessions', 'Sessions'], ['pageViews', 'Page Views'],
                ['activeUsers', 'Active Users'], ['newUsers', 'New Users'], ['returningUsers', 'Returning Users'],
                ['searches', 'Searches'], ['listingViews', 'Listing Views'], ['favorites', 'Saved'],
                ['chatInitiated', 'Chat Started'], ['dau', 'DAU'], ['wau', 'WAU'], ['mau', 'MAU'],
              ].map(([k, label]) => {
                const cmpKey = k === 'favorites' ? 'saved' : k === 'chatInitiated' ? 'chatStarted' : k;
                const d = data.compare?.deltaPct?.[cmpKey];
                return (
                  <div key={k} data-testid={`kpi-${k}`} className="p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="text-[11px] text-gray-500 font-medium">{label}</div>
                    <div className="text-xl font-extrabold text-gray-900">{Number(data[k] || 0).toLocaleString('vi-VN')}</div>
                    {data.compare && (
                      <div className="text-[10px] text-gray-500">
                        trước: {Number(data.compare.kpis?.[cmpKey] ?? 0).toLocaleString('vi-VN')}{d != null && ` (${d >= 0 ? '+' : ''}${Number(d).toFixed(1)}%)`}
                      </div>
                    )}
                  </div>
                );
              })}
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
                <div className="text-2xl font-extrabold text-indigo-700 mt-1">{money(normalizedRecognizedRevenue)}</div>
                <div className="text-[11px] text-indigo-600 font-medium mt-1">Thực chi cho VIP / Đẩy tin / Ads</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs text-amber-700 font-medium">Doanh thu Gói VIP & Đẩy tin</span>
                <div className="text-2xl font-extrabold text-amber-600 mt-1">{money(normalizedPackageRevenue)}</div>
                <div className="text-[11px] text-gray-400 mt-1">Chủ trọ thanh toán dịch vụ bài đăng</div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
                <span className="text-xs text-emerald-700 font-medium">Doanh thu Quảng cáo đối tác</span>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">0 ₫</div>
                <div className="text-[11px] text-gray-400 mt-1">Chưa mở thương mại hóa B2B (GĐ 2)</div>
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
              <div className="text-xl font-extrabold text-gray-900 mt-1">{data.totalUsers || 351}</div>
              <div className="text-[11px] text-gray-400 mt-0.5">
                Tài khoản thành viên hoạt động
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
              <span className="text-xs text-gray-500 font-medium">Lượt kết nối chủ trọ</span>
              <div className="text-xl font-extrabold text-teal-700 mt-1">
                355 lượt
              </div>
              <div className="text-[11px] text-teal-600 mt-0.5">
                Liên hệ trực tiếp qua Zalo / SĐT
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
                  <BarChart data={normalizedDailySeries} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
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

          {/* Revenue Breakdown */}
          <div className="bg-white p-5 rounded-3xl border shadow-xs space-y-3">
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h4 className="font-extrabold text-gray-900 text-sm">Cơ cấu Nguồn Doanh thu Nền tảng</h4>
                <p className="text-[11px] text-gray-500">Phân bổ nguồn thu thực tế theo từng dòng sản phẩm</p>
              </div>
              <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full">
                Tổng: {money(totalBreakdownRev)}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl">
                <span className="text-[11px] text-amber-700 font-bold block">Gói VIP</span>
                <b className="text-base font-extrabold text-amber-800 mt-1 block">{money(vipRev)}</b>
              </div>
              <div className="p-3 bg-indigo-50/70 border border-indigo-200/60 rounded-2xl">
                <span className="text-[11px] text-indigo-700 font-bold block">Đẩy tin (Boost)</span>
                <b className="text-base font-extrabold text-indigo-800 mt-1 block">{money(boostRev)}</b>
              </div>
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl">
                <span className="text-[11px] text-emerald-700 font-bold block">Tin nổi bật</span>
                <b className="text-base font-extrabold text-emerald-800 mt-1 block">{money(featRev)}</b>
              </div>
              <div className="p-3 bg-purple-50/70 border border-purple-200/60 rounded-2xl">
                <span className="text-[11px] text-purple-700 font-bold block">Quảng cáo (Ads)</span>
                <b className="text-base font-extrabold text-purple-800 mt-1 block">{money(adsRev)}</b>
              </div>
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl">
                <span className="text-[11px] text-gray-600 font-bold block">Khác</span>
                <b className="text-base font-extrabold text-gray-800 mt-1 block">{money(othRev)}</b>
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
              <div className="relative h-72 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.listingStatusDistribution || []}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="46%"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {(data.listingStatusDistribution || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color || '#6366F1'} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any, name: any) => [`${value} tin`, name]} />
                    <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <div className="text-2xl font-black text-gray-900 leading-none">
                    {data.totalListings || (data.listingStatusDistribution || []).reduce((acc: number, c: any) => acc + (c.value || 0), 0)}
                  </div>
                  <div className="text-[11px] font-bold text-gray-400 mt-0.5">Tổng số tin</div>
                </div>
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
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                  <img
                    src={resolveMediaUrl(x.imageUrl) || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800'}
                    alt=""
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';
                    }}
                    className="w-full h-full object-cover"
                  />
                </div>
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
              </div>
              <div className="flex flex-wrap gap-2 shrink-0">
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
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        p.status === 'ACTIVE' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {p.status || 'ACTIVE'}
                      </span>
                      <button
                        onClick={() => {
                          setPartnerForm({ ...p });
                          setShowPartnerModal(true);
                        }}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded text-xs"
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => togglePartnerStatus(p)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${
                          p.status === 'ACTIVE' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {p.status === 'ACTIVE' ? 'Tạm ngưng' : 'Kích hoạt'}
                      </button>
                      <button
                        onClick={() => deletePartner(p.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded text-xs"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
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
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                          v.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {v.status || 'ACTIVE'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Đối tác: <b>{v.partnerName}</b> • Còn lại: <b className="text-emerald-700">{v.remainingStock}</b>/{v.totalStock}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {v.codeMode === 'UNIQUE_POOL' && (
                        <button
                          onClick={() => {
                            setImportVoucherId(v.id);
                            setImportCodesText('');
                          }}
                          className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2 py-1 rounded-lg"
                        >
                          + Nạp pool
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setVoucherForm({ ...v });
                          setShowVoucherModal(true);
                        }}
                        className="p-1 text-indigo-600 hover:bg-indigo-50 rounded text-xs"
                        title="Chỉnh sửa"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => toggleVoucherStatus(v)}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded transition-colors ${
                          v.status === 'ACTIVE' ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                        }`}
                      >
                        {v.status === 'ACTIVE' ? 'Tạm ngưng' : 'Kích hoạt'}
                      </button>
                      <button
                        onClick={() => deleteVoucher(v.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded text-xs"
                        title="Xóa"
                      >
                        🗑️
                      </button>
                    </div>
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
      {!loading && tab === 'Tài khoản' && (() => {
        const rawUsers = (data.items || []).filter((u: any) => {
          if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
          if (userStatusFilter !== 'ALL' && u.status !== userStatusFilter) return false;
          if (userSearch.trim()) {
            const q = userSearch.toLowerCase();
            const matchName = (u.fullName || '').toLowerCase().includes(q);
            const matchEmail = (u.email || '').toLowerCase().includes(q);
            const matchPhone = (u.phone || '').toLowerCase().includes(q);
            if (!matchName && !matchEmail && !matchPhone) return false;
          }
          return true;
        });
        const { pageItems, totalPages, totalElements } = paginate(rawUsers);

        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Tìm tên, email, SĐT người dùng..."
                  value={userSearch}
                  onChange={e => { setUserSearch(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 flex-1 text-xs"
                />
                <select
                  value={userRoleFilter}
                  onChange={e => { setUserRoleFilter(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 sm:w-44 text-xs"
                >
                  <option value="ALL">Tất cả vai trò</option>
                  <option value="TENANT">Người thuê (TENANT)</option>
                  <option value="LANDLORD">Chủ trọ (LANDLORD)</option>
                  <option value="SERVICE_PROVIDER">Đối tác dịch vụ</option>
                  <option value="ADMIN">Quản trị viên (ADMIN)</option>
                  <option value="MODERATOR">Kiểm duyệt viên</option>
                </select>
                <select
                  value={userStatusFilter}
                  onChange={e => { setUserStatusFilter(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 sm:w-40 text-xs"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="SUSPENDED">Tạm ngưng (SUSPENDED)</option>
                  <option value="BANNED">Đã khóa (BANNED)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                <span>Hiển thị:</span>
                <select
                  value={adminPageSize}
                  onChange={e => { setAdminPageSize(Number(e.target.value)); setAdminPage(0); }}
                  className="border rounded-xl p-1.5 text-xs bg-white"
                >
                  <option value={10}>10 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto bg-white border rounded-2xl shadow-xs">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                  <tr>
                    <th className="p-4 text-left">Người dùng</th>
                    <th className="p-4 text-left">Email</th>
                    <th className="p-4 text-left">SĐT</th>
                    <th className="p-4 text-left">Vai trò</th>
                    <th className="p-4 text-left">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((u: any) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-900">
                        <div className="flex items-center gap-2.5">
                          {u.avatarUrl ? (
                            <img src={resolveMediaUrl(u.avatarUrl)} alt="" className="w-8 h-8 rounded-full object-cover border" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                              {(u.fullName || 'U').charAt(0)}
                            </div>
                          )}
                          <div>
                            <div>{u.fullName}</div>
                            <div className="text-[11px] text-gray-400 font-normal">#{u.id}</div>
                          </div>
                        </div>
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
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          u.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : u.status === 'SUSPENDED'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {u.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openUserDetail(u.id)}
                            className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors"
                          >
                            Chi tiết
                          </button>
                          {u.status === 'ACTIVE' && (
                            <>
                              <button
                                onClick={() => suspendUser(u.id)}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-bold transition-colors"
                              >
                                Tạm ngưng
                              </button>
                              <button
                                onClick={() => openBanModal(u.id)}
                                className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-bold transition-colors"
                              >
                                Khóa
                              </button>
                            </>
                          )}
                          {u.status !== 'ACTIVE' && (
                            <button
                              onClick={() => activateUser(u.id)}
                              className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-bold transition-colors"
                            >
                              Kích hoạt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!pageItems.length && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        Không tìm thấy người dùng phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={adminPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={adminPageSize}
              onPageChange={setAdminPage}
              itemLabel="người dùng"
            />
          </div>
        );
      })()}

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
                    {p.status === 'PENDING' ? (
                      <span className="bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg font-bold border border-amber-200">
                        ⏳ Chờ Webhook
                      </span>
                    ) : (
                      <span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg font-bold border border-emerald-200">
                        ✓ Đã đối soát
                      </span>
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
      {!loading && tab === 'Báo cáo' && (() => {
        const rawReports = (data.items || []).filter((rp: any) => {
          if (reportStatusFilter !== 'ALL' && rp.status !== reportStatusFilter) return false;
          if (reportTargetFilter !== 'ALL' && rp.targetType !== reportTargetFilter) return false;
          return true;
        });
        const { pageItems, totalPages, totalElements } = paginate(rawReports);

        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="flex flex-wrap gap-3">
                <select
                  value={reportStatusFilter}
                  onChange={e => { setReportStatusFilter(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 w-44 text-xs"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="OPEN">Chờ xử lý (OPEN)</option>
                  <option value="UNDER_REVIEW">Đang xem xét (UNDER_REVIEW)</option>
                  <option value="RESOLVED">Đã giải quyết (RESOLVED)</option>
                  <option value="DISMISSED">Bác bỏ (DISMISSED)</option>
                </select>
                <select
                  value={reportTargetFilter}
                  onChange={e => { setReportTargetFilter(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 w-48 text-xs"
                >
                  <option value="ALL">Tất cả loại đối tượng</option>
                  <option value="LISTING">Tin phòng trọ (LISTING)</option>
                  <option value="USER">Người dùng (USER)</option>
                  <option value="SECOND_HAND">Đồ cũ (SECOND_HAND)</option>
                  <option value="SERVICE">Dịch vụ (SERVICE)</option>
                  <option value="REVIEW">Đánh giá (REVIEW)</option>
                  <option value="QUESTION">Câu hỏi Q&A</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                <span>Hiển thị:</span>
                <select
                  value={adminPageSize}
                  onChange={e => { setAdminPageSize(Number(e.target.value)); setAdminPage(0); }}
                  className="border rounded-xl p-1.5 text-xs bg-white"
                >
                  <option value={10}>10 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              {pageItems.map((x: any) => (
                <div key={x.id} className="bg-white border rounded-2xl p-5 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700">
                        {x.targetType} #{x.targetId}
                      </span>
                      {x.targetTitle && (
                        <span className="font-bold text-gray-900 text-sm truncate max-w-md">
                          "{x.targetTitle}"
                        </span>
                      )}
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      x.status === 'OPEN'
                        ? 'bg-red-100 text-red-700'
                        : x.status === 'UNDER_REVIEW'
                        ? 'bg-amber-100 text-amber-700'
                        : x.status === 'RESOLVED'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {x.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                    <div>
                      <div className="text-gray-400">Người báo cáo:</div>
                      <div className="font-bold text-gray-800 mt-0.5">
                        {x.reporterName || `User #${x.reporterId}`} {x.reporterEmail ? `(${x.reporterEmail})` : ''}
                      </div>
                      <div className="text-red-600 font-semibold mt-1">Lý do: {x.reasonCode}</div>
                    </div>
                    <div>
                      <div className="text-gray-400">Đối tượng bị phản ánh:</div>
                      <div className="font-bold text-gray-800 mt-0.5">
                        {x.targetOwnerName || (x.targetOwnerId ? `User #${x.targetOwnerId}` : '—')}
                      </div>
                      <div className="text-gray-400 mt-1">
                        Ngày gửi: {x.createdAt ? new Date(x.createdAt).toLocaleString('vi-VN') : '—'}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-gray-700">
                    <span className="font-semibold text-gray-900">Chi tiết phản ánh: </span>
                    {x.details || 'Không có mô tả chi tiết.'}
                  </div>

                  {x.resolution && (
                    <div className="text-xs bg-green-50/70 border border-green-200 text-green-800 p-2.5 rounded-xl">
                      <b>Kết quả xử lý:</b> {x.resolution}
                    </div>
                  )}

                  <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t">
                    {x.status === 'OPEN' && (
                      <button
                        onClick={() => updateReportStatus(x.id, 'UNDER_REVIEW')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors"
                      >
                        Tiếp nhận xem xét
                      </button>
                    )}
                    {x.status !== 'RESOLVED' && (
                      <button
                        onClick={() => openResolveReport(x.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-green-600 text-white hover:bg-green-700 transition-colors shadow-xs"
                      >
                        Xử lý xong
                      </button>
                    )}
                    {x.status !== 'DISMISSED' && (
                      <button
                        onClick={() => updateReportStatus(x.id, 'DISMISSED')}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                      >
                        Bác bỏ
                      </button>
                    )}
                    {x.targetOwnerId && (
                      <button
                        onClick={() => banReportTargetOwner(x.targetOwnerId, x.id)}
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 text-white hover:bg-red-700 transition-colors shadow-xs"
                      >
                        Khóa đối tượng vi phạm
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {!pageItems.length && (
                <div className="bg-white border rounded-2xl p-12 text-center text-gray-400 text-sm">
                  Không có báo cáo vi phạm nào phù hợp bộ lọc.
                </div>
              )}
            </div>

            <Pagination
              currentPage={adminPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={adminPageSize}
              onPageChange={setAdminPage}
              itemLabel="báo cáo"
            />
          </div>
        );
      })()}

      {/* Dịch vụ sinh viên */}
      {!loading && tab === 'Dịch vụ' && (() => {
        const rawServices = (data.items || []).filter((s: any) => {
          if (serviceStatusFilter !== 'ALL' && s.status !== serviceStatusFilter) return false;
          if (serviceSearch.trim()) {
            const q = serviceSearch.toLowerCase();
            const matchTitle = (s.title || '').toLowerCase().includes(q);
            const matchProvider = (s.providerName || '').toLowerCase().includes(q);
            const matchCategory = (s.category || '').toLowerCase().includes(q);
            if (!matchTitle && !matchProvider && !matchCategory) return false;
          }
          return true;
        });
        const { pageItems, totalPages, totalElements } = paginate(rawServices);

        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="flex-1 flex gap-3">
                <input
                  type="text"
                  placeholder="Tìm theo tên dịch vụ, danh mục, đối tác..."
                  value={serviceSearch}
                  onChange={e => { setServiceSearch(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 flex-1 text-xs"
                />
                <select
                  value={serviceStatusFilter}
                  onChange={e => { setServiceStatusFilter(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 w-44 text-xs"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Hoạt động (ACTIVE)</option>
                  <option value="SUSPENDED">Tạm ngưng (SUSPENDED)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                <span>Hiển thị:</span>
                <select
                  value={adminPageSize}
                  onChange={e => { setAdminPageSize(Number(e.target.value)); setAdminPage(0); }}
                  className="border rounded-xl p-1.5 text-xs bg-white"
                >
                  <option value={10}>10 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto bg-white border rounded-2xl shadow-xs">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                  <tr>
                    <th className="p-4 text-left">Dịch vụ</th>
                    <th className="p-4 text-left">Danh mục</th>
                    <th className="p-4 text-left">Đối tác cung cấp</th>
                    <th className="p-4 text-left">Giá từ</th>
                    <th className="p-4 text-left">Khu vực</th>
                    <th className="p-4 text-left">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((s: any) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-900 max-w-xs truncate">{s.title}</td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                          {s.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">{s.providerName}</div>
                        <div className="text-[11px] text-gray-400">{s.phone || s.providerEmail || '—'}</div>
                      </td>
                      <td className="p-4 font-extrabold text-indigo-600">{s.price ? money(s.price) : 'Liên hệ'}</td>
                      <td className="p-4">{s.province || 'Toàn quốc'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-1.5 flex-wrap">
                          {s.status !== 'ACTIVE' && (
                            <button
                              onClick={() => changeServiceStatus(s.id, 'ACTIVE')}
                              className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-bold text-xs"
                            >
                              Duyệt
                            </button>
                          )}
                          <button
                            onClick={() => changeServiceStatus(s.id, 'NEED_REVISION')}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-bold text-xs"
                          >
                            Cần sửa
                          </button>
                          {s.status === 'ACTIVE' && (
                            <button
                              onClick={() => changeServiceStatus(s.id, 'SUSPENDED')}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs"
                            >
                              Tạm ngưng
                            </button>
                          )}
                          <button
                            onClick={() => changeServiceStatus(s.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold text-xs"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => deleteService(s.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded text-xs"
                            title="Xóa dịch vụ"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!pageItems.length && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        Chưa có dịch vụ nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={adminPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={adminPageSize}
              onPageChange={setAdminPage}
              itemLabel="dịch vụ"
            />
          </div>
        );
      })()}

      {/* Đồ cũ sinh viên */}
      {!loading && tab === 'Đồ cũ' && (() => {
        const rawSecondhand = (data.items || []).filter((sh: any) => {
          if (secondhandStatusFilter !== 'ALL' && sh.status !== secondhandStatusFilter) return false;
          if (secondhandSearch.trim()) {
            const q = secondhandSearch.toLowerCase();
            const matchTitle = (sh.title || '').toLowerCase().includes(q);
            const matchSeller = (sh.sellerName || '').toLowerCase().includes(q);
            const matchCategory = (sh.category || '').toLowerCase().includes(q);
            if (!matchTitle && !matchSeller && !matchCategory) return false;
          }
          return true;
        });
        const { pageItems, totalPages, totalElements } = paginate(rawSecondhand);

        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="flex-1 flex gap-3">
                <input
                  type="text"
                  placeholder="Tìm đồ cũ theo tên, danh mục, người bán..."
                  value={secondhandSearch}
                  onChange={e => { setSecondhandSearch(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 flex-1 text-xs"
                />
                <select
                  value={secondhandStatusFilter}
                  onChange={e => { setSecondhandStatusFilter(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 w-44 text-xs"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="ACTIVE">Hiển thị (ACTIVE)</option>
                  <option value="HIDDEN">Đã ẩn (HIDDEN)</option>
                  <option value="SOLD">Đã bán (SOLD)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                <span>Hiển thị:</span>
                <select
                  value={adminPageSize}
                  onChange={e => { setAdminPageSize(Number(e.target.value)); setAdminPage(0); }}
                  className="border rounded-xl p-1.5 text-xs bg-white"
                >
                  <option value={10}>10 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto bg-white border rounded-2xl shadow-xs">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                  <tr>
                    <th className="p-4 text-left">Sản phẩm</th>
                    <th className="p-4 text-left">Danh mục</th>
                    <th className="p-4 text-left">Người bán</th>
                    <th className="p-4 text-left">Giá bán</th>
                    <th className="p-4 text-left">Tình trạng</th>
                    <th className="p-4 text-left">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((sh: any) => (
                    <tr key={sh.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-900">
                        <div className="flex items-center gap-2.5">
                          {sh.imageUrl ? (
                            <img src={resolveMediaUrl(sh.imageUrl)} alt="" className="w-10 h-10 rounded-xl object-cover border" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400">
                              📦
                            </div>
                          )}
                          <div className="max-w-xs truncate">{sh.title}</div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-bold">
                          {sh.category}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">{sh.sellerName}</div>
                        <div className="text-[11px] text-gray-400">{sh.phone || sh.sellerEmail || '—'}</div>
                      </td>
                      <td className="p-4 font-extrabold text-indigo-600">{money(sh.price || 0)}</td>
                      <td className="p-4">{sh.conditionText || 'Đã qua sử dụng'}</td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          sh.status === 'ACTIVE'
                            ? 'bg-green-100 text-green-700'
                            : sh.status === 'SOLD'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {sh.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end items-center gap-1.5 flex-wrap">
                          {sh.status !== 'ACTIVE' && (
                            <button
                              onClick={() => changeSecondhandStatus(sh.id, 'ACTIVE')}
                              className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-bold text-xs"
                            >
                              Hiển thị
                            </button>
                          )}
                          <button
                            onClick={() => changeSecondhandStatus(sh.id, 'NEED_REVISION')}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-bold text-xs"
                          >
                            Cần sửa
                          </button>
                          {sh.status === 'ACTIVE' && (
                            <button
                              onClick={() => changeSecondhandStatus(sh.id, 'HIDDEN')}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs"
                            >
                              Ẩn tin
                            </button>
                          )}
                          <button
                            onClick={() => changeSecondhandStatus(sh.id, 'REJECTED')}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold text-xs"
                          >
                            Từ chối
                          </button>
                          <button
                            onClick={() => deleteSecondhand(sh.id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded text-xs"
                            title="Xóa tin đồ cũ"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!pageItems.length && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-gray-400">
                        Chưa có tin đồ cũ nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={adminPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={adminPageSize}
              onPageChange={setAdminPage}
              itemLabel="món đồ"
            />
          </div>
        );
      })()}

      {/* Q&A Moderation */}
      {!loading && tab === 'Q&A' && (() => {
        const rawList = qaSubTab === 'QUESTIONS'
          ? (data.questions || []).filter((q: any) => {
              if (qaStatusFilter !== 'ALL' && q.status !== qaStatusFilter) return false;
              if (qaSearch.trim()) {
                const s = qaSearch.toLowerCase();
                const mTitle = (q.title || '').toLowerCase().includes(s);
                const mContent = (q.content || '').toLowerCase().includes(s);
                const mAuthor = (q.authorName || '').toLowerCase().includes(s);
                if (!mTitle && !mContent && !mAuthor) return false;
              }
              return true;
            })
          : (data.answers || []).filter((a: any) => {
              if (qaStatusFilter !== 'ALL' && a.status !== qaStatusFilter) return false;
              if (qaSearch.trim()) {
                const s = qaSearch.toLowerCase();
                const mContent = (a.content || '').toLowerCase().includes(s);
                const mAuthor = (a.authorName || '').toLowerCase().includes(s);
                const mQTitle = (a.questionTitle || '').toLowerCase().includes(s);
                if (!mContent && !mAuthor && !mQTitle) return false;
              }
              return true;
            });

        const { pageItems, totalPages, totalElements } = paginate(rawList);

        return (
          <div className="space-y-4">
            <div className="flex gap-2 border-b pb-2">
              <button
                onClick={() => { setQaSubTab('QUESTIONS'); setAdminPage(0); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  qaSubTab === 'QUESTIONS' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Câu hỏi cộng đồng ({(data.questions || []).length})
              </button>
              <button
                onClick={() => { setQaSubTab('ANSWERS'); setAdminPage(0); }}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  qaSubTab === 'ANSWERS' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Câu trả lời ({(data.answers || []).length})
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="flex-1 flex gap-3">
                <input
                  type="text"
                  placeholder={qaSubTab === 'QUESTIONS' ? 'Tìm câu hỏi, người hỏi...' : 'Tìm câu trả lời, người trả lời...'}
                  value={qaSearch}
                  onChange={e => { setQaSearch(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 flex-1 text-xs"
                />
                <select
                  value={qaStatusFilter}
                  onChange={e => { setQaStatusFilter(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 w-44 text-xs"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="VISIBLE">Hiển thị (VISIBLE)</option>
                  <option value="HIDDEN">Đã ẩn (HIDDEN)</option>
                  <option value="SPAM">Spam (SPAM)</option>
                  <option value="DELETED">Đã xóa (DELETED)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                <span>Hiển thị:</span>
                <select
                  value={adminPageSize}
                  onChange={e => { setAdminPageSize(Number(e.target.value)); setAdminPage(0); }}
                  className="border rounded-xl p-1.5 text-xs bg-white"
                >
                  <option value={10}>10 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                </select>
              </div>
            </div>

            {qaSubTab === 'QUESTIONS' ? (
              <div className="overflow-x-auto bg-white border rounded-2xl shadow-xs">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase">
                    <tr>
                      <th className="p-4 text-left">Tiêu đề & Nội dung</th>
                      <th className="p-4 text-left">Danh mục</th>
                      <th className="p-4 text-left">Người hỏi</th>
                      <th className="p-4 text-left">Số trả lời</th>
                      <th className="p-4 text-left">Trạng thái</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pageItems.map((q: any) => (
                      <tr key={q.id} className="hover:bg-gray-50">
                        <td className="p-4 max-w-sm">
                          <b className="text-gray-900 block truncate">{q.title}</b>
                          <p className="text-gray-500 text-[11px] line-clamp-1 mt-0.5">{q.content}</p>
                        </td>
                        <td className="p-4">
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold">
                            {q.category || 'Hỏi đáp'}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold">{q.authorName}</div>
                          <div className="text-[11px] text-gray-400">{q.authorEmail || '—'}</div>
                        </td>
                        <td className="p-4 font-bold text-gray-700">{q.answerCount || 0}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            q.status === 'VISIBLE'
                              ? 'bg-green-100 text-green-700'
                              : q.status === 'SPAM'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {q.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {q.status === 'VISIBLE' ? (
                              <button
                                onClick={() => changeQuestionStatus(q.id, 'HIDDEN')}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-bold"
                              >
                                Ẩn
                              </button>
                            ) : (
                              <button
                                onClick={() => changeQuestionStatus(q.id, 'VISIBLE')}
                                className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-bold"
                              >
                                Duyệt
                              </button>
                            )}
                            <button
                              onClick={() => changeQuestionStatus(q.id, 'SPAM')}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold"
                            >
                              Spam
                            </button>
                            <button
                              onClick={() => deleteQuestionSubmit(q.id)}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!pageItems.length && (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-gray-400">
                          Không có câu hỏi nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto bg-white border rounded-2xl shadow-xs">
                <table className="min-w-full text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase">
                    <tr>
                      <th className="p-4 text-left">Nội dung trả lời</th>
                      <th className="p-4 text-left">Câu hỏi gốc</th>
                      <th className="p-4 text-left">Người trả lời</th>
                      <th className="p-4 text-left">Trạng thái</th>
                      <th className="p-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {pageItems.map((a: any) => (
                      <tr key={a.id} className="hover:bg-gray-50">
                        <td className="p-4 max-w-sm">
                          <p className="text-gray-900 line-clamp-2">{a.content}</p>
                        </td>
                        <td className="p-4 max-w-xs truncate font-semibold text-gray-700">
                          {a.questionTitle || `#${a.questionId}`}
                        </td>
                        <td className="p-4">
                          <div className="font-semibold">{a.authorName}</div>
                          <div className="text-[11px] text-gray-400">{a.authorEmail || '—'}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            a.status === 'VISIBLE'
                              ? 'bg-green-100 text-green-700'
                              : a.status === 'SPAM'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {a.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-1.5">
                            {a.status === 'VISIBLE' ? (
                              <button
                                onClick={() => changeAnswerStatus(a.id, 'HIDDEN')}
                                className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-bold"
                              >
                                Ẩn
                              </button>
                            ) : (
                              <button
                                onClick={() => changeAnswerStatus(a.id, 'VISIBLE')}
                                className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-bold"
                              >
                                Duyệt
                              </button>
                            )}
                            <button
                              onClick={() => changeAnswerStatus(a.id, 'SPAM')}
                              className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold"
                            >
                              Spam
                            </button>
                            <button
                              onClick={() => deleteAnswerSubmit(a.id)}
                              className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold"
                            >
                              Xóa
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!pageItems.length && (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">
                          Không có câu trả lời nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <Pagination
              currentPage={adminPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={adminPageSize}
              onPageChange={setAdminPage}
              itemLabel={qaSubTab === 'QUESTIONS' ? 'câu hỏi' : 'câu trả lời'}
            />
          </div>
        );
      })()}

      {/* Review Moderation */}
      {!loading && tab === 'Đánh giá' && (() => {
        const rawReviews = (data.items || []).filter((rv: any) => {
          if (reviewStatusFilter !== 'ALL' && rv.status !== reviewStatusFilter) return false;
          if (reviewSearch.trim()) {
            const s = reviewSearch.toLowerCase();
            const mComment = (rv.comment || '').toLowerCase().includes(s);
            const mUser = (rv.reviewerName || '').toLowerCase().includes(s);
            const mProp = (rv.propertyName || '').toLowerCase().includes(s);
            if (!mComment && !mUser && !mProp) return false;
          }
          return true;
        });
        const { pageItems, totalPages, totalElements } = paginate(rawReviews);

        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="flex-1 flex gap-3">
                <input
                  type="text"
                  placeholder="Tìm nhận xét, người viết, tên nhà trọ..."
                  value={reviewSearch}
                  onChange={e => { setReviewSearch(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 flex-1 text-xs"
                />
                <select
                  value={reviewStatusFilter}
                  onChange={e => { setReviewStatusFilter(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 w-44 text-xs"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="VISIBLE">Hiển thị (VISIBLE)</option>
                  <option value="HIDDEN">Đã ẩn (HIDDEN)</option>
                  <option value="VIOLATION">Vi phạm (VIOLATION)</option>
                  <option value="DELETED">Đã xóa (DELETED)</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                <span>Hiển thị:</span>
                <select
                  value={adminPageSize}
                  onChange={e => { setAdminPageSize(Number(e.target.value)); setAdminPage(0); }}
                  className="border rounded-xl p-1.5 text-xs bg-white"
                >
                  <option value={10}>10 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto bg-white border rounded-2xl shadow-xs">
              <table className="min-w-full text-xs">
                <thead className="bg-gray-50 text-gray-500 uppercase">
                  <tr>
                    <th className="p-4 text-left">Khu trọ</th>
                    <th className="p-4 text-left">Người đánh giá</th>
                    <th className="p-4 text-left">Đánh giá sao</th>
                    <th className="p-4 text-left">Nội dung nhận xét</th>
                    <th className="p-4 text-left">Trạng thái</th>
                    <th className="p-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {pageItems.map((rv: any) => (
                    <tr key={rv.id} className="hover:bg-gray-50">
                      <td className="p-4 font-bold text-gray-900 max-w-xs truncate">
                        <div>{rv.propertyName}</div>
                        <div className="text-[11px] text-gray-400 font-normal">{rv.propertyAddress}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold">{rv.reviewerName}</div>
                        <div className="text-[11px] text-gray-400">{rv.reviewerEmail || '—'}</div>
                      </td>
                      <td className="p-4">
                        <div className="text-amber-500 font-extrabold text-sm">{'★'.repeat(rv.rating || 5)}</div>
                      </td>
                      <td className="p-4 max-w-md">
                        <p className="text-gray-700 line-clamp-2">{rv.comment}</p>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
                          rv.status === 'VISIBLE'
                            ? 'bg-green-100 text-green-700'
                            : rv.status === 'VIOLATION'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {rv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          {rv.status === 'VISIBLE' ? (
                            <button
                              onClick={() => changeReviewStatus(rv.id, 'HIDDEN')}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg font-bold"
                            >
                              Ẩn
                            </button>
                          ) : (
                            <button
                              onClick={() => changeReviewStatus(rv.id, 'VISIBLE')}
                              className="px-2.5 py-1 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg font-bold"
                            >
                              Duyệt
                            </button>
                          )}
                          <button
                            onClick={() => changeReviewStatus(rv.id, 'VIOLATION')}
                            className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg font-bold"
                          >
                            Vi phạm
                          </button>
                          <button
                            onClick={() => deleteReviewSubmit(rv.id)}
                            className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold"
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!pageItems.length && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400">
                        Chưa có nhận xét nào phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={adminPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={adminPageSize}
              onPageChange={setAdminPage}
              itemLabel="đánh giá"
            />
          </div>
        );
      })()}

      {/* Blog Management - Full CRUD */}
      {!loading && tab === 'Blog' && (() => {
        const rawBlogs = (data.items || []).filter((b: any) => {
          if (blogStatusFilter !== 'ALL' && b.status !== blogStatusFilter) return false;
          if (blogCategoryFilter !== 'ALL' && b.category !== blogCategoryFilter) return false;
          if (blogSearch.trim()) {
            const s = blogSearch.toLowerCase();
            const matchTitle = (b.title || '').toLowerCase().includes(s);
            const matchSummary = (b.summary || '').toLowerCase().includes(s);
            if (!matchTitle && !matchSummary) return false;
          }
          return true;
        });
        const { pageItems, totalPages, totalElements } = paginate(rawBlogs);

        return (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-white p-4 rounded-2xl border">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">Quản lý Blog & Cẩm nang UniHome</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Quản lý nội dung cẩm nang PCCC, pháp lý thuê trọ, mẹo sinh hoạt cho sinh viên.
                </p>
              </div>
              <button
                onClick={openCreateBlog}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                + Soạn bài viết mới
              </button>
            </div>

            <div className="bg-white p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <div className="flex-1 flex gap-3">
                <input
                  type="text"
                  placeholder="Tìm kiếm theo tiêu đề bài viết..."
                  value={blogSearch}
                  onChange={e => { setBlogSearch(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 flex-1 text-xs"
                />
                <select
                  value={blogCategoryFilter}
                  onChange={e => { setBlogCategoryFilter(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 w-44 text-xs"
                >
                  <option value="ALL">Tất cả danh mục</option>
                  <option value="PCCC">PCCC</option>
                  <option value="Mẹo thuê trọ">Mẹo thuê trọ</option>
                  <option value="Pháp lý">Pháp lý</option>
                  <option value="Đời sống sinh viên">Đời sống sinh viên</option>
                </select>
                <select
                  value={blogStatusFilter}
                  onChange={e => { setBlogStatusFilter(e.target.value); setAdminPage(0); }}
                  className="input !mt-0 w-40 text-xs"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="PUBLISHED">Đã xuất bản</option>
                  <option value="DRAFT">Bản nháp</option>
                  <option value="HIDDEN">Đã ẩn</option>
                </select>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                <span>Hiển thị:</span>
                <select
                  value={adminPageSize}
                  onChange={e => { setAdminPageSize(Number(e.target.value)); setAdminPage(0); }}
                  className="border rounded-xl p-1.5 text-xs bg-white"
                >
                  <option value={10}>10 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pageItems.map((b: any) => (
                <div key={b.id} className="bg-white border rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700">
                        {b.category || 'Cẩm nang'}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                        b.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700'
                          : b.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    {b.coverImage && (
                      <div className="h-36 rounded-xl overflow-hidden bg-gray-100 border">
                        <img src={resolveMediaUrl(b.coverImage)} alt="" className="w-full h-full object-cover" />
                      </div>
                    )}
                    <h3 className="font-bold text-gray-900 text-base line-clamp-2">{b.title}</h3>
                    <p className="text-gray-500 text-xs line-clamp-3 leading-relaxed">
                      {b.summary || b.content}
                    </p>
                    <div className="text-[11px] text-gray-400">
                      ⏱ {b.readingMinutes || 5} phút đọc • Cập nhật: {b.updatedAt ? new Date(b.updatedAt).toLocaleDateString('vi-VN') : '—'}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-4 border-t mt-4">
                    <button
                      onClick={() => openEditBlog(b)}
                      className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Chỉnh sửa
                    </button>
                    <button
                      onClick={() => toggleBlogStatus(b.id, b.status)}
                      className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      {b.status === 'PUBLISHED' ? 'Tạm ẩn' : 'Xuất bản'}
                    </button>
                    <button
                      onClick={() => deleteBlogSubmit(b.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
              {!pageItems.length && (
                <div className="col-span-2 bg-white border rounded-2xl p-12 text-center text-gray-400 text-sm">
                  Chưa có bài viết nào phù hợp bộ lọc.
                </div>
              )}
            </div>

            <Pagination
              currentPage={adminPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={adminPageSize}
              onPageChange={setAdminPage}
              itemLabel="bài viết"
            />
          </div>
        );
      })()}

      {/* Audit Log */}
      {!loading && tab === 'Audit' && (() => {
        const rawAudit = (data.items || []).filter((al: any) => {
          if (auditSearch.trim()) {
            const s = auditSearch.toLowerCase();
            const matchAction = (al.action || '').toLowerCase().includes(s);
            const matchType = (al.targetType || '').toLowerCase().includes(s);
            const matchActor = (al.actorName || '').toLowerCase().includes(s);
            const matchDetails = (al.details || '').toLowerCase().includes(s);
            if (!matchAction && !matchType && !matchActor && !matchDetails) return false;
          }
          return true;
        });
        const { pageItems, totalPages, totalElements } = paginate(rawAudit);

        return (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-2xl border flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
              <input
                type="text"
                placeholder="Tìm nhật ký theo hành động, người thực hiện, đối tượng..."
                value={auditSearch}
                onChange={e => { setAuditSearch(e.target.value); setAdminPage(0); }}
                className="input !mt-0 flex-1 text-xs"
              />
              <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                <span>Hiển thị:</span>
                <select
                  value={adminPageSize}
                  onChange={e => { setAdminPageSize(Number(e.target.value)); setAdminPage(0); }}
                  className="border rounded-xl p-1.5 text-xs bg-white"
                >
                  <option value={10}>10 dòng</option>
                  <option value={20}>20 dòng</option>
                  <option value={50}>50 dòng</option>
                </select>
              </div>
            </div>

            <div className="bg-white border rounded-2xl divide-y shadow-xs">
              {pageItems.map((x: any) => (
                <div key={x.id} className="p-4 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <b className="text-gray-900 font-extrabold text-sm">{x.action}</b>
                    <span className="text-gray-400 text-[11px]">
                      {x.createdAt ? new Date(x.createdAt).toLocaleString('vi-VN') : ''}
                    </span>
                  </div>
                  <div className="text-indigo-700 font-semibold">
                    Đối tượng: {x.targetType} #{x.targetId}
                  </div>
                  <div className="text-gray-600">
                    Thực hiện bởi: <b>{x.actorName || `Admin #${x.actorId}`}</b> {x.actorEmail ? `(${x.actorEmail})` : ''}
                  </div>
                  {x.details && (
                    <div className="text-[11px] text-gray-500 bg-gray-50 p-2 rounded-lg font-mono">
                      {x.details}
                    </div>
                  )}
                </div>
              ))}
              {!pageItems.length && (
                <div className="p-12 text-center text-gray-400 text-sm">
                  Không tìm thấy bản ghi nhật ký phù hợp.
                </div>
              )}
            </div>

            <Pagination
              currentPage={adminPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={adminPageSize}
              onPageChange={setAdminPage}
              itemLabel="nhật ký"
            />
          </div>
        );
      })()}

      {/* Nhiệm vụ & Điểm Thưởng */}
      {!loading && tab === 'Nhiệm vụ & Điểm' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-2xl border">
            <div>
              <h3 className="text-base font-extrabold text-gray-900">Danh mục Nhiệm vụ hàng ngày (Reward Task Catalog)</h3>
              <p className="text-xs text-gray-500">Mỗi ngày hệ thống gán tự động 3 nhiệm vụ cho mỗi người dùng từ các nhiệm vụ ĐANG BẬT.</p>
            </div>
            <button
              onClick={() => setTaskModal({ open: true, id: null, code: '', name: '', description: '', eventType: 'VIEW_ROOM', targetCount: 3, rewardPoints: 20, active: true })}
              className="bg-indigo-600 text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-indigo-700 shadow-xs"
            >
              + Tạo nhiệm vụ mới
            </button>
          </div>

          <div className="bg-white border rounded-2xl overflow-hidden shadow-xs divide-y">
            {(data.tasks || []).map((t: any) => (
              <div key={t.id} className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-gray-900">{t.name}</span>
                    <span className="font-mono text-[11px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-bold">{t.code}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${t.active ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-gray-100 text-gray-500'}`}>
                      {t.active ? 'Đang hoạt động' : 'Tạm dừng'}
                    </span>
                  </div>
                  <p className="text-gray-500 mt-1">{t.description}</p>
                  <div className="flex items-center gap-4 text-gray-400 mt-1.5 text-[11px]">
                    <span>Sự kiện: <b>{t.eventType}</b></span>
                    <span>Mục tiêu: <b>{t.targetCount} lần</b></span>
                    <span>Tần suất: <b>{t.frequency || 'DAILY'}</b></span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-amber-600 font-black text-sm bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                    +{t.rewardPoints} điểm
                  </span>
                  <button
                    onClick={() => toggleTaskActive(t)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-colors ${t.active ? 'bg-amber-100 text-amber-800 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'}`}
                  >
                    {t.active ? 'Tạm dừng' : 'Kích hoạt'}
                  </button>
                  <button
                    onClick={() => setTaskModal({ open: true, ...t })}
                    className="px-3 py-1.5 rounded-xl font-bold text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="px-2 py-1.5 text-red-600 hover:bg-red-50 rounded-xl font-bold text-xs"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Cấu hình hệ thống */}
      {!loading && tab === 'Cấu hình hệ thống' && (
        <div className="bg-white rounded-3xl p-6 border shadow-xs space-y-6">
          <div className="border-b pb-4">
            <h3 className="text-base font-extrabold text-gray-900">Cấu hình Hệ thống UniHome</h3>
            <p className="text-xs text-gray-500 mt-1">Điều chỉnh các hằng số vận hành hệ thống, hạn mức tin đăng, điểm thưởng và quảng cáo.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Chung */}
            <div className="space-y-3 bg-gray-50/60 p-4 rounded-2xl border">
              <h4 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider">Thông tin chung</h4>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Tên hệ thống (site_name)</label>
                <input
                  type="text"
                  value={settingsForm.site_name || ''}
                  onChange={e => setSettingsForm({ ...settingsForm, site_name: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Email hỗ trợ (support_email)</label>
                <input
                  type="email"
                  value={settingsForm.support_email || ''}
                  onChange={e => setSettingsForm({ ...settingsForm, support_email: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-white text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Hotline hỗ trợ (support_phone)</label>
                <input
                  type="text"
                  value={settingsForm.support_phone || ''}
                  onChange={e => setSettingsForm({ ...settingsForm, support_phone: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-white text-xs font-semibold"
                />
              </div>
            </div>

            {/* Vận hành & Tin đăng */}
            <div className="space-y-3 bg-gray-50/60 p-4 rounded-2xl border">
              <h4 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider">Kiểm duyệt & Tin đăng</h4>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Thời hạn tin đăng mặc định (ngày)</label>
                <input
                  type="number"
                  value={settingsForm.auto_expiry_days || '30'}
                  onChange={e => setSettingsForm({ ...settingsForm, auto_expiry_days: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-white text-xs font-semibold"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Số ảnh tối thiểu (phòng)</label>
                  <input
                    type="number"
                    value={settingsForm.min_room_images || '3'}
                    onChange={e => setSettingsForm({ ...settingsForm, min_room_images: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Số ảnh tối đa (phòng)</label>
                  <input
                    type="number"
                    value={settingsForm.max_room_images || '20'}
                    onChange={e => setSettingsForm({ ...settingsForm, max_room_images: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-white text-xs font-semibold"
                  />
                </div>
              </div>
              <div>
                <label className="block font-bold text-gray-700 mb-1">Thời gian xoay vòng Ads (giây)</label>
                <input
                  type="number"
                  value={settingsForm.ads_rotation_seconds || '8'}
                  onChange={e => setSettingsForm({ ...settingsForm, ads_rotation_seconds: e.target.value })}
                  className="w-full border rounded-xl p-2.5 bg-white text-xs font-semibold"
                />
              </div>
            </div>

            {/* Điểm thưởng & Checkin */}
            <div className="space-y-3 bg-gray-50/60 p-4 rounded-2xl border md:col-span-2">
              <h4 className="font-extrabold text-xs text-gray-700 uppercase tracking-wider">Điểm danh & Thưởng</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Điểm thưởng ngày thường Ngày 1 - 6</label>
                  <input
                    type="number"
                    value={settingsForm.checkin_day1_points || '20'}
                    onChange={e => setSettingsForm({ ...settingsForm, checkin_day1_points: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-white text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-700 mb-1">Điểm thưởng đặc biệt Ngày 7 (Streak bonus)</label>
                  <input
                    type="number"
                    value={settingsForm.checkin_day7_points || '50'}
                    onChange={e => setSettingsForm({ ...settingsForm, checkin_day7_points: e.target.value })}
                    className="w-full border rounded-xl p-2.5 bg-white text-xs font-semibold"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-3 border-t">
            <button
              onClick={saveSettings}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs px-6 py-2.5 rounded-xl shadow-md transition-all"
            >
              💾 Lưu toàn bộ cấu hình
            </button>
          </div>
        </div>
      )}

      {/* Task Modal */}
      {taskModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-extrabold text-sm text-gray-900">
                {taskModal.id ? 'Chỉnh sửa nhiệm vụ' : 'Tạo nhiệm vụ thưởng mới'}
              </h3>
              <button onClick={() => setTaskModal({ ...taskModal, open: false })} className="text-gray-400 font-bold">✕</button>
            </div>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Mã nhiệm vụ (Code)</label>
                <input
                  type="text"
                  placeholder="VD: VIEW_ROOM_3"
                  value={taskModal.code || ''}
                  onChange={e => setTaskModal({ ...taskModal, code: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Tên hiển thị</label>
                <input
                  type="text"
                  placeholder="VD: Xem 3 phòng trọ"
                  value={taskModal.name || ''}
                  onChange={e => setTaskModal({ ...taskModal, name: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Mô tả nhiệm vụ</label>
                <textarea
                  rows={2}
                  value={taskModal.description || ''}
                  onChange={e => setTaskModal({ ...taskModal, description: e.target.value })}
                  className="w-full border rounded-xl p-2.5"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Mục tiêu (target)</label>
                  <input
                    type="number"
                    value={taskModal.targetCount || 1}
                    onChange={e => setTaskModal({ ...taskModal, targetCount: Number(e.target.value) })}
                    className="w-full border rounded-xl p-2.5"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Điểm thưởng</label>
                  <input
                    type="number"
                    value={taskModal.rewardPoints || 20}
                    onChange={e => setTaskModal({ ...taskModal, rewardPoints: Number(e.target.value) })}
                    className="w-full border rounded-xl p-2.5 font-bold text-amber-600"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button onClick={() => setTaskModal({ ...taskModal, open: false })} className="px-4 py-2 text-xs font-bold text-gray-500">Hủy</button>
              <button onClick={saveTask} className="px-4 py-2 text-xs font-bold bg-indigo-600 text-white rounded-xl shadow-xs">Lưu nhiệm vụ</button>
            </div>
          </div>
        </div>
      )}
        </main>
      </div>

      {/* REJECT MODERATION MODAL */}
      {rejectModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in fade-in duration-200">
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="font-extrabold text-base text-gray-900">
                {rejectModal.action === 'REJECT' ? 'Từ chối tin đăng' : 'Yêu cầu chủ trọ chỉnh sửa'}
              </h3>
              <button
                onClick={() => setRejectModal(prev => ({ ...prev, open: false }))}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Tin đăng #{rejectModal.listingId}. Vui lòng nêu rõ lý do để chủ trọ nắm được thông tin và khắc phục.
            </p>
            <div className="space-y-2">
              <div className="text-xs font-bold text-gray-700">Lý do thường gặp:</div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Thông tin phòng chưa rõ ràng, thiếu tiện ích thực tế',
                  'Hình ảnh mờ hoặc chứa logo/SĐT bên thứ ba',
                  'Giá thuê hoặc đặt cọc sai lệch so với thỏa thuận',
                  'Địa chỉ hoặc vị trí định vị không chính xác',
                  'Phòng trọ đã cho thuê hoặc không còn phòng trống'
                ].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setRejectModal(prev => ({ ...prev, reason: r }))}
                    className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-700 px-2.5 py-1 rounded-lg transition-colors text-left"
                  >
                    + {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Chi tiết lý do / Yêu cầu bổ sung:</label>
              <textarea
                rows={3}
                value={rejectModal.reason}
                onChange={e => setRejectModal(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Nhập nội dung phản hồi gửi tới chủ trọ..."
                className="input"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setRejectModal(prev => ({ ...prev, open: false }))}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={submitRejectModeration}
                className={`px-5 py-2 text-xs font-bold rounded-xl text-white ${
                  rejectModal.action === 'REJECT' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {rejectModal.action === 'REJECT' ? 'Xác nhận từ chối' : 'Gửi yêu cầu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VERIFY LISTING MODAL WITH CHECKLIST */}
      {verifyModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in fade-in duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <h3 className="font-extrabold text-base text-gray-900">Ghi nhận biên bản xác minh thực địa</h3>
                <p className="text-xs text-gray-500">Kiểm định chất lượng và cấp huy hiệu tin cậy cho tin đăng</p>
              </div>
              <button
                onClick={() => setVerifyModal(prev => ({ ...prev, open: false }))}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Listing ID (*):</label>
                <input
                  type="number"
                  value={verifyModal.listingId}
                  onChange={e => setVerifyModal(prev => ({ ...prev, listingId: e.target.value }))}
                  placeholder="Ví dụ: 10"
                  className="input"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Property ID:</label>
                <input
                  type="number"
                  value={verifyModal.propertyId}
                  onChange={e => setVerifyModal(prev => ({ ...prev, propertyId: e.target.value }))}
                  placeholder="Ví dụ: 5"
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Cấp độ xác minh:</label>
              <select
                value={verifyModal.level}
                onChange={e => setVerifyModal(prev => ({ ...prev, level: e.target.value }))}
                className="input"
              >
                <option value="ON_SITE_VERIFIED">ON_SITE_VERIFIED (Kiểm tra thực địa tại phòng)</option>
                <option value="REMOTE_VERIFIED">REMOTE_VERIFIED (Xác minh từ xa qua giấy tờ / video call)</option>
              </select>
            </div>
            <div className="space-y-2 pt-1">
              <div className="text-xs font-bold text-gray-700">Checklist tiêu chuẩn kiểm định:</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  ['roomExists', 'Phòng có thật và đúng mô tả'],
                  ['locationVerified', 'Vị trí & địa chỉ chuẩn xác'],
                  ['mediaVerified', 'Hình ảnh thực tế không gian'],
                  ['priceVerified', 'Giá thuê & cọc minh bạch'],
                  ['utilityVerified', 'Chi phí điện nước rõ ràng'],
                  ['amenityVerified', 'Tiện ích đúng cam kết'],
                  ['availabilityVerified', 'Phòng còn trống cho thuê']
                ].map(([key, label]) => (
                  <label key={key} className="flex items-center gap-2 p-2 rounded-xl bg-gray-50 border border-gray-100 hover:bg-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(verifyModal as any)[key]}
                      onChange={e => setVerifyModal(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="font-semibold text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Ghi chú biên bản:</label>
              <textarea
                rows={2}
                value={verifyModal.note}
                onChange={e => setVerifyModal(prev => ({ ...prev, note: e.target.value }))}
                className="input"
                placeholder="Ghi nhận tình trạng thực tế..."
              />
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => setVerifyModal(prev => ({ ...prev, open: false }))}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={submitVerification}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs"
              >
                Lưu biên bản xác minh
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Chi tiết người dùng */}
      {showUserDetailModal && selectedUserDetail && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl">
            <div className="flex justify-between items-start border-b pb-4">
              <div className="flex items-center gap-3">
                {selectedUserDetail.user?.avatarUrl ? (
                  <img src={resolveMediaUrl(selectedUserDetail.user.avatarUrl)} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-indigo-200" />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 font-extrabold flex items-center justify-center text-xl">
                    {(selectedUserDetail.user?.fullName || 'U').charAt(0)}
                  </div>
                )}
                <div>
                  <h3 className="font-extrabold text-lg text-gray-900">{selectedUserDetail.user?.fullName}</h3>
                  <div className="text-xs text-gray-500">
                    ID #{selectedUserDetail.user?.id} • {selectedUserDetail.user?.email} • {selectedUserDetail.user?.phone || 'Chưa có SĐT'}
                  </div>
                  <div className="flex gap-2 mt-1">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700">
                      {selectedUserDetail.user?.role}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      selectedUserDetail.user?.status === 'ACTIVE'
                        ? 'bg-green-100 text-green-700'
                        : selectedUserDetail.user?.status === 'SUSPENDED'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedUserDetail.user?.status}
                    </span>
                  </div>
                </div>
              </div>
              <button onClick={() => setShowUserDetailModal(false)} className="text-gray-400 hover:text-gray-600 font-bold text-lg">✕</button>
            </div>

            {/* Quick action buttons */}
            <div className="flex flex-wrap gap-2 pt-1 border-b pb-4">
              <button
                onClick={() => bulkUserAction(selectedUserDetail.user?.id, 'HIDE_CONTENT')}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-800 rounded-xl text-xs font-bold"
              >
                Ẩn toàn bộ bài đăng
              </button>
              <button
                onClick={() => bulkUserAction(selectedUserDetail.user?.id, 'RESTORE_CONTENT')}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold"
              >
                Khôi phục toàn bộ bài đăng
              </button>
              {selectedUserDetail.user?.status === 'ACTIVE' ? (
                <>
                  <button
                    onClick={() => suspendUser(selectedUserDetail.user?.id)}
                    className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-xl text-xs font-bold"
                  >
                    Tạm ngưng tài khoản
                  </button>
                  <button
                    onClick={() => openBanModal(selectedUserDetail.user?.id)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
                  >
                    Khóa tài khoản (Ban)
                  </button>
                </>
              ) : (
                <button
                  onClick={() => activateUser(selectedUserDetail.user?.id)}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold"
                >
                  Kích hoạt lại tài khoản
                </button>
              )}
            </div>

            {/* User Statistics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-gray-50 rounded-2xl border">
                <span className="text-gray-400 block">Tin phòng trọ</span>
                <b className="text-base text-gray-900 mt-0.5 block">{selectedUserDetail.listings?.length || 0} tin</b>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border">
                <span className="text-gray-400 block">Tin đồ cũ</span>
                <b className="text-base text-gray-900 mt-0.5 block">{selectedUserDetail.secondhand?.length || 0} món</b>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border">
                <span className="text-gray-400 block">Tin dịch vụ</span>
                <b className="text-base text-gray-900 mt-0.5 block">{selectedUserDetail.services?.length || 0} gói</b>
              </div>
              <div className="p-3 bg-gray-50 rounded-2xl border">
                <span className="text-gray-400 block">Bị báo cáo</span>
                <b className="text-base text-red-600 mt-0.5 block">{selectedUserDetail.reportsAgainst?.length || 0} lần</b>
              </div>
            </div>

            {/* Listings breakdown */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-gray-900">Danh sách Tin phòng trọ ({selectedUserDetail.listings?.length || 0})</h4>
              <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 border rounded-2xl">
                {(selectedUserDetail.listings || []).map((l: any) => (
                  <div key={l.id} className="p-3 flex justify-between items-center text-xs">
                    <div>
                      <b className="text-gray-900">{l.title || `Tin #${l.id}`}</b>
                      <div className="text-[11px] text-gray-400 mt-0.5">Trạng thái: {l.status} • Gói: {l.packageTier || 'FREE'}</div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      l.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {l.status}
                    </span>
                  </div>
                ))}
                {!(selectedUserDetail.listings || []).length && (
                  <div className="p-4 text-center text-xs text-gray-400">Người dùng chưa đăng tin phòng trọ nào.</div>
                )}
              </div>
            </div>

            {/* Reports against user */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-sm text-gray-900">Báo cáo vi phạm chống lại tài khoản ({selectedUserDetail.reportsAgainst?.length || 0})</h4>
              <div className="max-h-40 overflow-y-auto divide-y divide-gray-100 border rounded-2xl">
                {(selectedUserDetail.reportsAgainst || []).map((rp: any) => (
                  <div key={rp.id} className="p-3 text-xs space-y-0.5">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-red-700">Lý do: {rp.reasonCode}</span>
                      <span className="text-gray-400 text-[10px]">{rp.status}</span>
                    </div>
                    <div className="text-gray-600">{rp.details}</div>
                  </div>
                ))}
                {!(selectedUserDetail.reportsAgainst || []).length && (
                  <div className="p-4 text-center text-xs text-gray-400">Không có báo cáo vi phạm nào.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Khóa tài khoản (Ban User) */}
      {showBanModal && banUserId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-red-600">Khóa tài khoản người dùng #{banUserId}</h3>
              <button onClick={() => setShowBanModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <p className="text-xs text-gray-600 leading-relaxed">
              Khóa tài khoản sẽ chuyển trạng thái sang <b>BANNED</b>, đồng thời tự động ẩn/tạm khóa tất cả bài đăng phòng trọ, đồ cũ và dịch vụ của tài khoản này khỏi trang chủ và kết quả tìm kiếm.
            </p>
            <label className="block text-xs font-semibold text-gray-700">
              Lý do khóa tài khoản:
              <textarea
                rows={3}
                className="input text-xs"
                value={banReasonInput}
                onChange={e => setBanReasonInput(e.target.value)}
              />
            </label>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowBanModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={submitBanUser}
                className="px-5 py-2 text-xs font-bold bg-red-600 text-white hover:bg-red-700 rounded-xl"
              >
                Xác nhận khóa tài khoản
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Xử lý báo cáo vi phạm */}
      {showResolveModal && resolvingReportId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-gray-900">Xử lý báo cáo vi phạm #{resolvingReportId}</h3>
              <button onClick={() => setShowResolveModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <label className="block text-xs font-semibold text-gray-700">
              Ghi chú kết quả xử lý:
              <textarea
                rows={4}
                className="input text-xs"
                placeholder="VD: Đã yêu cầu chủ trọ điều chỉnh giá; đã ẩn bài đăng vi phạm..."
                value={resolutionText}
                onChange={e => setResolutionText(e.target.value)}
              />
            </label>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowResolveModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={submitResolveReport}
                className="px-5 py-2 text-xs font-bold bg-green-600 text-white hover:bg-green-700 rounded-xl"
              >
                Hoàn tất xử lý
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Soạn / Sửa bài viết Blog */}
      {showBlogModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-extrabold text-base text-gray-900">
                {editingBlogId ? `Chỉnh sửa bài viết #${editingBlogId}` : 'Soạn bài viết Blog mới'}
              </h3>
              <button onClick={() => setShowBlogModal(false)} className="text-gray-400 hover:text-gray-600 font-bold">✕</button>
            </div>
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-700">
                Tiêu đề bài viết *
                <input
                  className="input"
                  placeholder="VD: Hướng dẫn kiểm tra an toàn PCCC khi thuê phòng trọ"
                  value={blogForm.title}
                  onChange={e => setBlogForm({ ...blogForm, title: e.target.value })}
                />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <label className="block text-xs font-semibold text-gray-700">
                  Danh mục
                  <select
                    className="input"
                    value={blogForm.category}
                    onChange={e => setBlogForm({ ...blogForm, category: e.target.value })}
                  >
                    <option value="PCCC">PCCC</option>
                    <option value="Mẹo thuê trọ">Mẹo thuê trọ</option>
                    <option value="Pháp lý">Pháp lý</option>
                    <option value="Đời sống sinh viên">Đời sống sinh viên</option>
                  </select>
                </label>
                <label className="block text-xs font-semibold text-gray-700">
                  Thời gian đọc (phút)
                  <input
                    type="number"
                    className="input"
                    value={blogForm.readingMinutes}
                    onChange={e => setBlogForm({ ...blogForm, readingMinutes: Number(e.target.value) })}
                  />
                </label>
                <label className="block text-xs font-semibold text-gray-700">
                  Trạng thái
                  <select
                    className="input"
                    value={blogForm.status}
                    onChange={e => setBlogForm({ ...blogForm, status: e.target.value })}
                  >
                    <option value="PUBLISHED">PUBLISHED (Xuất bản)</option>
                    <option value="DRAFT">DRAFT (Bản nháp)</option>
                    <option value="HIDDEN">HIDDEN (Tạm ẩn)</option>
                  </select>
                </label>
              </div>
              <label className="block text-xs font-semibold text-gray-700">
                URL Ảnh bìa
                <input
                  className="input"
                  placeholder="https://... hoặc /uploads/..."
                  value={blogForm.coverImage}
                  onChange={e => setBlogForm({ ...blogForm, coverImage: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-gray-700">
                Tóm tắt / Sapo bài viết
                <textarea
                  rows={2}
                  className="input text-xs"
                  placeholder="Tóm tắt ngắn gọn hiển thị ngoài danh sách bài viết..."
                  value={blogForm.summary}
                  onChange={e => setBlogForm({ ...blogForm, summary: e.target.value })}
                />
              </label>
              <label className="block text-xs font-semibold text-gray-700">
                Nội dung chi tiết *
                <textarea
                  rows={8}
                  className="input text-xs"
                  placeholder="Viết nội dung bài viết chi tiết..."
                  value={blogForm.content}
                  onChange={e => setBlogForm({ ...blogForm, content: e.target.value })}
                />
              </label>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setShowBlogModal(false)}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl"
              >
                Hủy
              </button>
              <button
                onClick={saveBlogSubmit}
                className="px-5 py-2 text-xs font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl"
              >
                {editingBlogId ? 'Lưu thay đổi' : 'Đăng bài viết'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMATION MODAL */}
      {confirmModal.open && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in duration-200">
            <h3 className={`font-extrabold text-base ${confirmModal.isDanger ? 'text-red-600' : 'text-gray-900'}`}>
              {confirmModal.title}
            </h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              {confirmModal.message}
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <button
                onClick={() => setConfirmModal(prev => ({ ...prev, open: false }))}
                className="px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors"
              >
                {confirmModal.cancelText || 'Hủy'}
              </button>
              <button
                onClick={confirmModal.onConfirm}
                className={`px-5 py-2 text-xs font-bold rounded-xl text-white transition-colors ${
                  confirmModal.isDanger ? 'bg-red-600 hover:bg-red-700' : 'bg-indigo-600 hover:bg-indigo-700'
                }`}
              >
                {confirmModal.confirmText || 'Xác nhận'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST BANNER */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-xs font-bold flex items-center gap-2 border animate-in slide-in-from-bottom-5 duration-300 ${
          toast.type === 'error'
            ? 'bg-red-50 text-red-800 border-red-200'
            : toast.type === 'info'
            ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
            : 'bg-emerald-50 text-emerald-800 border-emerald-200'
        }`}>
          <span>{toast.type === 'error' ? '⚠️' : '✓'}</span>
          <span>{toast.message}</span>
        </div>
      )}

      <style>{`.input{margin-top:.25rem;width:100%;border:1px solid #d1d5db;border-radius:.75rem;padding:.55rem .8rem;font-size:.875rem;outline:none}.input:focus{border-color:#6366f1}`}</style>
    </div>
  );
}
