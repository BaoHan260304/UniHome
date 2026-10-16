import { useEffect, useState } from 'react';
import { api, getUser, resolveMediaUrl } from '../lib/api';

export default function AdSlot({ placement, className = '' }: { placement: string; className?: string }) {
  const [ads, setAds] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  // Strictly user-session isolated key: userId + authToken/sessionId
  const getStorageKey = () => {
    const user = getUser();
    const token = localStorage.getItem('authToken') || 'guest_sess';
    const uid = user?.id ? String(user.id) : 'guest';
    return `unihome_hidden_ads_${uid}_${token.slice(-10)}`;
  };

  const [hiddenIds, setHiddenIds] = useState<number[]>(() => {
    try {
      const saved = sessionStorage.getItem(getStorageKey());
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const visibleAds = ads.filter(a => !hiddenIds.includes(Number(a?.id)));

  useEffect(() => {
    if (visibleAds.length <= 1) return;
    const t = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % visibleAds.length);
    }, 8000);
    return () => clearInterval(t);
  }, [visibleAds.length]);

  useEffect(() => {
    let mounted = true;
    void api.get('/content/ads', { params: { placement } })
      .then(r => {
        if (!mounted) return;
        const list = r.data || [];
        setAds(list);
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [placement]);

  useEffect(() => {
    const rawId = visibleAds[currentIdx]?.id;
    const numId = Number(rawId);
    if (Number.isFinite(numId) && numId > 0) {
      void api.post(`/content/ads/${numId}/impression`).catch(() => {});
    }
  }, [currentIdx, visibleAds]);

  const handleHideAd = (e: React.MouseEvent, adId: number) => {
    e.stopPropagation();
    const updated = [...hiddenIds, adId];
    setHiddenIds(updated);
    try {
      sessionStorage.setItem(getStorageKey(), JSON.stringify(updated));
    } catch {}
  };

  if (!visibleAds.length) return null;

  const ad = visibleAds[currentIdx % visibleAds.length] || visibleAds[0];
  const bannerUrl = ad.bannerImage ? resolveMediaUrl(ad.bannerImage) : '';

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const numId = Number(ad?.id);
    if (Number.isFinite(numId) && numId > 0) {
      void api.post(`/content/ads/${numId}/click`).catch(() => {});
    }
    if (ad.destinationUrl) {
      window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      onClick={handleClick}
      className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm cursor-pointer group transition-transform hover:shadow-md ${className}`}
    >
      <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-xs text-[10px] font-bold text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
        Quảng cáo
      </div>

      <button
        type="button"
        onClick={(e) => handleHideAd(e, Number(ad.id))}
        title="Ẩn quảng cáo này"
        className="absolute top-2 right-2 z-20 bg-black/60 hover:bg-black/90 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold transition-colors"
      >
        ✕
      </button>

      {bannerUrl ? (
        <div className="w-full h-full relative">
          <img
            src={bannerUrl}
            alt={ad.title || 'Quảng cáo UniHome'}
            className="w-full h-full object-cover transition-transform group-hover:scale-102"
          />
          {ad.title && (
            <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-semibold truncate">
              {ad.title}
            </div>
          )}
        </div>
      ) : (
        <div className="p-6 text-center flex flex-col justify-center h-full bg-indigo-50/50">
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">UniHome Partner</span>
          <h4 className="font-bold text-gray-900 mt-1 text-sm">{ad.title}</h4>
          {ad.advertiserName && <p className="text-xs text-gray-500 mt-1">{ad.advertiserName}</p>}
          <span className="mt-3 text-xs text-indigo-600 font-semibold hover:underline">Tìm hiểu thêm →</span>
        </div>
      )}
    </div>
  );
}
