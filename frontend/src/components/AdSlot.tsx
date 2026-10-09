import { useEffect, useState } from 'react';
import { api, resolveMediaUrl } from '../lib/api';

export default function AdSlot({ placement, className = '' }: { placement: string; className?: string }) {
  const [ads, setAds] = useState<any[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    if (ads.length <= 1) return;
    const t = setInterval(() => {
      setCurrentIdx(prev => (prev + 1) % ads.length);
    }, 8000);
    return () => clearInterval(t);
  }, [ads.length]);

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
    const rawId = ads[currentIdx]?.id;
    const numId = Number(rawId);
    if (Number.isFinite(numId) && numId > 0) {
      void api.post(`/content/ads/${numId}/impression`).catch(() => {});
    }
  }, [currentIdx, ads]);

  if (!ads.length) return null;

  const ad = ads[currentIdx] || ads[0];
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
