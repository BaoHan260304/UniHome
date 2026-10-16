import { useNavigate } from 'react-router-dom';
import { mediaList, money, resolveMediaUrl } from '../lib/api';

export default function RoomCard({
  item,
  isFavorite,
  onFavorite
}: {
  item: any;
  isFavorite?: boolean;
  onFavorite?: (id: number) => void;
}) {
  const navigate = useNavigate();

  // Extract primary cover and total count
  const rawMedia = (() => {
    if (item.mediaJson) {
      const parsed = mediaList(item.mediaJson);
      if (parsed.length > 0) return parsed;
    }
    if (item.imageUrl) {
      const parsed = mediaList(item.imageUrl);
      if (parsed.length > 0) return parsed;
    }
    return [];
  })();

  const rawCover = item.imageUrl || rawMedia[0] || '';
  const cover = resolveMediaUrl(rawCover) || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';
  const totalPhotos = rawMedia.filter(u => !u.endsWith('.mp4') && !u.endsWith('.webm') && !u.startsWith('data:video')).length;

  const verified = item.verificationLevel === 'ON_SITE_VERIFIED' || item.verificationLevel === 'REMOTE_VERIFIED';
  const isBannedOwner = item.landlordStatus === 'BANNED' || item.landlordStatus === 'SUSPENDED';
  const isFav = isFavorite ?? !!item.isFavorite;

  return (
    <div onClick={() => navigate(`/property/${item.listingId}`)} className="cursor-pointer group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col relative">
      {onFavorite && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(item.listingId || item.id);
          }}
          className={`absolute top-4 right-4 z-10 w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all duration-200 cursor-pointer ${
            isFav
              ? 'bg-white text-red-500 ring-2 ring-red-400 shadow-md scale-105'
              : 'bg-white/85 text-gray-400 hover:text-red-500 hover:bg-white shadow-sm'
          }`}
          title={isFav ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
          aria-label={isFav ? 'Bỏ yêu thích' : 'Lưu vào yêu thích'}
        >
          {isFav ? (
            <svg className="w-5 h-5 fill-red-500 text-red-500" viewBox="0 0 24 24">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      )}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
        <img
          src={cover}
          alt={item.title}
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Subtle photo count badge if post has multiple photos */}
        {totalPhotos > 1 && (
          <div className="absolute bottom-3 right-3 z-10 bg-black/60 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs pointer-events-none">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{totalPhotos} ảnh</span>
          </div>
        )}

        <div className="absolute top-4 left-4 flex gap-2 flex-col items-start pointer-events-none">
          {isBannedOwner ? (
            <span className="bg-red-600/95 text-white text-xs font-extrabold px-3 py-1.5 rounded-full shadow-md">
              ⚠️ CHỦ TRỌ BỊ KHÓA
            </span>
          ) : (
            <span className={`text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm ${item.availability === 'AVAILABLE' ? 'bg-green-600/90' : 'bg-orange-600/90'}`}>{item.availability === 'AVAILABLE' ? 'Còn phòng' : item.availability || 'Đang cập nhật'}</span>
          )}
          {verified && <span className="bg-indigo-600/90 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">✓ {item.verificationLevel === 'ON_SITE_VERIFIED' ? 'Xác minh thực địa' : 'Xác minh từ xa'}</span>}
          {item.packageTier && item.packageTier !== 'FREE' && <span className="bg-amber-500/95 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">★ {item.packageTier}</span>}
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{item.title || item.name}</h3>
        <p className="text-gray-500 text-sm mt-1 line-clamp-1">{[item.street, item.ward, item.district, item.province].filter(Boolean).join(', ')}</p>
        <p className="text-2xl font-bold text-indigo-600 mt-4">{money(item.price)}<span className="text-sm font-normal text-gray-500"> / tháng</span></p>
        <div className="flex flex-wrap gap-x-4 gap-y-2 my-4 text-sm text-gray-600">
          <span>{item.area || '—'} m²</span>
          {item.floorText && <span>Tầng {item.floorText}</span>}
          {item.maxOccupants && <span>Tối đa {item.maxOccupants} người</span>}
          {item.distanceKm != null && <span>{item.distanceKm} km</span>}
        </div>
        <p className="text-gray-600 text-sm line-clamp-2 flex-1">{item.description}</p>
        <div className="pt-4 mt-5 border-t flex items-center justify-between text-sm text-gray-500">
          <span>👁 {item.viewCount || 0}</span><span>♥ {item.interestCount || 0} quan tâm</span><span>{item.rating ? `★ ${item.rating}` : 'Chưa đánh giá'}</span>
        </div>
      </div>
    </div>
  );
}
