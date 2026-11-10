export const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-2xl bg-white/[0.06] ${className}`} />
);

export const BinCardSkeleton = () => (
  <div className="card-tight flex items-center gap-3 p-3">
    <Skeleton className="h-12 w-12 rounded-2xl" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-2/3" />
      <Skeleton className="h-3 w-1/3" />
    </div>
  </div>
);

export const EmptyState = ({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) => (
  <div className="card flex flex-col items-center gap-2 px-6 py-10 text-center">
    <p className="text-sm font-semibold text-white">{title}</p>
    <p className="max-w-[34ch] text-xs leading-relaxed text-white/50">{description}</p>
    {action && <div className="mt-2">{action}</div>}
  </div>
);
