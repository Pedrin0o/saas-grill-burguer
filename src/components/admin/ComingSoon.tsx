import type { ComponentType } from "react";

type ComingSoonProps = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
};

export function ComingSoon({ title, description, icon: Icon }: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl bg-white p-10 text-center shadow-[0_20px_40px_-24px_rgba(28,20,12,0.25)]">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)]">
        <Icon className="h-7 w-7 text-[#1c1006]" />
      </div>
      <h1 className="text-2xl font-semibold text-[var(--text-h-light)]">
        {title}
      </h1>
      <p className="mt-3 max-w-md text-[var(--text-on-light)] opacity-70">
        {description}
      </p>
      <span className="mt-6 rounded-full bg-[var(--paper-soft)] px-4 py-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--gold-deep)]">
        Em desenvolvimento
      </span>
    </div>
  );
}