export function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]"
        >
          <div className="h-3 w-24 rounded bg-black/10" />
          <div className="mt-4 h-8 w-32 rounded bg-black/10" />
          <div className="mt-3 h-3 w-20 rounded bg-black/5" />
        </div>
      ))}
    </div>
  );
}

export function RecentOrdersSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)] lg:col-span-2">
      <div className="h-4 w-32 rounded bg-black/10" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="space-y-1.5">
              <div className="h-3 w-28 rounded bg-black/10" />
              <div className="h-2.5 w-40 rounded bg-black/5" />
            </div>
            <div className="h-3 w-16 rounded bg-black/10" />
          </div>
        ))}
      </div>
    </div>
  );
}
export function ProdutosSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 animate-pulse rounded bg-black/10" />
          <div className="mt-2 h-4 w-60 animate-pulse rounded bg-black/5" />
        </div>
        <div className="h-10 w-36 animate-pulse rounded-full bg-black/10" />
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
        <div className="animate-pulse divide-y divide-black/5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div className="space-y-2">
                <div className="h-3.5 w-32 rounded bg-black/10" />
                <div className="h-2.5 w-48 rounded bg-black/5" />
              </div>
              <div className="h-3.5 w-16 rounded bg-black/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function PedidosSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-28 animate-pulse rounded bg-black/10" />
          <div className="mt-2 h-4 w-72 animate-pulse rounded bg-black/5" />
        </div>
        <div className="h-10 w-44 animate-pulse rounded-full bg-black/10" />
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
        <div className="animate-pulse divide-y divide-black/5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div className="space-y-2">
                <div className="h-3.5 w-40 rounded bg-black/10" />
                <div className="h-2.5 w-56 rounded bg-black/5" />
              </div>
              <div className="space-y-2 text-right">
                <div className="ml-auto h-3.5 w-16 rounded bg-black/10" />
                <div className="ml-auto h-2.5 w-12 rounded bg-black/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export function FinanceiroSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-7 w-32 animate-pulse rounded bg-black/10" />
          <div className="mt-2 h-4 w-56 animate-pulse rounded bg-black/5" />
        </div>
        <div className="h-10 w-40 animate-pulse rounded-full bg-black/10" />
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="animate-pulse rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]"
          >
            <div className="h-3 w-24 rounded bg-black/10" />
            <div className="mt-4 h-8 w-32 rounded bg-black/10" />
            <div className="mt-3 h-3 w-20 rounded bg-black/5" />
          </div>
        ))}
      </div>
      <div className="overflow-hidden rounded-2xl bg-white shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
        <div className="animate-pulse divide-y divide-black/5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between px-6 py-4">
              <div className="space-y-2">
                <div className="h-3.5 w-40 rounded bg-black/10" />
                <div className="h-2.5 w-24 rounded bg-black/5" />
              </div>
              <div className="h-3.5 w-16 rounded bg-black/10" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}