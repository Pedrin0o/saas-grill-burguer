type IconProps = { className?: string };

const base = "1.8";

export function IconMenu({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={base} strokeLinecap="round" className={className}>
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}

export function IconX({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={base} strokeLinecap="round" className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M3 11l9-7 9 7" />
      <path d="M5 10v9a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1v-9" />
    </svg>
  );
}

export function IconBurger({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 9c0-2.5 3.6-4.5 8-4.5s8 2 8 4.5" />
      <path d="M3.5 12h17" />
      <path d="M4 15.5h16a1.5 1.5 0 010 3H4a1.5 1.5 0 010-3z" />
    </svg>
  );
}

export function IconClipboard({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="5" y="4" width="14" height="17" rx="2" />
      <path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1" />
      <path d="M9 11h6M9 15h6" />
    </svg>
  );
}

export function IconWallet({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect x="3" y="6" width="18" height="13" rx="2" />
      <path d="M3 10h18" />
      <circle cx="16" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconBoxes({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3l4 2.3v4.6L12 12l-4-2.1V5.3z" />
      <path d="M4 8.6l4 2.2v4.6L4 17.5v-4.6z" />
      <path d="M20 8.6l-4 2.2v4.6l4 2.1v-4.6z" />
      <path d="M12 12v4.6l4 2.2M12 12v4.6l-4 2.2" />
    </svg>
  );
}

export function IconRadar({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12L12 4a8 8 0 018 8z" opacity="0.5" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconWhatsapp({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 20l1.3-3.8A8 8 0 1112 20a7.9 7.9 0 01-3.9-1z" />
      <path d="M9 10c0 3 2 5 5 5" />
    </svg>
  );
}

export function IconSparkles({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6z" />
      <path d="M19 15l.7 1.9L21.5 17.6l-1.8.7L19 20l-.7-1.7-1.8-.7 1.8-.7z" />
    </svg>
  );
}

export function IconLogout({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={base} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}