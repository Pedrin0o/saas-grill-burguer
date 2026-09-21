type StatCardProps = {
  label: string;
  value: React.ReactNode;
  hint?: string;
  trend?: { value: number; label: string } | null;
};

export function StatCard({ label, value, hint, trend }: StatCardProps) {
  const trendPositive = trend != null && trend.value >= 0;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
      <p className="text-xs font-semibold uppercase tracking-[1.5px] text-[var(--gold-deep)]">
        {label}
      </p>

      <p className="mt-3 text-3xl font-semibold text-[var(--text-h-light)]">
        {value}
      </p>

      <div className="mt-2 flex items-center gap-2">
        {trend != null && (
          <span
            className={`text-sm font-semibold ${
              trendPositive ? "text-[var(--success)]" : "text-[var(--danger)]"
            }`}
          >
            {trendPositive ? "▲" : "▼"} {Math.abs(trend.value).toFixed(1)}%
          </span>
        )}
        {(hint || trend) && (
          <span className="text-xs text-[var(--text-on-light)] opacity-60">
            {trend ? trend.label : hint}
          </span>
        )}
      </div>
    </div>
  );
}