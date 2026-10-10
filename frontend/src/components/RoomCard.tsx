import { useNavigate } from 'react-router-dom';
import { mediaList, money } from '../lib/api';

export default function RoomCard({ item, onFavorite }: { item: any; onFavorite?: (id: number) => void }) {
  const navigate = useNavigate();
  const media = mediaList(item.imageUrl);
  const cover = media[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800';
  const verified = item.verificationLevel === 'ON_SITE_VERIFIED' || item.verificationLevel === 'REMOTE_VERIFIED';
  const isBannedOwner = item.landlordStatus === 'BANNED' || item.landlordStatus === 'SUSPENDED';
  return (
    <div onClick={() => navigate(`/property/${item.listingId}`)} className="cursor-pointer group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 flex flex-col relative">
      {onFavorite && <button onClick={(e) => { e.stopPropagation(); onFavorite(item.listingId); }} className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/85 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm text-gray-500 hover:text-red-500">♥</button>}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
        <img src={cover} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        <div className="absolute top-4 left-4 flex gap-2 flex-col items-start">
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
