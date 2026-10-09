import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser } from '../lib/api';

interface PostComposerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PostComposerModal({ isOpen, onClose }: PostComposerModalProps) {
  const nav = useNavigate();
  const user = getUser();
  const [roomRelationship, setRoomRelationship] = useState<'OWNER' | 'PROPERTY_MANAGER'>('OWNER');
  const [roommateRelationship, setRoommateRelationship] = useState<'ROOMMATE_SEARCH' | 'TENANT_TRANSFER'>('ROOMMATE_SEARCH');

  if (!isOpen) return null;

  const handleSelect = (category: string) => {
    if (!user) {
      onClose();
      nav('/login', { state: { from: window.location.pathname } });
      return;
    }

    if (category === 'ROOM') {
      onClose();
      nav(`/manager/posts?action=create&category=ROOM&relationship=${roomRelationship}`);
    } else if (category === 'ROOMMATE') {
      onClose();
      nav(`/manager/posts?action=create&category=ROOMMATE&relationship=${roommateRelationship}`);
    } else if (category === 'SECOND_HAND') {
      onClose();
      nav('/secondhand');
    } else if (category === 'SERVICE') {
      onClose();
      nav('/services');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-100 animate-fade-in flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-white">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              <span>✍️</span> Đăng tin mới trên UniHome
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Chọn danh mục phù hợp với nhu cầu của bạn để tiếp cận hàng ngàn sinh viên
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Card A: Phòng trọ & Căn hộ */}
          <div
            onClick={() => handleSelect('ROOM')}
            className="group cursor-pointer p-4 rounded-2xl border-2 border-gray-100 hover:border-indigo-500 bg-white hover:bg-indigo-50/20 transition-all shadow-xs hover:shadow-md flex flex-col gap-3"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                🏠
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors text-base">
                    Phòng trọ / Căn hộ mini / Ký túc xá
                  </h3>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-100">
                    Chính chủ & Quản lý
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Đăng thông tin phòng trọ, căn hộ dịch vụ, chung cư mini, homestay hoặc giường ký túc xá cho sinh viên thuê.
                </p>
              </div>
            </div>

            {/* Sub-relationship selector */}
            <div
              className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="font-medium text-gray-500">Tư cách đăng:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="rel_room"
                  checked={roomRelationship === 'OWNER'}
                  onChange={() => setRoomRelationship('OWNER')}
                />
                <span>Chính chủ</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer ml-3">
                <input
                  type="radio"
                  name="rel_room"
                  checked={roomRelationship === 'PROPERTY_MANAGER'}
                  onChange={() => setRoomRelationship('PROPERTY_MANAGER')}
                />
                <span>Quản lý / Môi giới</span>
              </label>
            </div>
          </div>

          {/* Card B: Sang nhượng / Ở ghép */}
          <div
            onClick={() => handleSelect('ROOMMATE')}
            className="group cursor-pointer p-4 rounded-2xl border-2 border-gray-100 hover:border-emerald-500 bg-white hover:bg-emerald-50/20 transition-all shadow-xs hover:shadow-md flex flex-col gap-3"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
                👥
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors text-base">
                    Sang nhượng phòng / Tìm bạn ở ghép
                  </h3>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                    Sinh viên
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Bạn đang thuê phòng cần tìm bạn cùng phòng chia tiền, hoặc muốn pass lại cọc/hợp đồng phòng trọ trước hạn.
                </p>
              </div>
            </div>

            {/* Sub-relationship selector */}
            <div
              className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="font-medium text-gray-500">Nhu cầu:</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="rel_roommate"
                  checked={roommateRelationship === 'ROOMMATE_SEARCH'}
                  onChange={() => setRoommateRelationship('ROOMMATE_SEARCH')}
                />
                <span>Tìm người ở ghép</span>
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer ml-3">
                <input
                  type="radio"
                  name="rel_roommate"
                  checked={roommateRelationship === 'TENANT_TRANSFER'}
                  onChange={() => setRoommateRelationship('TENANT_TRANSFER')}
                />
                <span>Sang nhượng phòng gấp</span>
              </label>
            </div>
          </div>

          {/* Card C: Thanh lý đồ cũ */}
          <div
            onClick={() => handleSelect('SECOND_HAND')}
            className="group cursor-pointer p-4 rounded-2xl border-2 border-gray-100 hover:border-amber-500 bg-white hover:bg-amber-50/20 transition-all shadow-xs hover:shadow-md flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
              📦
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors text-base">
                  Thanh lý đồ cũ (Pass đồ)
                </h3>
                <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100">
                  Miễn phí
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Pass lại tủ lạnh, quạt, bàn ghế học tập, giáo trình, đệm ngủ, đồ gia dụng phòng trọ cho bạn sinh viên khác.
              </p>
            </div>
          </div>

          {/* Card D: Dịch vụ sinh viên */}
          <div
            onClick={() => handleSelect('SERVICE')}
            className="group cursor-pointer p-4 rounded-2xl border-2 border-gray-100 hover:border-blue-500 bg-white hover:bg-blue-50/20 transition-all shadow-xs hover:shadow-md flex items-start gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition-transform">
              🛠️
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors text-base">
                  Dịch vụ sinh viên & Đời sống
                </h3>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                  Tiện ích
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Dịch vụ chuyển trọ trọn gói, sửa điện nước sinh viên, lắp máy lạnh, giặt là, vệ sinh dọn phòng.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Tin đăng sẽ được duyệt nhanh trong vòng 15–30 phút theo tiêu chuẩn an toàn UniHome.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-200/60 rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
