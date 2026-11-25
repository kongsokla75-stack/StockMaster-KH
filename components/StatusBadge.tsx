import type { StockStatus } from '@/lib/types';

const statusStyles: Record<StockStatus, string> = {
  out: 'bg-red-100 text-red-700',
  low: 'bg-amber-100 text-amber-700',
  healthy: 'bg-emerald-100 text-emerald-700',
};

export default function StatusBadge({ status, label }: { status: StockStatus; label: string }) {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyles[status]}`}
    >
      {label}
    </span>
  );
}
