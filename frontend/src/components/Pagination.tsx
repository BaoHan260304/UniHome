
export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalElements?: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  className?: string;
  itemLabel?: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalElements,
  pageSize = 12,
  onPageChange,
  className = '',
  itemLabel = 'tin'
}: PaginationProps) {
  if (totalPages <= 1 && (!totalElements || totalElements <= pageSize)) {
    return null;
  }

  // Calculate start and end indices
  const startItem = totalElements ? currentPage * pageSize + 1 : 0;
  const endItem = totalElements ? Math.min((currentPage + 1) * pageSize, totalElements) : 0;

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible + 2) {
      for (let i = 0; i < totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(0);

      let start = Math.max(1, currentPage - 1);
      let end = Math.min(totalPages - 2, currentPage + 1);

      if (currentPage <= 2) {
        start = 1;
        end = 3;
      } else if (currentPage >= totalPages - 3) {
        start = totalPages - 4;
        end = totalPages - 2;
      }

      if (start > 1) {
        pages.push('...');
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages - 1);
    }

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 ${className}`}>
      {totalElements != null && totalElements > 0 && (
        <div className="text-sm text-gray-500 font-medium">
          Hiển thị <span className="font-bold text-gray-900">{startItem}–{endItem}</span> trong{' '}
          <span className="font-bold text-gray-900">{totalElements}</span> {itemLabel}
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Previous Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 0}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
        >
          ← Trước
        </button>

        {/* Page Numbers */}
        {pages.map((p, idx) => {
          if (typeof p === 'string') {
            return (
              <span key={`ellipsis-${idx}`} className="px-2 text-gray-400 select-none">
                …
              </span>
            );
          }

          const isActive = p === currentPage;
          return (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={`min-w-9 h-9 px-3 rounded-xl text-sm font-bold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/20'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200 shadow-xs'
              }`}
            >
              {p + 1}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages - 1}
          className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-semibold border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs"
        >
          Sau →
        </button>
      </div>
    </div>
  );
}
