import { useRef, useState } from 'react';
import { TERMS_SECTIONS } from '../pages/TermsPage';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  isAccepted?: boolean;
}

export default function TermsModal({ isOpen, onClose, onAccept, isAccepted = false }: TermsModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(isAccepted);
  const [scrollProgress, setScrollProgress] = useState(isAccepted ? 100 : 0);

  if (!isOpen) return null;

  const handleScroll = () => {
    const el = contentRef.current;
    if (!el) return;

    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) {
      setHasScrolledToBottom(true);
      setScrollProgress(100);
      return;
    }

    const currentPercent = Math.min(100, Math.round((scrollTop / maxScroll) * 100));
    setScrollProgress(currentPercent);

    if (currentPercent >= 95) {
      setHasScrolledToBottom(true);
    }
  };

  const handleAcceptClick = () => {
    if (onAccept) onAccept();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-gray-100 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900">
              Điều khoản Dịch vụ UniHome
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Vui lòng cuộn đọc toàn bộ 26 điều khoản (tối thiểu 95%) để xác nhận
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Scroll Progress Bar */}
        <div className="w-full bg-gray-100 h-1">
          <div
            className={`h-full transition-all duration-150 ${
              hasScrolledToBottom ? 'bg-emerald-500' : 'bg-indigo-600'
            }`}
            style={{ width: `${scrollProgress}%` }}
          />
        </div>

        {/* Scrollable Content */}
        <div
          ref={contentRef}
          onScroll={handleScroll}
          className="px-6 py-4 overflow-y-auto flex-1 divide-y divide-gray-100 text-sm text-gray-600 leading-relaxed space-y-4"
        >
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-xs text-indigo-900 font-medium">
            💡 Lưu ý: Hệ thống yêu cầu bạn cuộn xuống cuối văn bản trước khi nút "Tôi đồng ý" được kích hoạt nhằm đảm bảo quyền lợi và nghĩa vụ của bạn.
          </div>

          {TERMS_SECTIONS.map((sec) => (
            <div key={sec.id} className="pt-3">
              <h3 className="font-bold text-gray-900 mb-1 text-xs sm:text-sm flex items-center gap-1.5">
                <span className="text-indigo-600 font-extrabold">{sec.id}.</span> {sec.title.replace(/^\d+\.\s*/, '')}
              </h3>
              <p className="text-xs sm:text-sm text-gray-600">{sec.content}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            {hasScrolledToBottom ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                ✓ Đã đọc đủ nội dung ({scrollProgress}%)
              </span>
            ) : (
              <span className="text-amber-600 font-medium">
                ⏳ Đang đọc: {scrollProgress}% (Cần cuộn thêm để đồng ý)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200/60 transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={!hasScrolledToBottom}
              onClick={handleAcceptClick}
              className={`px-5 py-2 rounded-xl text-xs font-bold transition-all ${
                hasScrolledToBottom
                  ? 'bg-indigo-600 text-white shadow-xs hover:bg-indigo-700 active:scale-95'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Tôi đã đọc và đồng ý
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
