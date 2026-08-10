import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  totalItems?: number;
  itemsPerPage?: number;
}

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col items-center space-y-3">
      {totalItems !== undefined && itemsPerPage && (
        <p className="text-sm text-metallic-500">
          Showing{' '}
          <span className="font-medium text-metallic-700">
            {totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>{' '}
          of <span className="font-medium text-metallic-700">{totalItems}</span>{' '}
          results
        </p>
      )}
      <div className="flex items-center justify-center space-x-2">
        {/* Previous Button - Touch target: 44x44px minimum */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="min-w-[2.75rem] min-h-[2.75rem] p-2 rounded-xl ring-1 ring-black/10 shadow-sm hover:bg-metallic-50 hover:ring-accent-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Previous page"
        >
          <ChevronLeftIcon className="w-5 h-5" />
        </button>

        {/* Page Numbers */}
        <div className="flex items-center space-x-1 flex-wrap justify-center">
          {getPageNumbers().map((page, index) => {
            if (page === '...') {
              return (
                <span key={`ellipsis-${index}`} className="px-2 sm:px-3 py-2 text-metallic-400">
                  ...
                </span>
              );
            }

            const pageNum = page as number;
            return (
              <button
                key={pageNum}
                onClick={() => onPageChange(pageNum)}
                className={`min-w-[2.75rem] min-h-[2.75rem] px-3 sm:px-4 py-2 rounded-xl font-bold transition-all ${
                  currentPage === pageNum
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/30'
                    : 'text-metallic-700 hover:bg-metallic-50 hover:text-primary-600 ring-1 ring-transparent hover:ring-accent-400/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500'
                }`}
                aria-label={`Page ${pageNum}`}
                aria-current={currentPage === pageNum ? 'page' : undefined}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Next Button - Touch target: 44x44px minimum */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="min-w-[2.75rem] min-h-[2.75rem] p-2 rounded-xl ring-1 ring-black/10 shadow-sm hover:bg-metallic-50 hover:ring-accent-400/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
          aria-label="Next page"
        >
          <ChevronRightIcon className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
