import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ page, limit, total, totalPages, onPageChange }: PaginationProps) {
  if (!total) return null;

  const from = ((page - 1) * limit) + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="flex items-center justify-between mt-6 px-4 py-3 bg-background-secondary border border-border rounded-lg">
      <div className="text-sm text-foreground-secondary">
        Mostrando {from} - {to} de {total} registros
      </div>
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-lg bg-primary text-white dark:text-foreground hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150 ease-out"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm text-foreground">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="p-2 rounded-lg bg-primary text-white dark:text-foreground hover:bg-primary-hover disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors duration-150 ease-out"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
