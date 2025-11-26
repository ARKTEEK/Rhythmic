interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
}

export function PaginationControls({ page, totalPages, onPageChange }: PaginationControlsProps) {
  return (
    <div className="flex justify-center items-center mt-2 gap-3 shrink-0">
      <button
        disabled={ page === 1 }
        onClick={ () => onPageChange(page - 1) }
        className="px-3 py-1 bg-[#f38ca7] text-white box-style-sm hover:cursor-pointer
                   disabled:opacity-50 disabled:cursor-not-allowed">
        Prev
      </button>
      <span className="text-sm font-semibold text-gray-700">
        Page { page } / { totalPages }
      </span>
      <button
        disabled={ page === totalPages }
        onClick={ () => onPageChange(page + 1) }
        className="px-3 py-1 bg-[#f38ca7] text-white box-style-sm hover:cursor-pointer
                   disabled:opacity-50 disabled:cursor-not-allowed">
        Next
      </button>
    </div>
  );
}
