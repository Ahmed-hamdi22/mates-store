import type { ProductStatus } from '@/types/database';

interface StatusBadgeProps {
  status: ProductStatus;
  labels: {
    draft: string;
    published: string;
    archived: string;
  };
}

export function StatusBadge({ status, labels }: StatusBadgeProps) {
  switch (status) {
    case 'published':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          {labels.published}
        </span>
      );
    case 'archived':
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-zinc-500/10 px-2.5 py-0.5 text-xs font-semibold text-zinc-600 dark:bg-zinc-500/20 dark:text-zinc-400">
          <span className="size-1.5 rounded-full bg-zinc-400" />
          {labels.archived}
        </span>
      );
    case 'draft':
    default:
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-300">
          <span className="size-1.5 rounded-full bg-amber-500" />
          {labels.draft}
        </span>
      );
  }
}