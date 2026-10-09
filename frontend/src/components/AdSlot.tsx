import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export default function AdSlot({ placement, className = '' }: { placement: string; className?: string }) {
  const [ads, setAds] = useState<any[]>([]);
  useEffect(() => { api.get('/content/ads', { params: { placement } }).then(r => setAds(r.data || [])).catch(() => {}); }, [placement]);
  if (!ads.length) return null;
  const ad = ads[0];
  return (
    <button
      onClick={() => { api.post(`/content/ads/${ad.id}/click`).catch(() => {}); window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer'); }}
      className={`relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm text-left ${className}`}
    >
      <span className="absolute top-2 left-2 z-10 bg-white/90 text-[10px] font-bold text-gray-500 px-2 py-1 rounded-full">Sponsored</span>
      {ad.bannerImage ? <img src={ad.bannerImage} alt={ad.title} className="w-full h-full object-cover" /> : <div className="p-6 text-sm text-gray-600">{ad.title}</div>}
    </button>
  );
}
