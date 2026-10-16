import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { api, getUser, resolveMediaUrl } from '../lib/api';

export default function ServiceDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const currentUser = getUser();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Contact reveal state
  const [contactRevealed, setContactRevealed] = useState(false);
  const [fullPhone, setFullPhone] = useState<string | null>(null);
  const [fullEmail, setFullEmail] = useState<string | null>(null);
  const [revealing, setRevealing] = useState(false);

  // Active gallery image
  const [activeImage, setActiveImage] = useState<string>('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    void api.get(`/content/services/${id}`)
      .then((res) => {
        setData(res.data);
        const s = res.data?.service || res.data;
        setActiveImage(s?.imageUrl || '/demo/service-moving.png');
        if (res.data?.isContactRevealed) {
          setContactRevealed(true);
          setFullPhone(res.data?.providerPhone);
          setFullEmail(res.data?.providerEmail);
        }
      })
      .catch((err) => {
        setError(err?.response?.data?.message || 'Không tìm thấy dịch vụ');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleRevealContact = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    setRevealing(true);
    try {
      const res = await api.post(`/content/services/${id}/reveal-contact`);
      setContactRevealed(true);
      setFullPhone(res.data?.phone);
      setFullEmail(res.data?.email);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Không thể mở liên hệ');
    } finally {
      setRevealing(false);
    }
  };

  const handleStartChat = () => {
    if (!currentUser) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    const targetUserId = service?.providerId;
    if (!targetUserId) return;

    void api.post('/chat/conversations', {
      otherUserId: targetUserId,
      contextType: 'SERVICE',
      contextId: service.id,
    }).then((res) => {
      const convId = res.data?.id || res.data?.conversationId;
      navigate(convId ? `/chat?conversationId=${convId}` : '/chat');
    }).catch(() => {
      navigate('/chat');
    });
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-16 text-center text-sm text-gray-400">
        Đang tải thông tin dịch vụ...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <span className="text-5xl block">⚠️</span>
        <h2 className="text-xl font-bold text-gray-900">{error || 'Không tìm thấy dịch vụ'}</h2>
        <Link to="/services" className="inline-block text-xs font-bold text-indigo-600 hover:underline">
          ← Quay lại danh sách dịch vụ
        </Link>
      </div>
    );
  }

  const service = data.service || data;
  const providerName = data.providerName || 'Nhà cung cấp đối tác';
  const providerAvatar = data.providerAvatar
    ? resolveMediaUrl(data.providerAvatar)
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(providerName)}&background=random`;

  // Parse JSON helpers
  let galleryList: string[] = [];
  try {
    if (service.galleryJson) {
      const parsed = JSON.parse(service.galleryJson);
      if (Array.isArray(parsed)) galleryList = parsed;
    }
  } catch {}
  if (galleryList.length === 0 && service.imageUrl) {
    galleryList = [service.imageUrl];
  }

  let pricingTiers: any[] = [];
  try {
    if (service.pricingTiersJson) pricingTiers = JSON.parse(service.pricingTiersJson);
  } catch {}

  let faqList: any[] = [];
  try {
    if (service.faqJson) faqList = JSON.parse(service.faqJson);
  } catch {}

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <div className="text-xs text-gray-500 flex items-center gap-2">
        <Link to="/" className="hover:text-indigo-600">Trang chủ</Link>
        <span>/</span>
        <Link to="/services" className="hover:text-indigo-600">Dịch vụ</Link>
        <span>/</span>
        <span className="text-gray-900 font-semibold truncate max-w-xs">{service.title}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (Images, Info, Pricing, FAQs) */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Visual Card */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-4">
            <div className="relative h-72 sm:h-96 rounded-2xl overflow-hidden bg-gray-100">
              <img
                src={activeImage ? resolveMediaUrl(activeImage) : '/demo/service-moving.png'}
                alt={service.title}
                className="w-full h-full object-cover"
              />
              <span className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-xs">
                {service.category || 'Dịch vụ tiện ích'}
              </span>
            </div>

            {/* Gallery thumbnails */}
            {galleryList.length > 1 && (
              <div className="flex gap-2.5 overflow-x-auto pb-1">
                {galleryList.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImage === img ? 'border-indigo-600 scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={resolveMediaUrl(img)} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Title & Price Header */}
            <div className="pt-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-snug">
                {service.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  📍 {service.serviceArea || `${service.district || ''}, ${service.province || 'Toàn quốc'}`}
                </span>
                {service.responseTime && (
                  <span className="flex items-center gap-1">
                    ⚡ Phản hồi: {service.responseTime}
                  </span>
                )}
                {service.businessHours && (
                  <span className="flex items-center gap-1">
                    🕒 Giờ làm việc: {service.businessHours}
                  </span>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-xs text-gray-400 block font-semibold">Giá tham khảo từ</span>
                  <span className="text-2xl font-black text-indigo-600">
                    {Number(service.priceFrom || 0).toLocaleString('vi-VN')}đ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-gray-900">Mô tả chi tiết dịch vụ</h2>
            <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {service.description || 'Chưa có mô tả chi tiết cho dịch vụ này.'}
            </div>
          </div>

          {/* Pricing Tiers (nếu có) */}
          {pricingTiers.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-gray-900">Bảng giá các gói dịch vụ</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {pricingTiers.map((tier, idx) => (
                  <div key={idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm text-gray-900">{tier.name}</span>
                      <span className="text-sm font-black text-indigo-600">
                        {Number(tier.price || 0).toLocaleString('vi-VN')}đ
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">{tier.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* FAQs (nếu có) */}
          {faqList.length > 0 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
              <h2 className="text-base font-bold text-gray-900">Câu hỏi thường gặp</h2>
              <div className="space-y-3">
                {faqList.map((faq, idx) => (
                  <details key={idx} className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 text-xs cursor-pointer group">
                    <summary className="font-bold text-gray-900 list-none flex justify-between items-center">
                      <span>❓ {faq.question}</span>
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <p className="mt-2 text-gray-600 leading-relaxed pl-5">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column (Provider Card & Contact Actions) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs space-y-5 sticky top-28">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Thông tin nhà cung cấp
            </h3>

            <div className="flex items-center gap-3">
              <img
                src={providerAvatar}
                alt={providerName}
                className="w-14 h-14 rounded-full object-cover border-2 border-indigo-100 shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-extrabold text-sm text-gray-900 truncate">{providerName}</h4>
                <span className="inline-block text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-1 border border-indigo-100">
                  Đối tác dịch vụ xác thực
                </span>
                {data.providerSchool && (
                  <p className="text-[11px] text-gray-400 truncate mt-1">🏫 {data.providerSchool}</p>
                )}
              </div>
            </div>

            {/* Contact Reveal Area */}
            <div className="pt-3 border-t border-gray-100 space-y-3">
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-2">
                <span className="text-[11px] text-gray-400 block font-semibold">Số điện thoại liên hệ</span>
                {contactRevealed ? (
                  <div className="space-y-1">
                    <a
                      href={`tel:${fullPhone}`}
                      className="text-base font-black text-indigo-700 block hover:underline"
                    >
                      📞 {fullPhone || 'Chưa cập nhật'}
                    </a>
                    {fullEmail && (
                      <a href={`mailto:${fullEmail}`} className="text-xs text-gray-500 block hover:underline">
                        ✉️ {fullEmail}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold text-gray-700">
                      {data.providerPhone || '09xx xxx xxx'}
                    </span>
                    <button
                      type="button"
                      disabled={revealing}
                      onClick={handleRevealContact}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-white px-3 py-1.5 rounded-xl border border-indigo-200 shadow-2xs transition-colors"
                    >
                      {revealing ? '...' : 'Hiện số'}
                    </button>
                  </div>
                )}
              </div>

              {/* Direct Chat Button */}
              <button
                type="button"
                onClick={handleStartChat}
                className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <span>💬</span> Chat trực tiếp với đối tác
              </button>
            </div>

            <div className="text-[11px] text-gray-400 space-y-1 pt-2 border-t border-gray-100">
              <p>✓ Đảm bảo giá niêm yết công khai</p>
              <p>✓ Hỗ trợ xử lý sự cố qua tổng đài UniHome</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
