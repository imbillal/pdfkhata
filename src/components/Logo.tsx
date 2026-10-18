/** Wordmark: a small khata (exercise book) with its cover label, plus the name. */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <svg viewBox="0 0 32 32" className="size-8" aria-hidden>
        <rect x="4" y="2" width="24" height="28" rx="3.5" fill={inverted ? "#ffffff" : "var(--logo)"} />
        <rect x="4" y="2" width="5" height="28" rx="2" fill={inverted ? "#dfe5f7" : "var(--logo-2)"} />
        <rect x="11.5" y="9" width="13" height="9" rx="1.5" fill={inverted ? "var(--logo)" : "#fffdf6"} />
        <path d="M13.5 12.5h9M13.5 15h6" stroke={inverted ? "#ffffff" : "var(--logo)"} strokeWidth="1.3" strokeLinecap="round" />
      </svg>
      <span className={`font-display text-[1.35rem] leading-none font-bold ${inverted ? "text-white" : "text-ink"}`}>
        PDF<span className={inverted ? "text-[#c9d4ff]" : "text-margin"}>Khata</span>
      </span>
    </span>
  );
}
